// import { isAfter } from 'date-fns';
import { Resource, epochISOString, isEmpty } from 'idea-toolbox';

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
    this.validFrom = this.clean(x.validFrom, t => new Date(t).toISOString().slice(0, 16));
    this.validTo = this.clean(x.validTo, t => new Date(t).toISOString().slice(0, 16));
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

  isMealValid(date: Date): boolean {
    const from = new Date(this.validFrom).toISOString().slice(0, 16);
    const to = new Date(this.validTo).toISOString().slice(0, 16);
    const reference = new Date(date).toISOString().slice(0, 16);
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
  NO_PORK = 'NO_PORK',
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL',
  REGULAR_SPECIAL = 'REGULAR_SPECIAL'
}
