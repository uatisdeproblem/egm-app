import { Component, inject } from '@angular/core';
import { IDEATranslatePipe, IDEATranslationsService } from '@idea-ionic/common';
import {
  IonContent,
  IonHeader,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'privacy-page',
  imports: [
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonContent,
    IonHeader,
    IonList,
    IonTitle,
    IonToolbar
  ],
  templateUrl: 'privacy-policy.page.html',
  styleUrls: ['privacy-policy.page.scss']
})
export class PrivacyPage {
  protected t = inject(IDEATranslationsService);
}
