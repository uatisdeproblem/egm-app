import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { AuthService } from '@app/auth/auth.service';
import { UserService } from '@tabs/user/user.service';

import { environment as env } from '@env';
import { AuthServices, User } from '@models/user.model';

@Component({
  selector: 'user',
  templateUrl: 'user.page.html',
  styleUrls: ['user.page.scss']
})
export class UserPage {
  version = env.idea.app.version;

  AuthServices = AuthServices;

  editProfileMode = false;
  errors = new Set<string>();
  entityBeforeChange: User;

  constructor(
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private auth: AuthService,
    private _user: UserService,
    public app: AppService
  ) {}

  async changeAvatar({ target }): Promise<void> {
    const file = target.files[0];
    if (!file) return;

    try {
      await this.loading.show();
      const imageURI = await this._user.uploadAvatarAndGetURI(file);
      await new Promise(waitForImageCreation => setTimeout(waitForImageCreation, 5000));
      this.app.user.avatarURL = this.app.getImageURLByURI(imageURI);
      this.app.user.load(await this._user.update(this.app.user));
      this.message.success('COMMON.OPERATION_COMPLETED');
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  startEditProfile(): void {
    this.entityBeforeChange = new User(this.app.user);
    this.editProfileMode = true;
  }
  exitEditProfile(): void {
    this.app.user = this.entityBeforeChange;
    this.errors = new Set<string>();
    this.editProfileMode = false;
  }
  async saveProfile(): Promise<void> {
    this.errors = new Set(this.app.user.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      this.app.user.load(await this._user.update(this.app.user));
      this.editProfileMode = false;
      this.message.success('COMMON.OPERATION_COMPLETED');
    } catch (err) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  goToUserRegistration(): void {
    if (this.app.user.validate().length) return;

    this.app.goToInTabs(['user', 'registration', 'me']);
  }

  async uploadProofOfPayment({ target }): Promise<void> {
    const file = target.files[0];
    if (!file) return;

    try {
      await this.loading.show();
      this.app.user.load(await this._user.uploadProofOfPayment(file));
      this.message.success('COMMON.OPERATION_COMPLETED');
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  async downloadProofOfPayment(): Promise<void> {
    if (!this.app.user.spot?.proofOfPaymentURI) return;

    try {
      await this.loading.show();
      const url = await this._user.getProofOfPaymentURL();
      this.app.openURL(url);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  downloadInfoToPay(): void {
    // @todo
  }

  async openPrivacyPolicy(): Promise<void> {
    await this.app.openURL(this.t._('AUTH.PRIVACY_POLICY_URL'));
  }

  async logout(): Promise<void> {
    const header = this.t._('COMMON.LOGOUT');
    const message = this.t._('COMMON.ARE_YOU_SURE');
    const buttons = [
      { text: this.t._('COMMON.CANCEL') },
      { text: this.t._('COMMON.LOGOUT'), handler: (): Promise<void> => this.auth.logout() }
    ];
    const alert = await this.alertCtrl.create({ header, message, buttons });
    alert.present();
  }

  async deleteAccount(): Promise<void> {
    const confirmKey = this.t._('COMMON.CONFIRM').toLowerCase();
    const doDelete = async (data: any): Promise<void> => {
      try {
        const typedKey = data?.confirmKey?.trim();
        if (typedKey !== confirmKey) return;
        await this.loading.show();
        await this._user.delete();
        await this.auth.logout();
        window.location.assign('');
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('USER.DELETE_MY_DATA');
    const subHeader = this.t._('COMMON.ARE_YOU_SURE');
    const message = this.t._('USER.DELETE_MY_DATA_MSG', { confirmKey });
    const inputs: any = [{ name: 'confirmKey', type: 'text', placeholder: confirmKey }];
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.DELETE'), role: 'destructive', handler: doDelete }
    ];

    const alert = await this.alertCtrl.create({ header, subHeader, message, inputs, buttons });
    await alert.present();
  }
}
