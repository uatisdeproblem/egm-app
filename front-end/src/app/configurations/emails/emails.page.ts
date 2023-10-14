import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { EmailTemplateComponent } from './emailTemplate/emailTemplate.component';

import { AppService } from '@app/app.service';

import { EmailTemplates } from '@models/configuration.model';

@Component({
  selector: 'event-emails',
  templateUrl: 'emails.page.html',
  styleUrls: ['emails.page.scss']
})
export class EmailsPage {
  EmailTemplates = EmailTemplates;

  constructor(private modalCtrl: ModalController, public app: AppService) {}

  async openTemplateEmailModal(template: EmailTemplates): Promise<void> {
    const componentProps = { template };
    const modal = await this.modalCtrl.create({ component: EmailTemplateComponent, componentProps });
    await modal.present();
  }
}
