///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController, S3, SES } from 'idea-aws';
import { toISODate } from 'idea-toolbox';

import { sendEmail } from '../utils/notifications.utils';

import { Configurations } from '../models/configurations.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///
const PROJECT = process.env.PROJECT;
const STAGE = process.env.STAGE;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  configurations: process.env.DDB_TABLE_configurations,
  eventSpots: process.env.DDB_TABLE_eventSpots
};
const ddb = new DynamoDB();

const BASE_URL = STAGE === 'prod' ? 'https://app.erasmusgeneration.org' : 'https://dev.egm-app.click';
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
      throw new HandledError('User not found');
    }

    if (!this.user.permissions.isAdmin) throw new HandledError('Unauthorized');

    try {
      this.configurations = new Configurations(
        await ddb.get({ TableName: DDB_TABLES.configurations, Key: { PK: Configurations.PK } })
      );
    } catch (err) {
      throw new HandledError('Configuration not found');
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
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    for (const meal of this.configurations.mealConfigurations.mealInfo) {
      if (!meal.ticketId) {
        meal.ticketId = await ddb.IUNID(PROJECT);
      }
    }
    await ddb.put({ TableName: DDB_TABLES.configurations, Item: this.configurations });

    return this.configurations;
  }

  protected async patchResources(): Promise<{ subject: string; content: string } | void> {
    switch (this.body.action) {
      case 'GET_EMAIL_TEMPLATE':
        return await this.getEmailTemplate(this.body.template);
      case 'SET_EMAIL_TEMPLATE':
        return await this.setEmailTemplate(this.body.template, this.body.subject, this.body.content);
      case 'RESET_EMAIL_TEMPLATE':
        return await this.resetEmailTemplate(this.body.template);
      case 'TEST_EMAIL_TEMPLATE':
        return await this.testEmailTemplate(this.body.template);
      default:
        throw new HandledError('Unsupported action');
    }
  }
  private async getEmailTemplate(emailTemplate: string): Promise<{ subject: string; content: string }> {
    try {
      const template = await ses.getTemplate(`${emailTemplate}-${STAGE}`);
      return { subject: template.Subject, content: template.Html };
    } catch (error) {
      throw new HandledError('Template not found');
    }
  }
  private async setEmailTemplate(emailTemplate: string, subject: string, content: string): Promise<void> {
    if (!subject) throw new HandledError('Missing subject');
    if (!content) throw new HandledError('Missing content');

    await ses.setTemplate(`${emailTemplate}-${STAGE}`, subject, content, true);
  }
  private async testEmailTemplate(emailTemplate: string): Promise<void> {
    const toAddresses = [this.user.email];
    const template = `${emailTemplate}-${STAGE}`;
    const templateData = {
      user: this.user.getName(),
      name: this.user.getName(),
      country: TEST_EMAIL_EXAMPLE_COUNTRY,
      section: TEST_EMAIL_EXAMPLE_SECTION,
      spotType: TEST_EMAIL_EXAMPLE_SPOT_TYPE,
      spotId: TEST_EMAIL_EXAMPLE_SPOT_ID,
      price: TEST_EMAIL_EXAMPLE_PRICE,
      url: TEST_EMAIL_EXAMPLE_URL,
      reference: 1234551234,
      deadline: toISODate(new Date())
    };

    try {
      await sendEmail(toAddresses, template, templateData);
    } catch (error) {
      this.logger.warn('Error sending email', error, { template });
      throw new HandledError('Error sending email');
    }

    try {
      await ses.sendTemplatedEmail({ toAddresses, template, templateData }, SES_CONFIG);
    } catch (error) {
      this.logger.warn('Sending template', error, { template });
      throw new HandledError('Sending failed');
    }
  }
  private async resetEmailTemplate(emailTemplate: string): Promise<void> {
    const subject = `${emailTemplate}-${STAGE}`;
    const content = (await s3.getObjectAsText({
      bucket: S3_BUCKET_MEDIA,
      key: S3_ASSETS_FOLDER.concat('/', emailTemplate, '.hbs')
    })) as string;
    await ses.setTemplate(`${emailTemplate}-${STAGE}`, subject, content, true);
  }
}
