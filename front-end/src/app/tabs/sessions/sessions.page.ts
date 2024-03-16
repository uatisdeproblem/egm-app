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

  days: string[]
  sessions: Session[];
  favoriteSessionsIds: string[] = [];
  registeredSessionsIds: string[] = []

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
    this.segment = segment
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
        session.numberOfParticipants--;
      } else {
        await this._sessions.registerInSession(session.sessionId);
        this.favoriteSessionsIds.push(session.sessionId);
        this.registeredSessionsIds.push(session.sessionId);
        session.numberOfParticipants++;
      };
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  // @todo this may be refactored to use both on back-end and front-end. This will handle the logic to tell if a session is disabled or not. WARNING IS DISABLED YOU CANT OPEN DETAIL....
  canUserRegisterInSession(session: Session) {
    if (session.isFull()) return false;

    // @todo or should this just disable the button and make the border red...?
    // @todo check logic to avoid overlaps.
  }

  // @todo open detail <- modal if mobile, selectSession if not
}