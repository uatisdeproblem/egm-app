import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Dish } from '@models/dish.model';
import { AddDishModalComponent } from './addDish.component';
import { AppService } from '@app/app.service';

@Component({
  selector: 'dish-list-modal',
  templateUrl: './dishList.component.html',
  styleUrls: ['./dishList.component.scss']
})
export class DishListModalComponent implements OnInit {
  @Input() dishes: Dish[] = [];
  @Input() mealName: string = '';
  @Input() mealTicketId: string = '';
  @Input() editMode: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private app: AppService
  ) { }

  ngOnInit() {
    this.dishes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async removeDish(dish: Dish) {
    if (!this.editMode) return;
    this.dishes.splice(this.dishes.indexOf(dish), 1);
  }

  reorderDishes({ detail }): void {
    this.dishes = detail.complete(this.dishes);
  }

  async editDish(dish: Dish) {
    if (!this.editMode) return;

    const modal = await this.modalCtrl.create({
      component: AddDishModalComponent,
      componentProps: {
        dish: dish,
        mealTypes: this.app.configurations.mealConfigurations.mealTypes,
        editMode: true
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.dish) {
      const index = this.dishes.findIndex(d =>
        d.name === dish.name && d.mealType === dish.mealType);

      if (index >= 0) {
        this.dishes[index] = data.dish;

        this.modalCtrl.dismiss({
          updated: true,
          dishes: this.dishes
        });
      }
    }
  }

  async addNewDish() {
    if (!this.editMode) return;
    if (this.app.configurations.mealConfigurations.mealTypes.length === 0) return ;

    const defaultMealType = this.app.configurations.mealConfigurations.mealTypes[0].name;

    const modal = await this.modalCtrl.create({
      component: AddDishModalComponent,
      componentProps: {
        dish: new Dish({
          mealType: defaultMealType,
          mealTicketId: this.mealTicketId
        }),
        mealTypes: this.app.configurations.mealConfigurations.mealTypes,
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.dish) {
      data.dish.mealTicketId = this.mealTicketId;
      this.dishes.push(data.dish);
      this.dishes.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}