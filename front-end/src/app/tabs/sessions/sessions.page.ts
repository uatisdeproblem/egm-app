import { Component, ViewChild } from '@angular/core';
import { IonContent, IonSearchbar, ModalController } from '@ionic/angular';

import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { ManageSessionComponent } from './manageSession.component';

import { SessionsService } from './sessions.service';
import { SessionRegistrationsService } from '../sessionRegistrations/sessionRegistrations.service';

import { Session } from '@models/session.model';
import { Speaker } from '@models/speaker.model';
import { SpeakersService } from '../speakers/speakers.service';
import { QrScannerModalComponent } from './QRScanner.component';
import { SessionRegistration } from '@models/sessionRegistration.model';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.page.html',
  styleUrls: ['./sessions.page.scss']
})
export class SessionsPage {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonContent) searchbar: IonSearchbar;

  days: string[];
  sessions: Session[];
  favoriteSessionsIds: string[] = [];
  registeredSessionsIds: string[] = [];
  ratedSessionsIds: string[] = [];
  selectedSession: Session;
  speakers: Speaker[];
  hasSessionLimitations: boolean;
  sessionCountByDate: Record<string, number> = {};
  registration: SessionRegistration;
  segment = '';

  constructor(
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    public _sessions: SessionsService,
    public _speakers: SpeakersService,
    private _sessionRegistrations: SessionRegistrationsService,
    public t: IDEATranslationsService,
    public app: AppService
  ) {}

  async ionViewDidEnter(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      await this.loading.show();
      // WARNING: do not pass any segment in order to get the favorites on the next api call.
      this.segment = '';
      this.sessions = await this._sessions.getList({ force: true });
      this.speakers = await this._speakers.getList({});
      const isSpeaker = this.speakers.some(s => this.app.user.isSpeaker(s));
      this.hasSessionLimitations = isSpeaker
        ? this.app.configurations.forSpeakers
        : this.app.user.isExternal()
        ? this.app.configurations.forExternals
        : this.app.configurations.forParticipants;

      this.favoriteSessionsIds = this.sessions.map(s => s.sessionId);
      const userRegisteredSessions = await this._sessions.loadUserRegisteredSessions();
      this.registeredSessionsIds = userRegisteredSessions.map(ur => ur.sessionId);
      this.ratedSessionsIds = userRegisteredSessions.filter(ur => ur.hasUserRated).map(ur => ur.sessionId);
      this.days = await this._sessions.getSessionDays();
      this.checkMinSessionsLimit();
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  changeSegment(segment: string, search = ''): void {
    this.selectedSession = null;
    this.segment = segment;
    this.filterSessions(search);
    this.checkMinSessionsLimit();
  }
  async filterSessions(search = ''): Promise<void> {
    this.sessions = await this._sessions.getList({ search, segment: this.segment });
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
        if (!this.segment) this.sessions = this.sessions.filter(s => s.sessionId !== session.sessionId);
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
    try {
      const modal = await this.modalCtrl.create({
        component: QrScannerModalComponent,
        componentProps: {
          sessionId: session.sessionId
        },
        backdropDismiss: true
      });

      // Present the modal
      await modal.present();

      const { data: scannedData } = await modal.onDidDismiss();

      if (scannedData) {
        try {
          await this.loading.show();
          await this._sessionRegistrations.confirmParticipation(session.sessionId);
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

      await modal.present();
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    }
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
        if (!this.segment) this.sessions = this.sessions.filter(s => s.sessionId !== session.sessionId);
      } else {
        await this._sessions.registerInSession(session.sessionId);
        this.favoriteSessionsIds.push(session.sessionId);
        this.registeredSessionsIds.push(session.sessionId);
      }
      const updatedSession = await this._sessions.getById(session.sessionId);
      session.numberOfParticipants = updatedSession.numberOfParticipants;
      this.checkMinSessionsLimit();
    } catch (error) {
      if (error.message === "User can't sign up for this session!") {
        this.message.error('SESSIONS.CANT_SIGN_UP');
      } else if (error.message === 'Registrations are closed!') {
        this.message.error('SESSIONS.REGISTRATION_CLOSED');
      } else if (error.message === 'Session is full! Refresh your page.') {
        this.message.error('SESSIONS.SESSION_FULL');
      } else if (error.message === 'You have 1 or more sessions during this time period.') {
        this.message.error('SESSIONS.OVERLAP');
      } else if (error.message === 'You have reached the maximum number of sessions you can register to!') {
        this.message.error('SESSIONS.SESSION_MAX_LIMIT_WARNING');
      } else this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async checkMinSessionsLimit(): Promise<void> {
    if (!this.hasSessionLimitations) return;

    for (const day of this.days) {
      const sessionsInDay = await this._sessions.getList({ segment: day });
      const registeredSessions = sessionsInDay.filter(s => this.registeredSessionsIds.includes(s.sessionId));
      this.sessionCountByDate[day] = registeredSessions.length;
    }
  }

  async openDetail(ev: any, session: Session): Promise<void> {
    ev?.stopPropagation();

    if (this.app.isInMobileMode()) this.app.goToInTabs(['agenda', session.sessionId]);
    else {
      this.selectedSession = session;
      this.registration = await this._sessionRegistrations.getById(session.sessionId);
    }
  }

  async onGiveFeedback(ev: any, session: Session): Promise<void> {
    try {
      await this.loading.show();
      if (ev.rating === 0) return this.message.error('SESSIONS.NO_RATING');

      await this._sessions.giveFeedback(session, ev.rating, ev.comment);
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
    if (!this.selectedSession) return;

    if (!this.app.user.permissions.canManageContents) return;

    const modal = await this.modalCtrl.create({
      component: ManageSessionComponent,
      componentProps: { session: this.selectedSession },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      try {
        this.selectedSession = await this._sessions.getById(this.selectedSession.sessionId);
      } catch (error) {
        // deleted
        this.selectedSession = null;
        this.sessions = await this._sessions.getList({ force: true });
      }
    });
    await modal.present();
  }

  async downloadSessionsRegistrations(): Promise<void> {
    try {
      await this.loading.show();
      await this._sessionRegistrations.downloadSpreadsheet(
        this.t._('SESSIONS.SESSION_REGISTRATIONS'),
        this.selectedSession
      );
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
}
