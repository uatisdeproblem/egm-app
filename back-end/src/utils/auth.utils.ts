import { sign, verify } from 'jsonwebtoken';
import { SystemsManager } from 'idea-aws';

const SECRETS_PATH = '/egm/auth';
let JWT_SECRET: string;
const JWT_EXPIRE_TIME = '7 days';

/**
 * Verify an auth token and return the user ID of the owner user.
 */
export const verifyAuthTokenAndGetUserId = async (ssm: SystemsManager, token: string): Promise<string> => {
  const secretJWT = await getJwtSecretFromSecretsManager(ssm);
  return new Promise(resolve => {
    verify(token, secretJWT, (err: Error, decoded: any): void => {
      if (err) resolve(null);
      else resolve(decoded.userId);
    });
  });
};

/**
 * Create a new auth token containing the ID of the user.
 */
export const createAuthTokenWithUserId = async (ssm: SystemsManager, user: { userId: string }): Promise<string> => {
  const secretJWT = await getJwtSecretFromSecretsManager(ssm);
  return sign({ userId: user.userId }, secretJWT, { expiresIn: JWT_EXPIRE_TIME });
};

const getJwtSecretFromSecretsManager = async (ssm: SystemsManager): Promise<string> => {
  if (JWT_SECRET) return;
  JWT_SECRET = await ssm.getSecretByName(SECRETS_PATH);
  return JWT_SECRET;
};
