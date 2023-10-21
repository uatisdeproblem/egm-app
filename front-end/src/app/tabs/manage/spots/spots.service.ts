import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { EventSpot } from '@models/eventSpot.model';
import { User } from '@models/user.model';

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

  /**
   * Assign a spot to a user.
   */
  async assignToUser(spot: EventSpot, user: User): Promise<void> {
    const body = { action: 'ASSIGN_TO_USER', userId: user.userId };
    await this.api.patchResource(['event-spots', spot.spotId], { body });
  }
  /**
   * Transfer an assigned spot to another user.
   */
  async transferToUser(spot: EventSpot, user: User): Promise<void> {
    const body = { action: 'TRANSFER_TO_USER', userId: user.userId };
    await this.api.patchResource(['event-spots', spot.spotId], { body });
  }
  /**
   * Confirm the payment as received.
   */
  async confirmPayment(spot: EventSpot): Promise<void> {
    const body = { action: 'CONFIRM_PAYMENT' };
    await this.api.patchResource(['event-spots', spot.spotId], { body });
  }
  /**
   * Assign a spot to a country.
   */
  async assignToCountry(spot: EventSpot, sectionCountry: string): Promise<void> {
    const body = { action: 'ASSIGN_TO_COUNTRY', sectionCountry };
    await this.api.patchResource(['event-spots', spot.spotId], { body });
  }
  /**
   * Release (unassign) a spot from section country and user (if any).
   */
  async release(spot: EventSpot): Promise<void> {
    const body = { action: 'RELEASE' };
    await this.api.patchResource(['event-spots', spot.spotId], { body });
  }
  /**
   * Edit the description of a spot.
   */
  async editDescription(spot: EventSpot, description: string): Promise<void> {
    const body = { action: 'EDIT_DESCRIPTION', description };
    await this.api.patchResource(['event-spots', spot.spotId], { body });
  }

  /**
   * Delete an unassigned spot.
   */
  async delete(spot: EventSpot): Promise<void> {
    await this.api.deleteResource(['event-spots', spot.spotId]);
  }
}
