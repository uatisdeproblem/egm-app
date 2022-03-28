import { isEmpty, Resource } from 'idea-toolbox';

import { SpeakerLinked } from './speaker';
import { VenueLinked } from './venue';

/**
 * YYYY-MM-DDTHH:MM, without timezone.
 */
type datetime = string;

export class Session extends Resource {
  sessionId: string;
  code: string;
  name: string;
  description: string;
  type: SessionType;
  startsAt: datetime;
  durationMinutes: number;
  endsAt: datetime;
  venue: VenueLinked;
  speaker1: SpeakerLinked;
  speaker2: SpeakerLinked;
  speaker3: SpeakerLinked;
  speaker4: SpeakerLinked;
  speaker5: SpeakerLinked;

  load(x: any): void {
    super.load(x);
    this.sessionId = this.clean(x.sessionId, String);
    this.code = this.clean(x.code, String);
    this.name = this.clean(x.name, String);
    this.description = this.clean(x.description, String);
    this.type = this.clean(x.type, String) as SessionType;
    this.startsAt = this.clean(x.startsAt, t => this.calcDatetimeWithoutTimezone(t));
    this.durationMinutes = this.clean(x.durationMinutes, Number);
    const endsAt = new Date(this.startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + this.durationMinutes);
    this.endsAt = this.calcDatetimeWithoutTimezone(endsAt);
    this.venue = typeof x.venue === 'string' ? new VenueLinked({ venueId: x.venue }) : new VenueLinked(x.venue);
    this.speaker1 =
      typeof x.speaker1 === 'string' ? new SpeakerLinked({ speakerId: x.speaker1 }) : new SpeakerLinked(x.speaker1);
    this.speaker2 =
      typeof x.speaker2 === 'string' ? new SpeakerLinked({ speakerId: x.speaker2 }) : new SpeakerLinked(x.speaker2);
    this.speaker3 =
      typeof x.speaker3 === 'string' ? new SpeakerLinked({ speakerId: x.speaker3 }) : new SpeakerLinked(x.speaker3);
    this.speaker4 =
      typeof x.speaker4 === 'string' ? new SpeakerLinked({ speakerId: x.speaker4 }) : new SpeakerLinked(x.speaker4);
    this.speaker5 =
      typeof x.speaker5 === 'string' ? new SpeakerLinked({ speakerId: x.speaker5 }) : new SpeakerLinked(x.speaker5);
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
    if (isEmpty(this.durationMinutes)) e.push('durationMinutes');
    if (!this.venue.venueId) e.push('venue');
    if (!this.speaker1.speakerId) e.push('speaker1');
    return e;
  }

  calcDatetimeWithoutTimezone(dateToFormat: Date | string | number): datetime {
    const date = new Date(dateToFormat);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
}

export enum SessionType {
  KEYNOTE = 'KEYNOTE',
  WORKSHOP = 'WORKSHOP',
  TALK = 'TALK',
  QA = 'QA',
  DISCUSSION = 'DISCUSSION',
  IGNITE = 'IGNITE',
  CAMPFIRE = 'CAMPFIRE',
  LAB = 'LAB',
  KNOWLEDGE_EXCHANGE = 'KNOWLEDGE_EXCHANGE',
  PROJECT = 'PROJECT',
  POSTER = 'POSTER'
}
