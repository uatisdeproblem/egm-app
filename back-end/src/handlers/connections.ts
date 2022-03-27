///
/// IMPORTS
///

import { Cognito, DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Connection } from '../models/connection';
import { UserProfile } from '../models/userProfile';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const DDB_TABLES = {
  profiles: process.env.DDB_TABLE_userProfiles,
  connections: process.env.DDB_TABLE_connections
};

const ddb = new DynamoDB();
const cognito = new Cognito();

export const handler = (ev: any, _: any, cb: any) => new Connections(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Connections extends ResourceController {
  target: UserProfile;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    const requesterProfile = new UserProfile(
      await ddb.get({ TableName: DDB_TABLES.profiles, Key: { userId: this.principalId } })
    );
    if (!requesterProfile.getName()) throw new RCError('Requester profile incomplete');

    if (!this.resourceId) return;

    try {
      this.target = new UserProfile(
        await ddb.get({ TableName: DDB_TABLES.profiles, Key: { userId: this.resourceId } })
      );
    } catch (error) {
      throw new RCError('Not found');
    }

    if (!this.target.getName()) throw new RCError('Target profile incomplete');
  }

  protected async getResources(): Promise<UserProfile[]> {
    try {
      const connectionsFromBothSides = await Promise.all([
        ddb.query({
          TableName: DDB_TABLES.connections,
          IndexName: 'requesterId-targetId-index',
          KeyConditionExpression: 'requesterId = :userId',
          ExpressionAttributeValues: { ':userId': this.principalId }
        }),
        ddb.query({
          TableName: DDB_TABLES.connections,
          IndexName: 'targetId-requesterId-index',
          KeyConditionExpression: 'targetId = :userId',
          ExpressionAttributeValues: { ':userId': this.principalId }
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
      throw new RCError('Operation failed');
    }
  }

  protected async postResources(): Promise<UserProfile> {
    try {
      this.resourceId = (await cognito.getUserByEmail(this.body.username, COGNITO_USER_POOL_ID)).sub;
    } catch (error) {
      throw new RCError('Not found');
    }
    if (this.principalId === this.resourceId) throw new RCError('Same user');

    try {
      this.target = new UserProfile(
        await ddb.get({ TableName: DDB_TABLES.profiles, Key: { userId: this.resourceId } })
      );
    } catch (error) {
      throw new RCError('Profile not found');
    }
    if (!this.target.getName()) throw new RCError('Target profile incomplete');

    const existingConnection = await this.getConnectionOfUserWithTarget(this.target.userId);
    if (existingConnection) throw new RCError('Already connected');

    const connection = new Connection({
      connectionId: await ddb.IUNID(PROJECT),
      requesterId: this.principalId,
      targetId: this.target.userId
    });

    try {
      await ddb.put({ TableName: DDB_TABLES.connections, Item: connection });

      return this.target;
    } catch (err) {
      throw new RCError('Creation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    const connection = await this.getConnectionOfUserWithTarget(this.target.userId);
    if (!connection) throw new RCError('Not found');

    try {
      await ddb.delete({ TableName: DDB_TABLES.connections, Key: { connectionId: connection.connectionId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  private async getConnectionOfUserWithTarget(targetId: string): Promise<Connection> {
    const connectionWithUserAsRequester = await ddb.query({
      TableName: DDB_TABLES.connections,
      IndexName: 'requesterId-targetId-index',
      KeyConditionExpression: 'requesterId = :requesterId AND targetId = :targetId',
      ExpressionAttributeValues: { ':requesterId': this.principalId, ':targetId': targetId }
    });
    const connectionWithUserAsTarget = await ddb.query({
      TableName: DDB_TABLES.connections,
      IndexName: 'targetId-requesterId-index',
      KeyConditionExpression: 'requesterId = :requesterId AND targetId = :targetId',
      ExpressionAttributeValues: { ':requesterId': targetId, ':targetId': this.principalId }
    });
    const connection = connectionWithUserAsRequester[0] || connectionWithUserAsTarget[0];

    return connection ? new Connection(connection) : null;
  }
}
