import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Session, SessionType } from '@models/session.model';
import { SessionRegistration } from '@models/sessionRegistration.model';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private sessions: Session[];
  // It's the IDs only
  private userFavoriteSessions: string[];
  private userRegisteredSessions: SessionRegistration[];

  /**
   * The number of sessions to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.sessions = (await this.api.getResource(['sessions'])).map(s => new Session(s));
  }

  private async loadUserFavoriteSessions(): Promise<void> {
    const body: any = { action: 'GET_FAVORITE_SESSIONS' };
    this.userFavoriteSessions = await this.api.patchResource(['users', 'me'], { body });
  }

  async loadUserRegisteredSessions(): Promise<SessionRegistration[]> {
    this.userRegisteredSessions = await this.api.getResource(['registrations']);
    return this.userRegisteredSessions
  }

  async getSpeakerSessions(speaker: string, search?: string): Promise<Session[]> {
    const sessions: Session[] = (await this.api.getResource(['sessions'], { params: { speaker } })).map(
      s => new Session(s)
    );
    return this.applySearchToSessions(sessions, search);
  }
  async getSessionsInARoom(room: string, search?: string): Promise<Session[]> {
    let sessions: Session[] = (await this.api.getResource(['sessions'], { params: { room } })).map(s => new Session(s));
    return this.applySearchToSessions(sessions, search);
  }

  /**
   * Get (and optionally filter) the list of sessions.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   * Note: if speaker id is passed, it will filter sessions for that speaker.
   * Note: if room id is passed, it will filter sessions for that room.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
    segment?: string,
  } = {}): Promise<Session[]> {
    if (!this.sessions || options.force) await this.loadList();
    if (!this.sessions) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.sessions.slice();

    if (options.search) filteredList = this.applySearchToSessions(filteredList, options.search)

      // @todo should we hide past sessions? or disable them?
      if (!options.segment) {
        await this.loadUserFavoriteSessions();
        filteredList = filteredList.filter(s => this.userFavoriteSessions.includes(s.sessionId)) || [];
      }
      else filteredList = filteredList.filter(s => s.startsAt.startsWith(options.segment)) || [];

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage = filteredList.findIndex(x => x.sessionId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  private applySearchToSessions(sessions: Session[], search: string) {
    if (search)
    sessions = sessions.filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [x.sessionId, x.code, x.name, x.getSpeakers()].filter(f => f).some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    return sessions
  }

  async getSessionDays(): Promise<string[]> {
    if (!this.sessions) await this.loadList();

    return Array.from(new Set(this.sessions.map(s => s.startsAt.slice(0, 10)))).sort()
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

  async addToFavorites(sessionId: string){
    const body: any = { action: 'ADD_FAVORITE_SESSION', sessionId };
    this.userFavoriteSessions = await this.api.patchResource(['users', 'me'], { body });
  }
  async removeFromFavorites(sessionId: string){
    const body: any = { action: 'REMOVE_FAVORITE_SESSION', sessionId };
    this.userFavoriteSessions = await this.api.patchResource(['users', 'me'], { body });
  }
  async registerInSession(sessionId: string){
    this.userFavoriteSessions = await this.api.postResource(['registrations', sessionId]);
  }
  async unregisterFromSession(sessionId: string){
    this.userFavoriteSessions = await this.api.deleteResource(['registrations', sessionId]);
  }

  getColourBySessionType(session: Session){
    switch(session.type) {
      case SessionType.DISCUSSION:
        return 'ESNcyan';
      case SessionType.TALK:
        return 'ESNgreen';
      case SessionType.IGNITE:
        return 'ESNpink';
      case SessionType.CAMPFIRE:
        return 'ESNorange';
      case SessionType.INCUBATOR:
        return 'ESNdarkBlue';
      case SessionType.HUB:
        return 'dark';
      default:
        return 'medium';
    }
  }
}
