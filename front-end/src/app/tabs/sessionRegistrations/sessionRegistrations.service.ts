import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { SessionRegistration } from '@models/sessionRegistration.model';

@Injectable({ providedIn: 'root' })
export class SessionRegistrationsService {
  constructor(private api: IDEAApiService) {}

  /**
   * Get the list of registrations for the user or session.
   */
  async getList(sessionId?: string): Promise<SessionRegistration[]> {
    return (await this.api.getResource(['registrations'], { params: { sessionId } })).map(
      sr => new SessionRegistration(sr)
    );
  }

  /**
   * Get the full details of a registration by its id.
   */
  async getById(sessionId: string): Promise<SessionRegistration> {
    return new SessionRegistration(await this.api.getResource(['registrations', sessionId]));
  }

  /**
   * Insert a new registration.
   */
  async insert(sessionId: string): Promise<SessionRegistration> {
    return new SessionRegistration(await this.api.postResource(['registrations', sessionId]));
  }
  /**
   * Delete a registration.
   */
  async delete(registration: SessionRegistration): Promise<void> {
    await this.api.deleteResource(['registrations', registration.sessionId]);
  }
}
