import { isEmpty, Resource } from 'idea-toolbox';

import { RoomLinked } from './room.model';
import { SpeakerLinked } from './speaker.model';

/**
 * YYYY-MM-DDTHH:MM, without timezone. // @todo do we need this?
 */
type datetime = string;

export class Session extends Resource {
  /**
   * The session ID.
   */
  sessionId: string;
  /**
   * The session's code.
   */
  code: string;
  /**
   * The session's name.
   */
  name: string;
  /**
   * The session's description.
   */
  description: string;
  /**
   * The type of session.
   */
  type: SessionType;
  /**
   * The session's start date.
   */
  startsAt: datetime;
  /**
   * The session's end date.
   */
  endsAt: datetime;
  /**
   * The session's duration in minutes.
   */
  durationMinutes: number;
  /**
   * The room where the session will take place.
   */
  room: RoomLinked;
  /**
   * The session's speakrs.
   */
  speakers: SpeakerLinked[]; // @todo we changed this to a single array. Check consequences
  /**
   * The number of participants currently registered
   */
  numberOfParticipants: number; // @todo should this be calculated?
  /**
   * The limit of participants for this session.
   */
  limitOfParticipants: number;
  /**
   * Wether the sessions requires registration.
   */
  requiresRegistration: boolean;

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
    this.room = typeof x.room === 'string' ? new RoomLinked({ roomId: x.room }) : new RoomLinked(x.room);
    this.speakers = this.cleanArray(x.speakers, x => new SpeakerLinked(x));
    this.numberOfParticipants = this.clean(x.numberOfParticipants, Number, 0);
    this.limitOfParticipants = this.clean(x.limitOfParticipants, Number);
    this.requiresRegistration = Object.keys(IndividualSessionType).includes(this.type);
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
    if (!this.room.roomId) e.push('room');
    if (!this.speakers?.length) e.push('speakers');
    return e;
  }

  // @todo add a method to check if a user/speaker is in the session or not

  calcDatetimeWithoutTimezone(dateToFormat: Date | string | number): datetime {
    const date = new Date(dateToFormat);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  isFull(): boolean {
    return this.numberOfParticipants >= this.limitOfParticipants;
  }
}

// @todo don't have three enums...
// @todo check if any is missing or we need to add.
export enum CommonSessionType {
  OPENING = 'OPENING',
  KEYNOTE = 'KEYNOTE',
  MORNING = 'MORNING',
  POSTER = 'POSTER',
  EXPO = 'EXPO',
  CANDIDATES = 'CANDIDATES',
  HARVESTING = 'HARVESTING',
  CLOSING = 'CLOSING',
  OTHER = 'OTHER'
}

export enum IndividualSessionType {
  DISCUSSION = 'DISCUSSION',
  TALK = 'TALK',
  IGNITE = 'IGNITE',
  CAMPFIRE = 'CAMPFIRE',
  IDEAS = 'IDEAS',
  INCUBATOR = 'INCUBATOR'
}

export enum SessionType {
  OPENING = 'OPENING',
  KEYNOTE = 'KEYNOTE',
  MORNING = 'MORNING',
  POSTER = 'POSTER',
  EXPO = 'EXPO',
  CANDIDATES = 'CANDIDATES',
  HARVESTING = 'HARVESTING',
  CLOSING = 'CLOSING',
  DISCUSSION = 'DISCUSSION',
  TALK = 'TALK',
  IGNITE = 'IGNITE',
  CAMPFIRE = 'CAMPFIRE',
  IDEAS = 'IDEAS',
  INCUBATOR = 'INCUBATOR',
  OTHER = 'OTHER'
}
