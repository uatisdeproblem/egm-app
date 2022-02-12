///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';
import { SignedURL } from 'idea-toolbox';

import { Session } from '../models/session';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = { sessions: process.env.TABLE_SESSIONS };

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Sessions(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Sessions extends ResourceController {
  session: Session;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'sessionId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.resourceId) return;

    try {
      this.session = new Session(
        await ddb.get({ TableName: DDB_TABLES.sessions, Key: { sessionId: this.resourceId } })
      );
    } catch (err) {
      throw new RCError('Session not found');
    }
  }

  protected async getResource(): Promise<Session> {
    return this.session;
  }

  protected async putResource(): Promise<Session> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    const oldResource = new Session(this.session);
    this.session.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Session> {
    const errors = this.session.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.sessions, Item: this.session };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(sessionId)';
      await ddb.put(putParams);

      return this.session;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async patchResource(): Promise<SignedURL> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    switch (this.body.action) {
      default:
        throw new RCError('Unsupported action');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.sessions, Key: { sessionId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  protected async postResources(): Promise<Session> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    this.session = new Session(this.body);
    this.session.sessionId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Session[]> {
    try {
      return (await ddb.scan({ TableName: DDB_TABLES.sessions }))
        .map((x: Session) => new Session(x))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }
}
