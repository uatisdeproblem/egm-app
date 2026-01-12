import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { IDEATranslatePipe } from '@idea-ionic/common';

import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  imports: [
    CommonModule,
    IDEATranslatePipe,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar
  ]
})
export class MenuPage {
  public readonly app = inject(AppService);
}