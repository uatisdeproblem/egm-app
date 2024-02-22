///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Speaker } from '../models/speaker.model';
import { OrganizationLinked } from '../models/organization.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  speakers: process.env.DDB_TABLE_speakers,
  organizations: process.env.DDB_TABLE_organizations
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Speakers(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Speakers extends ResourceController {
  user: User;
  speaker: Speaker;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'speakerId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (!this.resourceId) return;

    try {
      this.speaker = new Speaker(
        await ddb.get({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.resourceId } })
      );
    } catch (err) {
      throw new HandledError('Speaker not found');
    }
  }

  protected async getResource(): Promise<Speaker> {
    return this.speaker;
  }

  protected async putResource(): Promise<Speaker> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Speaker(this.speaker);
    this.speaker.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Speaker> {
    const errors = this.speaker.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

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
      throw new HandledError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.resourceId } });
    } catch (err) {
      throw new HandledError('Delete failed');
    }
  }

  protected async postResources(): Promise<Speaker> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

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
      throw new HandledError('Operation failed');
    }
  }
}
