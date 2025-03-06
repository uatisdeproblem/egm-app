import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSearchbar, ModalController } from '@ionic/angular';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
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
import { UsersService } from '@app/tabs/manage/users/users.service';
import { User } from '@models/user.model';

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

  meals: MealTicket[] = [];
  users: User[] = [];
  usersWithoutTicket: User[] = [];
  filteredMeals: MealTicket[] = [];

  filters: RowsFilters = {
    type: null,
    approvedType: null,
    used: null,
    sectionCountry: null,
    generateTicket: null
  };

  numMeals = 0;
  numUsedTickets = 0;
  numAvailableUsers = 0;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private actionsCtrl: IDEAActionSheetController,
    private route: ActivatedRoute,
    private _users: UsersService,
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
      [this.users, this.meals] = await Promise.all([
        this._users.getList(),
        this._meals.getMealsByMealId(this.app.user.userId, this.ticketId)
      ]);

      this.updateUsersWithoutTicket();

      this.filter(this.searchbar?.value);
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    } finally {
      this.loading.hide();
    }
  }

  updateUsersWithoutTicket(): void {
    const mealUserIds = this.meals.map(meal => meal.userId);

    this.usersWithoutTicket = this.users.filter(user =>
      user.registrationAt &&
      user.spot &&
      !mealUserIds.includes(user.userId)
    );

    this.numAvailableUsers = this.usersWithoutTicket.length;
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

    if (this.filters.generateTicket === 'no') {
      this.showUsersWithoutTicket(searchText);
    } else if (this.filters.generateTicket === 'yes') {
      this.showUsersWithTicket(searchText);
    } else {
      this.showAllUsers(searchText);
    }

    this.mealsTable.offset = 0;
  }

  private showUsersWithTicket(searchText: string): void {
    this.filteredMeals = this.meals.slice();

    this.filteredMeals = this.filteredMeals.filter(x =>
      [x.userId, x.userName, x.userCountry]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );

    if (this.filters.approvedType) {
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.approvedType === 'no' ? !x.approvedAt : x.approvedAt && this.filters.approvedType === x.approvedAt
      );
    }

    if (this.filters.used) {
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.used === 'yes' ? x.status : !x.status
      );
    }

    if (this.filters.type) {
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.type === 'no' ? !x.type : x.type && this.filters.type === x.type
      );
    }

    if (this.filters.sectionCountry) {
      this.filteredMeals = this.filteredMeals.filter(x =>
        this.filters.sectionCountry === 'no' ? !x.userCountry : this.filters.sectionCountry === x.userCountry
      );
    }

    this.calcFooterTotals();
  }

  private showUsersWithoutTicket(searchText: string): void {
    const filteredUsers = this.usersWithoutTicket.filter(user => {
      const matchesSearch = [
        user.userId,
        user.firstName + ' ' + user.lastName,
        user.sectionCountry
      ]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText));

      const matchesType = !this.filters.type ||
                         this.filters.type === 'no' && !user.mealType ||
                         user.mealType === this.filters.type;

      const matchesCountry = !this.filters.sectionCountry ||
                            this.filters.sectionCountry === 'no' && !user.sectionCountry ||
                            user.sectionCountry === this.filters.sectionCountry;

      return matchesSearch && matchesType && matchesCountry;
    });

    this.filteredMeals = filteredUsers.map(user => {
      return new MealTicket({
        mealTicketId: this.ticketId,
        userId: user.userId,
        userName: user.firstName + ' ' + user.lastName,
        userCountry: user.sectionCountry || '',
        type: user.mealType || '',
        status: false,
        name: this.app.configurations.mealConfigurations.mealInfo
          .find(info => info.ticketId === this.ticketId)?.name || ''
      });
    });

    // Imposta i totali
    this.numMeals = 0;
    this.numUsedTickets = 0;
    this.numAvailableUsers = this.filteredMeals.length;
  }

  private showAllUsers(searchText: string): void {
    this.showUsersWithTicket(searchText);

    const filteredUsers = this.usersWithoutTicket.filter(user => {
      const matchesSearch = [
        user.userId,
        user.firstName + ' ' + user.lastName,
        user.sectionCountry
      ]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText));

      // Filtro per tipo di pasto
      const matchesType = !this.filters.type ||
                         this.filters.type === 'no' && !user.mealType ||
                         user.mealType === this.filters.type;

      // Filtro per paese
      const matchesCountry = !this.filters.sectionCountry ||
                            this.filters.sectionCountry === 'no' && !user.sectionCountry ||
                            user.sectionCountry === this.filters.sectionCountry;

      return matchesSearch && matchesType && matchesCountry;
    });

    const usersWithoutTicketsAsMeals = filteredUsers.map(user => {
      return new MealTicket({
        mealTicketId: this.ticketId,
        userId: user.userId,
        userName: user.firstName + ' ' + user.lastName,
        userCountry: user.sectionCountry || '',
        type: user.mealType || '',
        status: false,
        name: this.app.configurations.mealConfigurations.mealInfo
          .find(info => info.ticketId === this.ticketId)?.name || ''
      });
    });

    this.filteredMeals = [...this.filteredMeals, ...usersWithoutTicketsAsMeals];

    this.numAvailableUsers = filteredUsers.length;
  }

  calcFooterTotals(): void {
    this.numMeals = this.filteredMeals.length;
    this.numUsedTickets = this.filteredMeals.filter(meal => meal.status).length;
  }

  hasMealUsed(userId: string): boolean {
    return this.meals.find(meal => meal.userId === userId)?.status ?? false;
  }

  async addTicket() {
    const data = this.usersWithoutTicket.map(x => x.mapIntoSuggestion());
    const componentProps = {
      data,
      hideIdFromUI: true,
      sortData: true,
      hideClearButton: true,
      searchPlaceholder: this.t._('MANAGE.ADD_MEAL_TICKET')
    };
    const modal = await this.modalCtrl.create({ component: IDEASuggestionsComponent, componentProps });
    modal.onDidDismiss().then(async ({ data }): Promise<void> => {
      if (!data) return;
      try {
        await this.loading.show();
        const user = this.users.find(x => x.userId === data.value);
        const mealTicket = new MealTicket({
          mealTicketId: this.ticketId,
          name: this.app.configurations.mealConfigurations.mealInfo
            .find(info => info.ticketId === this.ticketId)?.name || '',
          userName: user.firstName + ' ' + user.lastName,
          userCountry: user.sectionCountry,
          type: user.mealType,
          userId: user.userId,
          status: false
        });

        await this._meals.addTicket(mealTicket, user.userId);
        this.meals = await this._meals.getMealsByMealId(this.app.user.userId, this.ticketId);

        this.updateUsersWithoutTicket();

        this.filter(this.searchbar?.value);
        this.message.success('COMMON.OPERATION_COMPLETED');
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    });
    modal.present();
  }
}

interface RowsFilters {
  type: string | 'no' | null;
  approvedType: string | 'no' | null;
  used: null | 'yes' | 'no';
  sectionCountry: string | 'no' | null;
  generateTicket: null | 'yes' | 'no';
}