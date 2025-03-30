import { Component, OnInit, inject } from '@angular/core';
import {
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';
import { AppService } from '@app/app.service';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SessionRegistrationsService } from '../sessionRegistrations/sessionRegistrations.service';
import { Session } from '@models/session.model';
import { SessionsService } from './sessions.service';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, IDEATranslationsModule],
  selector: 'app-confirm-session',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="white">
        <ion-buttons slot="start">
          <ion-button (click)="_app.closePage()">
            <ion-icon icon="arrow-back" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="maxWidthContainer">
        <ion-card color="white">
          <ion-card-content class="ion-text-center">
            @if(success && session) {
              <ion-icon name="checkmark-circle" color="success" style="font-size: 48px;"></ion-icon>
              <h2>{{ 'SESSIONS.CONFIRMED_SESSION' | translate : { name: session.name } }}</h2>
              <p>
                <ion-text color="medium">
                  {{ session.startsAt | dateLocale : 'short' }} - {{ session.endsAt | dateLocale : 'short' }}
                </ion-text>
              </p>
            } @if(error) {
              <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                  {{ 'COMMON.ERROR' | translate }}
                  <p>
                    {{ error | translate }}
                  </p>
                </ion-label>
                <ion-icon slot="end" name="close" color="danger" />
              </ion-item>
            }
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [
    `
      div.maxWidthContainer {
        max-width: 300px;
      }
    `
  ]
})
export class ConfirmSessionComponent implements OnInit {
  private _loading = inject(IDEALoadingService);
  private _message = inject(IDEAMessageService);
  private _sessions = inject(SessionsService);
  private _sessionRegistrations = inject(SessionRegistrationsService);
  private route = inject(ActivatedRoute);
  private _t = inject(IDEATranslationsService);
  _app = inject(AppService);

  session: Session;
  success = false;
  error: string;

  async ngOnInit(): Promise<void> {
    try {
      await this._loading.show();
      const sessionId = this.route.snapshot.paramMap.get('sessionId');
      this.session = await this._sessions.getById(sessionId);
      await this._sessionRegistrations.confirmParticipation(sessionId);
      this.success = true;
    } catch (error) {
      if (error.message === 'Unauthorized') this.error = 'SESSIONS.CONFIRM_ERRORS.UNAUTHORIZED';
      else if (error.message === 'Participation already confirmed') this.error = 'SESSIONS.CONFIRM_ERRORS.ALREADY_CONFIRMED';
      else if (error.message === 'Invalid Time period') this.error = 'SESSIONS.CONFIRM_ERRORS.INVALID_TIME';
      else if (error.message === 'Registration not found') this.error = 'SESSIONS.CONFIRM_ERRORS.USER_NOT_REGISTERED';
      else this.error = 'COMMON.OPERATION_FAILED';

      this._message.error(this.error);
    } finally {
      this._loading.hide();

      if (this.success) {
        setTimeout(() => {
          this._app.closePage();
        }, 3000);
      }
    }
  }
}