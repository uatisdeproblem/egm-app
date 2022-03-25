///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Connection } from '../models/connection';
import { UserProfile } from '../models/userProfile';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  profiles: process.env.DDB_TABLE_userProfiles,
  connections: process.env.DDB_TABLE_connections
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Connections(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Connections extends ResourceController {
  requesterId: string;
  targetId: string;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
    this.requesterId = this.principalId;
    this.targetId = this.body.userId || this.pathParameters.userId;
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (this.requesterId === this.targetId) throw new RCError('Same user');

    const requesterProfile = new UserProfile(
      await ddb.get({ TableName: DDB_TABLES.profiles, Key: { userId: this.requesterId } })
    );
    if (!requesterProfile.getName()) throw new RCError('Profile incomplete');
  }

  protected async getResources(): Promise<UserProfile[]> {
    try {
      const connectionsFromBothSides = await Promise.all([
        ddb.query({
          TableName: DDB_TABLES.connections,
          IndexName: 'requesterId-targetId-index',
          KeyConditionExpression: 'requesterId = :userId',
          ExpressionAttributeValues: { ':userId': this.requesterId }
        }),
        ddb.query({
          TableName: DDB_TABLES.connections,
          IndexName: 'targetId-requesterId-index',
          KeyConditionExpression: 'targetId = :userId',
          ExpressionAttributeValues: { ':userId': this.requesterId }
        })
      ]);

      const connections = [
        ...connectionsFromBothSides[0].map(x => ({ userId: x.targetId })),
        ...connectionsFromBothSides[1].map(x => ({ userId: x.requesterId }))
      ];

      if (!connections) return [];

      const userConnections = (await ddb.batchGet(DDB_TABLES.profiles, connections)).map(x => new UserProfile(x));

      const sortedUserConnections = userConnections.sort((a, b) => a.getName().localeCompare(b.getName()));

      return sortedUserConnections;
    } catch (err) {
      console.log('err', err);
      throw new RCError('Operation failed');
    }
  }

  protected async postResources(): Promise<UserProfile> {
    const target = new UserProfile(await ddb.get({ TableName: DDB_TABLES.profiles, Key: { userId: this.targetId } }));

    if (!target.getName()) throw new RCError('Target profile incomplete');

    const connection = new Connection({
      connectionId: await ddb.IUNID(PROJECT),
      requesterId: this.requesterId,
      targetId: target.userId
    });

    try {
      await ddb.put({ TableName: DDB_TABLES.connections, Item: connection });

      return target;
    } catch (err) {
      throw new RCError('Creation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    const connectionWithUserAsRequester = await ddb.query({
      TableName: DDB_TABLES.connections,
      IndexName: 'requesterId-targetId-index',
      KeyConditionExpression: 'requesterId = :requesterId AND targetId = :targetId',
      ExpressionAttributeValues: { ':requesterId': this.requesterId, ':targetId': this.targetId }
    });
    const connectionWithUserAsTarget = await ddb.query({
      TableName: DDB_TABLES.connections,
      IndexName: 'targetId-requesterId-index',
      KeyConditionExpression: 'requesterId = :requesterId AND targetId = :targetId',
      ExpressionAttributeValues: { ':requesterId': this.targetId, ':targetId': this.requesterId }
    });
    const connection = connectionWithUserAsRequester[0] || connectionWithUserAsTarget[0];

    if (!connection) throw new RCError('Not found');

    try {
      await ddb.delete({ TableName: DDB_TABLES.connections, Key: { connectionId: connection.connectionId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }
}
