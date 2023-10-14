import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

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
  selectionType = SelectionType.single;
  trackByProp = 'requestId';
  columnMode = ColumnMode.force;
  limit = 10;

  rowHeight = 45;
  headerHeight = 50;
  footerHeight = 80;

  spots: EventSpot[];
  filteredSpots: EventSpot[];

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private _spots: SpotsService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.col = [
      { prop: 'spotId', name: this.t._('EVENT_REGISTRATIONS.SPOT_ID') },
      { prop: 'type', name: this.t._('EVENT_REGISTRATIONS.SPOT_TYPE') },
      { prop: 'sectionCountry', name: this.t._('EVENT_REGISTRATIONS.ASSIGNED_TO_COUNTRY') },
      { prop: 'userName', name: this.t._('EVENT_REGISTRATIONS.ASSIGNED_TO_USER') }
    ];
    this.col.forEach(c => (c.resizeable = false));
    this.setTableHeight();

    try {
      await this.loading.show();
      this.spots = await this._spots.getList();
      this.updateFilter();
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    } finally {
      this.loading.hide();
    }
  }

  @HostListener('window:resize', ['$event'])
  setTableHeight(event?: Event): void {
    const currentPageHeight = event?.target ? (event.target as Window).innerHeight : window.innerHeight;
    const heightAvailableInPx = currentPageHeight - this.headerHeight - this.footerHeight;
    this.limit = Math.floor(heightAvailableInPx / this.rowHeight);
  }

  rowIdentity(row: EventSpot): string {
    return row.spotId;
  }

  updateFilter(searchText?: string): void {
    searchText = (searchText ?? '').toLowerCase();

    this.filteredSpots = this.spots.filter(x =>
      [x.spotId, x.type, x.sectionCountry, x.userName]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );

    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
}
