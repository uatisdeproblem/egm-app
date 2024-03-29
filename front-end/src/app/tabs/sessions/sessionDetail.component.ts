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
  @Input() hasUserRatedSession: boolean;
  @Input() hasSessionEnded: boolean;
  @Output() favorite = new EventEmitter<void>();
  @Output() register = new EventEmitter<void>();
  @Output() giveFeedback = new EventEmitter<{ rating: number; comment?: string }>();

  selectedRating = 0;

  constructor(public _sessions: SessionsService, public t: IDEATranslationsService, public app: AppService) {}
}
