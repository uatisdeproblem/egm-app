import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IDEALoadingService, IDEAMessageService, IDEATranslatePipe } from '@idea-ionic/common';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { Organization } from '@models/organization.model';
import { OrganizationsService } from './organizations.service';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-organizations',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSkeletonText,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './organizations.page.html',
  styleUrls: ['./organizations.page.scss']
})
export class OrganizationsPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  organizations: Organization[];
  filteredOrganizations: Organization[];

  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _organizations = inject(OrganizationsService);
  public app = inject(AppService);

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