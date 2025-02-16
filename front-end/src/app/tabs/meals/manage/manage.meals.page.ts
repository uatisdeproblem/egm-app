import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';
import { AppService } from '@app/app.service';
import { MealTicket } from '@models/meals.model';
import { MealsService } from '../meals.service';
import { Meal } from '@models/meals.configurations.model';

@Component({
  selector: 'manage-meals',
  templateUrl: 'manage.meals.page.html',
  styleUrls: ['manage.meals.page.scss']
})
export class ManageMealsPage implements OnInit {
  ticketInfos: Meal[] = [];

  constructor(
    public app: AppService
  ) {}

  async ngOnInit(): Promise<void> {
    this.ticketInfos = this.app.configurations.mealConfigurations.mealInfo;
  }

  goToTicketList(ticketId: string): void {
    this.app.goToInTabs(['meals', 'manage', ticketId]);
  }

  isOpenNow(ticket: Meal): boolean {
    const now = new Date().toISOString();

    return now >= ticket.startValidity && now < ticket.endValidity;
  }
}
