import { Resource, isEmpty } from 'idea-toolbox';

export class Dish extends Resource {
  /**
   * Name of the dish
   */
  name: string;

  /**
   * List of ingredients in the dish
   */
  ingredients: string;

  /**
   * List of allergens present in the dish
   */
  allergens: string;

  /**
   * The meal type this dish belongs to
   */
  mealType: string;

  /**
   * The meal this dish belongs to
   */
  mealTicketId: string;

  load(x: any): void {
    super.load(x);
    this.name = this.clean(x.name, String);
    this.ingredients = this.clean(x.ingredients, String, "");
    this.allergens = this.clean(x.allergens, String, "");
    this.mealType = this.clean(x.mealType, String);
    this.mealTicketId = this.clean(x.mealTicketId, String);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.mealTicketId = safeData.mealTicketId;
  }

  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (isEmpty(this.mealType)) e.push('mealType');
    if (isEmpty(this.mealTicketId)) e.push('mealTicketId');
    if (isEmpty(this.ingredients)) e.push('ingredients');
    return e;
  }

}