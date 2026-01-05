import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IDEAListComponent, IDEALoadingService, IDEAMessageService, IDEATranslatePipe, IDEATranslationsService } from '@idea-ionic/common';
import {
  AlertController,
  IonBadge,
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
  IonNote,
  IonReorder,
  IonReorderGroup,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { AppService } from '@app/app.service';
import { WrapperCustomBlockMetaComponent } from '@app/common/customBlock/wrapperCustomBlockMeta.component';
import { ConfigurationsService } from '../configurations.service';

import { Configurations } from '@models/configurations.model';

@Component({
  selector: 'registrations-configurations',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    IDEAListComponent,
    // App
    WrapperCustomBlockMetaComponent,
    // Ionic
    IonBadge,
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
    IonNote,
    IonReorder,
    IonReorderGroup,
    IonTitle,
    IonToolbar
  ],
  templateUrl: 'registrationsConfig.page.html',
  styleUrls: ['registrationsConfig.page.scss']
})
export class RegistrationsConfigurationsPage implements OnInit {
  configurations: Configurations;

  editMode = false;
  entityBeforeChange: Configurations;
  errors = new Set<string>();

  private alertCtrl = inject(AlertController);
  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private t = inject(IDEATranslationsService);
  private _configurations = inject(ConfigurationsService);
  public app = inject(AppService);
  ngOnInit(): void {
    this.configurations = new Configurations(this.app.configurations);
  }
  ionViewWillEnter(): void {
    if (!this.app.user.permissions.isAdmin) return this.app.closePage('COMMON.UNAUTHORIZED');
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
  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
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

  removeSpotType(spotType: string): void {
    this.configurations.spotTypes.splice(this.configurations.spotTypes.indexOf(spotType), 1);
    delete this.configurations.pricePerSpotTypes[spotType];
  }
  async addSpotType(): Promise<void> {
    const doAddSpotType = (data: any): Promise<void> => {
      const name = data?.name?.trim();
      if (!name) return;
      this.configurations.spotTypes.push(name);
      this.configurations.pricePerSpotTypes[name] = data.price ?? 0;
      this.configurations.stripeLinkPerSpotType[name] = data.stripeLink || null;
    };

    const header = this.t._('MANAGE.ADD_SPOT_TYPE');
    const inputs: any = [
      { name: 'name', type: 'text', placeholder: this.t._('MANAGE.SPOT_TYPE_NAME') },
      {
        name: 'price',
        type: 'number',
        placeholder: this.t._('MANAGE.SPOT_TYPE_PRICE', { currency: this.configurations.currency })
      },
      { name: 'stripeLink', type: 'text', placeholder: this.t._('MANAGE.SPOT_TYPE_STRIPE') }
    ];
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.CONFIRM'), handler: doAddSpotType }
    ];

    const alert = await this.alertCtrl.create({ header, inputs, buttons });
    await alert.present();
  }
  reorderSpotTypes({ detail }): void {
    this.configurations.spotTypes = detail.complete(this.configurations.spotTypes);
  }
}
