import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Speaker } from '@models/speaker.model';

@Injectable({ providedIn: 'root' })
export class SpeakersService {
  private speakers: Speaker[];

  /**
   * The number of speakers to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.speakers = (await this.api.getResource(['speakers'])).map(s => new Speaker(s));
  }

  /**
   * Get (and optionally filter) the list of speakers.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
  }): Promise<Speaker[]> {
    if (!this.speakers || options.force) await this.loadList();
    if (!this.speakers) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.speakers.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm =>
            [x.speakerId, x.name, x.contactEmail, x.organization?.organizationId, x.organization?.name]
              .filter(f => f)
              .some(f => f.toLowerCase().includes(searchTerm))
          )
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.speakerId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a speaker by its id.
   */
  async getById(speakerId: string): Promise<Speaker> {
    return new Speaker(await this.api.getResource(['speakers', speakerId]));
  }

  /**
   * Insert a new speaker.
   */
  async insert(speaker: Speaker): Promise<Speaker> {
    return new Speaker(await this.api.postResource(['speakers'], { body: speaker }));
  }
  /**
   * Update an existing speaker.
   */
  async update(speaker: Speaker): Promise<Speaker> {
    return new Speaker(
      await this.api.putResource(['speakers', speaker.speakerId], {
        body: speaker
      })
    );
  }
  /**
   * Delete a speaker.
   */
  async delete(speaker: Speaker): Promise<void> {
    await this.api.deleteResource(['speakers', speaker.speakerId]);
  }
}
