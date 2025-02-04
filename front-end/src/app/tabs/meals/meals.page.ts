import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEAApiService, IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';
import { AppService } from '@app/app.service';
import { MealTicket } from '@models/meals.model';
import { MealsService } from './meals.service';


@Component({
  selector: 'meals',
  templateUrl: 'meals.page.html',
  styleUrls: ['meals.page.scss']
})
export class MealsPage implements OnInit {
  meals: MealTicket[];
  editMode: boolean;

  constructor(
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private _meals: MealsService,
    private message: IDEAMessageService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.meals = await this._meals.getList(this.app.user.userId, { force: true });
    this.editMode = false;
  }

  async generateTicket(): Promise<void> {
    this._meals.generateTicket(this.app.user.userId);
    this.meals = await this._meals.getList(this.app.user.userId, {force: true});
  }

  showTicket(): string {
    //let appUrl = this._env.idea.api.stage === 'prod' ? 'https://app.erasmusgeneration.org'
    //                                                 : 'https://dev.egm-app.click';
    return this.app.isLocalhost() ? `http://localhost:${8100}/t/meals/verify-ticket/${this.app.user.userId}`
                                  : `https://dev.egm-app.click/t/meals/verify-ticket/${this.app.user.userId}`;

  }
}
