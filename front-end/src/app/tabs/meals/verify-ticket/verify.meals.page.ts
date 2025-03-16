import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MealsService } from '../meals.service';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '@app/app.service';
import { MealTicket } from '@models/meals.model';

@Component({
  selector: 'app-verify-ticket',
  templateUrl: './verify.meals.page.html',
  styleUrls: ['./verify.meals.page.scss']
})
export class VerifyMealPage implements OnInit {
  userId: string;
  ticketId: string;
  ticket: MealTicket;
  loading: boolean = false;
  verificationData: any = null;
  error: any = null;

  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private _meals: MealsService,
    protected app: AppService
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.ticketId = this.route.snapshot.paramMap.get('mealTicketId');
    this.verifyTicket();
  }

  async verifyTicket() {
    this.loading = true;
    try {
      await this._meals.scanTicket(this.userId, this.ticketId);
      this.ticket = (await this._meals.getMealsByUserId(this.userId))
                                      .find(ticket => ticket.mealTicketId == this.ticketId);
    } catch (err) {
      this.error = err;
    } finally {
      this.loading = false;
    }
  }

  getMealColor(type: string): string {
    const mealType = this.app.configurations.mealConfigurations.mealTypes.find(m => m.name == type);
    return mealType?.color ?? 'primary';
  }

  async closeModal() {
    await this.modalCtrl.dismiss();
    this.app.goToInTabs(['meals', 'manage']);
  }

}
