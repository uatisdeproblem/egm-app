import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSearchbar, ModalController } from '@ionic/angular';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import { WorkBook, utils, writeFile } from 'xlsx';
import { Suggestion } from 'idea-toolbox';
import {
  IDEAActionSheetController,
  IDEALoadingService,
  IDEAMessageService,
  IDEASuggestionsComponent,
  IDEATranslationsService
} from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { MealsService } from '../../meals.service';
import { ApprovedType, MealTicket } from '@models/meals.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'meals-list',
  templateUrl: 'meals.list.page.html',
  styleUrls: ['meals.list.page.scss']
})
export class MealsListPage implements OnInit {
  ticketId: string;
  readonly ApprovedType = ApprovedType;

  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild('mealsTable') mealsTable: DatatableComponent;

  col: TableColumn[];
  selectionType = SelectionType.single;
  trackByProp = 'userId';
  columnMode = ColumnMode.force;
  limit = 20;

  pageHeaderHeightPx = 56;
  actionBarHeight = 56;
  rowHeight = 42;
  headerHeight = 56;
  footerHeight = 80;

  meals: MealTicket[];
  filteredMeals: MealTicket[];
  filters: RowsFilters = {
    type: null,
    approvedType: null,
    used: null,
    sectionCountry: null
  };

  numMeals = 0;
  numUsedTickets = 0;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private actionsCtrl: IDEAActionSheetController,
    private route: ActivatedRoute,
    private _meals: MealsService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.ticketId = this.route.snapshot.paramMap.get('mealTicketId');

    this.col = [
      { prop: 'userName', name: this.t._('USER.NAME') },
      { prop: 'userCountry', name: this.t._('USER.ESN_COUNTRY') },
      { prop: 'approvedAt', name: this.t._('MEALS.APPROVED_AT'), pipe: { transform: x => this.t.formatDate(x) } },
      { prop: 'approvedBy', name: this.t._('MEALS.APPROVED_BY')},
      { prop: 'approvedType', name: this.t._('MEALS.APPROVED_TYPE')},
      { prop: 'type', name: this.t._('MEALS.TYPE') },
    ];
    this.col.forEach(c => (c.resizeable = false));
    this.setTableHeight();

    try {
      await this.loading.show();
      this.meals = await this._meals.getMealsByMealId(this.app.user.userId, this.ticketId);
      this.filter(this.searchbar?.value);
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    } finally {
      this.loading.hide();
    }
  }
  ionViewWillEnter(): void {
    if (!(this.app.user.canManageMeals()))
      return this.app.closePage('COMMON.UNAUTHORIZED');
  }

  @HostListener('window:resize', ['$event'])
  setTableHeight(event?: Event): void {
    const currentPageHeight = event?.target ? (event.target as Window).innerHeight : window.innerHeight;
    const heightAvailableInPx =
      currentPageHeight - this.pageHeaderHeightPx - this.actionBarHeight - this.headerHeight - this.footerHeight;
    this.limit = Math.floor(heightAvailableInPx / this.rowHeight);
  }

  rowIdentity(row: MealTicket): string {
    return row.userId;
  }

  filter(searchText?: string): void {
    searchText = (searchText ?? '').toLowerCase();

    this.filteredMeals= this.meals.slice();

    this.filteredMeals = this.filteredMeals.filter(x =>
      [x.userId, x.userName, x.userCountry]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );
    if (this.filters.approvedType)
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.approvedType === 'no' ? !x.approvedAt: x.approvedAt && this.filters.approvedType === x.approvedAt
      );
    if (this.filters.type)
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.type === 'no' ? !x.type : x.type && this.filters.type === x.type
      );

    if (this.filters.used)
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.used === 'yes' ? x.status : !x.status
      );
    if (this.filters.sectionCountry)
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.sectionCountry === 'no' ? !x.userCountry : this.filters.sectionCountry === x.userCountry
      );

    this.calcFooterTotals();

    // whenever the filter changes, always go back to the first page
    this.mealsTable.offset = 0;
  }

  calcFooterTotals(): void {
    this.numMeals = 0;
    this.numUsedTickets = 0;
    this.filteredMeals.forEach(meal => {
      if (meal.status) this.numUsedTickets++;
      this.numMeals++;
    });
  }

}

interface RowsFilters {
  type: string | 'no' | null;
  approvedType: string | 'no' | null;
  used: null | 'yes' | 'no';
  sectionCountry: string | 'no' | null;
}
