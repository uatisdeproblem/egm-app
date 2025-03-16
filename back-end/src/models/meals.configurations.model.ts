import { Resource, epochISODateString, epochISOString, isEmpty } from 'idea-toolbox';
import { Dish } from './dish.model';

export class MealConfigurations extends Resource {
  /**
   * Number of meal tickets available during the event
   */
  numTickets: number;

  /**
   * Start date of the event
   */
  startDate: epochISOString;

  /**
   * End date of the event
   */
  endDate: epochISOString;

  /**
   * Types of meal available during the event
   */
  mealTypes: MealType[];

  /**
   * Meal info about name, menu and validity hours
   */
  mealInfo: Meal[];

  /**
   * Estabilish whether admin can add manually meals
   */
  canAdminAddMeals: boolean;

  load(x: any): void {
    super.load(x);
    this.numTickets = this.clean(x.numTickets, Number);
    this.startDate = this.clean(x.startDate, t => new Date(t).toISOString(), new Date().toISOString());
    this.endDate = this.clean(x.endDate, t => new Date(t).toISOString(), new Date().toISOString());
    this.mealTypes = this.cleanArray(x.mealTypes, type => new MealType(type), []);
    this.mealInfo = this.cleanArray(x.mealInfo, m => new Meal(m), []);
    this.canAdminAddMeals = this.clean(x.canAdminAddMeals, Boolean, true);
  }

  safeLoad(newData: any, safeData: any, options?: any): void {
    super.safeLoad(newData, safeData);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.numTickets <= 0) e.push('numTickets');
    if (isEmpty(this.startDate, 'date')) e.push('startDay');
    if (isEmpty(this.endDate, 'date')) e.push('endDay');
    if (this.endDate < this.startDate) {
      e.push('endDay');
      e.push('startDay');
    }
    if (isEmpty(this.mealTypes)) e.push('mealTypes');
    this.mealInfo.forEach(mealInfo => {
      if (mealInfo.validate().length > 0) {
        e.push(`mealInfo.${mealInfo.name}`);
      }
    });
    return e;
  }
}

export class Meal extends Resource {
  /**
   * ID of the ticket used for recognition and used in the QRcode
   */
  ticketId: string;

  /**
   * Name of the ticket useful for the user to understand which ticket are using
   */
  name: string;

  /**
   * Start Validity of the ticket
   */
  startValidity: epochISOString;

  /**
   * End validity of the ticket
   */
  endValidity: epochISOString;

  /**
   * Dishes available for the given meal
   */
  dishes: Dish[];

  /**
   * Estabilish whether the ticket needs to be scan by OC or is only for information
   */
  needsScan: boolean;

  load(x: any): void {
    super.load(x);
    this.ticketId = this.clean(x.ticketId, String);
    this.name = this.clean(x.name, String);
    this.startValidity = this.clean(x.startValidity, t => new Date(t).toISOString(), new Date().toISOString());
    this.endValidity = this.clean(x.endValidity, t => new Date(t).toISOString(), new Date().toISOString());
    this.dishes = this.cleanArray(x.dishes, dish => new Dish(dish), []);
    this.needsScan = this.clean(x.needsScan, Boolean, false);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.ticketId = safeData.ticketId;
    this.dishes = safeData.dishes || [];
  }

  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (isEmpty(this.startValidity, 'date')) e.push('startValidity');
    if (isEmpty(this.endValidity, 'date')) e.push('endValidity');
    if (this.endValidity < this.startValidity) {
      e.push('startValidity');
      e.push('endValidity');
    }

    return e;
  }
}

export class MealType extends Resource {
  /**
   * Name of the type of meal
   */
  name: string;

  /**
   * Color of the meal used for Frontend recognize
   */
  color: string;

  load(x: any): void {
    super.load(x);
    this.name = this.clean(x.name, String);
    this.color = this.clean(x.color, String);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.name = safeData.name;
  }

  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (isEmpty(this.color)) e.push('color');

    return e;
  }
}