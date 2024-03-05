import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from 'src/app/app.service';
import { RoomsService } from './rooms.service';
import { SessionsService } from '../sessions/sessions.service';

import { Room } from '@models/room.model';
import { Session } from '@models/session.model';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss']
})
export class RoomPage implements OnInit {
  room: Room;
  sessions: Session[];

  constructor(
    private route: ActivatedRoute,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _sessions: SessionsService,
    private _rooms: RoomsService,
    public app: AppService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const roomId = this.route.snapshot.paramMap.get('roomId');
      this.room = await this._rooms.getById(roomId);
      this.sessions = await this._sessions.getList({ room: this.room.roomId, force: true });
    } catch (err) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      await this.loading.hide();
    }
  }

  async filterSessions(search: string = ''): Promise<void> {
    this.sessions = await this._sessions.getList({ search, room: this.room.roomId });
  }
}
