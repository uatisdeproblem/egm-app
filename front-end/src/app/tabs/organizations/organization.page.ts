import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from 'src/app/app.service';
import { OrganizationsService } from './organizations.service';
import { SpeakersService } from '../speakers/speakers.service';

import { Speaker } from '@models/speaker.model';
import { Organization } from '@models/organization.model';
import { ModalController } from '@ionic/angular';
import { ManageOrganizationComponent } from './manageOrganization.component';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.page.html',
  styleUrls: ['./organization.page.scss']
})
export class OrganizationPage implements OnInit {
  organization: Organization;
  speakers: Speaker[];

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _organizations: OrganizationsService,
    private _speakers: SpeakersService,
    public app: AppService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const organizationId = this.route.snapshot.paramMap.get('organizationId');
      this.organization = await this._organizations.getById(organizationId);
      this.speakers = await this._speakers.getList({ organization: this.organization.organizationId, force: true });
    } catch (err) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      await this.loading.hide();
    }
  }

  async filterSpeakers(search: string = ''): Promise<void> {
    this.speakers = await this._speakers.getList({ search, organization: this.organization.organizationId });
  }

  async manageOrganization(organization: Organization): Promise<void> {
    if (!this.app.user.permissions.canManageContents) return

    const modal = await this.modalCtrl.create({
      component: ManageOrganizationComponent,
      componentProps: { organization },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.organization = await this._organizations.getById(organization.organizationId);
    });
    await modal.present();
  }
}
