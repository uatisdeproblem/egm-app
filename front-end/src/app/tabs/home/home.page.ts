import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { ManageUsefulLinkStandaloneComponent } from 'src/app/common/usefulLinks/manageUsefulLink.component';
import { ManageCommunicationComponent } from './communications/manageCommunication.component';
import { CommunicationDetailComponent } from './communications/communicationDetail.component';

import { AppService } from '@app/app.service';
import { CommunicationsService } from './communications/communications.service';
import { UsefulLinksService } from 'src/app/common/usefulLinks/usefulLinks.service';

import { Communication } from '@models/communication.model';
import { UsefulLink } from '@models/usefulLink.model';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  communications: Communication[];
  usefulLinks: UsefulLink[];

  segment = MobileSegments.NEWS;
  MobileSegments = MobileSegments;

  editMode = false;

  constructor(
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _communications: CommunicationsService,
    private _usefulLinks: UsefulLinksService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    [this.communications, this.usefulLinks] = await Promise.all([
      this._communications.getList({ force: true }),
      this._usefulLinks.getList()
    ]);
  }

  //
  // COMMUNICATIONS
  //

  async openCommunication(communication: Communication): Promise<void> {
    if (this.editMode) return;
    const modal = await this.modalCtrl.create({
      component: CommunicationDetailComponent,
      componentProps: { communication }
    });
    modal.present();

    // request the communication so that it counts in the statistics (even if we don't need it)
    try {
      await this._communications.getById(communication.communicationId);
    } catch (error) {
      // no problem
    }
  }
  async manageCommunication(communication: Communication): Promise<void> {
    if (!this.editMode) return;
    const modal = await this.modalCtrl.create({
      component: ManageCommunicationComponent,
      componentProps: { communication },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.communications = await this._communications.getList({ force: true });
    });
    await modal.present();
  }
  async addCommunication(): Promise<void> {
    await this.manageCommunication(new Communication());
  }

  //
  // USEFUL LINKS
  //

  async openUsefulLink(usefulLink: UsefulLink): Promise<void> {
    if (this.editMode) return;

    this.app.openURL(usefulLink.url);

    // request the link so that it counts in the statistics (even if we don't need it)
    try {
      await this._usefulLinks.getById(usefulLink.linkId);
    } catch (error) {
      // no problem
    }
  }
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

enum MobileSegments {
  NEWS = 'NEWS',
  LINKS = 'LINKS'
}
