import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IDEALoadingService, IDEAMessageService, IDEATranslatePipe } from '@idea-ionic/common';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { AppService } from '@app/app.service';
import { ConfigurationsService } from '../configurations/configurations.service';

import { Configurations } from '@models/configurations.model';

@Component({
  selector: 'app-sessions-management',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonTitle,
    IonToolbar
  ],
  templateUrl: 'sessionsManagement.page.html'
})
export class SessionsManagementPage implements OnInit {
  configurations: Configurations;
  entityBeforeChange: Configurations;

  editMode = false;

  errors = new Set<string>();

  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _configurations = inject(ConfigurationsService);
  public app = inject(AppService);
  ngOnInit(): void {
    this.configurations = new Configurations(this.app.configurations);
  }
  ionViewWillEnter(): void {
    if (!this.app.user.permissions.canManageRegistrations) return this.app.closePage('COMMON.UNAUTHORIZED');
  }

  exitEditMode(): void {
    this.configurations = this.entityBeforeChange;
    this.errors = new Set<string>();
    this.editMode = false;
  }

  enterEditMode(): void {
    this.entityBeforeChange = new Configurations(this.configurations);
    this.editMode = true;
  }

  async save(): Promise<void> {
    this.errors = new Set(this.configurations.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      this.configurations.load(await this._configurations.update(this.configurations));
      this.app.configurations.load(this.configurations);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.editMode = false;
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
}
