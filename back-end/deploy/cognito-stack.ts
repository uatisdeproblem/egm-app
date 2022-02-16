import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as Cognito from 'aws-cdk-lib/aws-cognito';
import * as IAM from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';

export interface CognitoProps extends cdk.StackProps {
  project: string;
  firstAdminEmail: string;
  mapName: string;
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: Cognito.UserPool;
  public readonly clientFrontEnd: Cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id, props);

    this.userPool = new Cognito.UserPool(this, 'UserPool', {
      userPoolName: props.project,
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireDigits: false,
        requireSymbols: false,
        requireUppercase: false,
        tempPasswordValidity: Duration.days(100)
      },
      accountRecovery: Cognito.AccountRecovery.EMAIL_ONLY
    });

    this.clientFrontEnd = new Cognito.UserPoolClient(this, 'CognitoUserPoolClientFrontEnd', {
      userPool: this.userPool,
      userPoolClientName: props.project.concat('-front-end'),
      generateSecret: false,
      preventUserExistenceErrors: true,
      authFlows: { custom: true, userSrp: true, userPassword: true }
    });

    const userIdentityPool = new Cognito.CfnIdentityPool(this, 'CognitoIdentiyPool', {
      identityPoolName: props.project.concat('-identity'),
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: this.clientFrontEnd.userPoolClientId,
          providerName: `cognito-idp.${cdk.Stack.of(this).region}.amazonaws.com/${this.userPool.userPoolId}`,
          serverSideTokenCheck: false
        }
      ]
    });

    const unauthenticatedIdentityPoolRole = new IAM.Role(this, 'IdentityUnauthenticatedRole', {
      assumedBy: new IAM.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': userIdentityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' }
        },
        'sts:AssumeRoleWithWebIdentity'
      )
    });

    const authenticatedIdentityPoolRole = new IAM.Role(this, 'IdentityAuthenticatedRole', {
      assumedBy: new IAM.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': userIdentityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' }
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      inlinePolicies: {
        AmplifyGeoMapLocation: new IAM.PolicyDocument({
          statements: [
            new IAM.PolicyStatement({
              effect: IAM.Effect.ALLOW,
              actions: ['geo:GetMap*'],
              resources: [`arn:aws:geo:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:map/${props.mapName}`]
            })
          ]
        })
      }
    });

    new Cognito.CfnIdentityPoolRoleAttachment(this, 'identity-pool-role-attachment', {
      identityPoolId: userIdentityPool.ref,
      roles: {
        authenticated: authenticatedIdentityPoolRole.roleArn,
        unauthenticated: unauthenticatedIdentityPoolRole.roleArn
      },
      roleMappings: {
        mapping: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `cognito-idp.${cdk.Stack.of(this).region}.amazonaws.com/${this.userPool.userPoolId}:${
            this.clientFrontEnd.userPoolClientId
          }`
        }
      }
    });

    const adminsGroup = new Cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: 'admins',
      description: 'Administrators',
      precedence: 0,
      userPoolId: this.userPool.userPoolId
    });
    const user = new Cognito.CfnUserPoolUser(this, 'FirstAdminUser', {
      userPoolId: this.userPool.userPoolId,
      username: props.firstAdminEmail,
      desiredDeliveryMediums: ['EMAIL'],
      forceAliasCreation: true,
      userAttributes: [
        { name: 'email', value: props.firstAdminEmail },
        { name: 'email_verified', value: 'true' }
      ]
    });
    new Cognito.CfnUserPoolUserToGroupAttachment(this, 'FirstAdminInGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: adminsGroup.groupName,
      username: user.ref
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'ClientIdFrontEnd', { value: this.clientFrontEnd.userPoolClientId });
    new cdk.CfnOutput(this, 'UserPoolARN', { value: this.userPool.userPoolArn });
    new cdk.CfnOutput(this, 'IdentityPoolId', { value: userIdentityPool.ref });
  }
}
