///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Communication, CommunicationWithMarker } from '../models/communication.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  communications: process.env.DDB_TABLE_communications,
  usersReadCommunications: process.env.DDB_TABLE_usersReadCommunications
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Communications(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

// @todo check permissions here

class Communications extends ResourceController {
  user: User;
  communication: Communication;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'communicationId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new RCError('User not found');
    }

    if (!this.resourceId) return;

    try {
      this.communication = new Communication(
        await ddb.get({ TableName: DDB_TABLES.communications, Key: { communicationId: this.resourceId } })
      );
    } catch (err) {
      throw new RCError('Communication not found');
    }
  }

  protected async getResource(): Promise<CommunicationWithMarker> {
    const communication = this.communication as CommunicationWithMarker;

    try {
      await ddb.get({
        TableName: DDB_TABLES.usersReadCommunications,
        Key: { userId: this.principalId, communicationId: this.resourceId }
      });
      communication.hasBeenReadByUser = true;
      return communication;
    } catch (unread) {
      return communication;
    }
  }

  protected async putResource(): Promise<Communication> {
    if (!this.user.permissions.canManageContents) throw new RCError('Unauthorized');

    const oldResource = new Communication(this.communication);
    this.communication.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Communication> {
    const errors = this.communication.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.communications, Item: this.communication };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(communicationId)';
      await ddb.put(putParams);

      return this.communication;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async patchResource(): Promise<void> {
    switch (this.body.action) {
      case 'MARK_AS_READ':
        return await this.markAsReadForUser(true);
      case 'MARK_AS_UNREAD':
        return await this.markAsReadForUser(false);
      default:
        throw new RCError('Unsupported action');
    }
  }
  private async markAsReadForUser(markRead: boolean): Promise<void> {
    const marker = { userId: this.principalId, communicationId: this.resourceId };

    if (markRead) await ddb.put({ TableName: DDB_TABLES.usersReadCommunications, Item: marker });
    else await ddb.delete({ TableName: DDB_TABLES.usersReadCommunications, Key: marker });
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.communications, Key: { communicationId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  protected async postResources(): Promise<Communication> {
    if (!this.user.permissions.canManageContents) throw new RCError('Unauthorized');

    this.communication = new Communication(this.body);
    this.communication.communicationId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<CommunicationWithMarker[]> {
    try {
      const communications = (await ddb.scan({ TableName: DDB_TABLES.communications })).map(
        x => new CommunicationWithMarker(x)
      );

      const usersReadCommunications = new Set(
        (
          await ddb.query({
            TableName: DDB_TABLES.usersReadCommunications,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId': this.principalId }
          })
        ).map(x => x.communicationId)
      );

      communications.forEach(c => {
        if (usersReadCommunications.has(c.communicationId)) c.hasBeenReadByUser = true;
      });

      const sortedCommunications = communications.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

      return sortedCommunications;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }
}
