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
   * Section code in ESN Accounts.
   */
  roles: string[];
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
  /**
   * Whether the user is administrator, based on the platform's configurations.
   * A change in this permission will require a new sign-in to take full place.
   */
  isAdministrator: boolean;

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
    this.roles = this.cleanArray(x.roles, String);
    this.sectionCode = this.clean(x.sectionCode, String);
    this.section = this.clean(x.section, String);
    this.country = this.clean(x.country, String);
    this.avatarURL = this.clean(x.avatarURL, String);
    this.isExternal = this.clean(x.isExternal, Boolean);
    this.isAdministrator = this.clean(x.isAdministrator, Boolean);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.userId = safeData.userId;
    this.email = safeData.email;
    this.roles = safeData.roles;
    this.sectionCode = safeData.sectionCode;
    this.section = safeData.section;
    this.country = safeData.country;
    this.isExternal = safeData.isExternal;
    this.isAdministrator = safeData.isAdministrator;
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

  /**
   * Get a string representing the ESN Section and Country of the subject.
   * @todo to solve a known error from ESN Accounts: the Country isn't returned correctly.
   */
  getSectionCountry(): string {
    if (this.country === this.section) return this.section;
    return [this.country, this.section].filter(x => x).join(' - ');
  }
}
