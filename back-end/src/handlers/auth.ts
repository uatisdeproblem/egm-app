///
/// IMPORTS
///

import { SystemsManager } from 'idea-aws';

import { verifyAuthTokenAndGetUserId } from '../utils/auth.utils';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const ssm = new SystemsManager();

export const handler = async (event: any): Promise<AuthResult> => {
  const result: AuthResult = { isAuthorized: false };

  const principalId = await verifyAuthTokenAndGetUserId(ssm, event.headers.authorization);
  if (principalId) {
    result.context = { principalId };
    result.isAuthorized = true;
  }

  return result;
};

/**
 * Expected result by a Lambda authorizer (payload format: 2.0).
 */
interface AuthResult {
  isAuthorized: boolean;
  context?: { principalId: string };
}
