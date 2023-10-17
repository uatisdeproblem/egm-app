///
/// IMPORTS
///

import { Cognito, DynamoDB, RCError, ResourceController, SystemsManager } from 'idea-aws';

import { createAuthTokenWithUserId } from '../utils/auth.utils';

import { AuthServices, User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

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
        return this.signUp(this.body.email, this.body.password, this.body.firstName, this.body.lastName);
      case 'RESET_PASSWORD':
        return this.startResetPassword(this.body.email);
      case 'RESET_PASSWORD_CONFIRM':
        return this.confirmResetPassword(this.body.email, this.body.password, this.body.confirmationCode);
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

    let user: User;
    try {
      user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));
    } catch (error) {
      if (String(error) !== 'Error: Not found') throw error;
      user = new User({ userId, authService: AuthServices.COGNITO, email });
    }
    await ddb.put({ TableName: DDB_TABLES.users, Item: user });

    const token = await createAuthTokenWithUserId(ssm, userId);
    return { token };
  }
  private async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ token: string }> {
    const user = new User({ authService: AuthServices.COGNITO, firstName, lastName, email });

    const errors = user.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const cognitoUserId = await cognito.createUser(email, COGNITO_USER_POOL_ID, {
        temporaryPassword: password,
        skipNotification: true
      });
      await cognito.setPassword(email, COGNITO_USER_POOL_ID, { password, permanent: true });
      user.userId = AuthServices.COGNITO.concat('_', cognitoUserId);

      await ddb.put({ TableName: DDB_TABLES.users, Item: user });
    } catch (error) {
      this.logger.error('Cognito sign up failed', error);
      throw new RCError('Cognito sign up failed');
    }

    const token = await createAuthTokenWithUserId(ssm, user.userId);
    return { token };
  }
  private async startResetPassword(email: string): Promise<void> {
    await cognito.forgotPassword(email, COGNITO_USER_POOL_CLIENT_ID);
  }
  private async confirmResetPassword(email: string, newPassword: string, confirmationCode: string): Promise<void> {
    await cognito.confirmForgotPassword(email, newPassword, confirmationCode, COGNITO_USER_POOL_CLIENT_ID);
  }
}
