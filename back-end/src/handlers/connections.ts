///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Connection, ConnectionWithUserData } from '../models/connection.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  connections: process.env.DDB_TABLE_connections
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Connections(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Connections extends ResourceController {
  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'connectionId' });
  }

  protected async getResources(): Promise<ConnectionWithUserData[]> {
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

      const connections: Connection[] = [...connectionsFromBothSides[0], ...connectionsFromBothSides[1]];
      if (!connections.length) return [];

      const usersProfileToGather = [
        ...connectionsFromBothSides[0].map(x => ({ userId: x.targetId })),
        ...connectionsFromBothSides[1].map(x => ({ userId: x.requesterId }))
      ];
      const connectionsProfiles = await ddb.batchGet(DDB_TABLES.users, usersProfileToGather, true);
      const userConnections = connections
        .map(x => {
          const otherUserId = x.requesterId === this.principalId ? x.targetId : x.requesterId;
          const userProfile = connectionsProfiles.find(u => u.userId === otherUserId);
          return userProfile ? new ConnectionWithUserData({ ...x, userProfile }) : null;
        })
        .filter(x => x?.userProfile.getName());

      const sortedUserConnections = userConnections.sort((a, b) =>
        a.userProfile.getName().localeCompare(b.userProfile.getName())
      );

      return sortedUserConnections;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async postResources(): Promise<ConnectionWithUserData> {
    if (!this.body.userId) throw new RCError('Missing target user');
    if (this.principalId === this.body.userId) throw new RCError('Same user');

    let target: User;
    try {
      target = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.body.userId } }));
    } catch (error) {
      throw new RCError('Target profile not found');
    }
    if (!target.getName()) throw new RCError('Target profile incomplete');

    let connection = await this.getConnectionOfUserWithTarget(target.userId);
    if (connection) {
      if (connection.requesterId === this.principalId) {
        if (connection.isPending) throw new RCError('Connection is pending');
        else throw new RCError('Already connected');
      } else {
        if (connection.isPending) delete connection.isPending;
        else throw new RCError('Already connected');
      }
    } else {
      connection = new Connection({
        connectionId: await ddb.IUNID(PROJECT),
        requesterId: this.principalId,
        targetId: target.userId,
        isPending: true
      });
    }

    try {
      await ddb.put({ TableName: DDB_TABLES.connections, Item: connection });

      return new ConnectionWithUserData({ ...connection, userProfile: target });
    } catch (err) {
      throw new RCError('Connection failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    let connection: Connection;
    try {
      connection = await ddb.get({ TableName: DDB_TABLES.connections, Key: { connectionId: this.resourceId } });
    } catch (error) {
      throw new RCError('Not found');
    }

    if (connection.requesterId !== this.principalId && connection.targetId !== this.principalId)
      throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.connections, Key: { connectionId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  private async getConnectionOfUserWithTarget(targetUserId: string): Promise<Connection> {
    const connectionWithUserAsRequester = await ddb.query({
      TableName: DDB_TABLES.connections,
      IndexName: 'requesterId-targetId-index',
      KeyConditionExpression: 'requesterId = :requesterId AND targetId = :targetId',
      ExpressionAttributeValues: { ':requesterId': this.principalId, ':targetId': targetUserId }
    });
    const connectionWithUserAsTarget = await ddb.query({
      TableName: DDB_TABLES.connections,
      IndexName: 'targetId-requesterId-index',
      KeyConditionExpression: 'requesterId = :requesterId AND targetId = :targetId',
      ExpressionAttributeValues: { ':requesterId': targetUserId, ':targetId': this.principalId }
    });
    const connection = connectionWithUserAsRequester[0] || connectionWithUserAsTarget[0];

    return connection ? new Connection(connection) : null;
  }
}
