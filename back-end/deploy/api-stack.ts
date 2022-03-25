import SwaggerParser from '@apidevtools/swagger-parser';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import * as IAM from 'aws-cdk-lib/aws-iam';
import * as ApiGw from 'aws-cdk-lib/aws-apigatewayv2';
import * as DDB from 'aws-cdk-lib/aws-dynamodb';
import * as S3 from 'aws-cdk-lib/aws-s3';

export interface ApiProps extends cdk.StackProps {
  project: string;
  stage: string;
  apiDomain: string;
  apiDefinitionFile: string;
  resourceControllers: ApiResourceController[];
  tables: { [tableName: string]: ApiTable };
  mediaBucketArn: string;
  cognito: { userPoolId: string; audience: string[] };
  removalPolicy: RemovalPolicy;
  sesIdentityARN: string;
  mapPlaceIndexName: string;
}
export interface ApiResourceController {
  name: string;
  paths: string[];
}
export interface ApiTable {
  PK: DDB.Attribute;
  SK?: DDB.Attribute;
  indexes?: DDB.GlobalSecondaryIndexProps[];
}

const defaultLambdaFnProps: NodejsFunctionProps = {
  runtime: Lambda.Runtime.NODEJS_14_X,
  timeout: Duration.seconds(5),
  memorySize: 1024,
  bundling: { minify: true, sourceMap: true },
  environment: {
    NODE_OPTIONS: '--enable-source-maps'
  },
  logRetention: RetentionDays.TWO_WEEKS
};

const defaultDDBTableProps = {
  billingMode: DDB.BillingMode.PAY_PER_REQUEST,
  pointInTimeRecovery: true
};

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id, props);

    // parse the OpenAPI (Swagger) definition, to integrate it with AWS resources
    SwaggerParser.dereference(props.apiDefinitionFile).then((apiDefinition: any) => {
      const api = new ApiGw.CfnApi(this, 'HttpApi');

      apiDefinition['x-amazon-apigateway-cors'] = {
        allowOrigins: ['*'],
        allowMethods: ['*'],
        allowHeaders: ['Content-Type', 'Authorization']
      };

      // set the Cognito authorizer in the api definition (it will be created automatically with the api)
      apiDefinition.components.securitySchemes['CognitoUserPool']['x-amazon-apigateway-authorizer'] = {
        type: 'jwt',
        identitySource: '$request.header.Authorization',
        jwtConfiguration: {
          issuer: `https://cognito-idp.${cdk.Stack.of(this).region}.amazonaws.com/${props.cognito.userPoolId}`,
          audience: props.cognito.audience
        }
      };

      // create a Lambda function for each resource
      const lambdaFunctions = props.resourceControllers.map(resource => {
        const lambdaFnName = props.project.concat('_', props.stage, '_', resource.name);
        const lambdaFn = new NodejsFunction(this, resource.name.concat('Function'), {
          ...defaultLambdaFnProps,
          functionName: lambdaFnName,
          entry: `./src/handlers/${resource.name}.ts`
        });
        lambdaFn.addEnvironment('PROJECT', props.project);

        // link the Lambda function to the resource's paths
        resource.paths.forEach(path => {
          if (apiDefinition.paths[path]) {
            Object.keys(apiDefinition.paths[path]).forEach(method => {
              apiDefinition.paths[path][method]['x-amazon-apigateway-integration'] = {
                ...resourceIntegrationSetting,
                uri: lambdaFn.functionArn
              };
            });
          }
        });

        // allow the api to execute the Lambda function
        lambdaFn.addPermission(`${resource.name}-permission`, {
          principal: new IAM.ServicePrincipal('apigateway.amazonaws.com'),
          action: 'lambda:InvokeFunction',
          sourceArn: `arn:aws:execute-api:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:${api.ref}/*/*/*`
        });

        return lambdaFn;
      });

      // allow the Lambda functions to access the Cognito UserPool
      const accessCognitoPolicy = new IAM.Policy(this, 'ManageCognitoUserPool', {
        statements: [
          new IAM.PolicyStatement({
            effect: IAM.Effect.ALLOW,
            actions: ['cognito-idp:*'],
            resources: [
              `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:userpool/${
                props.cognito.userPoolId
              }`
            ]
          })
        ]
      });
      lambdaFunctions.forEach(lambdaFn => {
        lambdaFn.role.attachInlinePolicy(accessCognitoPolicy);
        lambdaFn.addEnvironment('COGNITO_USER_POOL_ID', props.cognito.userPoolId);
      });

      // allow the Lambda functions to access the Location Place Index
      const accessLocationPlaceIndex = new IAM.Policy(this, 'ManageLocationPlaceIndex', {
        statements: [
          new IAM.PolicyStatement({
            effect: IAM.Effect.ALLOW,
            actions: ['geo:SearchPlaceIndexForText'],
            resources: [
              `arn:aws:geo:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:place-index/${
                props.mapPlaceIndexName
              }`
            ]
          })
        ]
      });
      lambdaFunctions.forEach(lambdaFn => {
        lambdaFn.role.attachInlinePolicy(accessLocationPlaceIndex);
        lambdaFn.addEnvironment('LOCATION_PLACE_INDEX', props.mapPlaceIndexName);
      });

      // allow the Lambda functions to access the SES Identity
      const accessSES = new IAM.Policy(this, 'ManageSES', {
        statements: [
          new IAM.PolicyStatement({
            effect: IAM.Effect.ALLOW,
            actions: ['ses:*'],
            resources: [
              props.sesIdentityARN,
              `arn:aws:ses:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:configuration-set/ManageBounces`
            ]
          })
        ]
      });
      lambdaFunctions.forEach(lambdaFn => {
        lambdaFn.role.attachInlinePolicy(accessSES);
        lambdaFn.addEnvironment('SES_IDENTITY_ARN', props.sesIdentityARN);
        const domainName = props.apiDomain.split('.').slice(-2).join('.');
        lambdaFn.addEnvironment('SES_SOURCE_ADDRESS', `no-reply@${domainName}`);
        lambdaFn.addEnvironment('SES_REGION', cdk.Stack.of(this).region);
      });

      // create the tables and allow the Lambda functions to access them
      for (const tableName in props.tables) {
        const physicalTableName = id.concat('_', tableName);
        const table = new DDB.Table(this, tableName.concat('-Table'), {
          ...defaultDDBTableProps,
          tableName: physicalTableName,
          partitionKey: props.tables[tableName].PK,
          sortKey: props.tables[tableName].SK,
          removalPolicy: props.removalPolicy
        });
        (props.tables[tableName].indexes || []).forEach(GSI => table.addGlobalSecondaryIndex(GSI));
        lambdaFunctions.forEach(lambdaFn => {
          table.grantReadWriteData(lambdaFn);
          lambdaFn.addEnvironment('DDB_TABLE_'.concat(tableName), physicalTableName);
        });
      }

      // allow the Lambda functions to access IDEA tables
      const accessIDEATables = new IAM.Policy(this, 'AccessIDEATables', {
        statements: [
          new IAM.PolicyStatement({
            effect: IAM.Effect.ALLOW,
            actions: ['dynamodb:*'],
            resources: [`arn:aws:dynamodb:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:table/idea_*`]
          })
        ]
      });
      lambdaFunctions.forEach(lambdaFn => lambdaFn.role.attachInlinePolicy(accessIDEATables));

      const s3MediaBucket = S3.Bucket.fromBucketArn(this, 'MediaBucket', props.mediaBucketArn);
      const accessMediaBucketPolicy = new IAM.Policy(this, 'AccessMediaBucket', {
        statements: [
          new IAM.PolicyStatement({
            effect: IAM.Effect.ALLOW,
            actions: ['s3:Get*', 's3:Put*', 's3:Delete*'],
            resources: [
              `arn:aws:s3:::${s3MediaBucket.bucketName}/images/${props.stage}/*`,
              `arn:aws:s3:::${s3MediaBucket.bucketName}/documents/${props.stage}/*`,
              `arn:aws:s3:::${s3MediaBucket.bucketName}/usersCV/${props.stage}/*`
            ]
          })
        ]
      });
      lambdaFunctions.forEach(lambdaFn => {
        lambdaFn.role.attachInlinePolicy(accessMediaBucketPolicy);
        lambdaFn.addEnvironment('S3_BUCKET_MEDIA', s3MediaBucket.bucketName);
        lambdaFn.addEnvironment('S3_IMAGES_FOLDER', 'images'.concat('/', props.stage));
        lambdaFn.addEnvironment('S3_DOCUMENTS_FOLDER', 'documents'.concat('/', props.stage));
        lambdaFn.addEnvironment('S3_USERS_CV_FOLDER', 'usersCV'.concat('/', props.stage));
      });

      // set metadata to recognize the API in the API Gateway console
      apiDefinition.info.description = apiDefinition.info.title;
      apiDefinition.info.title = id;

      // note: it's important to set it here and not earlier, so we are sure all the attributes have been already set
      api.body = apiDefinition;

      const apiStage = new ApiGw.CfnStage(this, 'HttpApiDefaultStage', {
        apiId: api.ref,
        stageName: '$default',
        autoDeploy: true
      });

      new ApiGw.CfnApiMapping(this, 'HttpApiMapping', {
        domainName: props.apiDomain,
        apiId: api.ref,
        apiMappingKey: props.stage,
        stage: apiStage.ref
      });

      new cdk.CfnOutput(this, 'HTTPApiURL', { value: api.attrApiEndpoint });
    });
  }
}

const resourceIntegrationSetting = {
  type: 'AWS_PROXY',
  httpMethod: 'POST',
  payloadFormatVersion: '2.0'
};
