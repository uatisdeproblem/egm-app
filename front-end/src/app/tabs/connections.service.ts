import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Connection } from '@models/connection.model';

@Injectable({ providedIn: 'root' })
export class ConnectionsService {
  private connections: Connection[];

  /**
   * The number of connections to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.connections = (await this.api.getResource(['connections'])).map(c => new Connection(c));
  }

  /**
   * Get (and optionally filter) the list of connections.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    pending?: boolean;
    startPaginationAfterId?: string;
  }): Promise<Connection[]> {
    if (!this.connections || options.force) await this.loadList();
    if (!this.connections) return null;

    let filteredList = this.connections.slice();

    filteredList = filteredList.filter(c => (options.pending ? c.isPending : !c.isPending));

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.connectionId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Insert a new connection.
   */
  async insert(userId: string): Promise<Connection> {
    return new Connection(await this.api.postResource(['connections'], { body: { userId } }));
  }
  /**
   * Delete a connection.
   */
  async delete(connection: Connection): Promise<void> {
    await this.api.deleteResource(['connections', connection.connectionId]);
  }
}
