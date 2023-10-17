import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '@tabs/manage/users/users.service';

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

  acceptCOC = false;
  acceptTC = false;

  constructor(
    private route: ActivatedRoute,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private _users: UsersService,
    public app: AppService
  ) {}
  async ionViewWillEnter(): Promise<void> {
    let userId = this.route.snapshot.paramMap.get('userId');
    if (userId === 'me') userId = this.app.user.userId;

    if (userId !== this.app.user.userId && !this.app.user.permissions.canManageRegistrations)
      return this.app.closePage('COMMON.UNAUTHORIZED');

    try {
      await this.loading.show();
      this.user = await this._users.getById(userId);
      this.form = this.app.configurations.loadRegistrationForm(
        this.app.configurations.registrationFormDef,
        this.user.registrationForm
      );
      if (this.user.registrationAt) {
        this.editMode = false;
        this.acceptTC = true;
        this.acceptCOC = true;
      }
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
      if (!this.acceptCOC) this.errors.add('coc');
      if (!this.acceptTC) this.errors.add('tc');
    }
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      this.user.load(await this._users.registerToEvent(this.user, this.form, isDraft));
      if (this.app.user.userId === this.user.userId) this.app.user.load(this.user);
      this.message.success('COMMON.OPERATION_COMPLETED');
      if (!isDraft) {
        if (this.user.userId === this.app.user.userId) this.app.goToInTabs(['user'], { back: true });
        else this.editMode = false;
      }
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  async openDocumentByTranslationKey(translationKey: string): Promise<void> {
    await this.app.openURL(this.t._(translationKey));
  }
}
