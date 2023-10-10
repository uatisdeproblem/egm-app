import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService } from '../app.service';

import { environment as env } from '@env';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent {
  tabs: TabInterface[] = [
    { id: 'home', icon: 'home-outline', titleKey: 'TABS.HOME' },
    { id: 'profile', icon: 'person-outline', titleKey: 'TABS.PROFILE' },
    { id: 'manage', icon: 'settings-outline', titleKey: 'TABS.MANAGE_SHOP', restricted: true }
  ];

  constructor(private route: ActivatedRoute, public app: AppService) {}

  shouldShowTabsBasedOnUrl(url: string): boolean {
    return this.tabs.some(tab => url === `/event/${tab.id}`);
  }

  canUserSeeTabButton(tab: TabInterface): boolean {
    return !tab.restricted || this.app.user.isAdmin(); // @todo check auth
  }

  isDevEnvironment(): boolean {
    return env.idea.api.stage === 'dev';
  }
}

interface TabInterface {
  id: string;
  icon: string;
  titleKey: string;
  restricted?: boolean;
  canDisplayNotification?: boolean;
}
