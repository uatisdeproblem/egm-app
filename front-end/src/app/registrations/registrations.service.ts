import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Registration } from '@models/registration.model';
import { AppService } from '../app.service';

@Injectable({ providedIn: 'root' })
export class RegistrationsService {
  private registrations: Registration[] = null;

  /**
   * The number of registrations to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService, private app: AppService) {}

  /**
   * Load the registrations from the back-end.
   */
  private async loadList(): Promise<void> {
    let registrations: Registration[] = await this.api.getResource(['esners', 'registrations']);
    // @todo
  }

  /**
   * Get (and optionally filter) the list of registrations.
   * Note: it's a slice of the array.
   */
  async getListOfShop(
    options: {
      search?: string;
      withPagination?: boolean;
      startPaginationAfterId?: string;
    } = {}
  ): Promise<Registration[]> {
    // @todo only allow if user is not external!
    if (!this.registrations) await this.loadList();
    if (!this.registrations) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.registrations.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm =>
            [x.name, x.email, x.phoneNr, x.country, x.sectionCode, x.sectionCode]
              .filter(f => f)
              .some(f => f.toLowerCase().includes(searchTerm))
          )
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage =
          filteredList.findIndex(x => x.registrationId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a registration by its id.
   */
  async getById(id: string): Promise<Registration> {
    const registration = new Registration(await this.api.getResource([this.app.getUserApiPath(), 'registrations', id]));
    return registration;
  }

  /**
   * Update the registrations.
   */
  async update(registration: Registration): Promise<Registration> {
    return new Registration(
      await this.api.putResource([this.app.getUserApiPath(), 'registrations', registration.registrationId], {
        body: registration
      })
    );
  }

  /**
   * Submit the registration.
   */
  async submit(registration: Registration): Promise<Registration> {
    return new Registration(
      await this.api.patchResource([this.app.getUserApiPath(), 'registrations', registration.registrationId], {
        body: { action: 'SUBMIT' }
      })
    );
  }

  /**
   * Submit the registration.
   */
  async approve(registration: Registration): Promise<Registration> {
    // @todo check permissions
    return new Registration(
      await this.api.patchResource([this.app.getUserApiPath(), 'registrations', registration.registrationId], {
        body: { action: 'APPROVE' }
      })
    );
  }

  /**
   * Submit the registration.
   */
  async cancel(registration: Registration): Promise<Registration> {
    return new Registration(
      await this.api.patchResource([this.app.getUserApiPath(), 'registrations', registration.registrationId], {
        body: { action: 'CANCEL' }
      })
    );
  }
}
