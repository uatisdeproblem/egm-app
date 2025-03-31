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
  .option('--write', 'Whether to write/delete data or just to simulate the execution', false)
  .option('--env [environment]', 'Environment: dev, prod', 'dev')
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
    if (!options.inputFile) throw new InvalidArgumentError('Missing input file');
  } catch (error) {
    program.error((error as any).message);
  }

  try {
    const { inputFile } = options;

    const { ddb } = await initWithSSO(AWS_PROFILE, DDB_TABLE_REGION);

    const mealToEnumMap: { [meal: string]: MealTypes } = {
      'Gluten free': MealTypes.GLUTEN_FREE,
      'Gluten free & Lactose free': MealTypes.GLUTEN_LACTOSE_FREE,
      'Gluten free & Lactose free + Vegetarian': MealTypes.GLUTEN_LACTOSE_VEGETARIAN_FREE,
      'Lactose free': MealTypes.LACTOSE_FREE,
      'Vegetarian/Vegan': MealTypes.VEGETARIAN_VEGAN,
      'No beef': MealTypes.NO_BEEF,
      'No fish': MealTypes.NO_FISH,
      'No pork (and fish)': MealTypes.NO_PORK_AND_FISH,
      'No fish (and mushrooms)': MealTypes.NO_FISH_AND_MUSHROOMS,
      'No mushrooms': MealTypes.NO_MUSHROOMS,
      'No pork': MealTypes.NO_PORK,
      Regular: MealTypes.REGULAR,
      Special: MealTypes.SPECIAL,
      'Special Olive': MealTypes.SPECIAL_OLIVE
    };

    const users = (await scanInfinite(ddb, { TableName: DDB_TABLE_BASE.concat('users') })).filter(
      u => u?.spot?.paymentConfirmedAt
    );
    console.log(`Read ${users.length} users`);

    const userToMealMap: { [userId: string]: MealTypes } = {};

    const file = readFileSync(inputFile);
    const records = parse(file, { bom: true, cast: true }).slice(1); // skip header row
    for (const record of records) {
      const [userId, meal] = record;
      if (mealToEnumMap[meal]) userToMealMap[userId] = mealToEnumMap[meal];
      else console.log(`no meal type match for ${userId} (${meal})`);
    }
    console.log(`Read ${records.length} rows from input file`);

    for (const user of users) if (userToMealMap[user.userId]) user.mealType = userToMealMap[user.userId];
    await putItemsHelper(ddb, DDB_TABLE_BASE.concat('users'), users, options.write);

    console.log('[DONE]');
  } catch (err) {
    console.error('[ERROR] Operation failed', err);
  }
}
