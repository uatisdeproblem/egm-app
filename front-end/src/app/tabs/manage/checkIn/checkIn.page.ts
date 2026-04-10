import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonSearchbar, IonicModule, ModalController } from '@ionic/angular';
import { ColumnMode, DatatableComponent, NgxDatatableModule, SelectionType } from '@swimlane/ngx-datatable';
import {
  IDEAActionSheetController,
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '../users/users.service';

import { AuthServices, ESNcardValidationMethod, User } from '@models/user.model';
import { BarcodeScannerComponent } from '@app/common/barcode/barcodeScanner.component';

@Component({
  standalone: true,
  selector: 'check-in',
  templateUrl: 'checkIn.page.html',
  styleUrls: ['checkIn.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, NgxDatatableModule, IDEATranslationsModule]
})
export class CheckInPage implements OnInit {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild('usersTable') table: DatatableComponent;

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
  tshirtSizes: string[] = [];
  filters: RowsFilters = {
    sectionCountry: null,
    tshirt: null,
    ESNcardValidated: null,
    checkedIn: null
  };

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    public t: IDEATranslationsService,
    private actionsCtrl: IDEAActionSheetController,
    private _users: UsersService,
    public app: AppService
  ) {}

  async ngOnInit(): Promise<void> {
    this.setTableHeight();

    try {
      await this.loading.show();
      this.users = await this._users.getList();
      this.tshirtSizes = this.getAvailableTshirtSizes(this.users);
      this.filter(this.searchbar?.value);
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    } finally {
      this.loading.hide();
    }
  }

  ionViewWillEnter(): void {
    if (!(this.app.user.permissions.canManageRegistrations || this.app.user.permissions.isStaff))
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

    this.filteredUsers = this.users
      .filter(x => x.hasConfirmedSpot())
      .filter(x =>
        [x.userId, x.firstName, x.lastName, x.email, x.sectionCountry, x.sectionName, x.spot?.spotId, x.registrationForm?.main?.tshirt]
          .filter(f => f)
          .some(f => String(f).toLowerCase().includes(searchText))
      );

    if (this.filters.sectionCountry)
      this.filteredUsers = this.filteredUsers.filter(x => {
        if (this.filters.sectionCountry === 'international') return x.isESNInternational;
        return this.filters.sectionCountry === 'no' ? !x.sectionCountry : this.filters.sectionCountry === x.sectionCountry;
      });

    if (this.filters.tshirt)
      this.filteredUsers = this.filteredUsers.filter(x => x.registrationForm?.main?.tshirt === this.filters.tshirt);

    if (this.filters.ESNcardValidated)
      this.filteredUsers = this.filteredUsers.filter(x => {
        if (x.isExternal()) return false;
        return this.filters.ESNcardValidated === 'yes' ? x.hasValidatedESNcard() : !x.hasValidatedESNcard();
      });

    if (this.filters.checkedIn)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.checkedIn === 'yes' ? x.hasCheckedIn() : !x.hasCheckedIn()
      );

    if (this.table) this.table.offset = 0;
  }

  async actionsOnSelectedUser(user: User): Promise<void> {
    if (!user) return;

    const header = this.t._('USERS.ACTIONS_ON_USER', { user: user.getName() });
    const buttons: any[] = [];

    if (!user.isExternal() && !user.hasValidatedESNcard()) {
      buttons.push({
        text: this.t._('MANAGE.SCAN_ESNCARD'),
        icon: 'scan-outline',
        handler: (): Promise<void> => this.openESNcardScanner(user)
      });
      buttons.push({
        text: this.t._('MANAGE.VERIFY_ESNCARD_MANUALLY'),
        icon: 'card-outline',
        handler: (): Promise<void> => this.openManualESNcardVerifier(user)
      });
    }
    if (!user.hasCheckedIn()) {
      buttons.push({
        text: this.t._('MANAGE.CHECK_IN_USER'),
        icon: 'checkmark-done',
        handler: (): Promise<void> => this.checkInUser(user)
      });
    }
    buttons.push({ text: this.t._('COMMON.CANCEL'), role: 'cancel', icon: 'arrow-undo' });

    const actions = await this.actionsCtrl.create({ header, buttons });
    actions.present();
  }

  openRegistrationOfUser(user: User): void {
    this.app.goToInTabs(['manage', 'registrations', user.userId]);
  }

  getCategoryLabel(user: User): string {
    return user.authService === AuthServices.ESN_ACCOUNTS ? this.t._('AUTH.AN_ESNER') : this.t._('USER.EXTERNAL_GUEST');
  }

  getESNcardStatusLabel(user: User): string {
    if (user.isExternal()) return '';
    if (!user.hasValidatedESNcard()) return this.t._('COMMON.NO');
    if (user.ESNcardValidationMethod === ESNcardValidationMethod.MANUAL)
      return this.t._('MANAGE.VERIFIED_MANUAL');
    return this.t._('MANAGE.VERIFIED_SCAN');
  }

  getCheckInCompletedCount(): number {
    return this.filteredUsers?.filter(user => user.hasCheckedIn()).length ?? 0;
  }

  getCheckInPercentage(): number {
    const totalUsers = this.filteredUsers?.length ?? 0;
    if (!totalUsers) return 0;
    return (this.getCheckInCompletedCount() / totalUsers) * 100;
  }

  getESNcardEligibleCount(): number {
    return this.filteredUsers?.filter(user => !user.isExternal()).length ?? 0;
  }

  getESNcardValidatedCount(): number {
    return this.filteredUsers?.filter(user => !user.isExternal() && user.hasValidatedESNcard()).length ?? 0;
  }

  getESNcardValidatedPercentage(): number {
    const eligibleUsers = this.getESNcardEligibleCount();
    if (!eligibleUsers) return 0;
    return (this.getESNcardValidatedCount() / eligibleUsers) * 100;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  private getAvailableTshirtSizes(users: User[]): string[] {
    return [...new Set(users.map(user => user.registrationForm?.main?.tshirt).filter((size): size is string => !!size))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }

  private normalizeESNcard(rawValue: string): string {
    return (rawValue ?? '').replace(/\u001d/g, '').replace(/[^\x20-\x7E]/g, '').trim();
  }

  private async openESNcardScanner(user: User): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: BarcodeScannerComponent,
      componentProps: { buttonLabel: this.t._('MANAGE.SCAN_ESNCARD'), autoStart: true }
    });
    modal.onDidDismiss().then(async ({ data }): Promise<void> => {
      const rawValue = data?.cardCode;
      if (!rawValue) return;
      await this.verifyESNcard(user, rawValue, ESNcardValidationMethod.SCAN);
    });
    await modal.present();
  }

  private async openManualESNcardVerifier(user: User): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: this.t._('MANAGE.VERIFY_ESNCARD_MANUALLY'),
      inputs: [{ name: 'cardCode', type: 'text', placeholder: this.t._('USER.ESNCARD') }],
      buttons: [
        { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
        {
          text: this.t._('COMMON.CONFIRM'),
          handler: async (data): Promise<boolean> => {
            if (!data?.cardCode?.trim()) return false;
            await this.verifyESNcard(user, data.cardCode, ESNcardValidationMethod.MANUAL);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async verifyESNcard(user: User, rawValue: string, method: ESNcardValidationMethod): Promise<void> {
    const cardCode = this.normalizeESNcard(rawValue);
    console.log('[CheckIn] ESNcard payload', { rawValue, cardCode, userId: user.userId });
    if (!cardCode) return;

    try {
      await this.loading.show();
      const result = await this._users.verifyESNcard(user, cardCode, method);
      if (result.valid) {
        user.ESNcardValidatedAt = result.ESNcardValidatedAt;
        user.ESNcardValidatedBy = result.ESNcardValidatedBy;
        user.ESNcardValidationMethod = result.ESNcardValidationMethod;
        this.message.success('MANAGE.ESNCARD_VALID');
      } else this.message.error('MANAGE.ESNCARD_INVALID');
    } catch (error) {
      this.message.error(this.mapCheckInError(error.message));
    } finally {
      this.loading.hide();
    }
  }

  private async checkInUser(user: User): Promise<void> {
    const confirm = await this.alertCtrl.create({
      header: this.t._('MANAGE.CONFIRM_CHECKIN'),
      message: this.t._('MANAGE.CONFIRM_CHECKIN_I', { user: user.getName() }),
      buttons: [
        { text: this.t._('COMMON.NO'), role: 'cancel' },
        {
          text: this.t._('COMMON.YES'),
          role: 'confirm'
        }
      ]
    });
    await confirm.present();
    const { role } = await confirm.onDidDismiss();
    if (role !== 'confirm') return;

    try {
      await this.loading.show();
      const updatedUser = await this._users.checkInUser(user);
      user.checkedInAt = updatedUser.checkedInAt;
      user.checkedInBy = updatedUser.checkedInBy;
      this.message.success('MANAGE.CHECKIN_VALID');
    } catch (error) {
      this.message.error(this.mapCheckInError(error.message));
    } finally {
      this.loading.hide();
    }
  }

  private mapCheckInError(errorMessage: string): string {
    if (errorMessage === 'Unauthorized') return 'MANAGE.CHECKIN_ERRORS.UNAUTHORIZED';
    if (errorMessage === 'User has not registered to the event') return 'MANAGE.CHECKIN_ERRORS.NOT_REGISTERED';
    if (errorMessage === 'User does not have a confirmed spot') return 'MANAGE.CHECKIN_ERRORS.NO_CONFIRMED_SPOT';
    if (errorMessage === 'External users do not need ESNcard validation')
      return 'MANAGE.CHECKIN_ERRORS.EXTERNAL_ESNCARD';
    if (errorMessage === 'ESNcard already validated') return 'MANAGE.CHECKIN_ERRORS.ESNCARD_ALREADY_VALIDATED';
    if (errorMessage === 'User already checked in') return 'MANAGE.CHECKIN_ERRORS.ALREADY_CHECKED_IN';
    return 'COMMON.OPERATION_FAILED';
  }
}

interface RowsFilters {
  sectionCountry: string | 'no' | 'international' | null;
  tshirt: string | null;
  ESNcardValidated: 'yes' | 'no' | null;
  checkedIn: 'yes' | 'no' | null;
}
