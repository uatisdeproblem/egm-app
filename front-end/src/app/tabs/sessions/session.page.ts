import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { ManageSessionComponent } from './manageSession.component';

import { SessionsService } from './sessions.service';
import { SessionRegistrationsService } from '../sessionRegistrations/sessionRegistrations.service';

import { Session } from '@models/session.model';
import { ActivatedRoute } from '@angular/router';
import { QrScannerModalComponent } from './QRScanner.component';
import { SessionRegistration } from '@models/sessionRegistration.model';

@Component({
  selector: 'app-session',
  templateUrl: './session.page.html',
  styleUrls: ['./session.page.scss']
})
export class SessionPage implements OnInit {
  session: Session;
  registration: SessionRegistration;
  favoriteSessionsIds: string[] = [];
  registeredSessionsIds: string[] = [];
  ratedSessionsIds: string[] = [];
  selectedSession: Session;

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    public _sessions: SessionsService,
    private _sessionRegistrations: SessionRegistrationsService,
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
      this.registration = await this._sessionRegistrations.getById(sessionId);
      // WARNING: do not pass any segment in order to get the favorites on the next api call.
      // @todo improvable. Just amke a call to see if a session is or isn't favorited/registerd using a getById
      const favoriteSessions = await this._sessions.getList({ force: true });
      this.favoriteSessionsIds = favoriteSessions.map(s => s.sessionId);
      const userRegisteredSessions = await this._sessions.loadUserRegisteredSessions();
      this.registeredSessionsIds = userRegisteredSessions.map(ur => ur.sessionId);
      this.ratedSessionsIds = userRegisteredSessions.filter(ur => ur.hasUserRated).map(ur => ur.sessionId);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  isSessionInFavorites(session: Session): boolean {
    return this.favoriteSessionsIds.includes(session.sessionId);
  }

  async toggleFavorite(ev: any, session: Session): Promise<void> {
    ev?.stopPropagation();
    try {
      await this.loading.show();
      if (this.isSessionInFavorites(session)) {
        await this._sessions.removeFromFavorites(session.sessionId);
        this.favoriteSessionsIds = this.favoriteSessionsIds.filter(id => id !== session.sessionId);
      } else {
        await this._sessions.addToFavorites(session.sessionId);
        this.favoriteSessionsIds.push(session.sessionId);
      }
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async toggleConfirm(ev: any, session: Session): Promise<void> {
    if (!session.canConfirmSession()) return;

    ev?.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: QrScannerModalComponent,
      componentProps: {
        sessionId: session.sessionId
      },
      backdropDismiss: true
    });

    modal.onDidDismiss().then(async ({ data: scannedData }): Promise<void> => {
      if (scannedData) {
        try {
          await this.loading.show();
          await this._sessionRegistrations.confirmParticipation(session.sessionId);
          this.registration.hasUserConfirmed = true;
          this.message.success('COMMON.OPERATION_COMPLETED');
        } catch (error) {
          if (error.message === 'Unauthorized') this.message.error('SESSIONS.CONFIRM_ERRORS.UNAUTHORIZED');
          else if (error.message === 'Session not available')
            this.message.error('SESSIONS.CONFIRM_ERRORS.SESSION_UNAVAILABLE');
          else if (error.message === 'Participation already confirmed')
            this.message.error('SESSIONS.CONFIRM_ERRORS.ALREADY_CONFIRMED');
          else if (error.message === 'Invalid Time period') this.message.error('SESSIONS.CONFIRM_ERRORS.INVALID_TIME');
          else if (error.message === 'User not Registered')
            this.message.error('SESSIONS.CONFIRM_ERRORS.USER_NOT_REGISTERED');
          else this.message.error('COMMON.OPERATION_FAILED');
        } finally {
          this.loading.hide();
        }
      }
    });

    await modal.present();
  }

  hasUserConfirmedParticipation(): boolean {
    return this.registration?.hasUserConfirmed;
  }

  isUserRegisteredInSession(session: Session): boolean {
    return this.registeredSessionsIds.includes(session.sessionId);
  }

  hasUserRatedSession(session: Session): boolean {
    return this.ratedSessionsIds.includes(session.sessionId);
  }

  hasSessionEnded(session: Session): boolean {
    return new Date(session.endsAt) < new Date();
  }

  async toggleRegister(ev: any, session: Session): Promise<void> {
    ev?.stopPropagation();
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
      }
      this.session = await this._sessions.getById(session.sessionId);
    } catch (error) {
      if (error.message === "User can't sign up for this session!") {
        this.message.error('SESSIONS.CANT_SIGN_UP');
      } else if (error.message === 'Registrations are closed!') {
        this.message.error('SESSIONS.REGISTRATION_CLOSED');
      } else if (error.message === 'Session is full! Refresh your page.') {
        this.message.error('SESSIONS.SESSION_FULL');
      } else if (error.message === 'You have 1 or more sessions during this time period.') {
        this.message.error('SESSIONS.OVERLAP');
      } else this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async onGiveFeedback(ev: any, session: Session): Promise<void> {
    try {
      await this.loading.show();
      let rating = ev.rating;
      let comment = ev.comment;
      if (rating === 0) return this.message.error('SESSIONS.NO_RATING');
      await this._sessions.giveFeedback(session, rating, comment);
      this.ratedSessionsIds.push(session.sessionId);

      this.message.success('SESSIONS.FEEDBACK_SENT');
    } catch (error) {
      if (error.message === "Can't rate a session without being registered")
        this.message.error('SESSIONS.NOT_REGISTERED');
      else if (error.message === 'Already rated this session') this.message.error('SESSIONS.ALREADY_RATED');
      else if (error.message === "Can't rate a session before it has ended")
        this.message.error('SESSIONS.STILL_TAKING_PLACE');
      else if (error.message === 'Invalid rating') this.message.error('SESSIONS.INVALID_RATING');
      else this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async manageSession(): Promise<void> {
    if (!this.session) return;

    if (!this.app.user.permissions.canManageContents) return;

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

  async downloadSessionsRegistrations(): Promise<void> {
    try {
      await this.loading.show();
      await this._sessionRegistrations.downloadSpreadsheet(this.t._('SESSIONS.SESSION_REGISTRATIONS'), this.session);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
}
