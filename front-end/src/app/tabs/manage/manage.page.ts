import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { EmailTemplateComponent } from './configurations/emailTemplate/emailTemplate.component';
import { DocumentTemplateComponent } from './configurations/documentTemplate/documentTemplate.component';

import { AppService } from '@app/app.service';

import { EmailTemplates, DocumentTemplates } from '@models/configurations.model';

@Component({
  selector: 'manage',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage {
  EmailTemplates = EmailTemplates;
  DocumentTemplates = DocumentTemplates;

  constructor(private modalCtrl: ModalController, public app: AppService) {}
  ionViewWillEnter(): void {
    if (!this.app.userCanManageSomething()) this.app.closePage('COMMON.UNAUTHORIZED');
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
