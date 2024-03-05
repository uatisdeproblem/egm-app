import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

import { Organization } from '@models/organization.model';
import { OrganizationsService } from './organizations.service';
import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.page.html',
  styleUrls: ['./organizations.page.scss']
})
export class OrganizationsPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  organizations: Organization[];
  filteredOrganizations: Organization[];

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _organizations: OrganizationsService,
    public app: AppService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      this.organizations = await this._organizations.getList({});
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async filterOrganizations(search = ''): Promise<void> {
    this.organizations = await this._organizations.getList({ search });
  }

  selectOrganization(organization: Organization) {
    this.app.goToInTabs(['organizations', organization.organizationId]);
  }
}