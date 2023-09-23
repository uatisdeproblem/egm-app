import { Resource } from 'idea-toolbox';

export class UserProfile extends Resource {
  /**
   * Username in ESN Accounts (lowercase).
   */
  userId: string;
  /**
   * Email address.
   */
  email: string;
  /**
   * The name.
   */
  name: string;
  /**
   * The users role.
   */
  role: Roles;
  /**
   * Section code in ESN Accounts.
   */
  sectionCode: string;
  /**
   * ESN Section.
   */
  section: string;
  /**
   * ESN Country.
   * @todo there's a known error from ESN Accounts: here is returned the Section and not the Country.
   */
  country: string;
  /**
   * The URL to the user's avatar.
   */
  avatarURL: string;
  /**
   * Whether the user is from outside ESN.
   */
  isExternal: boolean;

  load(x: any): void {
    super.load(x);
    this.userId = this.clean(x.userId, String)?.toLowerCase();
    this.email = this.clean(x.email, String);
    if (x.name) this.name = this.clean(x.name, String);
    else {
      const firstName = this.clean(x.firstName, String);
      const lastName = this.clean(x.lastName, String);
      this.name = `${firstName} ${lastName}`.trim();
    }
    this.role = this.clean(x.role, Number, Roles.NONE);
    this.sectionCode = this.clean(x.sectionCode, String);
    this.section = this.clean(x.section, String);
    this.country = this.clean(x.country, String);
    this.avatarURL = this.clean(x.avatarURL, String);
    this.isExternal = this.clean(x.isExternal, Boolean);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.userId = safeData.userId;
    this.email = safeData.email;
    this.role = safeData.role;
    this.sectionCode = safeData.sectionCode;
    this.section = safeData.section;
    this.country = safeData.country;
    this.isExternal = safeData.isExternal;
    if (!safeData.isExternal) {
      this.name = safeData.name; // externals can change their name // @todo verify and check if anyhting msising
    }
  }

  // @todo add all fields here
  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.userId)) e.push('userId');
    return e;
  }

  isAdmin(): boolean {
    return this.role >= Roles.ADMIN;
  }

  /**
   * Get a string representing the ESN Section and Country of the subject.
   * @todo to solve a known error from ESN Accounts: the Country isn't returned correctly.
   */
  getSectionCountry(): string {
    if (this.country === this.section) return this.section;
    return [this.country, this.section].filter(x => x).join(' - ');
  }
}

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
