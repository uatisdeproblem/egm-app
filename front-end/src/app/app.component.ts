import { Component, inject } from '@angular/core';
import {
  IonApp,
  IonFab,
  IonFabButton,
  IonIcon,
  IonRouterOutlet
} from '@ionic/angular/standalone';
import { AppService } from './app.service';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, IonApp, IonIcon, IonFab, IonFabButton, IonRouterOutlet],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public app = inject(AppService);

  constructor() {
    addIcons({ ...icons });
  }
}
