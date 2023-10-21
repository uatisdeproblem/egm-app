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
  selectionType = SelectionType.single;
  trackByProp = 'userId';
  columnMode = ColumnMode.force;
  limit = 10;

  pageHeaderHeightPx = 56;
  actionBarHeight = 56;
  rowHeight = 42;
  headerHeight = 56;
  footerHeight = 80;

  users: User[];
  filteredUsers: User[];
  filters: RowsFilters = {
    registered: null,
    spot: null,
    proofOfPaymentUploaded: null,
    paymentConfirmed: null,
    sectionCountry: null
  };

  numRegistered = 0;
  numWithSpot = 0;
  numWithProofOfPaymentUploaded = 0;
  numWithPaymentConfirmed = 0;

  countrySpotsAvailable = 0; // @todo

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
      { prop: 'firstName', name: this.t._('USER.FIRST_NAME') },
      { prop: 'lastName', name: this.t._('USER.LAST_NAME') },
      { prop: 'sectionCountry', name: this.t._('USER.ESN_COUNTRY') },
      { prop: 'sectionName', name: this.t._('USER.ESN_SECTION') },
      { prop: 'registrationAt', name: this.t._('USERS.REGISTERED'), pipe: { transform: x => this.t.formatDate(x) } },
      { prop: 'spot.type', name: this.t._('USERS.SPOT') },
      {
        prop: 'spot.proofOfPaymentURI',
        name: this.t._('USERS.PROOF_OF_PAYMENT_UPLOADED'),
        pipe: { transform: x => (x ? !!x : '') }
      },
      {
        prop: 'spot.paymentConfirmedAt',
        name: this.t._('USERS.PAYMENT_CONFIRMED'),
        pipe: { transform: x => (x ? !!x : '') }
      },
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
    if (this.filters.proofOfPaymentUploaded)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.proofOfPaymentUploaded === 'yes' ? !!x.spot?.proofOfPaymentURI : !x.spot?.proofOfPaymentURI
      );
    if (this.filters.paymentConfirmed)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.paymentConfirmed === 'yes' ? !!x.spot?.paymentConfirmedAt : !x.spot?.paymentConfirmedAt
      );
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

    const header = this.t._('USERS.ACTIONS_ON_USER', { user: `${user.firstName} ${user.lastName}` });
    const buttons = [];

    if (!user.spot) {
      buttons.push({
        text: this.t._('USERS.ASSIGN_SPOT'),
        icon: 'ticket',
        handler: (): Promise<void> => this.pickSpotAndAssignToUser(user)
      });
    } else {
      buttons.push({
        text: this.t._('USERS.TRANSFER_SPOT'),
        icon: 'swap-horizontal',
        handler: (): Promise<void> => this.transferSpotToAnotherUser(user)
      });
      buttons.push({
        text: this.t._('USERS.CONFIRM_SPOT_PAYMENT'),
        icon: 'checkmark-done',
        handler: (): Promise<void> => this.confirmSpotPaymentOfUser(user)
      });
    }
    buttons.push({
      text: this.t._('USERS.MANAGE_PERMISSIONS'),
      icon: 'ribbon',
      handler: (): Promise<void> => this.managePermissionsOfUser(user)
    });
    buttons.push({
      text: this.t._('USERS.DELETE_USER'),
      icon: 'trash',
      handler: (): Promise<void> => this.deleteUser(user)
    });
    buttons.push({ text: this.t._('COMMON.CANCEL'), role: 'cancel', icon: 'arrow-undo' });

    const actions = await this.actionsCtrl.create({ header, buttons });
    actions.present();
  }
  private async pickSpotAndAssignToUser(user: User): Promise<void> {
    // @todo
  }
  private async transferSpotToAnotherUser(sourceUser: User): Promise<void> {
    // @todo
  }
  private async confirmSpotPaymentOfUser(user: User): Promise<void> {
    // @todo
  }
  private async managePermissionsOfUser(user: User): Promise<void> {
    // @todo
  }
  private async deleteUser(user: User): Promise<void> {
    // @todo
  }
  async assignCountrySpot(user: User): Promise<void> {
    // @todo
  }

  async openRegistrationOfUser(user: User): Promise<void> {
    this.app.goToInTabs(['manage', 'registrations', user.userId]);
  }

  calcFooterTotals(): void {
    this.numRegistered = 0;
    this.numWithSpot = 0;
    this.numWithProofOfPaymentUploaded = 0;
    this.numWithPaymentConfirmed = 0;
    this.filteredUsers.forEach(user => {
      if (!!user.registrationAt) this.numRegistered++;
      if (!!user.spot) this.numWithSpot++;
      if (!!user.spot?.proofOfPaymentURI) this.numWithProofOfPaymentUploaded++;
      if (!!user.spot?.paymentConfirmedAt) this.numWithPaymentConfirmed++;
    });
  }
}

interface RowsFilters {
  registered: null | 'yes' | 'no';
  spot: null | string;
  proofOfPaymentUploaded: null | 'yes' | 'no';
  paymentConfirmed: null | 'yes' | 'no';
  sectionCountry: string | 'no' | null;
}
