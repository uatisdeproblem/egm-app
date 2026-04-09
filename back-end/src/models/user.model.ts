import { Resource, Suggestion, epochISOString } from 'idea-toolbox';

import { EventSpotAttached } from './eventSpot.model';
import { Speaker } from './speaker.model';
import { ApprovedType, MealTypes } from './meal.model';

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
   * The user's birth date.
   */
  birthDate: epochISOString;
  /**
   * The number of the ESNcard. Must be valid to register for ESNers.
   * Set only for `AuthService.ESN_ACCOUNTS`
   */
  ESNcard?: string;
  /**
   * Timestamp of when the user's ESNcard was manually validated at check-in.
   */
  ESNcardValidatedAt?: epochISOString;
  /**
   * User ID of the staff member who validated the ESNcard at check-in.
   */
  ESNcardValidatedBy?: string;
  /**
   * How the ESNcard was validated at check-in.
   */
  ESNcardValidationMethod?: ESNcardValidationMethod;
  /**
   * Timestamp of when the user was checked in by the OC.
   */
  checkedInAt?: epochISOString;
  /**
   * User ID of the staff member who checked the user in.
   */
  checkedInBy?: string;
  /**
   * The permissions of the user on the app.
   */
  permissions: UserPermissions;
  /**
   * A custom block containing custom sections and fields for the registration form.
   */
  registrationForm: Record<string, any>;
  /**
   * The timestamp when the registration was submitted (if it was).
   * If set, the registration is considered completed.
   */
  registrationAt?: epochISOString;
  /**
   * The spot assigned for the event, if any.
   */
  spot?: EventSpotAttached;
  /**
   * The user's social media links, if any.
   */
  socialMedia: SocialMedia;
  /**
   * The list of contests (IDs) the user voted in.
   */
  votedInContests: string[];
  // @todo add this to registration field.
  /**
   * The user's meal preference.
   */
  mealType: MealTypes;
  /**
   * The user's meal tickets and their status.
   */
  mealTickets: { [mealId: string]: MealTicket };
  /**
   * Whether the user is part of the ESN International.
   */
  isESNInternational: boolean;

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
    this.birthDate = this.clean(x.birthDate, t => new Date(t).toISOString(), new Date().toISOString());

    if (this.authService === AuthServices.ESN_ACCOUNTS) {
      this.sectionCode = this.clean(x.sectionCode, String);
      this.sectionCountry = this.clean(x.sectionCountry, String);
      this.sectionName = this.clean(x.sectionName, String);
      this.ESNcard = this.clean(x.ESNcard, String);
      if (x.ESNcardValidatedAt)
        this.ESNcardValidatedAt = this.clean(x.ESNcardValidatedAt, t => new Date(t).toISOString());
      if (x.ESNcardValidatedBy) this.ESNcardValidatedBy = this.clean(x.ESNcardValidatedBy, String);
      if (x.ESNcardValidationMethod)
        this.ESNcardValidationMethod = this.clean(x.ESNcardValidationMethod, String);
      this.isESNInternational = this.clean(x.isESNInternational, Boolean, false);
    }
    if (x.checkedInAt) this.checkedInAt = this.clean(x.checkedInAt, t => new Date(t).toISOString());
    if (x.checkedInBy) this.checkedInBy = this.clean(x.checkedInBy, String);

    this.permissions = new UserPermissions(x.permissions);

    this.registrationForm = x.registrationForm ?? {};
    if (x.registrationAt) this.registrationAt = this.clean(x.registrationAt, t => new Date(t).toISOString());
    if (x.spot) this.spot = new EventSpotAttached(x.spot);
    this.socialMedia = {};
    if (x.socialMedia?.instagram) this.socialMedia.instagram = this.clean(x.socialMedia.instagram, String);
    if (x.socialMedia?.linkedIn) this.socialMedia.linkedIn = this.clean(x.socialMedia.linkedIn, String);
    if (x.socialMedia?.twitter) this.socialMedia.twitter = this.clean(x.socialMedia.twitter, String);

    this.votedInContests = this.cleanArray(x.votedInContests, String);

    this.mealType = x.mealType;
    if (!x.mealTickets) this.mealTickets = {};
    else this.mealTickets = x.mealTickets;
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
      this.birthDate = safeData.birthDate;
      this.ESNcardValidatedAt = safeData.ESNcardValidatedAt;
      this.ESNcardValidatedBy = safeData.ESNcardValidatedBy;
      this.ESNcardValidationMethod = safeData.ESNcardValidationMethod;
      this.isESNInternational = safeData.isESNInternational;
    }
    this.checkedInAt = safeData.checkedInAt;
    this.checkedInBy = safeData.checkedInBy;

    this.permissions = safeData.permissions;

    if (safeData.registrationForm) this.registrationForm = safeData.registrationForm;
    if (safeData.registrationAt) this.registrationAt = safeData.registrationAt;
    if (safeData.spot) this.spot = safeData.spot;

    this.votedInContests = safeData.votedInContests;
    this.mealType = safeData.mealType;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.firstName)) e.push('firstName');
    if (this.iE(this.lastName)) e.push('lastName');
    if (this.iE(this.email, 'email')) e.push('email');
    if (new Date().getFullYear() - new Date(this.birthDate).getFullYear() < 18) e.push('birthDate');

    return e;
  }

  /**
   * Get the original user ID in the AuthService.
   */
  getAuthServiceUserId(): string {
    return this.userId.slice(this.authService.concat('_').length);
  }

  /**
   * Get the full name of the user.
   */
  getName(): string {
    return `${this.firstName} ${this.lastName}`;
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

  isSpeaker(speaker: Speaker): boolean {
    return speaker.speakerId === this.userId;
  }

  isGalaxyInfoValid(): boolean {
    if (this.isExternal()) return true;
    return this.sectionName !== 'Unknown' && this.sectionCountry !== 'Unknown';
  }

  /**
   * Map the user into a Suggestion data structure.
   */
  mapIntoSuggestion(): Suggestion {
    return new Suggestion({
      value: this.userId,
      name: this.getName(),
      description: this.email,
      category1: this.sectionCountry,
      category2: this.sectionName
    });
  }

  isMealTicketApproved(mealId: string): boolean {
    return !!this.mealTickets?.[mealId]?.approvedAt;
  }

  hasConfirmedSpot(): boolean {
    return !!this.registrationAt && !!this.spot?.paymentConfirmedAt;
  }

  hasValidatedESNcard(): boolean {
    return !!this.ESNcardValidatedAt;
  }

  hasCheckedIn(): boolean {
    return !!this.checkedInAt;
  }
}

/**
 * The authentication services for the platform.
 */
export enum AuthServices {
  ESN_ACCOUNTS = 'EA', // aka Galaxy
  COGNITO = 'CO'
}

export enum ESNcardValidationMethod {
  SCAN = 'scan',
  MANUAL = 'manual'
}

/**
 * The permissions a user can have.
 */
export class UserPermissions {
  /**
   * Whether the user can manage spots assigned to their ESN country.
   */
  isCountryLeader: boolean;
  /**
   * Whether the user has administrative permissions on the registrations.
   */
  canManageRegistrations: boolean;
  /**
   * Whether the user havs administrative permissions on the contents (speakers, sessions, etc.).
   */
  canManageContents: boolean;
  /**
   * Whether the user has staff permissions.
   */
  isStaff: boolean;
  /**
   * Whether the user has maximum permissions over the app.
   * If this is true, all other permissions are.
   */
  protected _isAdmin: boolean;
  /**
   * Whether the user can manage spots for the ESN International delegation.
   */
  isESNInternationalLeader: boolean;

  get isAdmin(): boolean {
    return this._isAdmin;
  }
  set isAdmin(isAdmin: boolean) {
    this._isAdmin = isAdmin;
    if (isAdmin) {
      this.isCountryLeader = true;
      this.canManageRegistrations = true;
      this.canManageContents = true;
      this.isStaff = true;
      this.isESNInternationalLeader = true;
    }
  }

  constructor(x?: any) {
    x = x || {};
    this.isCountryLeader = Boolean(x.isCountryLeader);
    this.canManageRegistrations = Boolean(x.canManageRegistrations);
    this.canManageContents = Boolean(x.canManageContents);
    this.isStaff = Boolean(x.isStaff);
    this.isESNInternationalLeader = Boolean(x.isESNInternationalLeader);
    // as last, to change any other attribute in case it's `true`
    this.isAdmin = Boolean(x._isAdmin);
  }
}

export class UserFavoriteSession extends Resource {
  userId: string;
  sessionId: string;

  load(x: any): void {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.sessionId = this.clean(x.sessionId, String);
  }
}

export interface SocialMedia {
  instagram?: string;
  linkedIn?: string;
  twitter?: string;
}

export interface MealTicket {
  approvedAt?: epochISOString;
  approvedBy?: string;
  approvedType?: ApprovedType;
}
