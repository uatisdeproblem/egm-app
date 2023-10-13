import { Address, Resource } from 'idea-toolbox';

export class Registration extends Resource {
  /**
   * The registration ID. It is equal to the user's ID.
   */
  registrationId: string;
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
   */
  country: string;
  /**
   * The user's identity number or passport.
   */
  passportOrId: string;
  /**
   * The user's name.
   */
  name: string;
  /**
   * The user's email.
   */
  email: string;
  /**
   * The user's phone number.
   */
  phoneNr: string;
  /**
   * The user's personal address.
   */
  personalAddress: Address;
  /**
   * The user's ESNcard number, if not external.
   */
  esnCardNumber: string;
  /**
   * The user's invoice address.
   */
  invoiceAddress: Address;
  /**
   * Wether the user requires an invitation letter.
   */
  needsInvitationLetter: boolean;
  /**
   * The user's food restrictions, if any.
   */
  foodRestrictions: string;
  /**
   * The user's emergency contact.
   */
  emergencyContact: EmergencyContact;
  /**
   * The user's access needs.
   */
  accessNeeds: string;
  /**
   * The user's pronouns.
   */
  pronouns: string;
  /**
   * The user's t-shirt size.
   */
  tShirtSize: TShirtSizes;
  /**
   * Wether the user has agrred with the Code of Conduct.
   */
  agreesWithCoC: boolean; // @todo we need this file from Adel
  /**
   * Wether the user has agreed with the Terms and Conditions
   */
  agreesWithTC: boolean; // @todo we need this file from Adel
  /**
   * Wether the registration has been submitted.
   */
  submitted: boolean;
  /**
   * The current registration status. If not submitted, will be null.
   */
  status: RegistrationStatus;

  load(x: any): void {
    super.load(x);
    this.registrationId = this.clean(x.registrationId, String);
    this.passportOrId = this.clean(x.passportOrId, String);
    this.name = this.clean(x.name, String);
    this.sectionCode = this.clean(x.sectionCode, String);
    this.section = this.clean(x.section, String);
    this.country = this.clean(x.country, String);
    this.email = this.clean(x.email, String);
    this.phoneNr = this.clean(x.phoneNr, String);
    this.esnCardNumber = this.clean(x.esnCardNumber, String);
    this.personalAddress = new Address(x.personalAddress);
    this.invoiceAddress = new Address(x.invoiceAddress);
    this.needsInvitationLetter = this.clean(x.needsInvitationLetter, Boolean, false);
    this.foodRestrictions = this.clean(x.foodRestrictions, String);
    this.emergencyContact = new EmergencyContact(x.emergencyContact);
    this.accessNeeds = this.clean(x.accessNeeds, String);
    this.pronouns = this.clean(x.pronouns, String);
    this.tShirtSize = this.clean(x.tShirtSize, String);
    this.agreesWithCoC = this.clean(x.agreesWithCoC, Boolean, false);
    this.agreesWithTC = this.clean(x.agreesWithTC, Boolean, false);
    this.submitted = this.clean(x.submitted, Boolean, false);
    if (this.submitted) this.status = this.clean(x.status, Number);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.registrationId = safeData.registrationId;
    this.submitted = safeData.submitted;
    this.status = safeData.status;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.registrationId)) e.push('registrationId');
    if (this.iE(this.passportOrId)) e.push('passportOrId');
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.email)) e.push('email');
    if (this.iE(this.phoneNr)) e.push('phoneNr');
    this.personalAddress.validate().forEach(ea => e.push(`personalAddress.${ea}`));
    this.invoiceAddress.validate().forEach(ea => e.push(`invoiceAddress.${ea}`));
    this.emergencyContact.validate().forEach(ea => e.push(`emergencyContact.${ea}`));
    if (this.iE(this.foodRestrictions)) e.push('accessfoodRestrictionsNeeds');
    if (this.iE(this.accessNeeds)) e.push('accessNeeds');
    if (this.iE(this.pronouns)) e.push('pronouns');
    if (!this.agreesWithCoC) e.push('agreesWithCoC');
    if (!this.agreesWithTC) e.push('agreesWithTC');
    return e;
  }
}
export class EmergencyContact extends Resource {
  name: string;
  relationship: string;
  phoneNr: string;
  nationality: string;

  load(x: any): void {
    super.load(x);
    this.name = this.clean(x.name, String);
    this.relationship = this.clean(x.relationship, String);
    this.phoneNr = this.clean(x.phoneNr, String);
    this.nationality = this.clean(x.nationality, String);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.relationship)) e.push('relationship');
    if (this.iE(this.phoneNr)) e.push('phoneNr');
    if (this.iE(this.nationality)) e.push('nationality');
    return e;
  }
}

// @todo check this
export enum CommonFoodRestrictions {
  'Lactose',
  'Dairy',
  'Gluten',
  'Vegetarian',
  'Vegan',
  'Kosher',
  'Halal'
}

export enum RegistrationStatus {
  CANCELLED = 0,
  AWAITING_APPROVAL = 10,
  APPROVED = 20
}

export enum TShirtSizes {
  XS,
  S,
  M,
  L,
  XL,
  XXL,
  XXXL
}
