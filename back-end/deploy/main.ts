#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as DDB from 'aws-cdk-lib/aws-dynamodb';

import { IDEAStack } from './idea-stack';
import { MapStack } from './map-stack';
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
  { name: 'status', paths: ['/status'] },
  { name: 'auth', isAuthFunction: true },
  { name: 'cognito', paths: ['/cognito'] },
  { name: 'galaxy', paths: ['/galaxy'] },
  { name: 'configurations', paths: ['/configurations'] },
  { name: 'media', paths: ['/media'] },
  { name: 'users', paths: ['/users', '/users/{userId}'] },
  { name: 'eventSpots', paths: ['/event-spots', '/event-spots/{spotId}'] },
  { name: 'usefulLinks', paths: ['/useful-links', '/useful-links/{linkId}'] },
  { name: 'venues', paths: ['/venues', '/venues/{venueId}'] },
  { name: 'communications', paths: ['/communications', '/communications/{communicationId}'] },
  { name: 'organizations', paths: ['/organizations', '/organizations/{organizationId}'] },
  { name: 'rooms', paths: ['/rooms', '/rooms/{roomId}'] },
  { name: 'speakers', paths: ['/speakers', '/speakers/{speakerId}'] },
  { name: 'sessions', paths: ['/sessions', '/sessions/{sessionId}'] },
  { name: 'registrations', paths: ['/registrations', '/registrations/{sessionId}'] },
  { name: 'connections', paths: ['/connections', '/connections/{connectionId}'] },
  { name: 'contests', paths: ['/contests', '/contests/{contestId}'] },
  { name: 'meals', paths: ['/users/{userId}/meal-ticket', '/users/{userId}/meal-ticket/{mealTicketId}'] }
];

const tables: { [tableName: string]: DDBTable } = {
  status: {
    PK: { name: 'version', type: DDB.AttributeType.STRING }
  },
  configurations: {
    PK: { name: 'PK', type: DDB.AttributeType.STRING }
  },
  users: {
    PK: { name: 'userId', type: DDB.AttributeType.STRING }
  },
  eventSpots: {
    PK: { name: 'spotId', type: DDB.AttributeType.STRING }
  },
  usefulLinks: {
    PK: { name: 'linkId', type: DDB.AttributeType.STRING }
  },
  venues: {
    PK: { name: 'venueId', type: DDB.AttributeType.STRING }
  },
  communications: {
    PK: { name: 'communicationId', type: DDB.AttributeType.STRING }
  },
  usersReadCommunications: {
    PK: { name: 'userId', type: DDB.AttributeType.STRING },
    SK: { name: 'communicationId', type: DDB.AttributeType.STRING }
  },
  organizations: {
    PK: { name: 'organizationId', type: DDB.AttributeType.STRING }
  },
  rooms: {
    PK: { name: 'roomId', type: DDB.AttributeType.STRING }
  },
  speakers: {
    PK: { name: 'speakerId', type: DDB.AttributeType.STRING }
  },
  sessions: {
    PK: { name: 'sessionId', type: DDB.AttributeType.STRING }
  },
  registrations: {
    PK: { name: 'sessionId', type: DDB.AttributeType.STRING },
    SK: { name: 'userId', type: DDB.AttributeType.STRING },
    indexes: [
      {
        indexName: 'userId-sessionId-index',
        partitionKey: { name: 'userId', type: DDB.AttributeType.STRING },
        sortKey: { name: 'sessionId', type: DDB.AttributeType.STRING },
        projectionType: DDB.ProjectionType.ALL
      }
    ]
  },
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
  },
  contests: {
    PK: { name: 'contestId', type: DDB.AttributeType.STRING }
  },
  meals: {
    PK: { name: 'mealTicketId', type: DDB.AttributeType.STRING},
    SK: { name: 'userId', type: DDB.AttributeType.STRING},
    indexes: [
      {
        indexName: 'userId-index',
        partitionKey: { name: 'userId', type: DDB.AttributeType.STRING },
        projectionType: DDB.ProjectionType.ALL
      },
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
  const STAGE_VARIABLES = (stages as any)[STAGE] as Stage;
  if (!STAGE_VARIABLES) {
    console.log('Missing stage (environments.ts); e.g. --parameters stage=dev\n\n');
    throw new Error();
  }

  //
  // GENERIC RESOURCES (they don't depend by the stage)
  //

  new IDEAStack(app, `idea-resources`);

  new MapStack(app, `${parameters.project}-map`, { project: parameters.project });

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
    lambdaLogLevel: STAGE_VARIABLES.logLevel ?? 'INFO',
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
    domain: STAGE_VARIABLES.domain,
    alternativeDomain: STAGE_VARIABLES.alternativeDomain || '',
    certificateARN: STAGE_VARIABLES.frontEndCertificateARN
  });
};
createApp();
