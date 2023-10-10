#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as DDB from 'aws-cdk-lib/aws-dynamodb';

import { IDEAStack } from './idea-stack';
import { MediaStack } from './media-stack';
import { CognitoStack } from './cognito-stack';
import { SESStack } from './ses-stack';
import { ApiDomainStack } from './api-domain-stack';
import { ResourceController, ApiStack, DDBTable } from './api-stack';
import { FrontEndStack } from './front-end-stack';

import { parameters, stages, Stage, versionStatus } from './environments';

//
// RESOURCES
//

const apiResources: ResourceController[] = [
  { name: 'auth', isAuthFunction: true },
  { name: 'login', paths: ['/login'] },
  { name: 'status', paths: ['/status'] },
  { name: 'userProfiles', paths: ['/esners', '/esners/{userId}', '/externals', '/externals/{userId}'] },
  {
    name: 'registrations',
    paths: [
      '/esners/registrations',
      '/esners/registrations/{registrationId}',
      '/externals/registrations/{registrationId}'
    ]
  }
];

const tables: { [tableName: string]: DDBTable } = {
  status: {
    PK: { name: 'version', type: DDB.AttributeType.STRING }
  },
  userProfiles: {
    PK: { name: 'userId', type: DDB.AttributeType.STRING }
  },
  registrations: {
    PK: { name: 'registrationId', type: DDB.AttributeType.STRING }
  }
};

//
// STACKS
//

const createApp = async (): Promise<void> => {
  const app = new cdk.App({});

  const env = { account: parameters.awsAccount, region: parameters.awsRegion };

  const STAGE = app.node.tryGetContext('stage');
  const STAGE_VARIABLES = (stages as any)[STAGE] as Stage;
  if (!STAGE_VARIABLES) {
    console.log('Missing stage (environments.ts); e.g. --parameters stage=dev\n\n');
    throw new Error();
  }

  //
  // GENERIC RESOURCES (they don't depend by the stage)
  //

  new IDEAStack(app, `idea-resources`);

  const mediaStack = new MediaStack(app, `${parameters.project}-media`, {
    env,
    mediaBucketName: `${parameters.project}-media`,
    mediaDomain: parameters.mediaDomain
  });

  const apiDomainStack = new ApiDomainStack(app, `${parameters.project}-api-domain`, {
    env,
    domain: parameters.apiDomain
  });

  const cognitoStack = new CognitoStack(app, `${parameters.project}-cognito`, {
    env,
    project: parameters.project,
    firstAdminEmail: parameters.firstAdminEmail
  });

  const sesStack = new SESStack(app, `${parameters.project}-ses`, {
    env,
    project: parameters.project,
    domain: parameters.apiDomain,
    testEmailAddress: parameters.firstAdminEmail
  });

  //
  // STAGE-DEPENDANT RESOURCES
  //

  const apiStack = new ApiStack(app, `${parameters.project}-${STAGE}-api`, {
    env,
    project: parameters.project,
    stage: STAGE,
    firstAdminEmail: parameters.firstAdminEmail,
    versionStatus,
    apiDomain: parameters.apiDomain,
    apiDefinitionFile: './swagger.yaml',
    resourceControllers: apiResources,
    tables,
    mediaBucketArn: mediaStack.mediaBucketArn,
    ses: { identityArn: sesStack.identityArn, notificationTopicArn: sesStack.notificationTopicArn },
    cognito: {
      userPoolId: cognitoStack.userPool.userPoolId,
      audience: [cognitoStack.clientFrontEnd.userPoolClientId, cognitoStack.clientBackEnd.userPoolClientId]
    },
    removalPolicy: STAGE_VARIABLES.destroyDataOnDelete ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN
  });
  apiStack.addDependency(mediaStack);
  apiStack.addDependency(apiDomainStack);
  apiStack.addDependency(cognitoStack);
  apiStack.addDependency(sesStack);

  new FrontEndStack(app, `${parameters.project}-${STAGE}-front-end`, {
    env,
    project: parameters.project,
    stage: STAGE,
    domain: STAGE_VARIABLES.domain
  });
};
createApp();
