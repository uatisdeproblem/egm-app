import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Organization } from '@models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private organizations: Organization[];

  /**
   * The number of organizations to consider for the pagination, when active.
   */
  MAX_PAGE_SIZE = 24;

  constructor(private api: IDEAApiService) {}

  private async loadList(): Promise<void> {
    this.organizations = (await this.api.getResource(['organizations'])).map(o => new Organization(o));
  }

  /**
   * Get (and optionally filter) the list of organizations.
   * Note: it can be paginated.
   * Note: it's a slice of the array.
   */
  async getList(options: {
    force?: boolean;
    withPagination?: boolean;
    startPaginationAfterId?: string;
    search?: string;
  }): Promise<Organization[]> {
    if (!this.organizations || options.force) await this.loadList();
    if (!this.organizations) return null;

    options.search = options.search ? String(options.search).toLowerCase() : '';

    let filteredList = this.organizations.slice();

    if (options.search)
      filteredList = filteredList.filter(x =>
        options.search
          .split(' ')
          .every(searchTerm =>
            [x.organizationId, x.name].filter(f => f).some(f => f.toLowerCase().includes(searchTerm))
          )
      );

    if (options.withPagination && filteredList.length > this.MAX_PAGE_SIZE) {
      let indexOfLastOfPreviousPage = 0;
      if (options.startPaginationAfterId)
        indexOfLastOfPreviousPage =
          filteredList.findIndex(x => x.organizationId === options.startPaginationAfterId) || 0;
      filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + this.MAX_PAGE_SIZE);
    }

    return filteredList;
  }

  /**
   * Get the full details of a organization by its id.
   */
  async getById(organizationId: string): Promise<Organization> {
    return new Organization(await this.api.getResource(['organizations', organizationId]));
  }

  /**
   * Insert a new organization.
   */
  async insert(organization: Organization): Promise<Organization> {
    return new Organization(await this.api.postResource(['organizations'], { body: organization }));
  }
  /**
   * Update an existing organization.
   */
  async update(organization: Organization): Promise<Organization> {
    return new Organization(
      await this.api.putResource(['communications', organization.organizationId], {
        body: organization
      })
    );
  }
  /**
   * Delete an organization.
   */
  async delete(organization: Organization): Promise<void> {
    await this.api.deleteResource(['organizations', organization.organizationId]);
  }
}
