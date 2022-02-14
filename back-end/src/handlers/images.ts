///
/// IMPORTS
///

import { RCError, ResourceController, S3, DynamoDB } from 'idea-aws';
import { SignedURL } from 'idea-toolbox';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_IMAGES_FOLDER = process.env.S3_IMAGES_FOLDER;

const s3 = new S3();
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Images(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Images extends ResourceController {
  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');
  }

  protected async postResources(): Promise<SignedURL> {
    this.resourceId = await ddb.IUNID(PROJECT);

    const key = S3_IMAGES_FOLDER.concat('/', this.resourceId, '.png');
    const signedURL = s3.signedURLPut(S3_BUCKET_MEDIA, key);
    signedURL.id = this.resourceId;

    return signedURL;
  }
}
