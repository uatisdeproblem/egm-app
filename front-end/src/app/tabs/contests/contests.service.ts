import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Contest } from '@models/contest.model';

@Injectable({ providedIn: 'root' })
export class ContestsService {
  private contests: Contest[];

  /**
   * The number of contests to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    const contests: Contest[] = await this.api.getResource('contests');
    this.contests = contests.map(c => new Contest(c));
  }

  /**
   * Get (and optionally filter) the list of contests.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   * Note: if venue id is passed, it will filter contests for that venue.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
  }): Promise<Contest[]> {
    if (!this.contests || options.force) await this.loadList();
    if (!this.contests) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.contests.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm =>
            [x.contestId, x.name, x.description, ...x.candidates.map(x => x.name)]
              .filter(f => f)
              .some(f => f.toLowerCase().includes(searchTerm))
          )
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.contestId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a contest by its id.
   */
  async getById(contestId: string): Promise<Contest> {
    return new Contest(await this.api.getResource(['contests', contestId]));
  }

  /**
   * Insert a new contest.
   */
  async insert(contest: Contest): Promise<Contest> {
    return new Contest(await this.api.postResource(['contests'], { body: contest }));
  }
  /**
   * Update an existing contest.
   */
  async update(contest: Contest): Promise<Contest> {
    return new Contest(await this.api.putResource(['contests', contest.contestId], { body: contest }));
  }
  /**
   * Delete a contest.
   */
  async delete(contest: Contest): Promise<void> {
    await this.api.deleteResource(['contests', contest.contestId]);
  }

  /**
   * Vote for a candidate in a contest.
   */
  async vote(contest: Contest, candidate: string): Promise<void> {
    const body = { action: 'VOTE', candidate };
    await this.api.patchResource(['contests', contest.contestId], { body });
  }
  /**
   * Publish the results of a contest.
   */
  async publishResults(contest: Contest): Promise<void> {
    const body = { action: 'PUBLISH_RESULTS' };
    await this.api.patchResource(['contests', contest.contestId], { body });
  }
}
