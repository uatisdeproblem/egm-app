///
/// IMPORTS
///

import { Cognito, DynamoDB, RCError, ResourceController, S3 } from 'idea-aws';
import { SignedURL } from 'idea-toolbox';

import { AuthServices, Roles, User } from '../models/user.model';
import { Configuration } from '../models/configuration.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;
const DDB_TABLES = { users: process.env.DDB_TABLE_users, configurations: process.env.DDB_TABLE_configurations };
const ddb = new DynamoDB();

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_IMAGES_FOLDER = process.env.S3_IMAGES_FOLDER;
const s3 = new S3();

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const cognito = new Cognito();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new UsersRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class UsersRC extends ResourceController {
  reqUser: User;
  targetUser: User;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.reqUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new RCError('Requesting user not found');
    }

    if (this.resourceId === 'me') this.resourceId = this.principalId;

    if (!this.resourceId) return;

    if (this.principalId === this.resourceId) {
      this.targetUser = this.reqUser;
      return;
    }

    if (this.principalId !== this.resourceId && !this.reqUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      this.targetUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.resourceId } }));
    } catch (error) {
      throw new RCError('Target user not found');
    }
  }

  protected async getResource(): Promise<User> {
    const configurations = new Configuration(
      await ddb.get({ TableName: DDB_TABLES.configurations, Key: { PK: Configuration.PK } })
    );
    (this.targetUser as any).configurations = configurations;
    return this.targetUser;
  }

  protected async putResource(): Promise<User> {
    const oldUser = new User(this.targetUser);
    this.targetUser.safeLoad(this.body, oldUser);

    return await this.putSafeResource();
  }
  private async putSafeResource(): Promise<User> {
    const errors = this.targetUser.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    await ddb.put({ TableName: DDB_TABLES.users, Item: this.targetUser });
    return this.targetUser;
  }

  protected async patchResource(): Promise<User | SignedURL> {
    switch (this.body.action) {
      case 'GET_AVATAR_UPLOAD_URL':
        return await this.getSignedURLToUploadAvatar();
      case 'REGISTER_TO_EVENT':
        return await this.registerToEvent(this.body.registrationForm, this.body.isDraft);
      case 'CHANGE_ROLE':
        return await this.changeUserRole(this.body.role);
      default:
        throw new RCError('Unsupported action');
    }
  }
  private async getSignedURLToUploadAvatar(): Promise<SignedURL> {
    if (this.reqUser !== this.targetUser) throw new RCError('Unauthorized');

    const imageURI = await ddb.IUNID(PROJECT.concat('-avatar-'));
    const key = `${S3_IMAGES_FOLDER}/${imageURI}.png`;
    const signedURL = await s3.signedURLPut(S3_BUCKET_MEDIA, key);
    signedURL.id = imageURI;
    return signedURL;
  }
  private async registerToEvent(registrationForm: any, isDraft: boolean): Promise<User> {
    if (this.targetUser.registrationAt && isDraft) throw new RCError("Can't go back to draft");

    const configurations = new Configuration(
      await ddb.get({ TableName: DDB_TABLES.configurations, Key: { PK: Configuration.PK } })
    );

    this.targetUser.registrationForm = configurations.registrationFormDef.loadSections(registrationForm);

    if (isDraft) this.targetUser.registrationAt = null;
    else {
      const errors = configurations.registrationFormDef.validateSections(this.targetUser.registrationForm);
      if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);
      this.targetUser.registrationAt = new Date().toISOString();
    }

    await ddb.update({
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId },
      UpdateExpression: 'SET registrationForm = :form, registrationAt = :at',
      ExpressionAttributeValues: { ':form': this.targetUser.registrationForm, ':at': this.targetUser.registrationAt }
    });

    return this.targetUser;
  }
  private async changeUserRole(role: Roles): Promise<User> {
    if (!this.reqUser.isAdmin()) throw new RCError('Unauthorized');

    await ddb.update({
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId },
      UpdateExpression: 'SET role = :role',
      ExpressionAttributeValues: { ':role': role }
    });
    return this.targetUser;
  }

  protected async deleteResource(): Promise<void> {
    if (this.targetUser.authService === AuthServices.COGNITO) {
      const cognitoUserId = this.targetUser.getAuthServiceUserId();
      const { email: cognitoUserEmail } = await cognito.getUserBySub(cognitoUserId, COGNITO_USER_POOL_ID);
      await cognito.deleteUser(cognitoUserEmail, COGNITO_USER_POOL_ID);
    }
    await ddb.delete({ TableName: DDB_TABLES.users, Key: { userId: this.targetUser.userId } });
    // @todo delete all user-related data
  }
}
