import { epochISOString, isEmpty, Resource } from 'idea-toolbox';

import { SpeakerLinked } from './speaker';
import { VenueLinked } from './venue';

export class Session extends Resource {
  sessionId: string;
  code: string;
  name: string;
  description: string;
  type: SessionType;
  startsAt: epochISOString;
  endsAt: epochISOString;
  venue: VenueLinked;
  speaker1: SpeakerLinked;
  speaker2: SpeakerLinked;
  speaker3: SpeakerLinked;

  load(x: any): void {
    super.load(x);
    this.sessionId = this.clean(x.sessionId, String);
    this.code = this.clean(x.code, String);
    this.name = this.clean(x.name, String);
    this.description = this.clean(x.description, String);
    this.type = this.clean(x.type, String) as SessionType;
    this.startsAt = this.clean(x.startsAt, String) as epochISOString;
    this.endsAt = this.clean(x.endsAt, String) as epochISOString;
    this.venue = typeof x.venue === 'string' ? new VenueLinked({ venueId: x.venue }) : new VenueLinked(x.venue);
    this.speaker1 =
      typeof x.speaker1 === 'string' ? new SpeakerLinked({ speakerId: x.speaker1 }) : new SpeakerLinked(x.speaker1);
    this.speaker2 =
      typeof x.speaker2 === 'string' ? new SpeakerLinked({ speakerId: x.speaker2 }) : new SpeakerLinked(x.speaker2);
    this.speaker3 =
      typeof x.speaker3 === 'string' ? new SpeakerLinked({ speakerId: x.speaker3 }) : new SpeakerLinked(x.speaker3);
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
    if (!this.speaker1.speakerId) e.push('speaker1');
    return e;
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
