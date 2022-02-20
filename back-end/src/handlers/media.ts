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
const S3_DOCUMENTS_FOLDER = process.env.S3_DOCUMENTS_FOLDER;

const s3 = new S3();
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Media(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Media extends ResourceController {
  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');
  }
  private getMediaMeta(type: 'IMAGE' | 'DOCUMENT'): { folder: string; format: string } {
    let folder: string;
    let format: string;
    switch (type) {
      case 'DOCUMENT':
        folder = S3_DOCUMENTS_FOLDER;
        format = '.pdf';
        break;
      case 'IMAGE':
        folder = S3_IMAGES_FOLDER;
        format = '.png';
        break;
      default:
        throw new Error('Invalid type');
    }
    return { folder, format };
  }

  protected async postResources(): Promise<SignedURL> {
    const { folder, format } = this.getMediaMeta(this.body.type || 'IMAGE');

    this.resourceId = await ddb.IUNID(PROJECT);

    const key = folder.concat('/', this.resourceId, format);
    const signedURL = s3.signedURLPut(S3_BUCKET_MEDIA, key);
    signedURL.id = this.resourceId;

    return signedURL;
  }
}
