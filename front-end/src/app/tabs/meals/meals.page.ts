import { Component, OnInit, inject } from '@angular/core';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { MealsService } from './meals.service';

import { ApprovedType, Meal } from '@models/meal.model';

@Component({
  selector: 'app-meals',
  templateUrl: 'meals.page.html',
  styleUrls: ['meals.page.scss']
})
export class MealsPage implements OnInit {
  private _loading = inject(IDEALoadingService);
  private _message = inject(IDEAMessageService);
  private _meals = inject(MealsService);
  _app = inject(AppService);

  currentDevice: MediaDeviceInfo;
  isScanning = false;

  meals: Meal[];
  filteredMeals: Meal[];

  async ngOnInit(): Promise<void> {
    try {
      await this._loading.show();
      this.meals = await this._meals.getList({ force: true });
    } catch (error) {
      this._message.error('COMMON.OPERATION_FAILED');
    } finally {
      this._loading.hide();
    }
  }

  async filter(search = ''): Promise<void> {
    this.meals = await this._meals.getList({ search });
  }

  async onScanSuccess(url: string): Promise<void> {
    if (this.isScanning) return;

    try {
      await this._loading.show();

      this.isScanning = true;
      const urlElements = url.split('/');
      const userId = urlElements.pop();
      const mealId = urlElements.pop();

      const meal = await this._meals.getById(mealId);

      await this._meals.validateTicket(meal, userId, ApprovedType.QR_SCAN);
      this._message.success('COMMON.OPERATION_COMPLETED');
    } catch (err) {
      let error: string;
      if (err.message === 'Unauthorized') error = 'MEALS.VALIDATE_ERRORS.UNAUTHORIZED';
      else if (err.message === 'Ticket not available') error = 'MEALS.VALIDATE_ERRORS.TICKET_UNAVAILABLE';
      else if (err.message === 'Ticket already used') error = 'MEALS.VALIDATE_ERRORS.TICKET_USED';
      else if (err.message === 'Meal not found') error = 'MEALS.VALIDATE_ERRORS.NO_MEAL';
      else if (err.message === 'User not found') error = 'MEALS.VALIDATE_ERRORS.NO_USER';
      else error = 'COMMON.OPERATION_FAILED';

      this._message.error(error);
    } finally {
      await this._app.sleepForNumSeconds(2);
      this.isScanning = false;
      this._loading.hide();
    }
  }
}
