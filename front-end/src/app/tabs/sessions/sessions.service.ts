import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Session } from '@models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private sessions: Session[];

  /**
   * The number of sessions to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.sessions = (await this.api.getResource(['sessions'])).map(s => new Session(s));
  }

  /**
   * Get (and optionally filter) the list of sessions.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
  }): Promise<Session[]> {
    if (!this.sessions || options.force) await this.loadList();
    if (!this.sessions) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.sessions.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm =>
            [x.sessionId, x.code, x.name].filter(f => f).some(f => f.toLowerCase().includes(searchTerm))
          )
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.sessionId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a session by its id.
   */
  async getById(sessionId: string): Promise<Session> {
    return new Session(await this.api.getResource(['sessions', sessionId]));
  }

  /**
   * Insert a new sesion.
   */
  async insert(session: Session): Promise<Session> {
    return new Session(await this.api.postResource(['sessions'], { body: session }));
  }
  /**
   * Update an existing session.
   */
  async update(session: Session): Promise<Session> {
    return new Session(
      await this.api.putResource(['sessions', session.sessionId], {
        body: session
      })
    );
  }
  /**
   * Delete a session.
   */
  async delete(session: Session): Promise<void> {
    await this.api.deleteResource(['sessions', session.sessionId]);
  }
}
