import { Injectable } from '@angular/core';
import { WorkBook, utils, writeFile } from 'xlsx';
import { IDEAApiService } from '@idea-ionic/common';

import { Session } from '@models/session.model';
import { SessionRegistration, SessionRegistrationExportable } from '@models/sessionRegistration.model';

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

  async confirmParticipation(sessionId: string): Promise<void> {
    return await this.api.patchResource(['registrations', sessionId], { body: { action: 'CONFIRM_PARTICIPATION' } });
  }

  /**
   * Delete a registration.
   */
  async delete(registration: SessionRegistration): Promise<void> {
    await this.api.deleteResource(['registrations', registration.sessionId]);
  }

  /**
   * Download a spreadsheet containing the sessions registrations selected.
   */
  async downloadSpreadsheet(title: string, session?: Session): Promise<void> {
    const params: any = { export: true };
    if (session) params.sessionId = session.sessionId;
    const list: SessionRegistrationExportable[] = await this.api.getResource('registrations', { params });

    const workbook: WorkBook = { SheetNames: [], Sheets: {}, Props: { Title: title } };
    utils.book_append_sheet(workbook, utils.json_to_sheet(list), '1');
    writeFile(workbook, title.concat('.xlsx'));
  }
}
