import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { ManageSessionComponent } from './manageSession.component';

import { SessionsService } from './sessions.service';

import { Session } from '@models/session.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-session',
  templateUrl: './session.page.html',
  styleUrls: ['./session.page.scss']
})
export class SessionPage implements OnInit {

  session: Session;
  favoriteSessionsIds: string[] = [];
  registeredSessionsIds: string[] = [];
  selectedSession: Session;

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    public _sessions: SessionsService,
    public t: IDEATranslationsService,
    public app: AppService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const sessionId = this.route.snapshot.paramMap.get('sessionId');
      this.session = await this._sessions.getById(sessionId);
      // WARNING: do not pass any segment in order to get the favorites on the next api call.
      // @todo improvable. Just amke a call to see if a session is or isn't favorited/registerd using a getById
      const favoriteSessions = await this._sessions.getList({ force: true });
      this.favoriteSessionsIds = favoriteSessions.map( s => s.sessionId);
      this.registeredSessionsIds = (await this._sessions.loadUserRegisteredSessions()).map(ur => ur.sessionId);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
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
      } else {
        await this._sessions.registerInSession(session.sessionId);
        this.favoriteSessionsIds.push(session.sessionId);
        this.registeredSessionsIds.push(session.sessionId);
      };
      this.session = await this._sessions.getById(session.sessionId);
    } catch (error) {
      if (error.message === "User can't sign up for this session!"){
        this.message.error('SESSIONS.CANT_SIGN_UP');
      } else if (error.message === 'Registrations are closed!'){
        this.message.error('SESSIONS.REGISTRATION_CLOSED');
      } else if (error.message === 'Session is full! Refresh your page.'){
        this.message.error('SESSIONS.SESSION_FULL');
      } else if (error.message === 'You have 1 or more sessions during this time period.'){
        this.message.error('SESSIONS.OVERLAP');
      } else this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }


  async manageSession(): Promise<void> {
    if (!this.session) return;

    if (!this.app.user.permissions.canManageContents) return

    const modal = await this.modalCtrl.create({
      component: ManageSessionComponent,
      componentProps: { session: this.session },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      try {
        this.session = await this._sessions.getById(this.session.sessionId);
      } catch (error) {
        // deleted
        this.session = null;
      }
    });
    await modal.present();
  }
}