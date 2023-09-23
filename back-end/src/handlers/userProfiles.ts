///
/// IMPORTS
///

import { Cognito, DynamoDB, RCError, ResourceController, S3 } from 'idea-aws';
import { Roles, UserProfile } from '../models/userProfile.model';
import { SignedURL } from 'idea-toolbox';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_REGION = COGNITO_USER_POOL_ID.split('_')[0];
const cognito = new Cognito({ region: COGNITO_REGION });

const PROJECT = process.env.PROJECT;
const DDB_TABLES = {
  userProfiles: process.env.DDB_TABLE_userProfiles
};
const ddb = new DynamoDB();

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_IMAGES_FOLDER = process.env.S3_IMAGES_FOLDER;
const s3 = new S3();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new UserProfiles(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class UserProfiles extends ResourceController {
  requestingUserId: string;
  requestingUser: UserProfile;
  profile: UserProfile;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
    this.requestingUserId = this.cognitoUser?.userId
      ? this.cognitoUser?.userId
      : event.requestContext.authorizer.lambda.principalId;
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.requestingUser = new UserProfile(
        await ddb.get({ TableName: DDB_TABLES.userProfiles, Key: { userId: this.requestingUserId } })
      );
    } catch (err) {
      if (String(err) === 'Error: Not found') await this.initProfile();
      else throw new RCError('Profile not found');
    }

    if (!this.resourceId) return;

    if (this.requestingUserId === this.resourceId) {
      this.profile = this.requestingUser;
      return;
    }

    if (this.requestingUserId !== this.resourceId && !this.requestingUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      this.profile = new UserProfile(
        await ddb.get({ TableName: DDB_TABLES.userProfiles, Key: { userId: this.resourceId } })
      );
    } catch (error) {
      throw new RCError('Profile not found');
    }
  }

  private async initProfile() {
    if (this.cognitoUser?.userId) {
      this.requestingUser = new UserProfile({
        userId: this.cognitoUser.userId,
        name: this.cognitoUser.name,
        email: this.cognitoUser.email,
        roles: [],
        sectionCode: 'EXT',
        section: 'EXTERNAL',
        country: 'EXTERNAL',
        avatarURL: this.cognitoUser.picture,
        isExternal: true,
        isAdministrator: false // externals can't be admins
      });
      await ddb.put({ TableName: DDB_TABLES.userProfiles, Item: this.requestingUser });
    } else throw new RCError('Profile not found');
  }

  protected async getResource(): Promise<UserProfile> {
    return this.profile;
  }

  protected async putResource(): Promise<UserProfile> {
    if (!this.profile.isExternal) throw new RCError('Can only modify data for externals!');

    const oldProfile = new UserProfile(this.profile);
    this.profile.safeLoad(this.body, oldProfile);

    return await this.putSafeResource({ noOverwrite: false });
  }

  protected async patchResource(): Promise<UserProfile> {
    switch (this.body.action) {
      case 'CHANGE_ROLE':
        return await this.changeUserRole(this.body.role);
      default:
        throw new RCError('Unsupported action');
    }
  }

  private async changeUserRole(role: Roles): Promise<UserProfile> {
    if (!this.requestingUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.update({
        TableName: DDB_TABLES.userProfiles,
        Key: { userId: this.profile.userId },
        UpdateExpression: `SET role = :role`,
        ExpressionAttributeValues: { ':role': role }
      });
      return this.profile;
    } catch (err) {
      throw new RCError('Error updating user role');
    }
  }

  private async putSafeResource(opts: { noOverwrite: boolean }): Promise<UserProfile> {
    const errors = this.profile.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    const putParams: any = { TableName: DDB_TABLES.userProfiles, Item: this.profile };
    if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(userId)';
    await ddb.put(putParams);

    return this.profile;
  }

  protected async deleteResources(): Promise<void> {
    await ddb.delete({
      TableName: DDB_TABLES.userProfiles,
      Key: { userId: this.requestingUserId }
    });

    if (this.requestingUser.isExternal) await cognito.deleteUser(this.requestingUser.email, this.requestingUser.userId);
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
    const signedURL = await s3.signedURLPut(S3_BUCKET_MEDIA, key, { filename: `${this.profile.userId}-avatar.png` });
    signedURL.id = imageURI;

    return signedURL;
  }
}
