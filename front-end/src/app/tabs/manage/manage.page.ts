import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { EmailTemplateComponent } from './configurations/emailTemplate/emailTemplate.component';
import { ManageUsefulLinkStandaloneComponent } from '@app/common/usefulLinks/manageUsefulLink.component';
import { ManageOrganizationComponent } from '../organizations/manageOrganization.component';
import { ManageSpeakerComponent } from '../speakers/manageSpeaker.component';
import { ManageVenueComponent } from '../venues/manageVenue.component';
import { ManageRoomComponent } from '../rooms/manageRooms.component';
import { ManageSessionComponent } from '../sessions/manageSession.component';
import { ManageContestComponent } from '../contests/manageContest.component';

import { AppService } from '@app/app.service';
import { UsefulLinksService } from '@app/common/usefulLinks/usefulLinks.service';
import { SessionRegistrationsService } from '../sessionRegistrations/sessionRegistrations.service';

import { EmailTemplates, DocumentTemplates } from '@models/configurations.model';
import { UsefulLink } from '@models/usefulLink.model';
import { Organization } from '@models/organization.model';
import { Venue } from '@models/venue.model';
import { Speaker } from '@models/speaker.model';
import { Room } from '@models/room.model';
import { Session } from '@models/session.model';
import { Contest } from '@models/contest.model';
import { ManageMealComponent } from '../meals/manageMeal.component';
import { Meal } from '@models/meal.model';

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
    private t: IDEATranslationsService,
    private _usefulLinks: UsefulLinksService,
    private _sessionRegistrations: SessionRegistrationsService,
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

  async addOrganization(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageOrganizationComponent,
      componentProps: { organization: new Organization() },
      backdropDismiss: false
    });
    await modal.present();
  }
  async addSpeaker(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageSpeakerComponent,
      componentProps: { speaker: new Speaker() },
      backdropDismiss: false
    });
    await modal.present();
  }
  async addVenue(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageVenueComponent,
      componentProps: { venue: new Venue() },
      backdropDismiss: false
    });
    await modal.present();
  }
  async addRoom(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageRoomComponent,
      componentProps: { room: new Room() },
      backdropDismiss: false
    });
    await modal.present();
  }
  async addSession(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageSessionComponent,
      componentProps: { session: new Session() },
      backdropDismiss: false
    });
    await modal.present();
  }
  async downloadSessionsRegistrations(event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    try {
      await this.loading.show();
      await this._sessionRegistrations.downloadSpreadsheet(this.t._('SESSIONS.SESSION_REGISTRATIONS'));
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  async addContest(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageContestComponent,
      componentProps: { contest: new Contest() },
      backdropDismiss: false
    });
    await modal.present();
  }
  async addMeal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ManageMealComponent,
      componentProps: { meal: new Meal() },
      backdropDismiss: false
    });
    await modal.present();
  }
}
