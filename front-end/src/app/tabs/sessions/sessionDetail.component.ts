import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AppService } from '@app/app.service';
import { IDEATranslationsService } from '@idea-ionic/common';

import { Session } from '@models/session.model';
import { SessionsService } from './sessions.service';

@Component({
  selector: 'app-session-detail',
  templateUrl: 'sessionDetail.component.html',
  styleUrls: ['sessionDetail.component.scss']
})
export class SessionDetailComponent {
  @Input() session: Session;
  @Input() isSessionInFavorites: boolean;
  @Input() isUserRegisteredInSession: boolean;
  @Output() favorite = new EventEmitter<void>();
  @Output() register = new EventEmitter<void>();

  constructor(public _sessions: SessionsService, public t: IDEATranslationsService, public app: AppService) {}
}
