import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IDEATranslatePipe } from '@idea-ionic/common';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { Speaker } from '@models/speaker.model';
import { SpeakersService } from './speakers.service';
import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

@Component({
  selector: 'app-speakers',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSkeletonText,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './speakers.page.html',
  styleUrls: ['./speakers.page.scss']
})
export class SpeakersPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  speakers: Speaker[];
  filteredSpeakers: Speaker[];

  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _speakers = inject(SpeakersService);
  public app = inject(AppService);

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