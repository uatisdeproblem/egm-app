import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Room } from '@models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomsService {
  private rooms: Room[];

  /**
   * The number of rooms to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.rooms = (await this.api.getResource(['rooms'])).map(r => new Room(r));
  }

  /**
   * Get (and optionally filter) the list of rooms.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
  }): Promise<Room[]> {
    if (!this.rooms || options.force) await this.loadList();
    if (!this.rooms) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.rooms.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm =>
            [x.roomId, x.name, x.venue?.venueId, x.venue?.name]
              .filter(f => f)
              .some(f => f.toLowerCase().includes(searchTerm))
          )
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.roomId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a room by its id.
   */
  async getById(roomId: string): Promise<Room> {
    return new Room(await this.api.getResource(['rooms', roomId]));
  }

  /**
   * Insert a new room.
   */
  async insert(room: Room): Promise<Room> {
    return new Room(await this.api.postResource(['rooms'], { body: room }));
  }
  /**
   * Update an existing room.
   */
  async update(room: Room): Promise<Room> {
    return new Room(
      await this.api.putResource(['rooms', room.roomId], {
        body: room
      })
    );
  }
  /**
   * Delete a room.
   */
  async delete(room: Room): Promise<void> {
    await this.api.deleteResource(['rooms', room.roomId]);
  }
}
