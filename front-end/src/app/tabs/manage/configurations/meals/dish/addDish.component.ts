// dish-form-modal.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '@app/app.service';
import { IDEAMessageService } from '@idea-ionic/common';
import { ModalController } from '@ionic/angular';
import { Dish } from '@models/dish.model';
import { MealType } from '@models/meals.configurations.model';

@Component({
  selector: 'add-dish-modal',
  templateUrl: './addDish.component.html',
  styleUrls: ['./addDish.component.scss']
})
export class AddDishModalComponent implements OnInit {
  @Input() dish: Dish = null;
  @Input() editMode: boolean = false;
  @Input() mealTypes: MealType[] = [];
  @Input() mealTicketId: string = '';

  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private message: IDEAMessageService,
    protected app: AppService
  ) { }

  ngOnInit() {
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save(): Promise<void> {
    this.errors = new Set(this.dish.validate());

    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');
    this.modalCtrl.dismiss({
      dish: this.dish
    });
  }
}