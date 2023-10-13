import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IDEAApiService, IDEAStorageService } from '@idea-ionic/common';

import { AppService } from '../app.service';

import { environment as env } from '@env';

@Component({
  selector: 'auth-page',
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss']
})
export class AuthPage implements OnInit {
  version = env.idea.app.version;

  constructor(
    private route: ActivatedRoute,
    private storage: IDEAStorageService,
    private api: IDEAApiService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    // complete the flow from ESN Accounts
    if (token) {
      await this.storage.set('authToken', token);
      window.location.assign('');
    }
  }

  async startLoginFlowAsExternal(): Promise<void> {
    const { token } = await this.api.postResource('cognito', {
      body: { action: 'SIGN_IN', email: 'matteo.carbone@esnmodena.it', password: '12345678' }
    });
    await this.storage.set('authToken', token);
    window.location.assign('');
  }

  startLoginFlowWithESNAccounts(): void {
    const apiLoginURL = `https://${env.idea.api.url}/${env.idea.api.stage}/galaxy`;
    const localhost = location.hostname.startsWith('localhost') ? '?localhost=8100' : '';
    window.location.assign(`https://accounts.esn.org/cas/login?service=${apiLoginURL}${localhost}`);
  }
}
