import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '../users.service';

import { environment as env } from '@env';

@Component({
  selector: 'profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {
  version = env.idea.app.version;

  constructor(
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _users: UsersService,
    private t: IDEATranslationsService,
    public app: AppService
  ) {}

  async setAvatar(ev: any): Promise<void> {
    // @todo - ALSO, check how the URL comes from S3.
    // Consider putting even ESN avatars on S3 so it is standard
    // If so, change the app.service getImage method to handle onyl URI
    // !
    // const file = ev.target.files[0];
    // if (!file) return;
    // try {
    //   await this.loading.show();
    //   const imageURI = await this._users.uploadPictureAndGetURI(this.user, file);
    //   await new Promise(waitForImageCreation => setTimeout(waitForImageCreation, 3000));
    //   this.user.imageURI = imageURI;
    //   await this._users.update(this.user);
    //   this.app.user = new User(this.user);
    //   this.message.success('COMMON.OPERATION_COMPLETED');
    // } catch (error) {
    //   this.message.error('COMMON.OPERATION_FAILED');
    // } finally {
    //   this.loading.hide();
    // }
  }

  async deleteAccount(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._users.deleteProfile(this.app.user);
        await this.app.logout();
        window.location.assign('');
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };

    const header = this.t._('PROFILE.DELETE_ACCOUNT');
    const message = this.t._('COMMON.ARE_YOU_SURE');
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('PROFILE.DELETE_ACCOUNT'), role: 'danger', handler: doDelete }
    ];

    const alert = await this.alertCtrl.create({ header, message, buttons });
    await alert.present();
  }
}
