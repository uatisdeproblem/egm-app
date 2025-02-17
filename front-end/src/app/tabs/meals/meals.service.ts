import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';
import { MealTicket } from '@models/meals.model';


@Injectable({ providedIn: 'root' })
export class MealsService {
  private mealsByUserId: MealTicket[];
  private mealsByMealTicketId: MealTicket[];

  constructor(private api: IDEAApiService) {}

  /**
   * Get (and optionally filter) the list of meals tickets for a specific user.
   */
  async getMealsByUserId(userId: string, options?: { force: boolean}): Promise<MealTicket[]> {
    if (!this.mealsByUserId || options?.force) {
      this.mealsByUserId = (await this.api.getResource([`/users/${userId}/meal-ticket`])).map(m => new MealTicket(m));
    }
    if (!this.mealsByUserId) return [];
    return this.mealsByUserId;
  }

  /**
   * Get the list of meal for a specific meal Ticket Id (useful for admin to discover who is missing)
   * @param userId userID needed for the request to make
   * @param mealTicketId ticket ID used to obtain meal tickets
   * @returns the list of meal tickets of all users for that specific meal
   */
  async getMealsByMealId(userId: string, mealTicketId: string): Promise<MealTicket[]> {
    if (!this.mealsByMealTicketId) {
      this.mealsByMealTicketId = (await this.api.getResource([`/users/${userId}/meal-ticket/${mealTicketId}`]))
                                  .map(m => new MealTicket(m));
    }
    if (!this.mealsByMealTicketId) return [];
    return this.mealsByMealTicketId;
  }

  /**
   * Generate a Meal Ticket
   */
  async generateTicket(userId: string, ticketId: string): Promise<void> {
    await this.api.patchResource([`users/${userId}/meal-ticket/${ticketId}`], { body: { action: 'GENERATE_TICKET'}});
  }

  async scanTicket(userId: string, ticketId: string): Promise<void> {
    return await this.api.patchResource([`users/${userId}/meal-ticket/${ticketId}`], { body: { action: 'SCAN_TICKET'}});
  }
}
