import { SES } from 'idea-aws';

const SES_CONFIG = {
  sourceName: 'EGM App',
  source: process.env.SES_SOURCE_ADDRESS,
  sourceArn: process.env.SES_IDENTITY_ARN,
  region: process.env.SES_REGION
};
const ses = new SES();

export const sendEmail = async (toAddresses: string[], template: string, templateData: any): Promise<void> => {
  SES_CONFIG.sourceName = 'EGM App';
  await ses.sendTemplatedEmail({ toAddresses, template, templateData }, SES_CONFIG);
};

export const sendSimpleEmail = async (toAddresses: string[], subject: string, text: string): Promise<void> => {
  SES_CONFIG.sourceName = 'EGM App';
  await ses.sendEmail({ toAddresses, subject, text }, SES_CONFIG);
};
