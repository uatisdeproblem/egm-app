import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { WorkBook, utils, writeFile } from 'xlsx';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import {
  IDEAActionSheetController,
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslatePipe,
  IDEATranslationsService
} from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '../users/users.service';

import { User } from '@models/user.model';
import { ApprovedType, Meal, MealTypes, MEAL_CATEGORY_ASSIGNMENTS } from '@models/meal.model';
import { MealsService } from '@app/tabs/meals/meals.service';

const EXPORT_ALERT_ROW_FILL = 'FFFF0000';
const EXPORT_ALERT_ROW_TEXT = 'FFFFFFFF';
const MEAL_ASSIGNMENT_COLOR_HEX: Record<string, string> = {
  ESNdarkBlue: '#2E3192',
  ESNpink: '#EC008C',
  ESNgreen: '#7AC143',
  ESNcyan: '#00AEEF'
};

@Component({
  selector: 'mealsInfo',
  templateUrl: 'mealsInfo.page.html',
  styleUrls: ['mealsInfo.page.scss'],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // External
    NgxDatatableModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  ]
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
  rowHeight: number | 'auto' = 'auto';
  rowHeightForCalc = 42;
  headerHeight = 56;
  footerHeight = 80;

  meals: Meal[];
  filteredMeals: Meal[];
  users: User[];
  filteredUsers: User[];
  availableMealTypes = Object.values(MealTypes);
  filters: RowsFilters = {
    sectionCountry: null,
    mealTypes: [],
    additionalAllergens: null
  };

  mealCounters: { [mealId: string]: number } = {};
  numWithAdditionalAllergens = 0;

  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private t = inject(IDEATranslationsService);
  private actionsCtrl = inject(IDEAActionSheetController);
  private _users = inject(UsersService);
  private _meals = inject(MealsService);
  public app = inject(AppService);
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
      { prop: 'mealCategorySummaryOrType',
        name: this.t._('MEALS.TYPE'),
        comparator: (_a: string, _b: string, rowA: User, rowB: User): number =>
          this.formatMealTypeSummary(rowA).localeCompare(this.formatMealTypeSummary(rowB)),
        pipe: { transform: (value: string, row?: User) => this.formatMealTypeSummary(row, value) }
      },
      {
        prop: 'mealMenuSummary',
        name: this.t._('MEALS.ASSIGNED_MENU'),
        cellClass: data => this.getAssignedMenuCellClass(data?.row ?? data),
        pipe: { transform: (value: string, row?: User) => this.formatMealMenuSummary(row, value) }
      },
      {
        prop: 'additionalAllergensSummary',
        name: this.t._('MEALS.ADDITIONAL_ALLERGENS')
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
    this.limit = Math.floor(heightAvailableInPx / this.rowHeightForCalc);
  }

  rowIdentity(row: User): string {
    return row.userId;
  }

  getAdditionalAllergensRowClass = (row: User): string =>
    row?.additionalAllergensSummary?.trim() ? 'has-additional-allergens' : '';

  filter(searchText?: string): void {
    searchText = (searchText ?? '').toLowerCase();

    this.filteredUsers = this.users.slice();

    this.filteredUsers = this.filteredUsers.filter(x =>
      [
        x.userId,
        x.firstName,
        x.lastName,
        x.email,
        x.sectionCountry,
        x.sectionName,
        x.mealCategorySummaryOrType,
        x.mealMenuSummary,
        x.additionalAllergensSummary
      ]
        .filter(f => f)
        .some(f => String(f).toLowerCase().includes(searchText))
    );
    this.filteredUsers = this.filteredUsers.filter(x => x.spot);

    if (this.filters.sectionCountry)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.sectionCountry === 'no' ? !x.sectionCountry : this.filters.sectionCountry === x.sectionCountry
      );
    if (this.filters.mealTypes?.length)
      this.filteredUsers = this.filteredUsers.filter(x =>
        x.mealTypes?.some(mealType => this.filters.mealTypes.includes(mealType))
      );
    if (this.filters.additionalAllergens)
      this.filteredUsers = this.filteredUsers.filter(x =>
        this.filters.additionalAllergens === 'yes' ? this.hasAdditionalAllergens(x) : !this.hasAdditionalAllergens(x)
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
    this.numWithAdditionalAllergens = 0;
    this.filteredUsers.forEach(user => {
      if (this.hasAdditionalAllergens(user)) this.numWithAdditionalAllergens++;
      for (const mealId of Object.keys(user.mealTickets)) {
        if (user.mealTickets[mealId]?.approvedAt) this.mealCounters[mealId]++;
      }
    });
  }

  downloadFilteredMealsInfoAsExcelFile(): void {
    if (!(this.app.user.permissions.canManageRegistrations || this.app.user.permissions.isCountryLeader)) return;

    const title = this.t._('MEALS.LIST');
    const data = this.filteredUsers.map(user => {
      const row: Record<string, string | boolean> = {
        'User ID': user.userId,
        'First name': user.firstName,
        'Last name': user.lastName,
        'Section Country': user.sectionCountry ?? '',
        'Section Name': user.sectionName ?? '',
        'Meal Type': this.formatMealTypeSummary(user),
        'Assigned Menus': this.formatMealMenuSummary(user),
        'Additional Allergens': user.additionalAllergensSummary ?? '',
        'Meal Type -> Menu': this.formatMealTypeMenuAssignments(user),
        'Meal Type -> Color': this.formatMealTypeColorAssignments(user)
      };

      for (const meal of this.filteredMeals)
        row[meal.name] = user.mealTickets?.[meal.mealId]?.approvedAt ? true : false;

      return row;
    });

    const workbook: WorkBook = { SheetNames: [], Sheets: {}, Props: { Title: title } };
    const sheet = utils.json_to_sheet(data);
    this.applyAdditionalAllergenRowHighlight(sheet, data, row => String(row['Additional Allergens'] ?? '').trim().length > 0);
    utils.book_append_sheet(workbook, sheet, '1');
    this.appendMealAssignmentsSheet(workbook);
    writeFile(workbook, title.concat('.xlsx'), { cellStyles: true });
  }

  private formatMealTypeSummary(user?: User, fallback = ''): string {
    if (!user) return fallback ?? '';
    return (user.mealTypes ?? [])
      .map(mealType => this.t._('MEALS.TYPES.' + mealType))
      .join(', ');
  }

  private formatMealMenuSummary(user?: User, fallback = ''): string {
    if (!user) return this.formatAssignedMenusFromSummary(fallback);
    const assignedMenus = Array.from(
      new Set((user.mealTypes ?? []).map(mealType => MEAL_CATEGORY_ASSIGNMENTS[mealType]?.menu).filter(Boolean))
    );

    return this.formatAssignedMenus(assignedMenus);
  }

  private formatAssignedMenusFromSummary(summary = ''): string {
    const menus = summary
      .split(',')
      .map(menu => menu.trim())
      .filter(Boolean);
    return this.formatAssignedMenus(menus);
  }

  private formatAssignedMenus(menus: string[]): string {
    return menus.map(menu => this.t._('MEALS.' + menu)).join(', ');
  }

  private formatMealTypeMenuAssignments(user?: User): string {
    if (!user) return '';
    return (user.mealTypes ?? [])
      .map(mealType => {
        const assignment = MEAL_CATEGORY_ASSIGNMENTS[mealType];
        if (!assignment) return '';
        return `${this.t._('MEALS.TYPES.' + mealType)} -> ${this.t._('MEALS.' + assignment.menu)}`;
      })
      .filter(Boolean)
      .join('; ');
  }

  private formatMealTypeColorAssignments(user?: User): string {
    if (!user) return '';
    return (user.mealTypes ?? [])
      .map(mealType => {
        const assignment = MEAL_CATEGORY_ASSIGNMENTS[mealType];
        if (!assignment) return '';
        const colorHex = MEAL_ASSIGNMENT_COLOR_HEX[assignment.color] ?? assignment.color;
        return `${this.t._('MEALS.TYPES.' + mealType)} -> ${assignment.color} (${colorHex})`;
      })
      .filter(Boolean)
      .join('; ');
  }

  private applyAdditionalAllergenRowHighlight(
    sheet: any,
    rows: Record<string, string | boolean>[],
    shouldHighlight: (row: Record<string, string | boolean>) => boolean
  ): void {
    const ref = sheet['!ref'];
    if (!ref) return;

    const range = utils.decode_range(ref);
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      if (!shouldHighlight(rows[rowIndex])) continue;

      for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex++) {
        const cellAddress = utils.encode_cell({ r: rowIndex + 1, c: columnIndex });
        if (!sheet[cellAddress]) sheet[cellAddress] = { t: 's', v: '' };
        sheet[cellAddress].s = {
          fill: { patternType: 'solid', fgColor: { rgb: EXPORT_ALERT_ROW_FILL } },
          font: { color: { rgb: EXPORT_ALERT_ROW_TEXT }, bold: true }
        };
      }
    }
  }

  private appendMealAssignmentsSheet(workbook: WorkBook): void {
    const data = Object.values(MealTypes).map(mealType => {
      const assignment = MEAL_CATEGORY_ASSIGNMENTS[mealType];
      return {
        'Meal Type': this.t._('MEALS.TYPES.' + mealType),
        'Assigned Menu': this.t._('MEALS.' + assignment.menu)
      };
    });

    const sheet = utils.json_to_sheet(data);
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const mealType = Object.values(MealTypes)[rowIndex];
      const assignment = MEAL_CATEGORY_ASSIGNMENTS[mealType];
      const colorHex = (MEAL_ASSIGNMENT_COLOR_HEX[assignment.color] ?? assignment.color).replace('#', '');
      const menuCellAddress = utils.encode_cell({ r: rowIndex + 1, c: 1 });
      if (!sheet[menuCellAddress]) continue;
      sheet[menuCellAddress].s = { font: { color: { rgb: `FF${colorHex}` }, bold: true } };
    }

    utils.book_append_sheet(workbook, sheet, 'Meal assignments');
  }

  private getAssignedMenuCellClass(user?: User): string {
    const assignedMenu = user?.mealMenuSummary;

    switch (assignedMenu) {
      case 'MENU_1':
        return 'assigned-menu-1';
      case 'MENU_2':
        return 'assigned-menu-2';
      case 'MENU_3':
        return 'assigned-menu-3';
      case 'SPECIAL_MENU':
        return 'assigned-menu-other';
      default:
        return '';
    }
  }

  private hasAdditionalAllergens(user?: User): boolean {
    return !!user?.additionalAllergensSummary?.trim();
  }
}

interface RowsFilters {
  sectionCountry: string | 'no' | null;
  mealTypes: MealTypes[];
  additionalAllergens: null | 'yes' | 'no';
}
