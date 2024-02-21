import { isEmpty, Resource } from 'idea-toolbox';

import { OrganizationLinked } from './organization.model';

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
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.speakerId = safeData.speakerId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (this.contactEmail && isEmpty(this.contactEmail, 'email')) e.push('contactEmail');
    if (!this.organization.organizationId) e.push('organization');
    return e;
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
