import { Resource, epochISOString, isEmpty } from 'idea-toolbox';

export class MealTicket extends Resource {
  /**
   * The ID of the Meal Ticket.
   */
  mealTicketId: string;

  /**
   * The ID of the user related to the meal ticket.
   */
  userId: string;

  /**
   * The timestamp when the ticket has been generated.
   */
  createdAt: epochISOString;

  /**
   * The meal type of the ticket, based on foot choices and needs.
   */
  type: MealType;


  /**
   * Status of the ticket (true when has been used and false when not yet used)
   */
  status: boolean;


  load(x: any): void {
    super.load(x);
    this.mealTicketId = this.clean(x.mealTicketId, String);
    this.userId = this.clean(x.userId, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString(), new Date().toISOString());
    this.type = this.clean(x.type, String, MealType.MEAT) as MealType;
    this.status = this.clean(x.status, Boolean, false);
  }

  safeLoad(newData: any, safeData: any, options?: any): void {
    super.safeLoad(newData, safeData);
    this.mealTicketId = safeData.mealTicketId;
    this.userId = safeData.userId;
    this.createdAt = safeData.createdAt;
  }

  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.mealTicketId)) e.push('mealId');
    if (isEmpty(this.userId)) e.push('userId');
    if (!Object.keys(MealType).includes(this.type)) e.push('type');
    if (isEmpty(this.createdAt, 'date')) e.push('createdAt');
    return e;
  }
}

export enum MealType {
  VEGETARIAN = 'VEGETARIAN',
  VEGGIE = 'VEGGIE',
  MEAT = 'MEAT',
  GLUTEN_FREE = 'GLUTEN_FREE',
  OTHER = 'OTHER'
}