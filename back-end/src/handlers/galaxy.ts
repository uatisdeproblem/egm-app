///
/// IMPORTS
///

import { default as Axios } from 'axios';
import { parseStringPromise } from 'xml2js';
import { DynamoDB, HandledError, ResourceController, SystemsManager } from 'idea-aws';

import { createAuthTokenWithUserId } from '../utils/auth.utils';

import { AuthServices, User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const CAS_URL = 'https://accounts.esn.org/cas';
const APP_URL = process.env.STAGE === 'prod' ? 'https://app.erasmusgeneration.org' : 'https://dev.egm-app.click';

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

  constructor(event: any, callback: any) {
    super(event, callback);
    this.callback = callback;
    this.host = event.headers?.host ?? null;
    this.stage = process.env.STAGE ?? null;
  }

  protected async getResources(): Promise<any> {
    try {
      // build a URL to valid the ticket received (consider also the localhost exception)
      const localhost = this.queryParams.localhost ? `?localhost=${this.queryParams.localhost}` : '';
      const serviceURL = `https://${this.host}/${this.stage}/galaxy${localhost}`;
      const validationURL = `${CAS_URL}/serviceValidate?service=${serviceURL}&ticket=${this.queryParams.ticket}`;

      const ticketValidation = await Axios.get(validationURL);
      const jsonWithUserData = await parseStringPromise(ticketValidation.data);
      this.logger.debug('CAS ticket validated and parsed', { ticket: jsonWithUserData });

      const success = !!jsonWithUserData['cas:serviceResponse']['cas:authenticationSuccess'];
      if (!success) throw new HandledError('ESN accounts sign-in failed');

      const data = jsonWithUserData['cas:serviceResponse']['cas:authenticationSuccess'][0];
      const attributes = data['cas:attributes'][0];
      const userId = AuthServices.ESN_ACCOUNTS.concat('_', data['cas:user'][0]);

      let user: User;
      let firstAccess = false;
      try {
        user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));
        user.sectionCode = attributes['cas:sc'][0];
        user.sectionCountry = attributes['cas:country'][0];
        user.sectionName = attributes['cas:section'][0];
      } catch (error) {
        firstAccess = true;
        user = new User({
          userId,
          authService: AuthServices.ESN_ACCOUNTS,
          firstName: attributes['cas:first'][0],
          lastName: attributes['cas:last'][0],
          email: attributes['cas:mail'][0],
          avatarURL: attributes['cas:picture'][0],
          sectionCode: attributes['cas:sc'][0],
          sectionCountry: attributes['cas:country'][0],
          sectionName: attributes['cas:section'][0]
        });
      }

      this.logger.info('ESN Accounts sign-in', user);

      const putParams = {
        TableName: DDB_TABLES.users,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)'
      };
      if (!firstAccess) delete putParams.ConditionExpression;
      await ddb.put(putParams);

      const token = await createAuthTokenWithUserId(ssm, userId);

      // redirect to the front-end with the fresh new token (instead of resolving)
      const appURL = this.queryParams.localhost ? `http://localhost:${this.queryParams.localhost}` : APP_URL;
      this.callback(null, { statusCode: 302, headers: { Location: `${appURL}/auth?token=${token}` } });
    } catch (err) {
      this.logger.error('ESN Accounts sign-in failed', err);
      throw new HandledError('ESN Accounts sign-in failed');
    }
  }
}
