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
import { AddMealTicketComponent } from './addMealTicket.component';

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

  async editMealType(mealType: MealType): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddMealTypeComponent,
      componentProps: {
        mealType: mealType
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      mealType = new MealType(data);
    }
  }

  removeMealType(mealType: MealType): void {
    this.configurations.mealConfigurations.mealTypes.splice(
      this.configurations.mealConfigurations.mealTypes.indexOf(mealType), 1);
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


  async editMealTicket(ticket: Meal): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddMealTicketComponent,
      componentProps: {
        name: ticket.name,
        needsScan: ticket.needsScan
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.name) {
      ticket.name = data.name;
      ticket.needsScan = data.needsScan;
    }
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
    const modal = await this.modalCtrl.create({
      component: AddMealTicketComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.name) {
      this.configurations.mealConfigurations.mealInfo.push(new Meal({
        name: data.name,
        startValidity: new Date().toISOString(),
        endValidity: new Date().toISOString(),
        needsScan: data.needsScan || false
      }));
    }
  }

  reorderMealTickets({ detail }): void {
    this.configurations.mealConfigurations.mealInfo = detail.complete(this.configurations.mealConfigurations.mealInfo);
  }
}
