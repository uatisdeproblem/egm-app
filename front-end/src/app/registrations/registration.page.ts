import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '@app/users/users.service';

@Component({
  selector: 'event-registration',
  templateUrl: 'registration.page.html',
  styleUrls: ['registration.page.scss']
})
export class RegistrationPage {
  form: Record<string, any>;
  errors = new Set<string>();
  editMode = true;

  constructor(
    private route: ActivatedRoute,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _users: UsersService,
    public app: AppService
  ) {}
  async ionViewWillEnter(): Promise<void> {
    let registrationId = this.route.snapshot.paramMap.get('registrationId');
    if (registrationId === 'me') registrationId = this.app.user.userId;

    // @todo now it only works on self

    this.form = this.app.configurations.loadRegistrationForm(
      this.app.configurations.registrationFormDef,
      this.app.user.registrationForm
    );
    if (this.app.user.registrationAt) this.editMode = false;
  }

  async save(isDraft = false): Promise<void> {
    this.errors = new Set();
    if (!isDraft) {
      this.app.configurations.registrationFormDef
        .validateSections(this.form)
        .forEach(ea => this.errors.add(`sections.${ea}`));
    }
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      this.loading.show();
      this.app.user.load(await this._users.registerToEvent(this.app.user, this.form, isDraft));
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
}
