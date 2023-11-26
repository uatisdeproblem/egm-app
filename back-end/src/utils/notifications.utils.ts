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
