///
/// IMPORTS
///

import { Cognito, DynamoDB, RCError, ResourceController, S3 } from 'idea-aws';
import { SignedURL } from 'idea-toolbox';

import { UserProfile } from '../models/userProfile';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_IMAGES_FOLDER = process.env.S3_IMAGES_FOLDER;

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const DDB_TABLES = {
  profiles: process.env.TABLE_PROFILES,
  usersFavoriteSessions: process.env.TABLE_USERS_FAVORITE_SESSIONS
};

const ddb = new DynamoDB();
const s3 = new S3();
const cognito = new Cognito();

export const handler = (ev: any, _: any, cb: any) => new Users(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Users extends ResourceController {
  profile: UserProfile;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.resourceId) throw new Error('Unauthorized');

    if (this.resourceId === 'me') this.resourceId = this.principalId;

    const userManageOwnProfile = this.resourceId === this.principalId;
    if (!userManageOwnProfile) throw new Error('Unauthorized');

    try {
      this.profile = new UserProfile(
        await ddb.get({ TableName: DDB_TABLES.profiles, Key: { userId: this.resourceId } })
      );
    } catch (err) {
      await this.createUserProfile();
    }
  }
  private async createUserProfile(): Promise<void> {
    this.profile = new UserProfile({ userId: this.principalId });

    await ddb.put({
      TableName: DDB_TABLES.profiles,
      Item: this.profile,
      ConditionExpression: 'attribute_not_exists(userId)'
    });
  }

  protected async getResource(): Promise<UserProfile> {
    return this.profile;
  }

  protected async putResource(): Promise<UserProfile> {
    const oldResource = new UserProfile(this.profile);
    this.profile.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<UserProfile> {
    const errors = this.profile.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.profiles, Item: this.profile };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(userId)';
      await ddb.put(putParams);

      return this.profile;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async patchResource(): Promise<SignedURL | string[] | void> {
    switch (this.body.action) {
      case 'GET_IMAGE_UPLOAD_URL':
        return await this.getUploadImageURL();
      case 'ADD_FAVORITE_SESSION':
        return await this.setFavoriteSession(this.body.sessionId, true);
      case 'REMOVE_FAVORITE_SESSION':
        return await this.setFavoriteSession(this.body.sessionId, false);
      case 'GET_FAVORITE_SESSIONS':
        return await this.getFavoriteSessions();
      default:
        throw new RCError('Unsupported action');
    }
  }
  private async getUploadImageURL(): Promise<SignedURL> {
    const id = await ddb.IUNID(PROJECT);

    const key = S3_IMAGES_FOLDER.concat('/', id, '.png');
    const signedURL = s3.signedURLPut(S3_BUCKET_MEDIA, key);
    signedURL.id = id;

    return signedURL;
  }
  private async setFavoriteSession(sessionId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite)
      await ddb.put({ TableName: DDB_TABLES.usersFavoriteSessions, Item: { userId: this.principalId, sessionId } });
    else
      await ddb.delete({ TableName: DDB_TABLES.usersFavoriteSessions, Key: { userId: this.principalId, sessionId } });
  }
  private async getFavoriteSessions(): Promise<string[]> {
    return (
      await ddb.query({
        TableName: DDB_TABLES.usersFavoriteSessions,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': this.principalId }
      })
    ).map((x: { sessionId: string }) => x.sessionId);
  }

  protected async deleteResource(): Promise<void> {
    try {
      await ddb.delete({ TableName: DDB_TABLES.profiles, Key: { userId: this.resourceId } });
      await cognito.deleteUser(this.principalId, COGNITO_USER_POOL_ID);
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }
}
