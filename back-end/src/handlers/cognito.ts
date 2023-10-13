///
/// IMPORTS
///

import { Cognito, DynamoDB, RCError, ResourceController, SystemsManager } from 'idea-aws';

import { createAuthTokenWithUserId } from '../utils/auth.utils';

import { AuthServices, User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const DEFAULT_PASSWORD_LENGTH = 8;

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_USER_POOL_CLIENT_ID = process.env.COGNITO_USER_POOL_CLIENT_ID;
const cognito = new Cognito();

const DDB_TABLES = { users: process.env.DDB_TABLE_users };
const ddb = new DynamoDB();

const ssm = new SystemsManager();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new CognitoRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class CognitoRC extends ResourceController {
  constructor(event: any, callback: any) {
    super(event, callback);
  }

  protected async postResources(): Promise<any> {
    switch (this.body.action) {
      case 'SIGN_IN':
        return this.signIn(this.body.email, this.body.password);
      case 'SIGN_UP':
        return this.signUp(this.body.email, this.body.firstName, this.body.lastName);
      case 'CONFIRM_SIGN_UP':
        return this.confirmSignUp(this.body.email, this.body.confirmationCode);
      case 'RESEND_TEMPORARY_PASSWORD':
        return this.resendTemporaryPassword(this.body.email);
      default:
        throw new RCError('Unsupported action');
    }
  }
  private async signIn(email: string, password: string): Promise<{ token: string }> {
    try {
      await cognito.signIn(email, password, COGNITO_USER_POOL_ID, COGNITO_USER_POOL_CLIENT_ID);
    } catch (error) {
      this.logger.error('Cognito sign in failed', error);
      throw new RCError('Cognito sign-in failed');
    }

    const cognitoUser = await cognito.getUserByEmail(email, COGNITO_USER_POOL_ID);
    const userId = AuthServices.COGNITO.concat('_', cognitoUser.userId);

    const user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));
    await ddb.put({ TableName: DDB_TABLES.users, Item: user });

    const token = await createAuthTokenWithUserId(ssm, user);
    return { token };
  }
  private async signUp(email: string, firstName: string, lastName: string): Promise<{ token: string }> {
    const user = new User({ authService: AuthServices.COGNITO, firstName, lastName, email });

    const errors = user.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const cognitoUserId = await cognito.createUser(email, COGNITO_USER_POOL_ID);
      user.userId = AuthServices.COGNITO.concat('_', cognitoUserId);

      await ddb.put({ TableName: DDB_TABLES.users, Item: user, ConditionExpression: 'attribute_not_exists(userId)' });
    } catch (error) {
      this.logger.error('Cognito sign up failed', error);
      throw new RCError('Cognito sign up failed');
    }

    const token = await createAuthTokenWithUserId(ssm, user);
    return { token };
  }
  private async confirmSignUp(email: string, confirmationCode: string): Promise<void> {
    await cognito.confirmSignUp(email, confirmationCode, COGNITO_USER_POOL_ID);
  }
  private async resendTemporaryPassword(email: string): Promise<void> {
    const temporaryPassword = Math.random().toString(36).substring(4).slice(0, DEFAULT_PASSWORD_LENGTH);
    await cognito.resendPassword(email, COGNITO_USER_POOL_ID, { temporaryPassword });
  }
}
