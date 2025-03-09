///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Venue } from '../models/venue.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = { users: process.env.DDB_TABLE_users, venues: process.env.DDB_TABLE_venues };

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Venues(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Venues extends ResourceController {
  user: User;
  venue: Venue;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'venueId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (this.httpMethod === 'POST' || !this.resourceId) return;

    try {
      this.venue = new Venue(await ddb.get({ TableName: DDB_TABLES.venues, Key: { venueId: this.resourceId } }));
    } catch (err) {
      throw new HandledError('Venue not found');
    }
  }

  protected async getResource(): Promise<Venue> {
    return this.venue;
  }

  protected async putResource(): Promise<Venue> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Venue(this.venue);
    this.venue.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }

  protected async postResource(): Promise<Venue> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.venue = new Venue(this.body);

    return await this.putSafeResource({ noOverwrite: true });
  }

  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Venue> {
    const errors = this.venue.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.venues, Item: this.venue };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(venueId)';
      await ddb.put(putParams);

      return this.venue;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.venues, Key: { venueId: this.resourceId } });
    } catch (err) {
      throw new HandledError('Delete failed');
    }
  }

  protected async postResources(): Promise<Venue> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.venue = new Venue(this.body);
    this.venue.venueId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Venue[]> {
    try {
      return (await ddb.scan({ TableName: DDB_TABLES.venues }))
        .map((x: Venue) => new Venue(x))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }
}
