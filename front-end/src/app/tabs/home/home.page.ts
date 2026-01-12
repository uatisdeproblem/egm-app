import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonListHeader, IonRow, IonSegment, IonSegmentButton, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { IDEALoadingService, IDEAMessageService, IDEATranslatePipe } from '@idea-ionic/common';

import { ManageUsefulLinkStandaloneComponent } from 'src/app/common/usefulLinks/manageUsefulLink.component';
import { ManageCommunicationComponent } from './communications/manageCommunication.component';
import { CommunicationDetailComponent } from './communications/communicationDetail.component';

import { AppService } from '@app/app.service';
import { CommunicationsService } from './communications/communications.service';
import { UsefulLinksService } from 'src/app/common/usefulLinks/usefulLinks.service';

import { Communication } from '@models/communication.model';
import { UsefulLink } from '@models/usefulLink.model';
import { UsefulLinkStandaloneComponent } from '@app/common/usefulLinks/usefulLink.component';
import { CommunicationComponent } from './communications/communication.component';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UsefulLinkStandaloneComponent,
    CommunicationComponent,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    IDEATranslatePipe
  ]
})
export class HomePage implements OnInit {
  communications: Communication[];
  usefulLinks: UsefulLink[];

  segment = MobileSegments.NEWS;
  MobileSegments = MobileSegments;

  editMode = false;

  private modalCtrl = inject(ModalController);
  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _communications = inject(CommunicationsService);
  private _usefulLinks = inject(UsefulLinksService);
  app = inject(AppService);

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
