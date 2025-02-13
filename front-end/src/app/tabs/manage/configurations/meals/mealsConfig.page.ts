import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';
import { AppService } from '@app/app.service';
import { MealTicket } from '@models/meals.model';
import { MealsService } from '../../../meals/meals.service';
import { Configurations } from '@models/configurations.model';
import { Meal } from '@models/meals.configurations.model';
import { ConfigurationsService } from '@app/tabs/manage/configurations/configurations.service';

@Component({
  selector: 'meals-configurations',
  templateUrl: 'mealsConfig.page.html',
  styleUrls: ['mealsConfig.page.scss'],
})
export class MealsConfigurationsPage implements OnInit {
  configurations: Configurations;
  configurationsBeforeChange: Configurations;
  editMode: boolean;
  errors = new Set<string>();

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private alertCtrl: AlertController,
    private t: IDEATranslationsService,
    private _configurations: ConfigurationsService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.editMode = false;
    this.configurations = new Configurations(this.app.configurations);
  }

  exitEditMode(): void {
    this.configurations = this.configurationsBeforeChange;
    this.errors = new Set<string>();
    this.editMode = false;
  }
  enterEditMode(): void {
    this.configurationsBeforeChange = new Configurations(this.configurations);
    this.editMode = true;
  }

  resetTicketInfo(event: any): void {
    this.configurations.mealConfigurations.numTickets = parseInt(event.detail.value);
    this.configurations.mealConfigurations.mealInfo = Array(this.configurations.mealConfigurations.numTickets).fill(null).map(() => {
      const meal = new Meal({
        name: `Ticket ${this.configurations.mealConfigurations.mealInfo.length + 1}`,
        startValidity: new Date().toISOString(),
        endValidity: new Date().toISOString()
      });
      return meal;
    });
  }


  async save(): Promise<void> {
    this.errors = new Set(this.configurations.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');
    this.editMode = false;

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

  removeMealType(mealType: string): void {
    this.configurations.mealConfigurations.mealTypes.splice(this.configurations.mealConfigurations.mealTypes.indexOf(mealType), 1);
  }

  async addMealType(): Promise<void> {
    const doAddMealType = (data: any): Promise<void> => {
      const name = data?.name?.trim();
      if (!name) return;
      this.configurations.mealConfigurations.mealTypes.push(name);
    };

    const header = this.t._('MANAGE.ADD_MEAL_TYPE');
    const inputs: any = [
      { name: 'name', type: 'text', placeholder: this.t._('MANAGE.MEAL_TYPE_NAME') },
    ];
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.CONFIRM'), handler: doAddMealType }
    ];

    const alert = await this.alertCtrl.create({ header, inputs, buttons });
    await alert.present();
  }

  reorderMealTypes({ detail }): void {
    this.configurations.mealConfigurations.mealTypes = detail.complete(this.configurations.mealConfigurations.mealTypes);
  }
}
