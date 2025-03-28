import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSearchbar, ModalController } from '@ionic/angular';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import {
  IDEAActionSheetController,
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsService
} from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '../users/users.service';

import { User } from '@models/user.model';
import { ApprovedType, Meal, MealTypes } from '@models/meal.model';
import { MealsService } from '@app/tabs/meals/meals.service';

@Component({
  selector: 'mealsInfo',
  templateUrl: 'mealsInfo.page.html',
  styleUrls: ['mealsInfo.page.scss']
})
export class MealsInfoPage implements OnInit {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild('usersTable') table: DatatableComponent;

  col: TableColumn[];
  selectionType = SelectionType.single;
  trackByProp = 'userId';
  columnMode = ColumnMode.force;
  limit = 10;

  pageHeaderHeightPx = 56;
  actionBarHeight = 56;
  rowHeight = 42;
  headerHeight = 56;
  footerHeight = 80;

  meals: Meal[];
  filteredMeals: Meal[];
  users: User[];
  filteredUsers: User[];
  filters: RowsFilters = {
    sectionCountry: null
  };

  mealCounters: { [mealId: string]: number } = {};

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private actionsCtrl: IDEAActionSheetController,
    private _users: UsersService,
    private _meals: MealsService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      await this.loading.show();
      this.meals = await this._meals.getList({ force: true });
      this.filteredMeals = this.meals.slice();
      this.users = await this._users.getList();

      this.generateCols();

      this.filter(this.searchbar?.value);
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    } finally {
      this.loading.hide();
    }
  }
  generateCols(): void {
    this.col = [
      { prop: 'firstName', name: this.t._('USER.FIRST_NAME') },
      { prop: 'lastName', name: this.t._('USER.LAST_NAME') },
      { prop: 'sectionCountry', name: this.t._('USER.ESN_COUNTRY') },
      { prop: 'sectionName', name: this.t._('USER.ESN_SECTION') },
      { prop: 'mealType',
        name: this.t._('MEALS.TYPE'),
        pipe: { transform: x => this.t._('MEALS.TYPES.' + MealTypes[x]) }
      }
    ];

    for (const meal of this.filteredMeals) {
      this.col.push({
        prop: `mealTickets.${meal.mealId}`,
        name: meal.name,
        pipe: { transform: x => (x.approvedAt ? '✅' : '❌') }
      });
    }
    this.col.forEach(c => (c.resizeable = false));
    this.setTableHeight();
  }
  ionViewWillEnter(): void {
    if (!(this.app.user.permissions.canManageRegistrations || this.app.user.permissions.isCountryLeader))
      return this.app.closePage('COMMON.UNAUTHORIZED');
  }

  @HostListener('window:resize', ['$event'])
  setTableHeight(event?: Event): void {
    const currentPageHeight = event?.target ? (event.target as Window).innerHeight : window.innerHeight;
    const heightAvailableInPx =
      currentPageHeight - this.pageHeaderHeightPx - this.actionBarHeight - this.headerHeight - this.footerHeight;
    this.limit = Math.floor(heightAvailableInPx / this.rowHeight);
  }

  rowIdentity(row: User): string {
    return row.userId;
  }

  filter(searchText?: string): void {
    searchText = (searchText ?? '').toLowerCase();

    this.filteredUsers = this.users.slice();

    this.filteredUsers = this.filteredUsers.filter(x =>
      [x.userId, x.firstName, x.lastName, x.email, x.sectionCountry, x.sectionName]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );
    this.filteredUsers = this.filteredUsers.filter(x => x.spot);

    if (this.filters.sectionCountry)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.sectionCountry === 'no' ? !x.sectionCountry : this.filters.sectionCountry === x.sectionCountry
      );

    this.calcFooterTotals();

    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async actionsOnSelectedUser(user: User): Promise<void> {
    if (!user) return;

    const header = this.t._('USERS.ACTIONS_ON_USER', { user: user.getName() });
    const buttons = [];

    for (const meal of this.filteredMeals) {
      buttons.push({
        text: `${this.t._('COMMON.APPROVE')} ${meal.name}`,
        icon: 'ticket',
        handler: async (): Promise<void> => {
          try {
            this.loading.show();
            await this._meals.validateTicket(meal, user.userId, ApprovedType.MANUAL);
            user.mealTickets[meal.mealId] = {
              approvedAt: new Date().toISOString(),
              approvedBy: this.app.user.getName(),
              approvedType: ApprovedType.MANUAL
            };
            this.generateCols();
          } catch (err) {
            let error: string;
            if (err.message === 'Unauthorized') error = 'MEALS.VALIDATE_ERRORS.UNAUTHORIZED';
            else if (err.message === 'Ticket not available') error = 'MEALS.VALIDATE_ERRORS.TICKET_UNAVAILABLE';
            else if (err.message === 'Ticket already used') error = 'MEALS.VALIDATE_ERRORS.TICKET_USED';
            else if (err.message === 'Meal not found') error = 'MEALS.VALIDATE_ERRORS.NO_MEAL';
            else if (err.message === 'User not found') error = 'MEALS.VALIDATE_ERRORS.NO_USER';
            else error = 'COMMON.OPERATION_FAILED';

            this.message.error(error);
          } finally {
            this.loading.hide();
          }
        }
      });
    }

    buttons.push({ text: this.t._('COMMON.CANCEL'), role: 'cancel', icon: 'arrow-undo' });

    const actions = await this.actionsCtrl.create({ header, buttons });
    actions.present();
  }

  calcFooterTotals(): void {
    for (const meal of this.meals) this.mealCounters[meal.mealId] = 0;
    this.filteredUsers.forEach(user => {
      for (const mealId of Object.keys(user.mealTickets)) {
        if (user.mealTickets[mealId]?.approvedAt) this.mealCounters[mealId]++;
      }
    });
  }
}

interface RowsFilters {
  sectionCountry: string | 'no' | null;
}
