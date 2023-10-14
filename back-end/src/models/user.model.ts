import { Resource, epochISOString } from 'idea-toolbox';

export class User extends Resource {
  /**
   * The ID of the user; it's the concatenation of the key of the auth service and the username there.
   */
  userId: string;
  /**
   * Timestamp of when the user registered.
   */
  registeredAt: epochISOString;
  /**
   * Timestamp of the last time the user did something.
   */
  lastSeenAt: epochISOString;
  /**
   * The service used to authenticate.
   */
  authService: AuthServices;
  /**
   * The first name of the user.
   */
  firstName: string;
  /**
   * The last name of the user.
   */
  lastName: string;
  /**
   * Email address for notifications (!== account email address).
   * Note: if bounced, it will finish in the black list for a while (see `sesNotifications.ts`).
   */
  email: string;
  /**
   * The URL to the user's avatar.
   */
  avatarURL: string;

  /**
   * ESN section code in ESN Accounts.
   * Set only for `AuthService.ESN_ACCOUNTS`.
   */
  sectionCode?: string;
  /**
   * ESN country.
   * Set only for `AuthService.ESN_ACCOUNTS`.
   */
  sectionCountry?: string;
  /**
   * ESN section name.
   * Set only for `AuthService.ESN_ACCOUNTS`.
   */
  sectionName?: string;

  /**
   * The users role.
   * @todo TBD
   */
  role: Roles;

  load(x: any): void {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.registeredAt = this.clean(x.registeredAt, t => new Date(t).toISOString(), new Date().toISOString());
    this.lastSeenAt = new Date().toISOString();
    this.authService = this.clean(x.authService, String);
    this.firstName = this.clean(x.firstName, String);
    this.lastName = this.clean(x.lastName, String);
    this.email = this.clean(x.email, String);
    this.avatarURL = this.clean(x.avatarURL, String);

    if (this.authService === AuthServices.ESN_ACCOUNTS) {
      this.sectionCode = this.clean(x.sectionCode, String);
      this.sectionCountry = this.clean(x.sectionCountry, String);
      this.sectionName = this.clean(x.sectionName, String);
    }

    this.role = this.clean(x.role, Number, Roles.NONE);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.userId = safeData.userId;
    this.registeredAt = safeData.registeredAt;
    this.lastSeenAt = new Date().toISOString();
    this.authService = safeData.authService;

    if (this.authService === AuthServices.ESN_ACCOUNTS) {
      this.sectionCode = safeData.sectionCode;
      this.sectionCountry = safeData.sectionCountry;
      this.sectionName = safeData.sectionName;
    }

    this.role = safeData.role;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.firstName)) e.push('firstName');
    if (this.iE(this.lastName)) e.push('lastName');
    if (this.iE(this.email, 'email')) e.push('email');
    return e;
  }

  /**
   * Whether the user is an administrator.
   */
  isAdmin(): boolean {
    return this.role >= Roles.ADMIN;
  }

  /**
   * Get the original user ID in the AuthService.
   */
  getAuthServiceUserId(): string {
    return this.userId.slice(this.authService.concat('_').length);
  }

  /**
   * Get a string representing the ESN section and country of the user.
   */
  getSectionCountry(): string {
    return [this.sectionCountry, this.sectionName].filter(x => x).join(' - ');
  }
}

/**
 * The possible roles for the user.
 * @todo TBD
 */
export enum Roles {
  NONE = 0,
  PARTICIPANT = 10,
  DELEGATION_LEADER = 20,
  STAFF = 30,
  OC = 40,
  CT = 50,
  IB = 60,
  ADMIN = 70
}

/**
 * The authentication services for the platform.
 */
export enum AuthServices {
  ESN_ACCOUNTS = 'EA', // aka Galaxy
  COGNITO = 'CO'
}
