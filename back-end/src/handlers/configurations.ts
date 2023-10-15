///
/// IMPORTS
///

import { DynamoDB, GetObjectTypes, RCError, ResourceController, S3, SES } from 'idea-aws';

import { Configurations } from '../models/configurations.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const STAGE = process.env.STAGE;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  configurations: process.env.DDB_TABLE_configurations,
  eventSpots: process.env.DDB_TABLE_eventSpots
};
const ddb = new DynamoDB();

const BASE_URL = STAGE === 'prod' ? 'https://egm-app.click' : 'https://dev.egm-app.click'; // @todo change to app.erasmusgeneration.org
const SES_CONFIG = {
  sourceName: 'EGM app',
  source: process.env.SES_SOURCE_ADDRESS,
  sourceArn: process.env.SES_IDENTITY_ARN,
  region: process.env.SES_REGION
};
const TEST_EMAIL_EXAMPLE_COUNTRY = 'ESN Iberia';
const TEST_EMAIL_EXAMPLE_SECTION = 'ESN Rio Tinto';
const TEST_EMAIL_EXAMPLE_SPOT_TYPE = 'Test participant';
const TEST_EMAIL_EXAMPLE_SPOT_ID = 'spot-12345';
const TEST_EMAIL_EXAMPLE_PRICE = '96';
const TEST_EMAIL_EXAMPLE_URL = BASE_URL;
const ses = new SES();

const s3 = new S3();
const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_ASSETS_FOLDER = process.env.S3_ASSETS_FOLDER;

export const handler = (ev: any, _: any, cb: any): Promise<void> => new ConfigurationsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class ConfigurationsRC extends ResourceController {
  user: User;
  configurations: Configurations;

  constructor(event: any, callback: any) {
    super(event, callback);
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new RCError('User not found');
    }

    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    try {
      this.configurations = new Configurations(
        await ddb.get({ TableName: DDB_TABLES.configurations, Key: { PK: Configurations.PK } })
      );
    } catch (err) {
      throw new RCError('Configuration not found');
    }
  }

  protected async getResources(): Promise<Configurations> {
    return this.configurations;
  }

  protected async putResources(): Promise<Configurations> {
    const oldConfig = new Configurations(this.configurations);
    this.configurations.safeLoad(this.body, oldConfig);

    return await this.putSafeResource();
  }
  private async putSafeResource(): Promise<Configurations> {
    const errors = this.configurations.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    await ddb.put({ TableName: DDB_TABLES.configurations, Item: this.configurations });
    return this.configurations;
  }

  protected async patchResources(): Promise<{ subject: string; content: string } | void> {
    switch (this.body.action) {
      case 'GET_EMAIL_TEMPLATE_REGISTRATION_APPROVED':
        return await this.getEmailTemplate('registration-approved');
      case 'SET_EMAIL_TEMPLATE_REGISTRATION_APPROVED':
        return await this.setEmailTemplate('registration-approved', this.body.subject, this.body.content);
      case 'RESET_EMAIL_TEMPLATE_REGISTRATION_APPROVED':
        return await this.resetEmailTemplate('registration-approved');
      case 'TEST_EMAIL_TEMPLATE_REGISTRATION_APPROVED':
        return await this.testEmailTemplate('registration-approved');
      case 'GET_EMAIL_TEMPLATE_REGISTRATION_REFUSED':
        return await this.getEmailTemplate('registration-refused');
      case 'SET_EMAIL_TEMPLATE_REGISTRATION_REFUSED':
        return await this.setEmailTemplate('registration-refused', this.body.subject, this.body.content);
      case 'RESET_EMAIL_TEMPLATE_REGISTRATION_REFUSED':
        return await this.resetEmailTemplate('registration-refused');
      case 'TEST_EMAIL_TEMPLATE_REGISTRATION_REFUSED':
        return await this.testEmailTemplate('registration-refused');
      // @todo are invoices sent as email or just used to generate PDF and put attachment?
      case 'GET_EMAIL_TEMPLATE_INVOICE':
        return await this.getEmailTemplate('payment-invoice');
      case 'SET_EMAIL_TEMPLATE_INVOICE':
        return await this.setEmailTemplate('payment-invoice', this.body.subject, this.body.content);
      case 'RESET_EMAIL_TEMPLATE_INVOICE':
        return await this.resetEmailTemplate('payment-invoice');
      case 'TEST_EMAIL_TEMPLATE_INVOICE':
        return await this.testEmailTemplate('payment-invoice');
      default:
        throw new RCError('Unsupported action');
    }
  }
  private async getEmailTemplate(emailTemplate: string): Promise<{ subject: string; content: string }> {
    try {
      const template = await ses.getTemplate(`${emailTemplate}-${STAGE}`);
      return { subject: template.Subject, content: template.Html };
    } catch (error) {
      throw new RCError('Template not found');
    }
  }
  private async setEmailTemplate(emailTemplate: string, subject: string, content: string): Promise<void> {
    if (!subject) throw new RCError('Missing subject');
    if (!content) throw new RCError('Missing content');

    await ses.setTemplate(`${emailTemplate}-${STAGE}`, subject, content, true);
  }
  private async testEmailTemplate(emailTemplate: string): Promise<void> {
    const toAddresses = [this.user.email];
    const template = `${emailTemplate}-${STAGE}`;
    const templateData = {
      user: `${this.user.firstName} ${this.user.lastName}`,
      country: TEST_EMAIL_EXAMPLE_COUNTRY,
      section: TEST_EMAIL_EXAMPLE_SECTION,
      spotType: TEST_EMAIL_EXAMPLE_SPOT_TYPE,
      spotId: TEST_EMAIL_EXAMPLE_SPOT_ID,
      price: TEST_EMAIL_EXAMPLE_PRICE,
      url: TEST_EMAIL_EXAMPLE_URL
    };

    try {
      await ses.testTemplate(template, templateData);
    } catch (error) {
      this.logger.warn('Elaborating template', error, { template });
      throw new RCError('Bad template');
    }

    try {
      await ses.sendTemplatedEmail({ toAddresses, template, templateData }, SES_CONFIG);
    } catch (error) {
      this.logger.warn('Sending template', error, { template });
      throw new RCError('Sending failed');
    }
  }
  private async resetEmailTemplate(emailTemplate: string): Promise<void> {
    const subject = `${emailTemplate}-${STAGE}`;
    const content = (await s3.getObject({
      bucket: S3_BUCKET_MEDIA,
      key: S3_ASSETS_FOLDER.concat('/', emailTemplate, '.hbs'),
      type: GetObjectTypes.TEXT
    })) as string;
    await ses.setTemplate(`${emailTemplate}-${STAGE}`, subject, content, true);
  }
}
