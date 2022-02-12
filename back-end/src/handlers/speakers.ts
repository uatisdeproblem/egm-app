///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController, S3 } from 'idea-aws';
import { SignedURL } from 'idea-toolbox';

import { Speaker } from '../models/speaker';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_SPEAKERS_IMAGES_FOLDER = process.env.S3_SPEAKERS_IMAGES_FOLDER;

const DDB_TABLES = { speakers: process.env.TABLE_SPEAKERS };

const ddb = new DynamoDB();
const s3 = new S3();

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

    try {
      const putParams: any = { TableName: DDB_TABLES.speakers, Item: this.speaker };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(speakerId)';
      await ddb.put(putParams);

      return this.speaker;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async patchResource(): Promise<SignedURL> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    switch (this.body.action) {
      case 'GET_IMAGE_UPLOAD_URL':
        return this.getUploadImageURL();
      default:
        throw new RCError('Unsupported action');
    }
  }
  private getUploadImageURL(): SignedURL {
    const key = S3_SPEAKERS_IMAGES_FOLDER.concat('/', this.resourceId, '.png');
    return s3.signedURLPut(S3_BUCKET_MEDIA, key);
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
      return (await ddb.scan({ TableName: DDB_TABLES.speakers }))
        .map((x: Speaker) => new Speaker(x))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }
}
