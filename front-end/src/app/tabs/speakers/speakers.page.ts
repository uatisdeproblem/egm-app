import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

import { Speaker } from '@models/speaker.model';
import { SpeakersService } from './speakers.service';
import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

@Component({
  selector: 'app-speakers',
  templateUrl: './speakers.page.html',
  styleUrls: ['./speakers.page.scss']
})
export class SpeakersPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  speakers: Speaker[];
  filteredSpeakers: Speaker[];

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _speakers: SpeakersService,
    public app: AppService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      this.speakers = await this._speakers.getList({});
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async filterSpeakers(search = ''): Promise<void> {
    this.speakers = await this._speakers.getList({ search });
  }

  selectSpeaker(speaker: Speaker) {
    this.app.goToInTabs(['speakers', speaker.speakerId]);
  }
}