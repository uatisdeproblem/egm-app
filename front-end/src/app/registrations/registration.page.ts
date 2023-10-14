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
    let registrationId = this.route.snapshot.paramMap.get('registrationId');
    if (registrationId === 'me') registrationId = this.app.user.userId;

    if (!this.app.user.isAdmin() && registrationId) {
      // @todo add auth control
    }

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

  async saveProgress(): Promise<void> {
    try {
      this.loading.show();
      this.registration = await this._registrations.update(this.registration);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async submitRegistration(): Promise<void> {
    // @todo validate and show errors on form
    // this.errors = new Set(this.editedBanner.validate());
    //   if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    const errors = new Set(this.registration.validate());
    if (errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      this.loading.show();
      // @todo add alert!
      this.registration = await this._registrations.update(this.registration);
      this.registration = await this._registrations.submit(this.registration);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
}
