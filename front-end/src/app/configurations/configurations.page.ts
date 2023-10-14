import { Component } from '@angular/core';

import { AppService } from '@app/app.service';

@Component({
  selector: 'configurations',
  templateUrl: 'configurations.page.html',
  styleUrls: ['configurations.page.scss']
})
export class ConfigurationsPage {
  constructor(public app: AppService) {}
  ionViewWillEnter(): void {
    if (!this.userCanManageSomething()) this.app.closePage('COMMON.UNAUTHORIZED');
  }

  userCanManageSomething(): boolean {
    return Object.values(this.app.user.permissions).some(x => x === true);
  }
}
