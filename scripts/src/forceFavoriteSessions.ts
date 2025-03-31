import { InvalidArgumentError, program } from 'commander';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

import { initWithSSO, putItemsHelper, scanInfinite } from './utils/ddb.utils';

import { MealTypes } from '../../back-end/src/models/meal.model';

//
// PARAMS
//

program
  .name('EGM: import user meal types from CSV')
  .option('--write', 'Whether to write/delete data or just to simulate the execution', true)
  .option('--env [environment]', 'Environment: dev, prod', 'prod')
  .option('--inputFile [inputFile]', 'The path to the input file', './src/user-meals.csv')
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
    if (!['dev', 'prod'].includes(options.env)) throw new InvalidArgumentError('Missing environment');
  } catch (error) {
    program.error((error as any).message);
  }

  try {
    const { ddb } = await initWithSSO(AWS_PROFILE, DDB_TABLE_REGION);

    const sessionIdsToFavorite = [
      'egm_lEKq9TROTvxja7gLw6beqWiNl',
      'egm_ayo50MlgiYhsPGR6BcwHhgWOp',
      'egm_tf0SvyfHKPZ06PVXZtHqY22ZS',
      'egm_PGnkqZXUEtK9P8zJ3NYw8edRk',
      'egm_yM5Ma1EsoIEE5dPq0Q3tkbwy1',
      'egm_52P6yscm5Y8xB0eOEk08eucd0',
      'egm_Sl7AUKaqH0MzQFvfGNgwXn85q',
      'egm_HHkqgYqPqihbUVbEGdEEMgddn',
      'egm_DfLCGxwWmctwlOOP5LQ64vtqL',
      'egm_kuwcDkeC39KRBiM1oz6sWR3pg',
      'egm_sEp8TwDkBV0f9w4pd3db8mKj6',
      'Session_109',
      'egm_7DoIpxLopq38SybOm3IJg258d',
      'egm_rQcwqI4O5ljp2tAt0yOCW5Kie',
      'egm_htz7uADSEJ175TW3zQ6jmnuxP',
      'Session_110',
      'egm_1FdS51OwmDuALAnfAYzN3YnTb'
    ];

    const users = (await scanInfinite(ddb, { TableName: DDB_TABLE_BASE.concat('users') })).filter(
      u => u?.spot?.paymentConfirmedAt
    );
    console.log(`Read ${users.length} users`);

    const favoriteSessions: { userId: string; sessionId: string }[] = [];

    for (const user of users) {
      for (const sessionId of sessionIdsToFavorite) favoriteSessions.push({ userId: user.userId, sessionId });
    }

    await putItemsHelper(ddb, DDB_TABLE_BASE.concat('usersFavoriteSessions'), favoriteSessions, options.write);

    console.log('[DONE]');
  } catch (err) {
    console.error('[ERROR] Operation failed', err);
  }
}
