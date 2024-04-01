import { DynamoDB } from 'aws-sdk';
import { InvalidArgumentError, program } from 'commander';

import { initWithSSO, putItemsHelper, scanInfinite } from './utils/ddb.utils';

//
// PARAMS
//

program
  .name('EGM: Adds the feedback results and feedback comments array to the session model to avoid errors.')
  .option('-e, --env [environment]', 'The target environment', 'prod')
  .option('-w, --write', 'Whether to write data or just to simulate the execution', false)
  .showHelpAfterError('\tadd --help for additional information')
  .parse();
const options = program.opts();

const AWS_PROFILE = 'egm';
const DDB_TABLE_REGION = 'eu-central-1';
const DDB_TABLE_BASE = `egm-${options.env}-api_`;

//
// MAIN
//

main();

async function main(): Promise<void> {
  try {
    if (!options.env) throw new InvalidArgumentError('Missing environment');
  } catch (error) {
    program.error((error as any).message);
  }

  try {
    const { ddb } = await initWithSSO(AWS_PROFILE, DDB_TABLE_REGION);

    const sessions: any[] = await getSessions(ddb);
    sessions.forEach(s => {
      s.feedbackComments = [];
      s.feedbackResults = [0, 0, 0, 0, 0];
    });
    await putItemsHelper(ddb, DDB_TABLE_BASE.concat('sessions'), sessions, options.write);

    const registrations: any[] = await getRegistrations(ddb);
    registrations.forEach(r => {
      r.hasUserRated = false;
    });
    await putItemsHelper(ddb, DDB_TABLE_BASE.concat('registrations'), registrations, options.write);

    console.log('[DONE]');
  } catch (err) {
    console.error('[ERROR] Operation failed', err);
  }

  async function getSessions(ddb: DynamoDB.DocumentClient): Promise<any[]> {
    const sessions = await scanInfinite(ddb, { TableName: DDB_TABLE_BASE.concat('sessions') });
    console.log(`Read ${sessions.length} sessions`);
    return sessions;
  }
  async function getRegistrations(ddb: DynamoDB.DocumentClient): Promise<any[]> {
    const registrations = await scanInfinite(ddb, { TableName: DDB_TABLE_BASE.concat('registrations') });
    console.log(`Read ${registrations.length} registrations`);
    return registrations;
  }
}
