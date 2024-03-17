import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonSearchbar } from '@ionic/angular';

import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { SessionsService } from './sessions.service';

import { Session } from '@models/session.model';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.page.html',
  styleUrls: ['./sessions.page.scss']
})
export class SessionsPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonContent) searchbar: IonSearchbar;

  // @todo check if registrations are open

  // @todo prevent default on favorite/register/selectDetail not working
  // @todo if few sessions (i.e. favorites) session detail is small

  days: string[]
  sessions: Session[];
  favoriteSessionsIds: string[] = [];
  registeredSessionsIds: string[] = [];
  selectedSession: Session;

  segment = ''

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    public _sessions: SessionsService,
    public t: IDEATranslationsService,
    public app: AppService
  ) {}

  ngOnInit() {
    // this.app.configurations.areSessionRegistrationsOpen // @todo use this in the code (and in back-end as well!!)
    this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      // WARNING: do not pass any segment in order to get the favorites on the next api call.
      this.sessions = await this._sessions.getList({ force: true });
      this.favoriteSessionsIds = this.sessions.map( s => s.sessionId);
      this.registeredSessionsIds = (await this._sessions.loadUserRegisteredSessions()).map(ur => ur.sessionId);
      this.days = await this._sessions.getSessionDays()
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  changeSegment (segment: string, search = ''): void {
    this.selectedSession = null;
    this.segment = segment;
    this.filterSessions(search);
  };
  async filterSessions(search = ''): Promise<void> {
    this.sessions = await this._sessions.getList({ search, segment: this.segment });
  }

  isSessionInFavorites(session: Session): boolean {
    return this.favoriteSessionsIds.includes(session.sessionId);
  }

  async toggleFavorite(session: Session): Promise<void> {
    try {
      await this.loading.show();
      if (this.isSessionInFavorites(session)) {
        await this._sessions.removeFromFavorites(session.sessionId);
        this.favoriteSessionsIds = this.favoriteSessionsIds.filter(id => id !== session.sessionId);
        if (!this.segment) this.sessions = this.sessions.filter(s => s.sessionId !== session.sessionId);
      } else {
        await this._sessions.addToFavorites(session.sessionId);
        this.favoriteSessionsIds.push(session.sessionId);
      };
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  isUserRegisteredInSession(session: Session): boolean {
    return this.registeredSessionsIds.includes(session.sessionId);
  }

  async toggleRegister(session: Session): Promise<void> {
    try {
      await this.loading.show();
      if (this.isUserRegisteredInSession(session)) {
        await this._sessions.unregisterFromSession(session.sessionId);
        this.favoriteSessionsIds = this.favoriteSessionsIds.filter(id => id !== session.sessionId);
        this.registeredSessionsIds = this.registeredSessionsIds.filter(id => id !== session.sessionId);
        if (!this.segment) this.sessions = this.sessions.filter(s => s.sessionId !== session.sessionId);
        // session.numberOfParticipants--;
      } else {
        await this._sessions.registerInSession(session.sessionId);
        this.favoriteSessionsIds.push(session.sessionId);
        this.registeredSessionsIds.push(session.sessionId);
        // session.numberOfParticipants++;
      };
      const updatedSession = await this._sessions.getById(session.sessionId);
      session.numberOfParticipants = updatedSession.numberOfParticipants;
    } catch (error) {
      // @todo handle errors coming from back-end
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  openDetail(session: Session): void {
    // @todo if mobile, show on modal
    if (this.app.isInMobileMode()) return;
    this.selectedSession = session;
  }
}