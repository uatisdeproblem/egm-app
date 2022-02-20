import { isEmpty, Resource } from 'idea-toolbox';

export class UserProfile extends Resource {
  userId: string;
  firstName: string;
  lastName: string;
  imageURI: string;
  languages: string[];
  fieldOfExpertise: string;
  hasUploadedCV: boolean;
  ESNCountry: string;
  ESNSection: string;
  contactEmail: string;
  contactPhone: string;
  bio: string;
  openToJob: boolean;

  load(x: any): void {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.firstName = this.clean(x.firstName, String);
    this.lastName = this.clean(x.lastName, String);
    this.imageURI = this.clean(x.imageURI, String);
    this.languages = this.cleanArray(x.languages, String);
    this.fieldOfExpertise = this.clean(x.fieldOfExpertise, String);
    this.hasUploadedCV = this.clean(x.hasUploadedCV, Boolean);
    this.ESNCountry = this.clean(x.ESNCountry, String);
    this.ESNSection = this.clean(x.ESNSection, String);
    this.contactEmail = this.clean(x.contactEmail, String);
    this.contactPhone = this.clean(x.contactPhone, String);
    this.bio = this.clean(x.bio, String);
    this.openToJob = this.clean(x.openToJob, Boolean);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.userId = safeData.userId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.firstName)) e.push('firstName');
    if (isEmpty(this.lastName)) e.push('lastName');
    return e;
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
