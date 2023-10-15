import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { EmailTemplateComponent } from './emailTemplate/emailTemplate.component';

import { AppService } from '@app/app.service';

import { EmailTemplates } from '@models/configurations.model';

@Component({
  selector: 'emails-configurations',
  templateUrl: 'emailsConfig.page.html',
  styleUrls: ['emailsConfig.page.scss']
})
export class EmailsConfigurationsPage {
  EmailTemplates = EmailTemplates;

  constructor(private modalCtrl: ModalController, public app: AppService) {}

  async openTemplateEmailModal(template: EmailTemplates): Promise<void> {
    const componentProps = { template };
    const modal = await this.modalCtrl.create({ component: EmailTemplateComponent, componentProps });
    await modal.present();
  }
}
