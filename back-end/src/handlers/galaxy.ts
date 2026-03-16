///
/// IMPORTS
///
import { webcrypto } from 'node:crypto';
(globalThis as any).crypto = webcrypto;

import { default as Axios } from 'axios';
import { DynamoDB, HandledError, ResourceController, SystemsManager } from 'idea-aws';
import * as arctic from 'arctic';

import { createAuthTokenWithUserId } from '../utils/auth.utils';
import { AuthServices, User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///
const APP_URL = process.env.STAGE === 'prod' ? 'https://app.erasmusgeneration.org' : 'https://dev.egm-app.click';
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_AUTHORIZE_URL = 'https://accounts.esn.org/oauth/authorize';
const OAUTH_TOKEN_URL = 'https://accounts.esn.org/oauth/token';
const OAUTH_USERINFO_URL = 'https://accounts.esn.org/oauth/v1/userinfo';
const OAUTH_SCOPE = 'oauth2_access_to_profile_information';

const DDB_TABLES = { users: process.env.DDB_TABLE_users };
const ddb = new DynamoDB();
const ssm = new SystemsManager();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new GalaxyRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class GalaxyRC extends ResourceController {
  host: string;
  stage: string;
  redirectUri: string;

  constructor(event: any, callback: any) {
    super(event, callback);
    this.callback = callback;
    this.host = event.headers?.host ?? null;
    this.stage = process.env.STAGE ?? null;
    this.redirectUri = `https://${this.host}/${this.stage}/galaxy`;
  }

  private getOAuthClient(): arctic.OAuth2Client {
    return new arctic.OAuth2Client(OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET, this.redirectUri);
  }

  protected async getResources(): Promise<any> {
    try {
      // Step 1: If no code is present, initiate OAuth flow
      if (!this.queryParams.code) {
        return this.initiateOAuthFlow();
      }

      // Step 2: Exchange authorization code for access token
      const accessToken = await this.exchangeCodeForToken();

      // Step 3: Get user information
      const userInfo = await this.getUserInfo(accessToken);

      // Step 4: Create or update user in database
      const user = await this.createOrUpdateUser(userInfo);

      // Step 5: Generate auth token and redirect
      await this.redirectWithToken(user.userId);
    } catch (err) {
      this.logger.error('ESN Accounts OAuth sign-in failed', {
        details: JSON.stringify(err)
      });
      throw new HandledError('ESN Accounts sign-in failed');
    }
  }

  private initiateOAuthFlow(): void {
    const state = arctic.generateState();

    const statePayload = Buffer.from(JSON.stringify({
      state,
      localhost: this.queryParams.localhost || null
    })).toString('base64url');

    // Senza PKCE
    const url = this.getOAuthClient().createAuthorizationURL(
      OAUTH_AUTHORIZE_URL,
      state,
      [OAUTH_SCOPE]
    );

    url.searchParams.set('state', statePayload);

    this.logger.info('Initiating OAuth flow', { url: url.toString() });

    this.callback(null, {
      statusCode: 302,
      headers: { Location: url.toString() }
    });
  }

  private async exchangeCodeForToken(): Promise<string> {
    try {
      // Senza codeVerifier
      const tokens = await this.getOAuthClient().validateAuthorizationCode(
        OAUTH_TOKEN_URL,
        this.queryParams.code,
        null
      );
      return tokens.accessToken();
    } catch (e) {
      if (e instanceof arctic.OAuth2RequestError) {
        this.logger.error('OAuth2RequestError', { code: e.code, message: e.message, details: JSON.stringify(e) });
        throw new Error(`OAuth error: ${e.code}`);
      }
      this.logger.error('Unknown token exchange error', { details: JSON.stringify(e) });
      throw e;
    }
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    this.logger.debug('Fetching user info');

    const userInfoResponse = await Axios.get(OAUTH_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    this.logger.debug('User info retrieved', { userInfo: userInfoResponse.data });

    return userInfoResponse.data;
  }

  private async createOrUpdateUser(userInfo: any): Promise<User> {
    const userId = AuthServices.ESN_ACCOUNTS.concat('_', userInfo.id || userInfo.sub || userInfo.user_id);

    let user: User;
    let firstAccess = false;

    let birthDate: string;
    if (userInfo.birthdate) {
      const [day, month, year] = userInfo.birthdate.split('/');
      birthDate = new Date(`${year}-${month}-${day}`).toISOString();
    }

    try {
      user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));
      user.firstName = userInfo.first_name || userInfo.given_name;
      user.lastName = userInfo.last_name || userInfo.family_name;
      user.email = userInfo.email;
      user.sectionCode = userInfo.section_code || userInfo.sc;
      user.sectionCountry = userInfo.section_country || userInfo.country;
      user.sectionName = userInfo.section_name || userInfo.section;
      if (birthDate) user.birthDate = birthDate;
    } catch (error) {
      firstAccess = true;
      user = new User({
        userId,
        authService: AuthServices.ESN_ACCOUNTS,
        firstName: userInfo.first_name || userInfo.given_name,
        lastName: userInfo.last_name || userInfo.family_name,
        email: userInfo.email,
        avatarURL: userInfo.picture || userInfo.avatar_url,
        sectionCode: userInfo.section_code || userInfo.sc,
        sectionCountry: userInfo.section_country || userInfo.country,
        sectionName: userInfo.section_name || userInfo.section,
        birthDate: birthDate
      });
    }

    this.logger.info('ESN Accounts OAuth sign-in', user);

    const putParams: any = {
      TableName: DDB_TABLES.users,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    };
    if (!firstAccess) delete putParams.ConditionExpression;
    await ddb.put(putParams);

    return user;
  }

  private async redirectWithToken(userId: string): Promise<void> {
    const token = await createAuthTokenWithUserId(ssm, userId);

    const stateData = this.queryParams.state
      ? JSON.parse(Buffer.from(this.queryParams.state, 'base64url').toString())
      : {};

    const appURL = stateData.localhost ? `http://localhost:${stateData.localhost}` : APP_URL;

    this.logger.info('Redirecting with auth token');

    this.callback(null, {
      statusCode: 302,
      headers: { Location: `${appURL}/auth?token=${token}` }
    });
  }
}