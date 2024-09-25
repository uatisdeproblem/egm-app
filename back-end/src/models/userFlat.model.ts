import { AuthServices, User } from './user.model';
import { Configurations } from './configurations.model';

/**
 * A flat version of a User's data, useful for exports.
 */
export class UserFlat {
  'User ID': string;
  'Type': string;
  'First name': string;
  'Last name': string;
  'Email address': string;
  'Gender': string;
  'Birth Date': string;
  'Section Code': string;
  'Section Country': string;
  'Section Name': string;
  'Registered at': string;
  'Spot type': string;
  'Spot paid': boolean;
  'Spot confirmed': boolean;

  [__registrationForm: string]: any;

  constructor(x?: User) {
    x = x ?? ({} as any);
    this['User ID'] = x.userId;
    this['Type'] = x.authService === AuthServices.ESN_ACCOUNTS ? 'ESNer' : 'Guest';
    this['First name'] = x.firstName;
    this['Last name'] = x.lastName;
    this['Email address'] = x.email;
    this['Gender'] = x.gender ?? '';
    this['Birth Date'] = x.birthDate ?? '';
    this['Section Code'] = x.sectionCode ?? '';
    this['Section Country'] = x.sectionCountry ?? '';
    this['Section Name'] = x.sectionName ?? '';
    this['Registered at'] = x.registrationAt ?? '';
    this['Spot type'] = x.spot?.type ?? '';
    this['Spot paid'] = !!x.spot?.proofOfPaymentURI;
    this['Spot confirmed'] = !!x.spot?.paymentConfirmedAt;
  }
}

export class UserFlatWithRegistration extends UserFlat {
  [__registrationForm: string]: any;

  constructor(x?: User, configurations?: Configurations, language?: string) {
    x = x ?? ({} as any);

    super(x);

    if (configurations && language) {
      const fields = configurations.registrationFormDef.loadSections(x.registrationForm);
      for (const sectionId of configurations.registrationFormDef.sectionsLegend) {
        const section = configurations.registrationFormDef.sections[sectionId];
        const sectionName = section.name[language];
        for (const fieldId of section.fieldsLegend) {
          const fieldName = section.fields[fieldId].name[language];
          this[`Form > ${sectionName} > ${fieldName}`] = fields[sectionId][fieldId];
        }
      }
    }
  }
}
