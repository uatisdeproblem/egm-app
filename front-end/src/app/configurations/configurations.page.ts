import { Component } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { EmailTemplateComponent } from './emailTemplate/emailTemplate.component';
import { DocumentTemplateComponent } from './documentTemplate/documentTemplate.component';

import { AppService } from '@app/app.service';

import { EmailTemplates, DocumentTemplates } from '@models/configurations.model';

@Component({
  selector: 'configurations',
  templateUrl: 'configurations.page.html',
  styleUrls: ['configurations.page.scss']
})
export class ConfigurationsPage {
  EmailTemplates = EmailTemplates;
  DocumentTemplates = DocumentTemplates;

  constructor(private modalCtrl: ModalController, public app: AppService) {}
  ionViewWillEnter(): void {
    if (!this.userCanManageSomething()) this.app.closePage('COMMON.UNAUTHORIZED');
  }

  userCanManageSomething(): boolean {
    return Object.values(this.app.user.permissions).some(x => x === true);
  }

  async openTemplateEmailModal(template: EmailTemplates): Promise<void> {
    const componentProps = { template };
    const modal = await this.modalCtrl.create({ component: EmailTemplateComponent, componentProps });
    await modal.present();
  }

  async openTemplateDocumentModal(template: DocumentTemplates): Promise<void> {
    const componentProps = { template };
    const modal = await this.modalCtrl.create({ component: DocumentTemplateComponent, componentProps });
    await modal.present();
  }
}
