import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { EventSpot } from '@models/eventSpot.model';

@Injectable({ providedIn: 'root' })
export class SpotsService {
  constructor(private api: IDEAApiService) {}

  /**
   * Get the list of the event's spots.
   */
  async getList(): Promise<EventSpot[]> {
    const spots: EventSpot[] = await this.api.getResource('event-spots');
    return spots.map(s => new EventSpot(s));
  }

  /**
   * Add a batch of spots to the ones available for the event.
   */
  async add(spot: EventSpot, numOfSpots = 1): Promise<EventSpot[]> {
    const body = { ...spot, numOfSpots };
    const spots: EventSpot[] = await this.api.postResource('event-spots', { body });
    return spots.map(s => new EventSpot(s));
  }
}
