import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { IDEATranslatePipe, IDEATranslationsService } from '@idea-ionic/common';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
  IonTextarea,
  IonToolbar
} from '@ionic/angular/standalone';

import { AppService } from '@app/app.service';
import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { Session } from '@models/session.model';
import { SessionsService } from './sessions.service';

@Component({
  selector: 'app-session-detail',
  imports: [
    // Angular
    CommonModule,
    // IDEA
    IDEATranslatePipe,
    // App
    HTMLEditorComponent,
    // Ionic
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRow,
    IonText,
    IonTextarea,
    IonToolbar
  ],
  templateUrl: 'sessionDetail.component.html',
  styleUrls: ['sessionDetail.component.scss']
})
export class SessionDetailComponent {
  @Input() session: Session;
  @Input() isSessionInFavorites: boolean;
  @Input() isUserRegisteredInSession: boolean;
  @Input() hasUserRatedSession: boolean;
  @Input() hasSessionEnded: boolean;
  @Input() hasUserConfirmedParticipation: boolean;
  @Output() favorite = new EventEmitter<void>();
  @Output() register = new EventEmitter<void>();
  @Output() giveFeedback = new EventEmitter<{ rating: number; comment?: string }>();
  @Output() confirmParticipation = new EventEmitter<void>();

  public _sessions = inject(SessionsService);
  public t = inject(IDEATranslationsService);
  public app = inject(AppService);

  selectedRating = 0;
}
