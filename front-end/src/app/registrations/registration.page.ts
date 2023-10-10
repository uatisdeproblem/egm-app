import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';

import { Registration, TShirtSizes } from '@models/registration.model';
import { RegistrationsService } from './registrations.service';

@Component({
  selector: 'registration',
  templateUrl: 'registration.page.html',
  styleUrls: ['registration.page.scss']
})
export class RegistrationPage {
  registration: Registration;

  tshirtSizes = Object.keys(TShirtSizes).filter(s => isNaN(Number(s)));

  // @todo add methods and populate UI

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _registrations: RegistrationsService,
    private t: IDEATranslationsService,
    public app: AppService
  ) {}

  async ionViewWillEnter(): Promise<void> {
    if (!this.app.user.isAdmin() && this.route.snapshot.paramMap.get('registrationId')) {
      // @todo add auth control
    }
    const registrationId = this.route.snapshot.paramMap.get('registrationId') || this.app.user.userId;
    await this.loadRegistration(registrationId);
  }
  private async loadRegistration(registrationId: string): Promise<void> {
    try {
      this.loading.show();
      this.registration = await this._registrations.getById(registrationId);
    } catch (error) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      this.loading.hide();
    }
  }
}
