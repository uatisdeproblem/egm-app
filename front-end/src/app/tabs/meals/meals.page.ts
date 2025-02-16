import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEAApiService, IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';
import { AppService } from '@app/app.service';
import { MealTicket } from '@models/meals.model';
import { MealsService } from './meals.service';
import { Meal } from '@models/meals.configurations.model';


@Component({
  selector: 'meals',
  templateUrl: 'meals.page.html',
  styleUrls: ['meals.page.scss']
})
export class MealsPage implements OnInit {
  meals: MealTicket[];
  ticketInfos: Meal[] = [];

  @ViewChild('swiper') swiperRef: ElementRef | undefined;

  swiperOptions = {
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 20,
    centeredSlides: false,
    pagination: {
      enabled: true,
      clickable: true
    },
    keyboard: {
      enabled: true
    },
    cssMode: false,
    freeMode: true,
  };

  constructor(
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private _meals: MealsService,
    private message: IDEAMessageService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.meals = await this._meals.getMealsByUserId(this.app.user.userId);
    this.ticketInfos = this.app.configurations.mealConfigurations.mealInfo;
  }


  getAvailableTickets(): Meal[] {
    const now = new Date().toISOString();

    return this.ticketInfos.filter(info =>
      now >= info.startValidity &&
      now < info.endValidity &&
      !this.meals?.some(meal => meal.mealTicketId === info.ticketId)
    );
  }

  async generateTicket(ticketId: string): Promise<void> {
    await this._meals.generateTicket(this.app.user.userId, ticketId);
    this.meals = await this._meals.getMealsByUserId(this.app.user.userId, {force: true});
    console.log("MEALS: ", this.meals);
  }

  showTicket(meal: MealTicket): string {
    //let appUrl = this._env.idea.api.stage === 'prod' ? 'https://app.erasmusgeneration.org'
    //                                                 : 'https://dev.egm-app.click';
    return this.app.isLocalhost() ?
      `http://localhost:${8100}/t/meals/${this.app.user.userId}/verify-ticket/${meal.mealTicketId}` :
      `https://dev.egm-app.click/t/meals/${this.app.user.userId}/verify-ticket/${meal.mealTicketId}`;

  }

  goToManageMeals(): void {
    this.app.goToInTabs(['meals', 'manage']);
  }
}
