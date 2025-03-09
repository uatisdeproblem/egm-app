import { isEmpty, Resource } from 'idea-toolbox';

import { OrganizationLinked } from './organization.model';
import { SocialMedia } from './user.model';

export class Speaker extends Resource {
  /**
   * The speaker ID.
   */
  speakerId: string;
  /**
   * The name of the speaker.
   */
  name: string;
  /**
   * The URI for the speaker's profile picture.
   */
  imageURI: string;
  /**
   * The title of the speaker.
   */
  title: string;
  /**
   * A description of the speaker.
   */
  description: string;
  /**
   * The speaker's contact email.
   */
  contactEmail: string;
  /**
   * The speaker's organization.
   */
  organization: OrganizationLinked;
  /**
   * The speaker's social media links, if any.
   */
  socialMedia: SocialMedia;

  static getRole(speaker: Speaker | SpeakerLinked): string {
    return speaker.organization.name || speaker.title
      ? [speaker.organization.name, speaker.title].filter(x => x).join(', ')
      : '';
  }

  load(x: any): void {
    super.load(x);
    this.speakerId = this.clean(x.speakerId, String);
    this.name = this.clean(x.name, String);
    this.imageURI = this.clean(x.imageURI, String);
    this.title = this.clean(x.title, String);
    this.description = this.clean(x.description, String);
    this.contactEmail = this.clean(x.contactEmail, String);
    this.organization =
      typeof x.organization === 'string'
        ? new OrganizationLinked({ organizationId: x.organization })
        : new OrganizationLinked(x.organization);
    this.socialMedia = {};
    if (x.socialMedia?.instagram) this.socialMedia.instagram = this.clean(x.socialMedia.instagram, String);
    if (x.socialMedia?.linkedIn) this.socialMedia.linkedIn = this.clean(x.socialMedia.linkedIn, String);
    if (x.socialMedia?.twitter) this.socialMedia.twitter = this.clean(x.socialMedia.twitter, String);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.speakerId = safeData.speakerId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (!this.organization.organizationId) e.push('organization');
    return e;
  }

  /**
   * Return an exportable flat version of the resource.
   */
  exportFlat(): SpeakerFlat {
    return new SpeakerFlat(this);
  }

  /**
   * Import a flat structure and set the internal attributes accordingly.
   */
  importFlat(x: SpeakerFlat): void {
    this.speakerId = x['Speaker ID'];
    this.name = x['Speaker name'];
    this.organization = new OrganizationLinked({ organizationId: x['Organization ID'] });
    this.description = x['Description'];
    this.title = x['Title'];
    this.contactEmail = x['Contact Email'];
  }
}

export class SpeakerLinked extends Resource {
  speakerId: string;
  name: string;
  title: string;
  organization: OrganizationLinked;

  load(x: any): void {
    super.load(x);
    this.speakerId = this.clean(x.speakerId, String);
    this.name = this.clean(x.name, String);
    this.title = this.clean(x.title, String);
    this.organization = new OrganizationLinked(x.organization);
  }
}

/**
 * A flat version of the resource, useful for exports.
 */
export class SpeakerFlat {
  'Speaker ID': string;
  'Speaker name': string;
  'Organization ID': string;
  'Description': string;
  'Title': string;
  'Contact Email': string;

  constructor(x?: Speaker) {
    x = x || ({} as any);
    this['Speaker ID'] = x.speakerId;
    this['Speaker name'] = x.name;
    this['Organization ID'] = x.organization.organizationId;
    this['Description'] = x.description;
    this['Title'] = x.title;
    this['Contact Email'] = x.contactEmail;
  }
}
