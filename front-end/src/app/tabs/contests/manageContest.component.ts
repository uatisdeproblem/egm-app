import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, OnInit, inject } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import {
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';

import { HTMLEditorComponent } from '@common/htmlEditor.component';
import { DatetimeWithTimezoneStandaloneComponent } from '@common/datetimeWithTimezone';

import { AppService } from '@app/app.service';
import { MediaService } from '@common/media.service';
import { ContestsService } from './contests.service';

import { Contest, ContestCandidate } from '@models/contest.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    HTMLEditorComponent,
    DatetimeWithTimezoneStandaloneComponent
  ],
  selector: 'app-manage-contest',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CANCEL' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'CONTESTS.MANAGE_CONTEST' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [title]="'COMMON.SAVE' | translate" (click)="save()">
            <ion-icon slot="icon-only" icon="checkmark-circle" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content [class.ion-padding]="!_app.isInMobileMode()" [class.viewMode]="contest.isVoteStarted()">
      <ion-list class="aList" lines="full">
        <ion-item [class.fieldHasError]="hasFieldAnError('name')">
          <ion-label position="stacked">
            {{ 'CONTESTS.NAME' | translate }} <ion-text class="obligatoryDot" />
          </ion-label>
          <ion-input [(ngModel)]="contest.name" />
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('imageURI')">
          <ion-label position="stacked">{{ 'CONTESTS.IMAGE_URI' | translate }}</ion-label>
          <ion-input [(ngModel)]="contest.imageURI" />
          <input type="file" accept="image/*" style="display: none" #uploadImageInput (change)="uploadImage($event)" />
          <ion-button slot="end" fill="clear" color="medium" class="ion-margin-top" (click)="uploadImageInput.click()">
            <ion-icon icon="cloud-upload-outline" slot="icon-only" />
          </ion-button>
        </ion-item>
        <ion-list-header>
          <ion-label>
            <h2>{{ 'CONTESTS.OPTIONS' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        <ion-item [class.fieldHasError]="hasFieldAnError('enabled')">
          <ion-checkbox slot="end" [(ngModel)]="contest.enabled" />
          <ion-label>{{ 'CONTESTS.VISIBLE' | translate }}</ion-label>
        </ion-item>
        @if(contest.enabled) { @if(!contest.voteEndsAt) {
        <ion-item>
          <ion-checkbox slot="end" (ionChange)="setVoteDeadline()" />
          <ion-label>{{ 'CONTESTS.OPEN_VOTE' | translate }}</ion-label>
        </ion-item>
        } @else {
        <app-datetime-timezone
          [label]="'CONTESTS.VOTE_ENDS_AT' | translate : { timezone }"
          [timezone]="timezone"
          [class.fieldHasError]="hasFieldAnError('voteEndsAt')"
          [(date)]="contest.voteEndsAt"
        >
          <ion-button slot="end" fill="clear" color="danger" class="ion-margin-top" (click)="setVoteDeadline(true)">
            <ion-icon icon="remove-outline" slot="icon-only" />
          </ion-button>
        </app-datetime-timezone>
        } }
        <ion-list-header [class.fieldHasError]="hasFieldAnError('candidates')">
          <ion-label>
            <h2>{{ 'CONTESTS.CANDIDATES' | translate }}</h2>
            <p>{{ 'CONTESTS.CANDIDATES_I' | translate }}</p>
          </ion-label>
          @if(!contest.isVoteStarted()){
          <ion-button (click)="addCandidate()">
            <ion-icon icon="add-circle-outline" slot="icon-only" />
          </ion-button>
          }
        </ion-list-header>
        @for(candidate of contest.candidates; track $index) {
        <p class="ion-padding">
          <ion-item [class.fieldHasError]="hasFieldAnError('candidates[' + $index + '].name')">
            <ion-label position="stacked">
              {{ 'CONTESTS.CANDIDATE_NAME' | translate }} <ion-text class="obligatoryDot" />
            </ion-label>
            <ion-input [(ngModel)]="candidate.name" [disabled]="contest.isVoteStarted()" />
          </ion-item>
          <ion-item [class.fieldHasError]="hasFieldAnError('candidates[' + $index + '].url')">
            <ion-label position="stacked">{{ 'CONTESTS.CANDIDATE_URL' | translate }}</ion-label>
            <ion-input type="url" [(ngModel)]="candidate.url" [disabled]="contest.isVoteStarted()" />
          </ion-item>
          <ion-item [class.fieldHasError]="hasFieldAnError('candidates[' + $index + '].country')">
            <ion-select
              interface="popover"
              labelPlacement="stacked"
              [label]="'CONTESTS.CANDIDATE_COUNTRY' | translate"
              [(ngModel)]="candidate.country"
              [disabled]="contest.isVoteStarted()"
            >
              <ion-select-option [value]="null"></ion-select-option>
              @for(country of _app.configurations.sectionCountries; track $index) {
              <ion-select-option [value]="country">{{ country }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
          @if(!contest.isVoteStarted()) {
          <ion-button expand="block" fill="clear" color="danger" (click)="removeCandidate(candidate)">
            <ion-icon icon="trash-outline" slot="icon-only" />
          </ion-button>
          }
        </p>
        } @empty {
        <ion-item class="noElements">
          <ion-label>{{ 'COMMON.NO_ELEMENTS' | translate }}</ion-label>
        </ion-item>
        }
        <ion-list-header [class.fieldHasError]="hasFieldAnError('description')">
          <ion-label>
            <h2>{{ 'CONTESTS.DESCRIPTION' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        <app-html-editor [(content)]="contest.description" [editMode]="true" />
        @if(contest.isVoteEnded()) {
        <ion-list-header>
          <ion-label>
            <h2>{{ 'CONTESTS.RESULTS' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        @for(candidate of contest.candidates; track candidate.name) {
        <ion-item>
          <ion-label>{{ candidate.name }}</ion-label>
          @if(isCandidateWinnerByIndex($index)) {
          <ion-icon slot="end" icon="trophy" color="ESNgreen" />
          }
          <ion-badge
            slot="end"
            style="width: 80px; text-align: right; margin-left: 6px"
            [color]="isCandidateWinnerByIndex($index) ? 'ESNgreen' : 'primary'"
          >
            {{ contest.results[$index] ?? 0 }} {{ 'CONTESTS.VOTES' | translate | lowercase }}
          </ion-badge>
        </ion-item>
        } } @if(contest.contestId) {
        <ion-row class="ion-padding-top">
          @if(contest.isVoteEnded() && !contest.publishedResults) {
          <ion-col>
            <ion-button color="ESNgreen" (click)="publishResults()">
              {{ 'CONTESTS.PUBLISH_RESULTS' | translate }}
            </ion-button>
          </ion-col>
          }
          <ion-col class="ion-text-right">
            <ion-button color="danger" (click)="askAndDelete()">{{ 'COMMON.DELETE' | translate }}</ion-button>
          </ion-col>
        </ion-row>
        }
      </ion-list>
    </ion-content>
  `
})
export class ManageContestComponent implements OnInit {
  /**
   * The contest to manage.
   */
  @Input() contest: Contest;

  errors = new Set<string>();

  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  private _modal = inject(ModalController);
  private _alert = inject(AlertController);
  private _t = inject(IDEATranslationsService);
  private _loading = inject(IDEALoadingService);
  private _message = inject(IDEAMessageService);
  private _media = inject(MediaService);
  private _contests = inject(ContestsService);
  _app = inject(AppService);

  async ngOnInit(): Promise<void> {
    this.contest = new Contest(this.contest);
  }

  setVoteDeadline(remove = false): void {
    if (remove) delete this.contest.voteEndsAt;
    else {
      const oneWeekAhead = new Date();
      oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
      this.contest.voteEndsAt = oneWeekAhead.toISOString();
    }
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  async uploadImage({ target }): Promise<void> {
    const file = target.files[0];
    if (!file) return;

    try {
      await this._loading.show();
      const imageURI = await this._media.uploadImage(file);
      await this._app.sleepForNumSeconds(3);
      this.contest.imageURI = imageURI;
    } catch (error) {
      this._message.error('COMMON.OPERATION_FAILED');
    } finally {
      if (target) target.value = '';
      this._loading.hide();
    }
  }

  async save(): Promise<void> {
    this.errors = new Set(this.contest.validate());
    if (this.errors.size) return this._message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this._loading.show();
      let result: Contest;
      if (!this.contest.contestId) result = await this._contests.insert(this.contest);
      else result = await this._contests.update(this.contest);
      this.contest.load(result);
      this._message.success('COMMON.OPERATION_COMPLETED');
      this.close();
    } catch (err) {
      this._message.error('COMMON.OPERATION_FAILED');
    } finally {
      this._loading.hide();
    }
  }
  close(): void {
    this._modal.dismiss();
  }

  async askAndDelete(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this._loading.show();
        await this._contests.delete(this.contest);
        this._message.success('COMMON.OPERATION_COMPLETED');
        this.close();
        this._app.goToInTabs(['contests']);
      } catch (error) {
        this._message.error('COMMON.OPERATION_FAILED');
      } finally {
        this._loading.hide();
      }
    };
    const header = this._t._('COMMON.ARE_YOU_SURE');
    const message = this._t._('COMMON.ACTION_IS_IRREVERSIBLE');
    const buttons = [
      { text: this._t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this._t._('COMMON.DELETE'), role: 'destructive', handler: doDelete }
    ];
    const alert = await this._alert.create({ header, message, buttons });
    alert.present();
  }

  addCandidate(): void {
    this.contest.candidates.push(new ContestCandidate());
  }
  removeCandidate(candidate: ContestCandidate): void {
    const candidateIndex = this.contest.candidates.indexOf(candidate);
    if (candidateIndex !== -1) this.contest.candidates.splice(candidateIndex, 1);
  }

  isCandidateWinnerByIndex(candidateIndex: number): boolean {
    return this.contest.candidates.every(
      (_, competitorIndex): boolean => this.contest.results[competitorIndex] <= this.contest.results[candidateIndex]
    );
  }

  async publishResults(): Promise<void> {
    const doPublish = async (): Promise<void> => {
      try {
        await this._loading.show();
        await this._contests.publishResults(this.contest);
        this.contest.publishedResults = true;
        this.close();
      } catch (err) {
        this._message.error('COMMON.OPERATION_FAILED');
      } finally {
        this._loading.hide();
      }
    };

    const header = this._t._('CONTESTS.PUBLISH_RESULTS');
    const subHeader = this._t._('COMMON.ARE_YOU_SURE');
    const buttons = [
      { text: this._t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this._t._('COMMON.CONFIRM'), handler: doPublish }
    ];
    const alert = await this._alert.create({ header, subHeader, buttons });
    alert.present();
  }
}
