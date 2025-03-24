import { Component, ViewChild } from '@angular/core';

import { AppService } from '@app/app.service';
import { IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent {
  @ViewChild('mobileTabs', { static: false }) tabs: IonTabs;
  selectedTab: string;

  constructor(public app: AppService) {}

  setCurrentTab(): void {
    this.selectedTab = this.tabs.getSelected();
  }

  getTabIcon(tab: string, icon: string): string {
    return tab === this.selectedTab ? icon : `${icon}-outline`;
  }
}
