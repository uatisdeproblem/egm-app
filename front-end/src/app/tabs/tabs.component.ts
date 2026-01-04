import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { IDEATranslatePipe } from '@idea-ionic/common';
import { IonIcon, IonImg, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

import { AppService } from '@app/app.service';

@Component({
  selector: 'app-tabs',
  imports: [
    // Angular
    CommonModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonIcon,
    IonImg,
    IonLabel,
    IonTabBar,
    IonTabButton,
    IonTabs
  ],
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent {
  public readonly app = inject(AppService);

  @ViewChild('mobileTabs', { static: false }) tabs: IonTabs;
  selectedTab = '';

  setCurrentTab(): void {
    this.selectedTab = this.tabs.getSelected();
  }

  getTabIcon(tab: string, icon: string): string {
    return tab === this.selectedTab ? icon : `${icon}-outline`;
  }
}
