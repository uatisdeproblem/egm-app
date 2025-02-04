import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';
import { AppService } from '@app/app.service';
import { MealTicket } from '@models/meals.model';
import { MealsService } from '../meals.service';
import { Configurations } from '@models/configurations.model';

@Component({
  selector: 'meals-manage',
  templateUrl: 'meals.manage.page.html',
  styleUrls: ['meals.manage.page.scss']
})
export class MealsManagePage implements OnInit {
  configurations: Configurations;
  configurationsBeforeChange: Configurations;
  editMode: boolean;
  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private _meals: MealsService,
    private message: IDEAMessageService,
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
    /**
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
    */
  }
}
