import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IDEATranslatePipe } from '@idea-ionic/common';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonText
} from '@ionic/angular/standalone';

import { AppService } from '@app/app.service';
import { AuthService } from './auth.service';

import { environment as env } from '@env';

@Component({
  selector: 'auth-page',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCheckbox,
    IonContent,
    IonIcon,
    IonImg,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonText
  ],
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss']
})
export class AuthPage implements OnInit {
  version = env.idea.app.version;

  agreementCheck = true;

  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  public app = inject(AppService);

  async ngOnInit(): Promise<void> {
    // complete the flow from ESN Accounts
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      await this.auth.saveAuthToken(token);
      window.location.assign('');
    }
  }

  startSignInFlowWithESNAccounts(): void {
    window.location.assign(this.auth.getURLToStartSignInWithESNAccounts());
  }

  goToCognitoAuth(): void {
    this.app.goTo(['auth', 'cognito']);
  }
}
