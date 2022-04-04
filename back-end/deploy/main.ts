#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as DDB from 'aws-cdk-lib/aws-dynamodb';

import { IDEAStack } from './idea-stack';
import { MapStack } from './map-stack';
import { CognitoStack } from './cognito-stack';
import { MediaStack } from './media-stack';
import { ApiDomainStack } from './api-domain-stack';
import { SESStack } from './ses-stack';
import { ApiResourceController, ApiStack, ApiTable } from './api-stack';
import { FrontEndStack } from './front-end-stack';

import { parameters, environments, Stage } from './environments';

//
// RESOURCES
//

const apiResources: ApiResourceController[] = [
  { name: 'users', paths: ['/users/{userId}'] },
  { name: 'connections', paths: ['/connections', '/connections/{userId}'] },
  { name: 'organizations', paths: ['/organizations', '/organizations/{organizationId}'] },
  { name: 'speakers', paths: ['/speakers', '/speakers/{speakerId}'] },
  { name: 'venues', paths: ['/venues', '/venues/{venueId}'] },
  { name: 'sessions', paths: ['/sessions', '/sessions/{sessionId}'] },
  { name: 'media', paths: ['/media'] }
];

const tables: { [tableName: string]: ApiTable } = {
  userProfiles: { PK: { name: 'userId', type: DDB.AttributeType.STRING } },
  organizations: { PK: { name: 'organizationId', type: DDB.AttributeType.STRING } },
  messages: { PK: { name: 'messageId', type: DDB.AttributeType.STRING } },
  speakers: { PK: { name: 'speakerId', type: DDB.AttributeType.STRING } },
  venues: { PK: { name: 'venueId', type: DDB.AttributeType.STRING } },
  sessions: { PK: { name: 'sessionId', type: DDB.AttributeType.STRING } },
  usersFavoriteSessions: {
    PK: { name: 'userId', type: DDB.AttributeType.STRING },
    SK: { name: 'sessionId', type: DDB.AttributeType.STRING },
    indexes: [
      {
        indexName: 'inverted-index',
        partitionKey: { name: 'sessionId', type: DDB.AttributeType.STRING },
        sortKey: { name: 'userId', type: DDB.AttributeType.STRING },
        projectionType: DDB.ProjectionType.ALL
      }
    ]
  },
  connections: {
    PK: { name: 'connectionId', type: DDB.AttributeType.STRING },
    indexes: [
      {
        indexName: 'requesterId-targetId-index',
        partitionKey: { name: 'requesterId', type: DDB.AttributeType.STRING },
        sortKey: { name: 'targetId', type: DDB.AttributeType.STRING },
        projectionType: DDB.ProjectionType.ALL
      },
      {
        indexName: 'targetId-requesterId-index',
        partitionKey: { name: 'targetId', type: DDB.AttributeType.STRING },
        sortKey: { name: 'requesterId', type: DDB.AttributeType.STRING },
        projectionType: DDB.ProjectionType.ALL
      }
    ]
  }
};

//
// STACKS
//

const createApp = async (): Promise<void> => {
  const app = new cdk.App({});

  const env = { account: parameters.awsAccount, region: parameters.awsRegion };

  const STAGE = app.node.tryGetContext('stage');
  const ENV = (environments as any)[STAGE] as Stage;
  if (!ENV) {
    console.log('Missing stage (environments.ts); e.g. --parameters stage=dev\n\n');
    throw new Error();
  }

  //
  // GENERIC RESOURCES (they don't depend by the stage)
  //

  new IDEAStack(app, `idea-resources`);

  const mapStack = new MapStack(app, `${parameters.project}-map`, {
    env,
    project: parameters.project
  });

  const cognitoStack = new CognitoStack(app, `${parameters.project}-cognito`, {
    env,
    project: parameters.project,
    firstAdminEmail: parameters.firstAdminEmail,
    mapName: mapStack.map.mapName
  });
  cognitoStack.addDependency(mapStack);

  const mediaStack = new MediaStack(app, `${parameters.project}-media`, {
    env,
    mediaBucketName: `${parameters.project}-media-bucket`,
    mediaDomain: parameters.mediaDomain
  });

  const apiDomainStack = new ApiDomainStack(app, `${parameters.project}-api-domain`, {
    env,
    domain: parameters.apiDomain
  });

  const sesStack = new SESStack(app, `${parameters.project}-ses`, {
    env,
    domain: parameters.apiDomain
  });

  //
  // STAGE-DEPENDANT RESOURCES
  //

  const apiStack = new ApiStack(app, `${parameters.project}-${STAGE}-api`, {
    env,
    project: parameters.project,
    stage: STAGE,
    apiDomain: parameters.apiDomain,
    apiDefinitionFile: './swagger.yaml',
    resourceControllers: apiResources,
    tables,
    mediaBucketArn: mediaStack.mediaBucketArn,
    cognito: { userPoolId: cognitoStack.userPool.userPoolId, audience: [cognitoStack.clientFrontEnd.userPoolClientId] },
    removalPolicy: ENV.destroyDataOnDelete ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    sesIdentityARN: sesStack.identityARN,
    mapPlaceIndexName: mapStack.placeIndex.indexName
  });
  apiStack.addDependency(cognitoStack);
  apiStack.addDependency(mediaStack);
  apiStack.addDependency(apiDomainStack);
  apiStack.addDependency(sesStack);
  apiStack.addDependency(mapStack);

  new FrontEndStack(app, `${parameters.project}-${STAGE}-front-end`, {
    env,
    project: parameters.project,
    stage: STAGE,
    domain: ENV.domain
  });
};
createApp();
