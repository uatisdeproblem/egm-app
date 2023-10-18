import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import {
  IDEAActionSheetController,
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsService
} from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '@tabs/manage/users/users.service';

import { User, UserPermissions } from '@models/user.model';

@Component({
  selector: 'users',
  templateUrl: 'users.page.html',
  styleUrls: ['users.page.scss']
})
export class UsersPage implements OnInit {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild('usersTable') table: DatatableComponent;

  col: TableColumn[];
  selectionType = SelectionType.checkbox;
  trackByProp = 'userId';
  columnMode = ColumnMode.force;
  limit = 10;

  rowHeight = 45;
  headerHeight = 50;
  footerHeight = 80;

  users: User[];
  filteredUsers: User[];
  filters: RowsFilters = { registered: null, spot: null, paid: null, confirmed: null, sectionCountry: null };

  numRegistered = 0;
  numWithSpot = 0;
  numWhoPaid = 0;
  numConfirmed = 0;

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private actionsCtrl: IDEAActionSheetController,
    private _users: UsersService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.col = [
      { maxWidth: 50, sortable: false, headerCheckboxable: true, checkboxable: true },
      { prop: 'firstName', name: this.t._('USER.FIRST_NAME') },
      { prop: 'lastName', name: this.t._('USER.LAST_NAME') },
      { prop: 'sectionCountry', name: this.t._('USER.ESN_COUNTRY') },
      { prop: 'sectionName', name: this.t._('USER.ESN_SECTION') },
      { prop: 'registrationAt', name: this.t._('USERS.REGISTERED'), pipe: { transform: x => this.t.formatDate(x) } },
      { prop: 'spot.type', name: this.t._('USERS.SPOT') },
      { prop: 'spot.proofOfPaymentURI', name: this.t._('USERS.PAID'), pipe: { transform: x => (x ? !!x : '') } },
      { prop: 'confirmedAt', name: this.t._('USERS.CONFIRMED'), pipe: { transform: x => (x ? !!x : '') } },
      {
        prop: 'permissions',
        name: this.t._('USER.PERMISSIONS'),
        comparator: (a: UserPermissions, b: UserPermissions): number =>
          this.app.getUserPermissionsString(a).localeCompare(this.app.getUserPermissionsString(b)),
        pipe: { transform: x => this.app.getUserPermissionsString(x) }
      }
    ];
    this.col.forEach(c => (c.resizeable = false));
    this.setTableHeight();

    try {
      await this.loading.show();
      this.users = await this._users.getList();
      this.filter();
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    } finally {
      this.loading.hide();
    }
  }
  ionViewWillEnter(): void {
    if (!(this.app.user.permissions.canManageRegistrations || this.app.user.permissions.isCountryLeader))
      return this.app.closePage('COMMON.UNAUTHORIZED');
  }

  @HostListener('window:resize', ['$event'])
  setTableHeight(event?: Event): void {
    const currentPageHeight = event?.target ? (event.target as Window).innerHeight : window.innerHeight;
    const heightAvailableInPx = currentPageHeight - this.headerHeight - this.footerHeight;
    this.limit = Math.floor(heightAvailableInPx / this.rowHeight);
  }

  rowIdentity(row: User): string {
    return row.userId;
  }

  filter(searchText?: string): void {
    searchText = (searchText ?? '').toLowerCase();

    this.filteredUsers = this.users.slice();

    this.filteredUsers = this.filteredUsers.filter(x =>
      [x.firstName, x.lastName, x.email, x.sectionCountry, x.sectionName]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );
    if (this.filters.registered)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.registered === 'yes' ? !!x.registrationAt : !x.registrationAt
      );
    if (this.filters.spot)
      this.filteredUsers = this.filteredUsers.filter(x => x.spot && this.filters.spot === x.spot.type);
    if (this.filters.paid)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.paid === 'yes' ? !!x.spot?.proofOfPaymentURI : !x.spot?.proofOfPaymentURI
      );
    if (this.filters.confirmed)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.confirmed === 'yes' ? !!x.confirmedAt : !x.confirmedAt
      );
    if (this.filters.sectionCountry)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.paid === 'no' ? !this.filters.sectionCountry : this.filters.sectionCountry === x.sectionCountry
      );

    this.calcFooterTotals();

    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async actionsOnSelectedRows(): Promise<void> {
    if (!this.table.selected.length) return;

    const header = this.t._('USERS.ACTIONS_ON_NUM_ROWS', { num: this.table.selected.length });
    const buttons = [];
    buttons.push({ text: 'Assign spot', icon: 'ticket' }); // @todo
    if (this.table.selected.length === 1) buttons.push({ text: 'Assign country spot', icon: 'earth' }); // @todo
    buttons.push({ text: 'Confirm participation', icon: 'checkmark-done' }); // @todo
    buttons.push({ text: this.t._('COMMON.CANCEL'), role: 'cancel', icon: 'arrow-undo' });

    const actions = await this.actionsCtrl.create({ header, buttons });
    actions.present();
  }

  async openRegistrationOfUser(user: User): Promise<void> {
    this.app.goToInTabs(['manage', 'registrations', user.userId]);
  }

  calcFooterTotals(): void {
    this.numRegistered = 0;
    this.numWithSpot = 0;
    this.numWhoPaid = 0;
    this.numConfirmed = 0;
    this.filteredUsers.forEach(user => {
      if (!!user.registrationAt) this.numRegistered++;
      if (!!user.spot) this.numWithSpot++;
      if (!!user.spot?.proofOfPaymentURI) this.numWhoPaid++;
      if (!!user.confirmedAt) this.numConfirmed++;
    });
  }
}

interface RowsFilters {
  registered: null | 'yes' | 'no';
  spot: null | string;
  paid: null | 'yes' | 'no';
  confirmed: null | 'yes' | 'no';
  sectionCountry: string | 'no' | null;
}
