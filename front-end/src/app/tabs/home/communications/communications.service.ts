import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Communication } from '@models/communication.model';

@Injectable({ providedIn: 'root' })
export class CommunicationsService {
  private communications: Communication[];

  /**
   * The number of communications to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.communications = (await this.api.getResource(['communications'])).map(c => new Communication(c));
  }

  /**
   * Get (and optionally filter) the list of communications.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
  }): Promise<Communication[]> {
    if (!this.communications || options.force) await this.loadList();
    if (!this.communications) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.communications.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm =>
            [x.communicationId, x.title].filter(f => f).some(f => f.toLowerCase().includes(searchTerm))
          )
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage =
          filteredList.findIndex(x => x.communicationId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a communication by its id.
   */
  async getById(communicationId: string): Promise<Communication> {
    return new Communication(await this.api.getResource(['communications', communicationId]));
  }

  /**
   * Insert a new communication.
   */
  async insert(communication: Communication): Promise<Communication> {
    return new Communication(await this.api.postResource(['communications'], { body: communication }));
  }
  /**
   * Update an existing communication.
   */
  async update(communication: Communication): Promise<Communication> {
    return new Communication(
      await this.api.putResource(['communications', communication.communicationId], {
        body: communication
      })
    );
  }
  /**
   * Delete a venue.
   */
  async delete(communication: Communication): Promise<void> {
    await this.api.deleteResource(['communications', communication.communicationId]);
  }

  /**
   * Mark communication as read.
   */
  async markAsRead(communicationId: string): Promise<Communication> {
    const body = { action: 'MARK_AS_READ' };
    return new Communication(await this.api.patchResource(['communications', communicationId], { body }));
  }
  /**
   * Mark communication as unread.
   */
  async markAsUnread(communicationId: string): Promise<Communication> {
    const body = { action: 'MARK_AS_UNREAD' };
    return new Communication(await this.api.patchResource(['communications', communicationId], { body }));
  }
}
