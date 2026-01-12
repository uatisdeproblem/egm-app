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
  selector: 'terms-page',
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
  templateUrl: 'terms.page.html',
  styleUrls: ['terms.page.scss']
})
export class TermsPage {
  protected t = inject(IDEATranslationsService);
}
