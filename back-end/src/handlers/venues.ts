///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Venue } from '../models/venue';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = { venues: process.env.TABLE_VENUES };

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Venues(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Venues extends ResourceController {
  venue: Venue;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'venueId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.resourceId) return;

    try {
      this.venue = new Venue(await ddb.get({ TableName: DDB_TABLES.venues, Key: { venueId: this.resourceId } }));
    } catch (err) {
      throw new RCError('Venue not found');
    }
  }

  protected async getResource(): Promise<Venue> {
    return this.venue;
  }

  protected async putResource(): Promise<Venue> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    const oldResource = new Venue(this.venue);
    this.venue.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Venue> {
    const errors = this.venue.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.venues, Item: this.venue };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(venueId)';
      await ddb.put(putParams);

      return this.venue;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.venues, Key: { venueId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  protected async postResources(): Promise<Venue> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

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
      throw new RCError('Operation failed');
    }
  }
}
