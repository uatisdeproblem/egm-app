import { Component, OnInit } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { IDEAApiService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from '../app.service';

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  apiToken: string;

  constructor(private api: IDEAApiService, private message: IDEAMessageService, public app: AppService) {}
  async ngOnInit(): Promise<void> {
    this.apiToken = this.api.authToken as string;
  }

  async copyHTMLInputText(ionInput: IonInput): Promise<void> {
    if (!ionInput) return;

    const inputEl = await ionInput.getInputElement();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999); // for mobile devices
    navigator.clipboard.writeText(inputEl.value);

    this.message.success('COMMON.DONE');
  }

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
}
