///
/// IMPORTS
///

import { default as Axios } from 'axios';
import { DynamoDB, HandledError, ResourceController, SystemsManager } from 'idea-aws';
import * as crypto from 'crypto';

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
const OAUTH_REDIRECT_URI = `https://${APP_URL}/openid-connect/esn_accounts`;
const OAUTH_SCOPE = 'oauth2_access_to_profile_information';

const DDB_TABLES = { users: process.env.DDB_TABLE_users };
const ddb = new DynamoDB();

const ssm = new SystemsManager();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new GalaxyRC(ev, cb).handleRequest();

///
/// HELPER FUNCTIONS FOR PKCE
///

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

///
/// RESOURCE CONTROLLER
///

class GalaxyRC extends ResourceController {
  host: string;
  stage: string;

  constructor(event: any, callback: any) {
    super(event, callback);
    this.callback = callback;
    this.host = event.headers?.host ?? null;
    this.stage = process.env.STAGE ?? null;
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
      this.logger.error('ESN Accounts OAuth sign-in failed', err);
      throw new HandledError('ESN Accounts sign-in failed');
    }
  }

  private initiateOAuthFlow(): void {
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Store code_verifier in a way that can be retrieved later
    // For now, we'll use a state parameter to encode it (in production, use a secure session store)
    const state = Buffer.from(JSON.stringify({
      codeVerifier,
      localhost: this.queryParams.localhost || null
    })).toString('base64url');

    // Build authorization URL
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: OAUTH_CLIENT_ID,
      redirect_uri: OAUTH_REDIRECT_URI,
      scope: OAUTH_SCOPE,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authorizationURL = `${OAUTH_AUTHORIZE_URL}?${authParams.toString()}`;

    this.logger.info('Initiating OAuth flow', { authorizationURL });

    // Redirect user to OAuth authorization endpoint
    this.callback(null, {
      statusCode: 302,
      headers: { Location: authorizationURL }
    });
  }

  private async exchangeCodeForToken(): Promise<string> {
    // Decode state to get code_verifier
    const stateData = JSON.parse(Buffer.from(this.queryParams.state, 'base64url').toString());
    const codeVerifier = stateData.codeVerifier;

    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: this.queryParams.code,
      redirect_uri: OAUTH_REDIRECT_URI,
      client_id: OAUTH_CLIENT_ID,
      code_verifier: codeVerifier
    });

    this.logger.debug('Exchanging code for token');

    const tokenResponse = await Axios.post(OAUTH_TOKEN_URL, tokenParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.data.access_token) {
      throw new Error('No access token received');
    }

    return tokenResponse.data.access_token;
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
    // Map OAuth userInfo to your User model
    // Note: You'll need to adjust these field mappings based on the actual response structure
    const userId = AuthServices.ESN_ACCOUNTS.concat('_', userInfo.id || userInfo.sub || userInfo.user_id);

    let user: User;
    let firstAccess = false;

    // Parse birthdate (adjust format based on actual response)
    let birthDate: string;
    if (userInfo.birthdate) {
      const [day, month, year] = userInfo.birthdate.split('/');
      birthDate = new Date(`${year}-${month}-${day}`).toISOString();
    }


    try {
      user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));
      // Update existing user
      user.firstName = userInfo.first_name || userInfo.given_name;
      user.lastName = userInfo.last_name || userInfo.family_name;
      user.email = userInfo.email;
      user.sectionCode = userInfo.section_code || userInfo.sc;
      user.sectionCountry = userInfo.section_country || userInfo.country;
      user.sectionName = userInfo.section_name || userInfo.section;
      if (birthDate) user.birthDate = birthDate;
    } catch (error) {
      // Create new user
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

    // Save user to database
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

    // Get localhost from state if present
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