import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import {
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from '@app/app.service';
import { SpeakersService } from '../speakers/speakers.service';
import { RoomsService } from '../rooms/rooms.service';
import { SessionsService } from './sessions.service';

import { SpeakerLinked } from '@models/speaker.model';
import { Session, SessionType } from '@models/session.model';
import { RoomLinked } from '@models/room.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-manage-session',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CANCEL' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'SESSIONS.MANAGE_SESSION' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [title]="'COMMON.SAVE' | translate" (click)="save()">
            <ion-icon slot="icon-only" icon="checkmark-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content [class.ion-padding]="!app.isInMobileMode()">
      <ion-list class="aList" lines="full">
        <ion-item>
          <ion-label position="stacked">
            {{ 'SESSIONS.CODE' | translate }}
          </ion-label>
          <ion-input [(ngModel)]="session.code"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('name')">
          <ion-label position="stacked">
            {{ 'SESSIONS.NAME' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="session.name"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('type')">
          <ion-label position="stacked">
            {{ 'SESSIONS.TYPE' | translate }}
            <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-select interface="popover" [(ngModel)]="session.type">
            <ion-select-option *ngFor="let type of types | keyvalue" [value]="type.value">
              {{ 'SESSIONS.TYPES.' + type.key | translate }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item lines="none" [class.fieldHasError]="hasFieldAnError('durationMinutes')">
          <ion-label position="stacked">
            {{ 'SESSIONS.STARTS_AT' | translate }}
            <ion-text class="obligatoryDot" />
          </ion-label>
          <input #dateTime type="datetime-local" [(ngModel)]="session.startsAt" />
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('durationMinutes')">
          <ion-label position="stacked">
            {{ 'SESSIONS.DURATION_MINUTES' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="session.durationMinutes"></ion-input>
        </ion-item>
        <ion-item *ngIf="session.type !== types.COMMON" [class.fieldHasError]="hasFieldAnError('limitOfParticipants')">
          <ion-label position="stacked">
            {{ 'SESSIONS.PARTICIPANT_LIMIT' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input type="number" [(ngModel)]="session.limitOfParticipants"></ion-input>
        </ion-item>
        <ion-list-header>
          <ion-label>
            <h4>
              {{ 'SESSIONS.SPEAKERS' | translate }}
              <ion-text class="obligatoryDot"></ion-text>
            </h4>
          </ion-label>
        </ion-list-header>
        @if (session.speakers?.length) {
        <ion-item *ngFor="let speaker of session.speakers">
          <ion-icon slot="start" name="mic" />
          <ion-label>{{ speaker.name }}</ion-label>
          <ion-button fill="clear" slot="end" color="danger" (click)="removeSpeaker(speaker)">
            <ion-icon slot="icon-only" name="trash" />
          </ion-button>
        </ion-item>
        } @else {
        <ion-item [class.fieldHasError]="hasFieldAnError('speaker')">
          <ion-icon slot="start" name="mic" />
          <ion-label>{{ 'SESSIONS.NO_SPEAKERS' | translate }}</ion-label>
        </ion-item>
        }
        <ion-item [class.fieldHasError]="hasFieldAnError('speakers')">
          <ion-label position="stacked">{{ 'SESSIONS.ADD_SPEAKER' | translate }}</ion-label>
          <ion-select interface="popover" (ionChange)="addSpeaker($event)">
            <ion-select-option *ngFor="let speaker of speakers" [value]="speaker">
              {{ speaker.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-list-header>
          <ion-label>
            <h4>
              {{ 'SESSIONS.ROOM' | translate }}
              <ion-text class="obligatoryDot"></ion-text>
            </h4>
          </ion-label>
        </ion-list-header>
        <ion-item [class.fieldHasError]="hasFieldAnError('room')">
          <ion-label position="stacked">{{ 'SESSIONS.ROOM' | translate }}</ion-label>
          <ion-select interface="popover" [(ngModel)]="session.room">
            <ion-select-option *ngFor="let room of rooms" [value]="room">
              {{ room.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-list-header [class.fieldHasError]="hasFieldAnError('description')">
          <ion-label>
            <h2>{{ 'SESSIONS.DESCRIPTION' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        <app-html-editor [(content)]="session.description" [editMode]="true"></app-html-editor>
        <ion-row class="ion-padding-top" *ngIf="session.sessionId">
          <ion-col class="ion-text-right">
            <ion-button color="danger" (click)="askAndDelete()">{{ 'COMMON.DELETE' | translate }}</ion-button>
          </ion-col>
        </ion-row>
      </ion-list>
    </ion-content>
  `
})
export class ManageSessionComponent implements OnInit {
  /**
   * The session to manage.
   */
  @Input() session: Session;
  entityBeforeChange: Session;

  types = SessionType;
  speakers: SpeakerLinked[] = [];
  rooms: RoomLinked[] = [];

  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private t: IDEATranslationsService,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _rooms: RoomsService,
    private _speakers: SpeakersService,
    private _sessions: SessionsService,
    public app: AppService
  ) {}

  async ngOnInit() {
    this.entityBeforeChange = new Session(this.session);
    this.rooms = (await this._rooms.getList({ force: true })).map(r => new RoomLinked(r));
    this.speakers = (await this._speakers.getList({ force: true })).map(s => new SpeakerLinked(s));
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  addSpeaker(ev: any): void {
    const speaker = ev?.detail?.value;
    if (!speaker) return;

    if (this.session.speakers.some(s => s.speakerId === speaker.speakerId)) return;

    this.session.speakers.push(speaker);
  }

  removeSpeaker(speaker: SpeakerLinked): void {
    this.session.speakers = this.session.speakers.filter(s => s.speakerId !== speaker.speakerId);
  }

  async save(): Promise<void> {
    this.session = new Session(this.session);
    this.errors = new Set(this.session.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      let result: Session;
      if (!this.session.sessionId) result = await this._sessions.insert(this.session);
      else result = await this._sessions.update(this.session);
      this.session.load(result);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.close();
    } catch (err) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  close(): void {
    this.session = this.entityBeforeChange;
    this.modalCtrl.dismiss();
  }

  async askAndDelete(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._sessions.delete(this.session);
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.close();
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('COMMON.ARE_YOU_SURE');
    const message = this.t._('COMMON.ACTION_IS_IRREVERSIBLE');
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.DELETE'), role: 'destructive', handler: doDelete }
    ];
    const alert = await this.alertCtrl.create({ header, message, buttons });
    alert.present();
  }
}
