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
import { UsersService } from './users.service';
import { SpotsService } from '../spots/spots.service';

import { User, UserPermissions } from '@models/user.model';
import { UserFlat, UserFlatWithRegistration } from '@models/userFlat.model';
import { EventSpot, EventSpotAttached } from '@models/eventSpot.model';

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

  spots: EventSpot[];
  numCountrySpotsAvailable = 0;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private actionsCtrl: IDEAActionSheetController,
    private _users: UsersService,
    private _spots: SpotsService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.col = [
      { prop: 'firstName', name: this.t._('USER.FIRST_NAME') },
      { prop: 'lastName', name: this.t._('USER.LAST_NAME') },
      { prop: 'sectionCountry', name: this.t._('USER.ESN_COUNTRY') },
      { prop: 'sectionName', name: this.t._('USER.ESN_SECTION') },
      { prop: 'registrationAt', name: this.t._('USERS.REGISTERED'), pipe: { transform: x => this.t.formatDate(x) } },
      { prop: 'spot.type', name: this.t._('USERS.WITH_SPOT') },
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
        pipe: { transform: x => this.app.getUserPermissionsString(x, true) }
      }
    ];
    this.col.forEach(c => (c.resizeable = false));
    this.setTableHeight();

    try {
      await this.loading.show();
      [this.users, this.spots] = await Promise.all([this._users.getList(), this._spots.getList()]);
      this.numCountrySpotsAvailable = this.spots.filter(
        x => x.sectionCountry === this.app.user.sectionCountry && !x.userId
      ).length;
      this.filter(this.searchbar?.value);
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
      [x.userId, x.firstName, x.lastName, x.email, x.sectionCountry, x.sectionName, x.spot?.spotId]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );
    if (this.filters.registered)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.registered === 'yes' ? !!x.registrationAt : !x.registrationAt
      );
    if (this.filters.spot)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.spot === 'no' ? !x.spot : x.spot && this.filters.spot === x.spot.type
      );
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

    const header = this.t._('USERS.ACTIONS_ON_USER', { user: user.getName() });
    const buttons = [];

    if (!user.spot && this.app.user.permissions.isAdmin) {
      buttons.push({
        text: this.t._('USERS.ASSIGN_SPOT'),
        icon: 'ticket',
        handler: (): Promise<void> => this.pickSpotAndAssignToUser(user)
      });
    } else {
      if (this.app.user.permissions.isAdmin) {
        buttons.push({
          text: this.t._('USERS.TRANSFER_SPOT'),
          icon: 'swap-horizontal',
          handler: (): Promise<void> => this.transferSpotToAnotherUser(user)
        });
      }
      if (user.spot.proofOfPaymentURI) {
        buttons.push({
          text: this.t._('USERS.OPEN_PROOF_OF_PAYMENT'),
          icon: 'eye',
          handler: (): Promise<void> => this.openProofOfPayment(user)
        });
      }
      if (!user.spot.paymentConfirmedAt) {
        buttons.push({
          text: this.t._('USERS.CONFIRM_SPOT_PAYMENT'),
          icon: 'checkmark-done',
          handler: (): Promise<void> => this.confirmSpotPaymentOfUser(user)
        });
      }
    }
    if (this.app.user.permissions.isAdmin) {
      buttons.push({
        text: this.t._('USERS.MANAGE_PERMISSIONS'),
        icon: 'ribbon',
        handler: (): Promise<void> => this.managePermissionsOfUser(user)
      });
      buttons.push({
        text: this.t._('USERS.DELETE_USER'),
        icon: 'trash',
        role: 'destructive',
        handler: (): Promise<void> => this.deleteUser(user)
      });
    }
    buttons.push({ text: this.t._('COMMON.CANCEL'), role: 'cancel', icon: 'arrow-undo' });

    const actions = await this.actionsCtrl.create({ header, buttons });
    actions.present();
  }
  private async pickSpotAndAssignToUser(user: User): Promise<void> {
    if (user.spot) return;

    const data = this.spots.filter(x => !x.userId).map(x => this.mapSpotIntoSuggestion(x));
    const componentProps = {
      data,
      hideIdFromUI: true,
      hideClearButton: true,
      searchPlaceholder: this.t._('USERS.ASSIGN_SPOT')
    };
    const modal = await this.modalCtrl.create({ component: IDEASuggestionsComponent, componentProps });
    modal.onDidDismiss().then(async ({ data }): Promise<void> => {
      if (!data) return;
      try {
        await this.loading.show();
        const spot = this.spots.find(x => x.spotId === data.value);
        await this._spots.assignToUser(spot, user);
        spot.userId = user.userId;
        spot.userName = user.getName();
        user.spot = new EventSpotAttached(spot);
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
  private async transferSpotToAnotherUser(sourceUser: User): Promise<void> {
    if (!sourceUser.spot) return;

    const data = this.users
      .filter(x => x.registrationAt && !x.spot && x.userId !== sourceUser.userId)
      .map(x => x.mapIntoSuggestion());
    const componentProps = {
      data,
      hideIdFromUI: true,
      sortData: true,
      hideClearButton: true,
      searchPlaceholder: this.t._('USERS.TRANSFER_SPOT')
    };
    const modal = await this.modalCtrl.create({ component: IDEASuggestionsComponent, componentProps });
    modal.onDidDismiss().then(async ({ data }): Promise<void> => {
      if (!data) return;
      try {
        await this.loading.show();
        const targetUser = this.users.find(x => x.userId === data.value);
        const spot = this.spots.find(x => x.spotId === sourceUser.spot.spotId);
        await this._spots.transferToUser(spot, targetUser);
        spot.userId = targetUser.userId;
        spot.userName = targetUser.getName();
        targetUser.spot = new EventSpotAttached(spot);
        delete sourceUser.spot;
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
  private async confirmSpotPaymentOfUser(user: User): Promise<void> {
    if (!user.spot) return;

    const doConfirm = async (): Promise<void> => {
      try {
        await this.loading.show();
        const spot = this.spots.find(x => x.spotId === user.spot.spotId);
        await this._spots.confirmPayment(spot);
        spot.paymentConfirmedAt = new Date().toISOString();
        user.spot = new EventSpotAttached(spot);
        this.filter(this.searchbar?.value);
        this.message.success('COMMON.OPERATION_COMPLETED');
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('USERS.CONFIRM_SPOT_PAYMENT');
    const subHeader = this.t._('COMMON.ARE_YOU_SURE');
    const message = this.t._('SPOTS.CONFIRM_SPOT_PAYMENT_I');
    const buttons = [{ text: this.t._('COMMON.CANCEL') }, { text: this.t._('COMMON.CONFIRM'), handler: doConfirm }];
    const alert = await this.alertCtrl.create({ header, subHeader, message, buttons });
    alert.present();
  }
  private async managePermissionsOfUser(user: User): Promise<void> {
    const doChangePermissions = async (permissions: string[]): Promise<void> => {
      const newPermissions = new UserPermissions();
      for (const permission of permissions) newPermissions[permission] = true;
      try {
        await this.loading.show();
        await this._users.changePermissions(user, newPermissions);
        user.permissions = newPermissions;
        this.filter(this.searchbar?.value);
        this.message.success('COMMON.OPERATION_COMPLETED');
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('USERS.MANAGE_PERMISSIONS');
    const message = this.t._('USERS.MANAGE_PERMISSIONS_ADMIN_NOTE');
    const inputs: any[] = [
      {
        type: 'checkbox',
        name: 'isAdmin',
        value: 'isAdmin',
        checked: user.permissions.isAdmin,
        label: this.t._('USER.ADMINISTRATOR')
      },
      {
        type: 'checkbox',
        name: 'isCountryLeader',
        value: 'isCountryLeader',
        checked: user.permissions.isCountryLeader,
        label: this.t._('USER.DELEGATION_LEADER')
      },
      {
        type: 'checkbox',
        name: 'canManageRegistrations',
        value: 'canManageRegistrations',
        checked: user.permissions.canManageRegistrations,
        label: this.t._('USER.CAN_MANAGE_REGISTRATIONS')
      },
      {
        type: 'checkbox',
        name: 'canManageContents',
        value: 'canManageContents',
        checked: user.permissions.canManageContents,
        label: this.t._('USER.CAN_MANAGE_CONTENTS')
      }
    ];
    const buttons = [
      { text: this.t._('COMMON.CANCEL') },
      { text: this.t._('COMMON.CONFIRM'), handler: doChangePermissions }
    ];
    const alert = await this.alertCtrl.create({ header, message, inputs, buttons });
    alert.present();
  }
  private async deleteUser(user: User): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._users.delete(user);
        this.users.splice(this.users.indexOf(user), 1);
        this.filter(this.searchbar?.value);
        this.message.success('COMMON.OPERATION_COMPLETED');
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('USERS.DELETE_USER');
    const subHeader = this.t._('COMMON.ARE_YOU_SURE');
    const message = this.t._('COMMON.ACTION_IS_IRREVERSIBLE');
    const buttons = [{ text: this.t._('COMMON.CANCEL') }, { text: this.t._('COMMON.DELETE'), handler: doDelete }];
    const alert = await this.alertCtrl.create({ header, subHeader, message, buttons });
    alert.present();
  }
  async assignCountrySpot(user: User): Promise<void> {
    if (!this.numCountrySpotsAvailable || user.spot || user.sectionCountry !== this.app.user.sectionCountry) return;

    const doAssign = async (): Promise<void> => {
      try {
        await this.loading.show();
        const firstAvailableSpot = this.spots.find(x => x.sectionCountry === this.app.user.sectionCountry && !x.userId);
        if (!firstAvailableSpot) return;
        await this._spots.assignToUser(firstAvailableSpot, user);
        firstAvailableSpot.userId = user.userId;
        firstAvailableSpot.userName = user.getName();
        user.spot = new EventSpotAttached(firstAvailableSpot);
        this.numCountrySpotsAvailable--;
        this.filter(this.searchbar?.value);
        this.message.success('COMMON.OPERATION_COMPLETED');
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('USERS.ASSIGN_COUNTRY_SPOT');
    const message = this.t._('COMMON.ARE_YOU_SURE');
    const buttons = [{ text: this.t._('COMMON.CANCEL') }, { text: this.t._('COMMON.CONFIRM'), handler: doAssign }];
    const alert = await this.alertCtrl.create({ header, message, buttons });
    alert.present();
  }
  private async openProofOfPayment(user: User): Promise<void> {
    if (!user.spot?.proofOfPaymentURI) return;
    try {
      await this.loading.show();
      const url = await this._users.getProofOfPaymentURL(user);
      this.app.openURL(url);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  private mapSpotIntoSuggestion(spot: EventSpot): Suggestion {
    return new Suggestion({
      value: spot.spotId,
      name: [spot.type, spot.spotId].join(' - '),
      category1: spot.sectionCountry,
      category2: spot.paymentConfirmedAt
        ? this.t._('SPOTS.PAYMENT_CONFIRMED')
        : spot.proofOfPaymentURI
        ? this.t._('SPOTS.PROOF_OF_PAYMENT_UPLOADED')
        : ''
    });
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

  downloadFilteredUserAsExcelFile(): void {
    if (!(this.app.user.permissions.canManageRegistrations || this.app.user.permissions.isCountryLeader)) return;

    const title = this.t._('USERS.USERS');
    const data = this.filteredUsers.map(x =>
      this.app.user.permissions.canManageRegistrations
        ? new UserFlatWithRegistration(x, this.app.configurations, this.t.getCurrentLang())
        : new UserFlat(x)
    );
    const workbook: WorkBook = { SheetNames: [], Sheets: {}, Props: { Title: title } };
    utils.book_append_sheet(workbook, utils.json_to_sheet(data), '1');
    writeFile(workbook, title.concat('.xlsx'));
  }

  canAssignSpotAsCountryLeader(): boolean {
    return this.app.user.permissions.isCountryLeader && this.app.configurations.canCountryLeadersAssignSpots;
  }
}

interface RowsFilters {
  registered: null | 'yes' | 'no';
  spot: null | 'no' | string;
  proofOfPaymentUploaded: null | 'yes' | 'no';
  paymentConfirmed: null | 'yes' | 'no';
  sectionCountry: string | 'no' | null;
}
