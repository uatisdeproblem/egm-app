import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IDEALoadingService, IDEAMessageService, IDEATranslatePipe } from '@idea-ionic/common';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';

import { ManageOrganizationComponent } from './manageOrganization.component';
import { OrganizationCardStandaloneComponent } from './organizationCard.component';
import { SpeakerCardStandaloneComponent } from '../speakers/speakerCard.component';

import { AppService } from 'src/app/app.service';
import { OrganizationsService } from './organizations.service';
import { SpeakersService } from '../speakers/speakers.service';

import { Speaker } from '@models/speaker.model';
import { Organization } from '@models/organization.model';

@Component({
  selector: 'app-organization',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    // App
    OrganizationCardStandaloneComponent,
    SpeakerCardStandaloneComponent,
    // Ionic
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRow,
    IonSearchbar,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './organization.page.html',
  styleUrls: ['./organization.page.scss']
})
export class OrganizationPage implements OnInit {
  organization: Organization;
  speakers: Speaker[];

  private route = inject(ActivatedRoute);
  private modalCtrl = inject(ModalController);
  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _organizations = inject(OrganizationsService);
  private _speakers = inject(SpeakersService);
  public app = inject(AppService);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const organizationId = this.route.snapshot.paramMap.get('organizationId');
      this.organization = await this._organizations.getById(organizationId);
      this.speakers = await this._speakers.getOrganizationSpeakers(this.organization.organizationId);
    } catch (err) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      await this.loading.hide();
    }
  }

  async filterSpeakers(search: string = ''): Promise<void> {
    this.speakers = await this._speakers.getOrganizationSpeakers(this.organization.organizationId, search);
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
