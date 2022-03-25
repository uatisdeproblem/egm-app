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

  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  linkedin: string;

  homeAddress: string;
  homeLongitude: number;
  homeLatitude: number;

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

    this.facebook = this.clean(x.facebook, String);
    this.instagram = this.clean(x.instagram, String);
    this.twitter = this.clean(x.twitter, String);
    this.tiktok = this.clean(x.tiktok, String);
    this.linkedin = this.clean(x.linkedin, String);

    this.homeAddress = this.clean(x.homeAddress, String);
    this.homeLongitude = this.clean(x.homeLongitude, Number);
    this.homeLatitude = this.clean(x.homeLatitude, Number);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.userId = safeData.userId;

    this.homeAddress = safeData.homeAddress;
    this.homeLongitude = safeData.homeLongitude;
    this.homeLatitude = safeData.homeLatitude;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.firstName)) e.push('firstName');
    if (isEmpty(this.lastName)) e.push('lastName');
    if (isEmpty(this.contactEmail, 'email')) e.push('contactEmail');
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
