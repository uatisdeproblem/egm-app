///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController, SES, EmailData, S3 } from 'idea-aws';

import { Message } from '../models/message';
import { UserProfile } from '../models/userProfile';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = { messages: process.env.DDB_TABLE_messages, profiles: process.env.DDB_TABLE_userProfiles };

const SES_CONFIG = {
  sourceName: 'EGM',
  source: process.env.SES_SOURCE_ADDRESS,
  sourceArn: process.env.SES_IDENTITY_ARN,
  region: process.env.SES_REGION
};

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_USERS_CV_FOLDER = process.env.S3_USERS_CV_FOLDER;

const ddb = new DynamoDB();
const ses = new SES();
const s3 = new S3();

export const handler = (ev: any, _: any, cb: any) => new Messages(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Messages extends ResourceController {
  message: Message;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'messageId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.resourceId) return;

    try {
      this.message = new Message(
        await ddb.get({ TableName: DDB_TABLES.messages, Key: { organizationId: this.resourceId } })
      );
    } catch (err) {
      throw new RCError('Organization not found');
    }
  }

  protected async getResource(): Promise<Message> {
    return this.message;
  }

  protected async putResource(): Promise<Message> {
    const oldResource = new Message(this.message);
    this.message.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Message> {
    const errors = this.message.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.messages, Item: this.message };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(messageId)';
      await ddb.put(putParams);

      return this.message;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async patchResource(): Promise<void> {
    switch (this.body.action) {
      case 'SEND_USER_CONTACTS':
        return ; //await this.likeMessage()
      default:
        throw new RCError('Unsupported action');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.messages, Key: { messageId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  protected async postResources(): Promise<Message> {
    this.message = new Message(this.body);
    this.message.messageId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Message[]> {
    try {
      return (await ddb.scan({ TableName: DDB_TABLES.messages }))
        .map((x: Message) => new Message(x));
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }
}
