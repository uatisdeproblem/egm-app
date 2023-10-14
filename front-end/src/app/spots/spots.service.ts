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
}
