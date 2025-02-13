import { Resource, epochISODateString, epochISOString, isEmpty } from 'idea-toolbox';

export class MealConfigurations extends Resource {
  numTickets: number;

  startDate: epochISOString;

  endDate: epochISOString;

  mealTypes: string[];

  mealInfo: Meal[];

  canAdminAddMeals: boolean;

  load(x: any): void {
    super.load(x);
    this.numTickets = this.clean(x.numTickets, Number);
    this.startDate = this.clean(x.startDate, t => new Date(t).toISOString(), new Date().toISOString());
    this.endDate = this.clean(x.endDate, t => new Date(t).toISOString(), new Date().toISOString());
    this.mealTypes = this.cleanArray(x.mealTypes, String);
    this.mealInfo = this.cleanArray(x.mealInfo, m => new Meal(m), []);
    this.canAdminAddMeals = this.clean(x.canAdminAddMeals, Boolean, true);
  }

  safeLoad(newData: any, safeData: any, options?: any): void {
    super.safeLoad(newData, safeData);
    this.mealTypes = safeData.mealTypes;
    this.mealInfo = safeData.mealInfo;
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
    if (this.endValidity < this.startValidity) {
      e.push('startValidity');
      e.push('endValidity');
    }

    return e;
  }
}