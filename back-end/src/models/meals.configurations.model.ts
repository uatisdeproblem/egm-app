import { Resource, epochISODateString, epochISOString, isEmpty } from 'idea-toolbox';

export class MealConfigurations extends Resource {
  numTickets: number;

  startDay: epochISOString;

  endDay: epochISOString;

  spotTypes: string[];

  mealInfo: Meal[];

  canAdminAddMeals: boolean;

  load(x: any): void {
    super.load(x);
    this.numTickets = this.clean(x.numTickets, Number);
    this.startDay = this.clean(x.startDay, t => new Date(t).toISOString(), new Date().toISOString());
    this.endDay = this.clean(x.endDay, t => new Date(t).toISOString(), new Date().toISOString());
    this.spotTypes = this.cleanArray(x.spotTypes, String);
    this.mealInfo = this.cleanArray(x.mealInfo, m => new Meal(m), []);
    this.canAdminAddMeals = this.clean(x.canAdminAddMeals, Boolean, true);
  }

  safeLoad(newData: any, safeData: any, options?: any): void {
    super.safeLoad(newData, safeData);
    this.spotTypes = safeData.spotTypes;
    this.mealInfo = safeData.mealInfo;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.numTickets <= 0) e.push('numTickets');
    if (isEmpty(this.startDay, 'date')) e.push('startDay');
    if (isEmpty(this.endDay, 'date')) e.push('endDay');
    if (isEmpty(this.spotTypes)) e.push('spotTypes');
    return e;
  }
}

export class Meal extends Resource {
  name: string;
  startValidity: epochISOString;
  endValidity: epochISOString;

  load(x: any): void {
    super.load(x);
    this.name = this.clean(x.name, String);
    this.startValidity = this.clean(x.startValidity, t => new Date(t).toISOString(), new Date().toISOString());
    this.endValidity = this.clean(x.endValidity, t => new Date(t).toISOString(), new Date().toISOString());
  }

  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (isEmpty(this.startValidity, 'date')) e.push('startValidity');
    if (isEmpty(this.endValidity, 'date')) e.push('endValidity');

    return e;
  }
}