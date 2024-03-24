import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import {
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';

import { HTMLEditorComponent } from '@common/htmlEditor.component';
import { ManageContestComponent } from './manageContest.component';

import { AppService } from '@app/app.service';
import { ContestsService } from './contests.service';

import { Contest } from '@models/contest.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-contest',
  template: `
    <ion-header>
      <ion-toolbar color="ideaToolbar">
        <ion-buttons slot="start">
          <ion-button (click)="backToList()">
            <ion-icon slot="icon-only" name="arrow-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'CONTESTS.DETAILS' | translate }}</ion-title>
        @if(_app.user.permissions.canManageContents) {
        <ion-buttons slot="end">
          <ion-button color="ESNgreen" (click)="manageContest(contest)">
            <ion-icon slot="icon-only" icon="hammer" />
          </ion-button>
        </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if(contest) {
      <div class="maxWidthContainer">
        <ion-card color="white">
          <ion-img [src]="_app.getImageURLByURI(contest.imageURI)" />
          <ion-card-header>
            <ion-card-title>{{ contest.name }}</ion-card-title>
            <ion-card-subtitle>
              @if(contest.isVoteStarted()) { @if(contest.isVoteEnded()) { @if(contest.publishedResults) {
              <ion-badge color="ESNgreen">{{ 'CONTESTS.RESULTS' | translate }}</ion-badge>
              } @else {
              <ion-badge color="ESNpink">{{ 'CONTESTS.VOTE_ENDED' | translate }}</ion-badge>
              } } @else {
              <ion-badge color="primary">
                {{ 'CONTESTS.VOTE_NOW_UNTIL' | translate : { deadline: (contest.voteEndsAt | dateLocale : 'short') } }}
              </ion-badge>
              } } @else {
              <ion-badge color="medium">{{ 'CONTESTS.VOTE_NOT_OPEN_YET' | translate }}</ion-badge>
              }
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            @if(contest.description) {
            <app-html-editor [content]="contest.description" />
            }
            <ion-list>
              <ion-list-header>
                <ion-label>
                  <b>{{ 'CONTESTS.CANDIDATES' | translate }}</b>
                </ion-label>
              </ion-list-header>
              <ion-radio-group [(ngModel)]="voteForCandidate">
                @for(candidate of contest.candidates; track candidate.name) {
                <ion-item>
                  @if(canUserVote()) {
                  <ion-radio slot="start" [value]="candidate.name" [disabled]="canUserVote(candidate.country)" />
                  }
                  <ion-label class="ion-text-wrap">
                    {{ candidate.name }}
                    <p>{{ candidate.country }}</p>
                  </ion-label>
                  @if(candidate.url) {
                  <ion-button slot="end" fill="clear" (click)="_app.openURL(candidate.url)">
                    <ion-icon icon="link" slot="icon-only" />
                  </ion-button>
                  } @if(contest.publishedResults) { @if(isCandidateWinnerByIndex($index)) {
                  <ion-icon slot="end" icon="trophy" color="ESNgreen" style="margin-left: 6px" />
                  }
                  <ion-badge
                    slot="end"
                    style="width: 80px; text-align: right; margin-left: 6px"
                    [color]="isCandidateWinnerByIndex($index) ? 'ESNgreen' : 'primary'"
                  >
                    {{ contest.results[$index] ?? 0 }} {{ 'CONTESTS.VOTES' | translate | lowercase }}
                  </ion-badge>
                  }
                </ion-item>
                }
              </ion-radio-group>
              @if(canUserVote()) {
              <p class="ion-padding">{{ 'CONTESTS.VOTE_I' | translate }}</p>
              <ion-button expand="block" [disabled]="!voteForCandidate" (click)="vote()">
                {{ 'CONTESTS.VOTE' | translate }}
              </ion-button>
              } @if(userVoted()) {
              <p class="ion-padding">
                <b>{{ 'CONTESTS.YOU_ALREADY_VOTED' | translate }}</b>
              </p>
              }
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
      }
    </ion-content>
  `,
  styles: [
    `
      ion-card {
        ion-img {
          height: 300px;
          object-fit: cover;
        }
        ion-card-header {
          padding-bottom: 0;
        }
      }
      ion-list-header ion-label b {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--ion-color-step-700);
      }
    `
  ]
})
export class ContestPage implements OnInit {
  contest: Contest;

  private _route = inject(ActivatedRoute);
  private _modal = inject(ModalController);
  private _alert = inject(AlertController);
  private _loading = inject(IDEALoadingService);
  private _message = inject(IDEAMessageService);
  private _t = inject(IDEATranslationsService);
  private _contests = inject(ContestsService);
  _app = inject(AppService);

  voteForCandidate: string;

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      await this._loading.show();
      const contestId = this._route.snapshot.paramMap.get('contestId');
      this.contest = await this._contests.getById(contestId);
    } catch (err) {
      this._message.error('COMMON.NOT_FOUND');
    } finally {
      this._loading.hide();
    }
  }

  async manageContest(contest: Contest): Promise<void> {
    if (!this._app.user.permissions.canManageContents) return;

    const modal = await this._modal.create({
      component: ManageContestComponent,
      componentProps: { contest },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.contest = await this._contests.getById(contest.contestId);
    });
    await modal.present();
  }

  backToList(): void {
    this._app.goToInTabs(['contests'], { back: true });
  }

  isCandidateWinnerByIndex(candidateIndex: number): boolean {
    return this.contest.candidates.every(
      (_, competitorIndex): boolean => this.contest.results[competitorIndex] <= this.contest.results[candidateIndex]
    );
  }
  canUserVote(checkCountry?: string): boolean {
    const voteOpen = this.contest.isVoteStarted() && !this.contest.isVoteEnded();
    const canVoteCountry = !checkCountry || checkCountry === this._app.user.sectionCountry;
    const hasConfirmedSpot = this._app.user.spot?.paymentConfirmedAt;
    const isESNer = !this._app.user.isExternal();
    return voteOpen && canVoteCountry && !this.userVoted() && hasConfirmedSpot && isESNer;
  }
  userVoted(): boolean {
    return this._app.user.votedInContests.includes(this.contest.contestId);
  }

  async vote(): Promise<void> {
    const doVote = async (): Promise<void> => {
      try {
        await this._loading.show();
        await this._contests.vote(this.contest, this.voteForCandidate);
        this._app.user.votedInContests.push(this.contest.contestId);
      } catch (err) {
        this._message.error('COMMON.OPERATION_FAILED');
      } finally {
        this._loading.hide();
      }
    };

    const header = this._t._('CONTESTS.YOU_ARE_VOTING');
    const subHeader = this.voteForCandidate;
    const message = this._t._('CONTESTS.VOTE_I');
    const buttons = [
      { text: this._t._('CONTESTS.NOT_NOW'), role: 'cancel' },
      { text: this._t._('CONTESTS.VOTE'), handler: doVote }
    ];
    const alert = await this._alert.create({ header, subHeader, message, buttons });
    alert.present();
  }
}
