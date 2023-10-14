import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '@app/users/users.service';

import { User } from '@models/user.model';

@Component({
  selector: 'event-registration',
  templateUrl: 'registration.page.html',
  styleUrls: ['registration.page.scss']
})
export class RegistrationPage {
  user: User;
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
    let userId = this.route.snapshot.paramMap.get('userId');
    if (userId === 'me') userId = this.app.user.userId;

    try {
      await this.loading.show();
      this.user = await this._users.getById(userId);
      this.form = this.app.configurations.loadRegistrationForm(
        this.app.configurations.registrationFormDef,
        this.user.registrationForm
      );
      if (this.user.registrationAt) this.editMode = false;
    } catch (error) {
      this.app.closePage('COMMON.SOMETHING_WENT_WRONG');
      throw error;
    } finally {
      this.loading.hide();
    }
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
      this.user.load(await this._users.registerToEvent(this.user, this.form, isDraft));
      if (this.app.user.userId === this.user.userId) this.app.user.load(this.user);
      this.message.success('COMMON.OPERATION_COMPLETED');
      if (!isDraft) this.app.goToInTabs(['profile'], { back: true });
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
}
