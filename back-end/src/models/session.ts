import { epochISOString, isEmpty, Resource } from 'idea-toolbox';

import { SpeakerLinked } from './speaker';
import { VenueLinked } from './venue';

export class Session extends Resource {
  sessionId: string;
  name: string;
  description: string;
  type: SessionType;
  startsAt: epochISOString;
  endsAt: epochISOString;
  venue: VenueLinked;
  speakers: SpeakerLinked[];

  load(x: any): void {
    super.load(x);
    this.sessionId = this.clean(x.sessionId, String);
    this.name = this.clean(x.name, String);
    this.description = this.clean(x.description, String);
    this.type = this.clean(x.type, String) as SessionType;
    this.startsAt = this.clean(x.startsAt, String) as epochISOString;
    this.endsAt = this.clean(x.endsAt, String) as epochISOString;
    this.venue = new VenueLinked(x.venue);
    this.speakers = this.cleanArray(x.speakers, s => new SpeakerLinked(s));
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.sessionId = safeData.sessionId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (!Object.keys(SessionType).includes(this.type)) e.push('type');
    if (isEmpty(this.startsAt, 'date')) e.push('startsAt');
    if (isEmpty(this.endsAt, 'date')) e.push('endsAt');
    if (!this.venue.venueId) e.push('venue');
    return e;
  }
}

export enum SessionType {
  PARTNER = 'PARTNER',
  WORKSHOP = 'WORKSHOP',
  SMALL_SESSION = 'SMALL_SESSION',
  KEYNOTE = 'KEYNOTE'
}
