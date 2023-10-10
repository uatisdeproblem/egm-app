import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Suggestion } from 'idea-toolbox';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';

@Component({
  selector: 'manage',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage {
  constructor(public app: AppService) {}
  async ionViewWillEnter(): Promise<void> {
    // @todo add auth check -> only people who have permission can enter!
    // this.message.error('COMMON.UNAUTHORIZED');
    //     this.app.closePage();
  }

  goToManageUsersPage(): void {
    this.app.goTo(['manage', 'users']);
  }
  goToManageRegistrationsPage(): void {
    this.app.goTo(['manage', 'registrations']);
  }
}
