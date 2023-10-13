import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { isEmpty } from 'idea-toolbox';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'auth-cognito',
  templateUrl: 'cognito.page.html',
  styleUrls: ['cognito.page.scss']
})
export class AuthCognitoPage implements OnInit {
  mode = PageSections.LOGIN;
  Sections = PageSections;

  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmEmail: string;
  confirmationCode: string;

  errors = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private message: IDEAMessageService,
    private loading: IDEALoadingService,
    private t: IDEATranslationsService,
    private auth: AuthService,
    public app: AppService
  ) {}
  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) this.email = email;

    const forgotPasswordCode = this.route.snapshot.queryParamMap.get('forgotPasswordCode');
    if (forgotPasswordCode) {
      this.confirmationCode = forgotPasswordCode;
      this.mode = PageSections.FORGOT_PASSWORD_CONFIRM;
    }
  }

  async signIn(): Promise<void> {
    try {
      if (isEmpty(this.email, 'email')) this.errors.add('email');
      if (isEmpty(this.password)) this.errors.add('password');
      if (this.errors.size) return this.message.error('AUTH.AUTH_FIELDS_INVALID');

      await this.loading.show();
      await this.auth.cognitoSignIn(this.email, this.password);
      window.location.assign('');
    } catch (err) {
      this.message.error('AUTH.SIGN_IN_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  async signUp(): Promise<void> {
    this.errors = new Set();
    if (isEmpty(this.firstName)) this.errors.add('firstName');
    if (isEmpty(this.lastName)) this.errors.add('lastName');
    if (isEmpty(this.email, 'email')) this.errors.add('email');
    if (this.email !== this.confirmEmail) this.errors.add('confirmEmail');
    if (isEmpty(this.password)) this.errors.add('password');
    if (this.errors.size) return this.message.error('AUTH.AUTH_FIELDS_INVALID');

    try {
      await this.loading.show();
      await this.auth.cognitoSignUp(this.email, this.password, this.firstName, this.lastName);
      window.location.assign('');
    } catch (err) {
      this.message.error('AUTH.SIGN_IN_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  async resetPassword(): Promise<void> {
    if (isEmpty(this.email, 'email')) this.errors.add('email');
    if (this.errors.size) return this.message.error('AUTH.AUTH_FIELDS_INVALID');

    try {
      await this.loading.show();
      await this.auth.resetPassword(this.email);
      const alert = await this.alertCtrl.create({
        message: this.t._('AUTH.RESET_PASSWORD_INSTRUCTIONS_TO_YOUR_EMAIL'),
        buttons: [this.t._('COMMON.GOT_IT')]
      });
      await alert.present();
      this.mode = PageSections.LOGIN;
    } catch (err) {
      this.message.error('AUTH.ACCOUNT_NOT_FOUND');
    } finally {
      this.loading.hide();
    }
  }
  async confirmResetPassword(): Promise<void> {
    if (isEmpty(this.email, 'email')) this.errors.add('email');
    if (isEmpty(this.password)) this.errors.add('password');
    if (isEmpty(this.confirmationCode)) this.errors.add('confirmationCode');
    console.log(this.errors);
    if (this.errors.size) return this.message.error('AUTH.AUTH_FIELDS_INVALID');

    try {
      await this.loading.show();
      await this.auth.resetPasswordConfirm(this.email, this.password, this.confirmationCode);
      const alert = await this.alertCtrl.create({
        message: this.t._('AUTH.YOU_CAN_SIGN_IN_WITH_NEW_PASSWORD'),
        buttons: [this.t._('COMMON.GOT_IT')]
      });
      await alert.present();
      this.mode = PageSections.LOGIN;
    } catch (err) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
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
  FORGOT_PASSWORD,
  FORGOT_PASSWORD_CONFIRM
}
