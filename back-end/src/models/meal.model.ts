// import { isAfter } from 'date-fns';
import { Resource, epochISOString, isEmpty } from 'idea-toolbox';

/**
 * YYYY-MM-DDTHH:MM, without timezone.
 */
type datetime = string;

export class Meal extends Resource {
  /**
   * The ID of the Meal.
   */
  mealId: string;
  /**
   * The name of the Meal.
   */
  name: string;
  /**
   * The time from which the ticket is valid.
   */
  validFrom: epochISOString;
  /**
   * The time until which the ticket is valid.
   */
  validTo: epochISOString;
  /**
   * Estabilish whether the ticket needs to be scanned by OC or is merely informative
   */
  needsScan: boolean;
  /**
   * The description of the dishes in this meal for each MealType available.
   */
  dishDescription: { [mealType: string]: string };

  load(x: any): void {
    super.load(x);
    this.mealId = this.clean(x.mealId, String);
    this.name = this.clean(x.name, String);
    this.validFrom = this.clean(x.validFrom, t => this.calcDatetimeWithoutTimezone(t));
    this.validTo = this.clean(x.validTo, t => this.calcDatetimeWithoutTimezone(t));
    this.needsScan = this.clean(x.needsScan, Boolean);
    this.dishDescription = {};
    if (x.dishDescription) this.dishDescription = x.dishDescription;
    else for (const type of Object.keys(MealTypes)) this.dishDescription[type] = '';
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.mealId = safeData.mealId;
  }

  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (!this.validFrom) e.push('validFrom');
    if (!this.validTo) e.push('validTo');
    if (this.validFrom > this.validTo) e.push('validFrom', 'validTo');
    for (const type of Object.keys(MealTypes)) if (!this.dishDescription[type]) e.push(`dishDescription.${type}`);
    return e;
  }

  // @todo move this to utils file so we don't have repeated code
  calcDatetimeWithoutTimezone(dateToFormat: Date | string | number, bufferInMinutes = 0): datetime {
    try {
      const date = new Date(dateToFormat);
      return new Date(
        date.getTime() -
          this.convertMinutesToMilliseconds(date.getTimezoneOffset()) +
          this.convertMinutesToMilliseconds(bufferInMinutes)
      )
        .toISOString()
        .slice(0, 16);
    } catch (error) {
      // force null on invalid dates that might come from import
      return null;
    }
  }

  convertMinutesToMilliseconds(minutes: number): number {
    return minutes * 60 * 1000;
  }

  isMealValid(date: Date): boolean {
    const to = this.calcDatetimeWithoutTimezone(this.validTo);
    const from = this.calcDatetimeWithoutTimezone(this.validFrom);
    const reference = this.calcDatetimeWithoutTimezone(date);

    return reference >= from && reference <= to;
  }
}

export enum ApprovedType {
  MANUAL = 'MANUAL',
  QR_SCAN = 'QR_SCAN'
}

export enum MealTypes {
  GLUTEN_FREE = 'GLUTEN_FREE',
  GLUTEN_LACTOSE_FREE = 'GLUTEN_LACTOSE_FREE',
  GLUTEN_LACTOSE_VEGETARIAN_FREE = 'GLUTEN_LACTOSE_VEGETARIAN_FREE',
  LACTOSE_FREE = 'LACTOSE_FREE',
  VEGETARIAN_VEGAN = 'VEGETARIAN_VEGAN',
  NO_BEEF = 'NO_BEEF',
  NO_FISH = 'NO_FISH',
  NO_PORK_AND_FISH = 'NO_PORK_AND_FISH',
  NO_FISH_AND_MUSHROOMS = 'NO_FISH_AND_MUSHROOMS',
  NO_MUSHROOMS = 'NO_MUSHROOMS',
  NO_PORK = 'NO_PORK',
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL',
  SPECIAL_OLIVE = 'SPECIAL_OLIVE'
}
