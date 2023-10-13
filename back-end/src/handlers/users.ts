///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController, S3 } from 'idea-aws';
import { Roles, User } from '../models/user.model';
import { SignedURL } from 'idea-toolbox';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;
const DDB_TABLES = { users: process.env.DDB_TABLE_users };
const ddb = new DynamoDB();

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_IMAGES_FOLDER = process.env.S3_IMAGES_FOLDER;
const s3 = new S3();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new UsersRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class UsersRC extends ResourceController {
  requestingUser: User;
  targetUser: User;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.requestingUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new RCError('Requesting user not found');
    }

    if (this.resourceId === 'me') this.resourceId = this.principalId;

    if (!this.resourceId) return;

    if (this.principalId === this.resourceId) {
      this.targetUser = this.requestingUser;
      return;
    }

    if (this.principalId !== this.resourceId && !this.requestingUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      this.targetUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.resourceId } }));
    } catch (error) {
      throw new RCError('Target user not found');
    }
  }

  protected async getResource(): Promise<User> {
    return this.targetUser;
  }

  protected async putResource(): Promise<User> {
    const oldProfile = new User(this.targetUser);
    this.targetUser.safeLoad(this.body, oldProfile);

    return await this.putSafeResource({ noOverwrite: false });
  }

  protected async patchResource(): Promise<User> {
    switch (this.body.action) {
      case 'CHANGE_ROLE':
        return await this.changeUserRole(this.body.role);
      default:
        throw new RCError('Unsupported action');
    }
  }

  private async changeUserRole(role: Roles): Promise<User> {
    if (!this.requestingUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.update({
        TableName: DDB_TABLES.users,
        Key: { userId: this.targetUser.userId },
        UpdateExpression: `SET role = :role`,
        ExpressionAttributeValues: { ':role': role }
      });
      return this.targetUser;
    } catch (err) {
      throw new RCError('Error updating user role');
    }
  }

  private async putSafeResource(opts: { noOverwrite: boolean }): Promise<User> {
    const errors = this.targetUser.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    const putParams: any = { TableName: DDB_TABLES.users, Item: this.targetUser };
    if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(userId)';
    await ddb.put(putParams);

    return this.targetUser;
  }

  protected async deleteResources(): Promise<void> {
    await ddb.delete({
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId }
    });
  }

  protected async patchResources(): Promise<SignedURL> {
    switch (this.body.action) {
      case 'GET_IMAGE_UPLOAD_URL':
        return await this.getSignedURLToUploadImage();
      default:
        throw new RCError('Unsupported action');
    }
  }

  private async getSignedURLToUploadImage(): Promise<SignedURL> {
    const imageURI = await ddb.IUNID(PROJECT.concat('-avatar-'));

    const key = `${S3_IMAGES_FOLDER}/${imageURI}.png`;
    const signedURL = await s3.signedURLPut(S3_BUCKET_MEDIA, key, { filename: `${this.targetUser.userId}-avatar.png` });
    signedURL.id = imageURI;

    return signedURL;
  }
}
