import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from 'src/app/app.service';
import { SpeakersService } from './speakers.service';
import { SessionsService } from '../sessions/sessions.service';

import { Speaker } from '@models/speaker.model';
import { Session } from '@models/session.model';

@Component({
  selector: 'app-speaker',
  templateUrl: './speaker.page.html',
  styleUrls: ['./speaker.page.scss']
})
export class SpeakerPage implements OnInit {
  speaker: Speaker;
  sessions: Session[];

  constructor(
    private route: ActivatedRoute,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _speakers: SpeakersService,
    private _sessions: SessionsService,
    public app: AppService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const speakerId = this.route.snapshot.paramMap.get('speakerId');
      this.speaker = await this._speakers.getById(speakerId);
      this.sessions = await this._sessions.getList({ speaker: this.speaker.speakerId, force: true });
    } catch (err) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      await this.loading.hide();
    }
  }

  async filterSessions(search: string = ''): Promise<void> {
    this.sessions = await this._sessions.getList({ search, speaker: this.speaker.speakerId });
  }
}
