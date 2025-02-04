import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';
import { MealTicket } from '@models/meals.model';


@Injectable({ providedIn: 'root' })
export class MealsService {
  private meals: MealTicket[];

  constructor(private api: IDEAApiService) {}

  private async loadList(userId: string): Promise<void> {
    this.meals = (await this.api.getResource([`/users/${userId}/meal-ticket`])).map(m => new MealTicket(m));
    console.log("MEALS", this.meals);
  }

  /**
   * Get (and optionally filter) the list of meals tickets.
   */
  async getList(userId: string, options: {
    force?: boolean;
  }): Promise<MealTicket[]> {
    console.log("MEALS: ", this.meals);
    if (!this.meals|| options.force) await this.loadList(userId);
    if (!this.meals) return [];
    return this.meals;
  }

  /**
   * Generate a Meal Ticket
   */
  async generateTicket(userId: string): Promise<void> {
    await this.api.patchResource([`users/${userId}/meal-ticket`], { body: { action: 'GENERATE_TICKET'}});
  }

  async scanTicket(userId: string): Promise<void> {
    return await this.api.patchResource([`users/${userId}/meal-ticket`], { body: { action: 'SCAN_TICKET'}});
  }
}
