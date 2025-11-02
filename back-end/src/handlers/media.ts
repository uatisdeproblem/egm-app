///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController, S3 } from 'idea-aws';
import { SignedURL } from 'idea-toolbox';

import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;
const ddb = new DynamoDB();

const DDB_TABLES = { users: process.env.DDB_TABLE_users };

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_IMAGES_FOLDER = process.env.S3_IMAGES_FOLDER;
const s3 = new S3();

export const handler = (ev: any) => new Media(ev).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Media extends ResourceController {
  user: User;

  constructor(event: any) {
    super(event);
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (_) {
      throw new HandledError('User not found');
    }

    if (!this.user.permissions.isAdmin) throw new HandledError('Unauthorized');
  }

  protected async postResources(): Promise<SignedURL> {
    const imageURI = await ddb.IUNID(PROJECT.concat('-media'));

    const key = `${S3_IMAGES_FOLDER}/${imageURI}.png`;
    const signedURL = await s3.signedURLPut(S3_BUCKET_MEDIA, key);
    signedURL.id = imageURI;

    return signedURL;
  }
}
