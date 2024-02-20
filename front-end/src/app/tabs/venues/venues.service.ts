import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Venue } from '@models/venue.model';

@Injectable({ providedIn: 'root' })
export class VenuesService {
  private venues: Venue[];

  /**
   * The number of venues to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.venues = (await this.api.getResource(['venues'])).map(v => new Venue(v));
  }

  /**
   * Get (and optionally filter) the list of venues.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
  }): Promise<Venue[]> {
    if (!this.venues || options.force) await this.loadList();
    if (!this.venues) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.venues.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm => [x.venueId, x.name].filter(f => f).some(f => f.toLowerCase().includes(searchTerm)))
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.venueId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a venue by its id.
   */
  async getById(venueId: string): Promise<Venue> {
    return new Venue(await this.api.getResource(['venues', venueId]));
  }

  /**
   * Insert a new venue.
   */
  async insert(venue: Venue): Promise<Venue> {
    return new Venue(await this.api.postResource(['venues'], { body: venue }));
  }
  /**
   * Update an existing venue.
   */
  async update(venue: Venue): Promise<Venue> {
    return new Venue(
      await this.api.putResource(['venues', venue.venueId], {
        body: venue
      })
    );
  }
  /**
   * Delete a venue.
   */
  async delete(venue: Venue): Promise<void> {
    await this.api.deleteResource(['venues', venue.venueId]);
  }
}
