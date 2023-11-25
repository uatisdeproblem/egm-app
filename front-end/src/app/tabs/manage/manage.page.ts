import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { EmailTemplateComponent } from './configurations/emailTemplate/emailTemplate.component';
import { DocumentTemplateComponent } from './configurations/documentTemplate/documentTemplate.component';
import { ManageUsefulLinkStandaloneComponent } from '@app/common/usefulLinks/manageUsefulLink.component';

import { AppService } from '@app/app.service';
import { UsefulLinksService } from '@app/common/usefulLinks/usefulLinks.service';

import { EmailTemplates, DocumentTemplates } from '@models/configurations.model';
import { UsefulLink } from '@models/usefulLink.model';

@Component({
  selector: 'manage',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage {
  EmailTemplates = EmailTemplates;
  DocumentTemplates = DocumentTemplates;

  usefulLinks: UsefulLink[];

  constructor(
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _usefulLinks: UsefulLinksService,
    public app: AppService
  ) {}
  async ionViewWillEnter(): Promise<void> {
    if (!this.app.userCanManageSomething()) this.app.closePage('COMMON.UNAUTHORIZED');

    this.usefulLinks = await this._usefulLinks.getList();
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

  //
  // USEFUL LINKS
  //

  async swapSortUsefulLinks(usefulLinkA: UsefulLink, usefulLinkB: UsefulLink, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    try {
      await this.loading.show();
      await this._usefulLinks.swapSort(usefulLinkA, usefulLinkB);
      this.usefulLinks = await this._usefulLinks.getList();
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  async editUsefulLink(usefulLink: UsefulLink): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageUsefulLinkStandaloneComponent,
      componentProps: { link: usefulLink },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.usefulLinks = await this._usefulLinks.getList({ force: true });
    });
    await modal.present();
  }
  async addUsefulLink(): Promise<void> {
    await this.editUsefulLink(new UsefulLink());
  }
}
