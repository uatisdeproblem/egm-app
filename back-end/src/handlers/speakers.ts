///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Speaker } from '../models/speaker';
import { OrganizationLinked } from '../models/organization';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = { speakers: process.env.DDB_TABLE_speakers, organizations: process.env.DDB_TABLE_organizations };

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Speakers(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Speakers extends ResourceController {
  speaker: Speaker;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'speakerId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.resourceId) return;

    try {
      this.speaker = new Speaker(
        await ddb.get({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.resourceId } })
      );
    } catch (err) {
      throw new RCError('Speaker not found');
    }
  }

  protected async getResource(): Promise<Speaker> {
    return this.speaker;
  }

  protected async putResource(): Promise<Speaker> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    const oldResource = new Speaker(this.speaker);
    this.speaker.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Speaker> {
    const errors = this.speaker.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    this.speaker.organization = new OrganizationLinked(
      await ddb.get({
        TableName: DDB_TABLES.organizations,
        Key: { organizationId: this.speaker.organization.organizationId }
      })
    );

    try {
      const putParams: any = { TableName: DDB_TABLES.speakers, Item: this.speaker };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(speakerId)';
      await ddb.put(putParams);

      return this.speaker;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  protected async postResources(): Promise<Speaker> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    this.speaker = new Speaker(this.body);
    this.speaker.speakerId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Speaker[]> {
    try {
      const speakers = (await ddb.scan({ TableName: DDB_TABLES.speakers })).map((x: Speaker) => new Speaker(x));

      const filteredSpeakers = this.queryParams.organization
        ? speakers.filter(x => x.organization.organizationId === this.queryParams.organization)
        : speakers;

      const sortedSpeakers = filteredSpeakers.sort((a, b) => a.name.localeCompare(b.name));

      return sortedSpeakers;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }
}
