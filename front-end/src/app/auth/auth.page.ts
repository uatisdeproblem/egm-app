import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from '@app/app.service';
import { AuthService } from './auth.service';

import { environment as env } from '@env';

@Component({
  selector: 'auth-page',
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss']
})
export class AuthPage implements OnInit {
  version = env.idea.app.version;

  agreementCheck = true;

  constructor(private route: ActivatedRoute, private auth: AuthService, public app: AppService) {}
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
