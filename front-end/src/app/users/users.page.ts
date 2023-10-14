import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { ColumnMode, SelectionType, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from 'src/app/app.service';

import { User } from '@models/user.model';
import { UsersService } from '../users/users.service';

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
  trackByProp = 'requestId';
  columnMode = ColumnMode.force;
  limit = 10;

  rowHeight = 45;
  headerHeight = 50;
  footerHeight = 80;

  users: User[];
  filteredUsers: User[];

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private _users: UsersService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    this.col = [
      { prop: 'firstName', name: this.t._('PROFILE.FIRST_NAME') },
      { prop: 'lastName', name: this.t._('PROFILE.LAST_NAME') },
      { prop: 'email', name: this.t._('PROFILE.EMAIL') }
    ];
    this.col.forEach(c => (c.resizeable = false));
    this.setTableHeight();

    try {
      await this.loading.show();
      this.users = await this._users.getList();
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

  rowIdentity(row: User): string {
    return row.userId;
  }

  updateFilter(searchText?: string): void {
    searchText = (searchText ?? '').toLowerCase();

    this.filteredUsers = this.users.filter(x =>
      [x.firstName, x.lastName, x.email].filter(f => f).some(f => String(f).toLowerCase().includes(searchText))
    );

    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async openDetail({ selected }: { selected: User[] }): Promise<void> {
    if (!selected.length) return;
    this.app.goToInTabs(['event-registrations', selected[0].userId]);
  }
}
