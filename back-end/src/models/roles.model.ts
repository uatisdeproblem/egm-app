import { Resource } from 'idea-toolbox';

/**
 * The platform's roles.
 */
export class UserRoles extends Resource {
  /**
   * A fixed string, to identify the role.
   */
  PK: string;
  /**
   * The IDs of the users with the selected role.
   */
  userIds: string[];

  load(x: any): void {
    super.load(x);
    this.PK = this.clean(x.PK, String);
    this.userIds = this.cleanArray(x.userIds, String);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.PK = safeData.PK;
  }
}

export enum RoleTypes {
  'ADMIN' = 'ADMIN'
}
