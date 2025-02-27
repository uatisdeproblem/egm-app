import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';
import { AppService } from '@app/app.service';
import { MealTicket } from '@models/meals.model';
import { MealsService } from '../../../meals/meals.service';
import { Configurations } from '@models/configurations.model';
import { Meal, MealType } from '@models/meals.configurations.model';
import { ConfigurationsService } from '@app/tabs/manage/configurations/configurations.service';
import { AddMealTypeComponent } from './addMealType.component';
import { DishListModalComponent } from './dish/dishList.component';

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
    private modalCtrl: ModalController,
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

  async save(): Promise<void> {
    this.errors = new Set(this.configurations.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');
    this.editMode = false;

    try {
      await this.loading.show();
      this.configurations.mealConfigurations.numTickets = this.configurations.mealConfigurations.mealInfo.length;
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
    const index = this.configurations.mealConfigurations.mealTypes.findIndex(
      m => m.name === mealType
    );
    if (index !== -1) {
      this.configurations.mealConfigurations.mealTypes.splice(index, 1);
    }
  }

  async addMealType(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddMealTypeComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.configurations.mealConfigurations.mealTypes.push(new MealType(data));
    }
  }

  reorderMealTypes({ detail }): void {
    this.configurations.mealConfigurations.mealTypes = detail.complete(this.configurations.mealConfigurations.mealTypes);
  }

  removeMealTicket(mealTicket: Meal): void {
    this.configurations.mealConfigurations.mealInfo.splice(this.configurations.mealConfigurations.mealInfo.indexOf(mealTicket), 1);
  }

  async openDishesModal(meal: Meal): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DishListModalComponent,
      componentProps: {
        dishes: meal.dishes,
        mealName: meal.name,
        mealTicketId: meal.ticketId,
        editMode: this.editMode
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.updated) {
      meal.dishes = data.dishes;

      this.save();
    }
  }

  async addMealTicket(): Promise<void> {
    const doAddMealTicket = (data: any): Promise<void> => {
      const name = data?.name?.trim();
      if (!name) return;
      this.configurations.mealConfigurations.mealInfo.push(new Meal({
        name: name,
        startValidity: new Date().toISOString(),
        endValidity: new Date().toISOString()
      }));

    };

    const header = this.t._('MANAGE.ADD_MEAL_TICKET');
    const inputs: any = [
      { name: 'name', type: 'text', placeholder: this.t._('MANAGE.MEAL_TICKET_NAME') },
    ];
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.CONFIRM'), handler: doAddMealTicket }
    ];

    const alert = await this.alertCtrl.create({ header, inputs, buttons });
    await alert.present();
  }

  reorderMealTickets({ detail }): void {
    this.configurations.mealConfigurations.mealInfo = detail.complete(this.configurations.mealConfigurations.mealInfo);
  }
}
