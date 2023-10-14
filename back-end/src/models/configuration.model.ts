import { CustomBlockMeta, Languages, Resource } from 'idea-toolbox';

import { ServiceLanguages } from './serviceLanguages.enum';

export const LANGUAGES = new Languages({ default: ServiceLanguages.English, available: [ServiceLanguages.English] });

export class Configuration extends Resource {
  static PK = 'EGM';

  /**
   * A fixed primary key.
   */
  PK: string;
  /**
   * Whether the registrations are open.
   */
  isRegistrationOpen: boolean;
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

  load(x: any): void {
    super.load(x);
    this.PK = Configuration.PK;
    this.isRegistrationOpen = this.clean(x.isRegistrationOpen, Boolean);
    this.registrationFormDef = new CustomBlockMeta(x.registrationFormDef, LANGUAGES);
    this.currency = this.clean(x.currency, String);
    this.spotTypes = this.cleanArray(x.spotTypes, String);
    this.pricePerSpotTypes = {};
    if (x.pricePerSpotTypes)
      this.spotTypes.forEach(st => (this.pricePerSpotTypes[st] = this.clean(x.pricePerSpotTypes[st], Number)));
    this.spotTypes = this.cleanArray(x.spotTypes, String);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.PK = safeData.PK;
  }

  validate(): string[] {
    const e = super.validate();
    this.registrationFormDef.validate(LANGUAGES).forEach(ea => e.push(`registrationFormDef.${ea}`));
    return e;
  }

  /**
   * Load a registration form to use in the UI.
   */
  loadRegistrationForm(registrationDef: CustomBlockMeta, existingForm?: any): CustomBlockMeta {
    return existingForm ? registrationDef.loadSections(existingForm) : registrationDef.setSectionsDefaultValues();
  }
}