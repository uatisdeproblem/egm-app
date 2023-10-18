import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import {
  IDEAActionSheetController,
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsService
} from '@idea-ionic/common';

import { AddSpotsComponent } from './addSpots.component';

import { AppService } from '@app/app.service';
import { SpotsService } from './spots.service';

import { EventSpot } from '@models/eventSpot.model';

@Component({
  selector: 'event-spots',
  templateUrl: 'spots.page.html',
  styleUrls: ['spots.page.scss']
})
export class SpotsPage implements OnInit {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild('spotsTable') table: DatatableComponent;

  col: TableColumn[];
  selectionType = SelectionType.checkbox;
  trackByProp = 'spotId';
  columnMode = ColumnMode.force;
  limit = 10;

  pageHeaderHeightPx = 56;
  actionBarHeight = 56;
  rowHeight = 42;
  headerHeight = 56;
  footerHeight = 80;

  spots: EventSpot[];
  filteredSpots: EventSpot[];
  filters: RowsFilters = { spot: null, assignedToCountry: null, assignedToUser: null, paid: null };

  numAssignedToCountry = 0;
  numAssignedToUser = 0;
  numPaid = 0;

  constructor(
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private actionsCtrl: IDEAActionSheetController,
    private _spots: SpotsService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.col = [
      { maxWidth: 50, sortable: false, headerCheckboxable: true, checkboxable: true },
      { prop: 'spotId', name: this.t._('SPOTS.SPOT_ID') },
      { prop: 'type', name: this.t._('SPOTS.TYPE') },
      { prop: 'sectionCountry', name: this.t._('SPOTS.ASSIGNED_TO_COUNTRY') },
      { prop: 'userName', name: this.t._('SPOTS.ASSIGNED_TO_USER') },
      { prop: 'proofOfPaymentURI', name: this.t._('SPOTS.PAID'), pipe: { transform: x => (x ? !!x : '') } },
      { prop: 'description', name: this.t._('SPOTS.DESCRIPTION') },
      {
        prop: 'createdAt',
        name: this.t._('SPOTS.CREATED_ON'),
        pipe: { transform: x => this.t.formatDate(x, 'mediumDate') }
      }
    ];
    this.col.forEach(c => (c.resizeable = false));
    this.setTableHeight();

    await this.loadSpots();
  }
  ionViewWillEnter(): void {
    if (!this.app.user.permissions.canManageRegistrations) return this.app.closePage('COMMON.UNAUTHORIZED');
  }
  private async loadSpots(): Promise<void> {
    try {
      await this.loading.show();
      this.spots = await this._spots.getList();
      this.filter();
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    } finally {
      this.loading.hide();
    }
  }

  @HostListener('window:resize', ['$event'])
  setTableHeight(event?: Event): void {
    const currentPageHeight = event?.target ? (event.target as Window).innerHeight : window.innerHeight;
    const heightAvailableInPx =
      currentPageHeight - this.pageHeaderHeightPx - this.actionBarHeight - this.headerHeight - this.footerHeight;
    this.limit = Math.floor(heightAvailableInPx / this.rowHeight);
  }

  rowIdentity(row: EventSpot): string {
    return row.spotId;
  }

  filter(searchText?: string): void {
    searchText = (searchText ?? '').toLowerCase();

    this.filteredSpots = this.spots.slice();

    this.filteredSpots = this.filteredSpots.filter(x =>
      [x.spotId, x.type, x.sectionCountry, x.userName, x.description]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );

    if (this.filters.spot) this.filteredSpots = this.filteredSpots.filter(x => this.filters.spot === x.type);
    if (this.filters.assignedToCountry)
      this.filteredSpots = this.filteredSpots.filter(x => this.filters.assignedToCountry === x.sectionCountry);
    if (this.filters.assignedToUser)
      this.filteredSpots = this.filteredSpots.filter(x =>
        this.filters.assignedToUser === 'yes' ? !!x.userId : !x.userId
      );
    if (this.filters.paid)
      this.filteredSpots = this.filteredSpots.filter(x =>
        this.filters.assignedToUser === 'yes' ? !!x.proofOfPaymentURI : !x.proofOfPaymentURI
      );

    this.calcFooterTotals();

    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async actionsOnSelectedRows(): Promise<void> {
    if (!this.table.selected.length) return;

    const header = this.t._('SPOTS.ACTIONS_ON_NUM_ROWS', { num: this.table.selected.length });
    const buttons = [];
    // @todo
    buttons.push({ text: this.t._('COMMON.CANCEL'), role: 'cancel', icon: 'arrow-undo' });

    const actions = await this.actionsCtrl.create({ header, buttons });
    actions.present();
  }

  async manageSpot(spot: EventSpot): Promise<void> {
    // @todo
  }
  async addSpots(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: AddSpotsComponent });
    modal.onDidDismiss().then(({ data: newSpots }): void => {
      if (newSpots) {
        this.spots.unshift(...newSpots);
        this.filter();
      }
    });
    await modal.present();
  }

  calcFooterTotals(): void {
    this.numAssignedToCountry = 0;
    this.numAssignedToUser = 0;
    this.numPaid = 0;
    this.filteredSpots.forEach(user => {
      if (!!user.sectionCountry) this.numAssignedToCountry++;
      if (!!user.userId) this.numAssignedToUser++;
      if (!!user.proofOfPaymentURI) this.numPaid++;
    });
  }
}

interface RowsFilters {
  spot: null | string;
  assignedToCountry: null | string;
  assignedToUser: null | 'yes' | 'no';
  paid: null | 'yes' | 'no';
}
