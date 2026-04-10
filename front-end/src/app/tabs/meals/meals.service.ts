import { Injectable, inject } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { ApprovedType, Meal, MealTypes } from '@models/meal.model';

@Injectable({ providedIn: 'root' })
export class MealsService {
  private meals: Meal[];

  /**
   * The number of meals to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  private api = inject(IDEAApiService);

  private async loadList(): Promise<void> {
    const meals: Meal[] = await this.api.getResource(['meals']);
    this.meals = meals.map(m => new Meal(m));
  }

  /**
   * Get (and optionally filter) the list of meals.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(
    options: {
      force?: boolean;
      withPagination?: boolean;
      startPaginationAfterId?: string;
      search?: string;
    } = {}
  ): Promise<Meal[]> {
    if (!this.meals || options.force) await this.loadList();
    if (!this.meals) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.meals.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm => [x.mealId, x.name].filter(f => f).some(f => f.toLowerCase().includes(searchTerm)))
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.mealId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList.sort((a, b): number => a.validFrom.localeCompare(b.validFrom));
  }

  /**
   * Get the full details of a meal by its id.
   */
  async getById(mealId: string): Promise<Meal> {
    return new Meal(await this.api.getResource(['meals', mealId]));
  }

  /**
   * Insert a new meal.
   */
  async insert(meal: Meal): Promise<Meal> {
    return new Meal(await this.api.postResource(['meals'], { body: meal }));
  }
  /**
   * Update an existing meal.
   */
  async update(meal: Meal): Promise<Meal> {
    return new Meal(await this.api.putResource(['meals', meal.mealId], { body: meal }));
  }
  /**
   * Delete a meal.
   */
  async delete(meal: Meal): Promise<void> {
    await this.api.deleteResource(['meals', meal.mealId]);
  }

  /**
   * Validate a ticket.
   */
  async validateTicket(meal: Meal, userId: string, approvedType: ApprovedType): Promise<void> {
    const body = { action: 'SCAN_TICKET', userId, approvedType };
    await this.api.patchResource(['meals', meal.mealId], { body });
  }

  getColourByMealType(mealType: MealTypes): string {
    switch (mealType) {
      case MealTypes.NO_PREFERENCE:
        return 'ESNpink';
      case MealTypes.VEGAN:
      case MealTypes.VEGETARIAN:
        return 'ESNgreen';
      case MealTypes.PESCATARIAN:
      case MealTypes.NO_FISH:
        return 'ESNdarkBlue';
      case MealTypes.NO_PORK:
      case MealTypes.HALAL:
        return 'ESNorange';
      case MealTypes.GLUTEN_FREE:
        return 'ESNcyan';
      case MealTypes.LACTOSE_FREE:
      case MealTypes.NUT_FREE:
        return 'ESNcyan';
      case MealTypes.OTHER:
        return 'medium';
      default:
        return 'medium';
    }
  }
}
