import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonInfiniteScroll, IonicModule } from '@ionic/angular';
import { IDEAMessageService, IDEATranslationsModule } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { ContestsService } from './contests.service';

import { Contest } from '@models/contest.model';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, IDEATranslationsModule],
  selector: 'app-contests',
  template: `
    <ion-header>
      @if(_app.isInMobileMode()) {
      <ion-toolbar color="ideaToolbar">
        <ion-title class="ion-text-center">{{ 'CONTESTS.LIST' | translate }}</ion-title>
      </ion-toolbar>
      }
    </ion-header>
    <ion-content>
      <ion-list lines="inset">
        <ion-searchbar #searchbar color="light" (ionInput)="filterContests($event.target.value)" />
        @for(contest of contests; track contest.contestId) {
        <ion-item color="white" button detail (click)="selectContest(contest)">
          <ion-label class="ion-text-wrap">{{ contest.name }}</ion-label>
          @if(contest.isVoteStarted()) { @if(contest.isVoteEnded()) { @if(contest.publishedResults) {
          <ion-badge color="primary">{{ 'CONTESTS.RESULTS' | translate }}</ion-badge>
          } @else {
          <ion-badge color="ESNpink">{{ 'CONTESTS.VOTE_ENDED' | translate }}</ion-badge>
          } } @else {
          <ion-badge color="ESNgreen">{{ 'CONTESTS.VOTE_NOW' | translate }}</ion-badge>
          } }
        </ion-item>
        } @empty { @if(contests) {
        <ion-item color="white" class="noElements">
          <ion-label>{{ 'COMMON.NO_ELEMENT_FOUND' | translate }}</ion-label>
        </ion-item>
        } @else {
        <ion-item color="white">
          <ion-label><ion-skeleton-text animated /></ion-label>
        </ion-item>
        } }
        <ion-infinite-scroll (ionInfinite)="filterContests(searchbar.value, $event.target)">
          <ion-infinite-scroll-content />
        </ion-infinite-scroll>
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      ion-list {
        padding: 0;
        max-width: 500px;
        margin: 0 auto;
      }
    `
  ]
})
export class ContestsPage implements OnInit {
  contests: Contest[];

  private _message = inject(IDEAMessageService);
  private _contests = inject(ContestsService);
  _app = inject(AppService);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      this.contests = await this._contests.getList({});
    } catch (error) {
      this._message.error('COMMON.OPERATION_FAILED');
    }
  }

  async filterContests(search = '', scrollToNextPage?: IonInfiniteScroll): Promise<void> {
    let startPaginationAfterId = null;
    if (scrollToNextPage && this.contests?.length)
      startPaginationAfterId = this.contests[this.contests.length - 1].contestId;

    this.contests = await this._contests.getList({ search, withPagination: true, startPaginationAfterId });

    if (scrollToNextPage) setTimeout((): Promise<void> => scrollToNextPage.complete(), 100);
  }

  selectContest(contest: Contest): void {
    this._app.goToInTabs(['contests', contest.contestId]);
  }
}
