import { Resource, epochISOString } from 'idea-toolbox';

export class User extends Resource {
  /**
   * The ID of the user; it's the concatenation of the key of the auth service and the username there.
   */
  userId: string;
  /**
   * Timestamp of when the user signed-up.
   */
  createdAt: epochISOString;
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

  /**
   * A custom block containing custom sections and fields for the registration form.
   */
  registrationForm: Record<string, any>;
  /**
   * The timestamp when the registration was submitted (if it was).
   */
  registrationAt?: epochISOString;
  /**
   * The spot assigned for the event, if any.
   */
  spot?: string;
  /**
   * The URI to the proof of payment, if it has been uploaded.
   */
  proofOfPaymentURI?: string;
  /**
   * Whether the participation and the payment of the user have been confirmed.
   */
  confirmedAt?: string;

  load(x: any): void {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString(), new Date().toISOString());
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

    this.registrationForm = x.registrationForm ?? {};
    if (x.registrationAt) this.registrationAt = this.clean(x.registrationAt, t => new Date(t).toISOString());
    if (x.spot) this.spot = this.clean(x.spot, String);
    if (x.proofOfPaymentURI) this.proofOfPaymentURI = this.clean(x.proofOfPaymentURI, String);
    if (x.confirmedAt) this.confirmedAt = this.clean(x.confirmedAt, d => new Date(d).toISOString());
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.userId = safeData.userId;
    this.createdAt = safeData.createdAt;
    this.lastSeenAt = new Date().toISOString();
    this.authService = safeData.authService;

    if (this.authService === AuthServices.ESN_ACCOUNTS) {
      this.sectionCode = safeData.sectionCode;
      this.sectionCountry = safeData.sectionCountry;
      this.sectionName = safeData.sectionName;
    }

    this.role = safeData.role;

    if (safeData.registrationForm) this.registrationForm = safeData.registrationForm;
    if (safeData.registrationAt) this.registrationAt = safeData.registrationAt;
    if (safeData.spot) this.spot = safeData.spot;
    if (safeData.proofOfPaymentURI) this.proofOfPaymentURI = safeData.proofOfPaymentURI;
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
   * @todo TBD
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

  /**
   * Whether the user is considered an external guest.
   */
  isExternal(): boolean {
    return this.authService !== AuthServices.ESN_ACCOUNTS;
  }
}

/**
 * The authentication services for the platform.
 */
export enum AuthServices {
  ESN_ACCOUNTS = 'EA', // aka Galaxy
  COGNITO = 'CO'
}

/**
 * The possible roles for the user.
 * @todo TBD
 */
export enum Roles {
  NONE = 0,
  DELEGATION_LEADER = 10,
  STAFF = 20,
  OC = 30,
  CT = 40,
  IB = 50,
  ADMIN = 60
}
