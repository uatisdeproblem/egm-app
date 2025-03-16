import { CustomBlockMeta, Languages, Resource } from 'idea-toolbox';

import { User } from '../models/user.model';

import { ServiceLanguages } from './serviceLanguages.enum';

export const LANGUAGES = new Languages({ default: ServiceLanguages.English, available: [ServiceLanguages.English] });
const DEFAULT_SESSION_REGISTRATION_BUFFER_MINUTES = 10;

export class Configurations extends Resource {
  static PK = 'EGM';

  /**
   * A fixed primary key.
   */
  PK: string;
  /**
   * Whether the registrations are open for ESNers.
   */
  isRegistrationOpenForESNers: boolean;
  /**
   * Whether externals and guests can register.
   */
  isRegistrationOpenForExternals: boolean;
  /**
   * Whether participants can register for sessions.
   */
  areSessionRegistrationsOpen: boolean;
  /**
   * The minimum amount of time (in minutes) a user must leave open between sessions.
   */
  sessionRegistrationBuffer: number;
  /**
   * Whether the delegation leaders can assign spots.
   */
  canCountryLeadersAssignSpots: boolean;
  /**
   * A custom block containing the definition of custom sections and fields for the registration form.
   */
  registrationFormDef: CustomBlockMeta;
  /**
   * The currency for the event, expressed in three letters (e.g. EUR).
   */
  currency: string;
  /**
   * The possible spot types.
   */
  spotTypes: string[];
  /**
   * The price for each spot type.
   */
  pricePerSpotTypes: Record<string, number>;
  /**
   * The stripe payment link for each spot type, if any.
   */
  stripeLinkPerSpotType: Record<string, string>;
  /**
   * The list of all the current ESN countries.
   */
  sectionCountries: string[];
  /**
   * The minimum number of sessions that a user has to register to per day.
   */
  minLimit: number;
  /**
   * The maximum number of sessions that a user can register to.
   */
  maxLimit: number;
  /**
   * Apply the min & max limits only for Participants role.
   */
  forParticipants: false;
  /**
   * Apply the min & max limits only for Externals role.
   */
  forExternals: false;
  /**
   * Apply the min & max limits only for Speakers role.
   */
  forSpeakers: false;

  load(x: any): void {
    super.load(x);
    this.PK = Configurations.PK;
    this.isRegistrationOpenForESNers = this.clean(x.isRegistrationOpenForESNers, Boolean);
    this.isRegistrationOpenForExternals = this.clean(x.isRegistrationOpenForExternals, Boolean);
    this.areSessionRegistrationsOpen = this.clean(x.areSessionRegistrationsOpen, Boolean);
    this.sessionRegistrationBuffer = this.clean(
      x.sessionRegistrationBuffer,
      Number,
      DEFAULT_SESSION_REGISTRATION_BUFFER_MINUTES
    );
    this.canCountryLeadersAssignSpots = this.clean(x.canCountryLeadersAssignSpots, Boolean);
    this.registrationFormDef = new CustomBlockMeta(x.registrationFormDef, LANGUAGES);
    this.currency = this.clean(x.currency, String);
    this.spotTypes = this.cleanArray(x.spotTypes, String);
    this.pricePerSpotTypes = {};
    this.stripeLinkPerSpotType = {};
    if (x.pricePerSpotTypes)
      this.spotTypes.forEach(st => (this.pricePerSpotTypes[st] = this.clean(x.pricePerSpotTypes[st], Number, 0)));
    if (x.stripeLinkPerSpotType)
      this.spotTypes.forEach(st => (this.stripeLinkPerSpotType[st] = this.clean(x.stripeLinkPerSpotType[st], String)));
    this.sectionCountries = this.cleanArray(x.sectionCountries, String);
    this.minLimit = this.clean(x.minLimit, Number);
    this.maxLimit = this.clean(x.maxLimit, Number);
    this.forParticipants = this.clean(x.forParticipants, Boolean);
    this.forExternals = this.clean(x.forExternals, Boolean);
    this.forSpeakers = this.clean(x.forSpeakers, Boolean);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.PK = safeData.PK;
  }

  validate(): string[] {
    const e = super.validate();
    this.registrationFormDef.validate(LANGUAGES).forEach(ea => e.push(`registrationFormDef.${ea}`));
    if (this.sessionRegistrationBuffer < 0) e.push('sessionRegistrationBuffer')
    return e;
  }

  /**
   * Load a registration form to use in the UI.
   */
  loadRegistrationForm(registrationDef: CustomBlockMeta, existingForm?: any): CustomBlockMeta {
    return existingForm ? registrationDef.loadSections(existingForm) : registrationDef.setSectionsDefaultValues();
  }

  /**
   * Whether registrations are open based on user type
   */
  canUserRegister(user: User): boolean {
    return user.isExternal() ? this.isRegistrationOpenForExternals : this.isRegistrationOpenForESNers;
  }

  /**
   * Returns the payment link associated with the spot type.
   */
  getSpotPaymentLink(spotType: string): string {
    if (!(this.stripeLinkPerSpotType || spotType)) return;
    return this.stripeLinkPerSpotType[spotType];
  }

  /**
   * Returns the price associated with the spot type.
   */
  getSpotPrice(spotType: string): number {
    if (!(this.pricePerSpotTypes || spotType)) return;
    return this.pricePerSpotTypes[spotType];
  }

  /**
   * Returns the minimum limit for sessions per day.
   */
  getMinLimit(): number {
    if(this.minLimit) return this.minLimit;
  }

  /**
   * Returns the maximum limit for sessions.
   */
  getMaxLimit(): number {
    if(this.maxLimit) return this.maxLimit;
  }
}

/**
 * The types of email templates available.
 */
export enum EmailTemplates {
  SPOT_ASSIGNED = 'spot-assigned',
  REGISTRATION_CONFIRMED = 'registration-confirmed',
  SPOT_TRANSFERRED = 'spot-transferred',
  SPOT_RELEASED = 'spot-released'
}

/**
 * The types of document templates available.
 */
export enum DocumentTemplates {
  INVOICE = 'INVOICE'
}
