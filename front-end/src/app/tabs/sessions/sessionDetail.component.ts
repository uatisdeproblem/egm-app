import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { IDEATranslatePipe, IDEATranslationsService } from '@idea-ionic/common';
import { IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRow, IonText, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { AppService } from '@app/app.service';
import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { Session, SessionType } from '@models/session.model';
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
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonRow,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
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

  getSessionTypeInfoTranslationKey(): string {
    switch (this.session?.type) {
      case SessionType.DISCUSSION:
      case SessionType.TALK:
      case SessionType.IGNITE:
      case SessionType.CAMPFIRE:
      case SessionType.INCUBATOR:
      case SessionType.HUB:
      case SessionType.COMMON:
        return `SESSIONS.TYPE_INFO.${this.session.type}`;
      default:
        return 'SESSIONS.TYPE_INFO.DEFAULT';
    }
  }
}
