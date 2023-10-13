import { Component } from '@angular/core';
import { isEmpty } from 'idea-toolbox';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'auth-cognito',
  templateUrl: 'cognito.page.html',
  styleUrls: ['cognito.page.scss']
})
export class AuthCognitoPage {
  mode = PageSections.LOGIN;
  Sections = PageSections;

  email: string;
  password: string;
  firstName: string;
  lastName: string;

  errors = new Set<string>();

  constructor(
    private message: IDEAMessageService,
    private loading: IDEALoadingService,
    private auth: AuthService,
    public app: AppService
  ) {}

  async signIn(): Promise<void> {
    try {
      await this.loading.show();
      await this.auth.cognitoSignIn(this.email, this.password);
      window.location.assign('');
    } catch (err) {
      this.message.error('AUTH.SIGN_IN_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  signUp(): Promise<void> {
    this.errors = new Set();
    if (isEmpty(this.firstName)) this.errors.add('firstName');
    if (isEmpty(this.lastName)) this.errors.add('lastName');
    if (isEmpty(this.email, 'email')) this.errors.add('email');
    if (isEmpty(this.password)) this.errors.add('password');
    if (this.errors.size) return this.message.error('AUTH.REGISTRATION_FIELDS_INVALID');
  }
  resetPassword(): void {
    //
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  goToMainAuth(): void {
    this.app.goTo(['auth'], { back: true });
  }
}

/**
 * The sections of the page.
 */
enum PageSections {
  LOGIN,
  REGISTRATION,
  FORGOT_PASSWORD
}
