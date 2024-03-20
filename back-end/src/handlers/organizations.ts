///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Organization } from '../models/organization.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = { users: process.env.DDB_TABLE_users, organizations: process.env.DDB_TABLE_organizations };

// @todo add CV stuff?
// const SES_CONFIG = {
//   sourceName: 'EGM',
//   source: process.env.SES_SOURCE_ADDRESS,
//   sourceArn: process.env.SES_IDENTITY_ARN,
//   region: process.env.SES_REGION
// };

// const EMAIL_CONTENTS = {
//   subject: '[EGM] Contact request',
//   textHeader:
//     "Hi,\nthis is an automatic email from the EGM app.\n\nI'd like to get in touch with your organization; therefore, here is my contact information:\n\n",
//   textAttachment: '\n\nYou can find attached my CV.\n',
//   textFooter: '\n\nBest regards,\n'
// };

// const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
// const S3_USERS_CV_FOLDER = process.env.S3_USERS_CV_FOLDER;

const ddb = new DynamoDB();
// const ses = new SES();
// const s3 = new S3();

export const handler = (ev: any, _: any, cb: any) => new Organizations(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Organizations extends ResourceController {
  user: User;
  organization: Organization;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'organizationId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (!this.resourceId) return;

    try {
      this.organization = new Organization(
        await ddb.get({ TableName: DDB_TABLES.organizations, Key: { organizationId: this.resourceId } })
      );
    } catch (err) {
      throw new HandledError('Organization not found');
    }
  }

  protected async getResource(): Promise<Organization> {
    return this.organization;
  }

  protected async putResource(): Promise<Organization> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Organization(this.organization);
    this.organization.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Organization> {
    const errors = this.organization.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.organizations, Item: this.organization };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(organizationId)';
      await ddb.put(putParams);

      return this.organization;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }

  // protected async patchResource(): Promise<void> {
  //   switch (this.body.action) {
  //     case 'SEND_USER_CONTACTS':
  //       return await this.sendUserContacts();
  //     default:
  //       throw new HandledError('Unsupported action');
  //   }
  // }

  // @todo?
  // private async sendUserContacts(): Promise<void> {
  // if (!this.organization.contactEmail) throw new Error('No target email address');
  // const userProfile = new UserProfile(
  //   await ddb.get({
  //     TableName: DDB_TABLES.profiles,
  //     Key: { userId: this.cognitoUser.userId }
  //   })
  // );
  // if (!userProfile.contactEmail) throw new Error('No source email address');
  // const emailData: EmailData = {
  //   toAddresses: [this.organization.contactEmail],
  //   replyToAddresses: [userProfile.contactEmail],
  //   subject: EMAIL_CONTENTS.subject
  // };
  // let emailText = EMAIL_CONTENTS.textHeader;
  // const contactInfo = [userProfile.getName(), userProfile.contactEmail];
  // if (this.body.sendPhone) contactInfo.push(userProfile.contactPhone);
  // emailText = emailText.concat(contactInfo.map(x => `- ${x}`).join('\n'));
  // if (this.body.sendCV && userProfile.hasUploadedCV) {
  //   const key = S3_USERS_CV_FOLDER.concat('/', this.cognitoUser.userId, '.pdf');
  //   const { url } = s3.signedURLGet(S3_BUCKET_MEDIA, key);
  //   emailData.attachments = [{ path: url, filename: 'CV.pdf', contentType: 'application/pdf' }];
  //   emailText = emailText.concat(EMAIL_CONTENTS.textAttachment);
  // }
  // emailText = emailText.concat(EMAIL_CONTENTS.textFooter, userProfile.getName());
  // emailData.text = emailText;
  // await ses.sendEmail(emailData, SES_CONFIG);
  // }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.organizations, Key: { organizationId: this.resourceId } });
    } catch (err) {
      throw new HandledError('Delete failed');
    }
  }

  protected async postResources(): Promise<Organization> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.organization = new Organization(this.body);
    this.organization.organizationId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Organization[]> {
    try {
      return (await ddb.scan({ TableName: DDB_TABLES.organizations }))
        .map((x: Organization) => new Organization(x))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }
}
