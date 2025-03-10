import { isEmpty, Resource } from 'idea-toolbox';

import { RoomLinked } from './room.model';
import { SpeakerLinked } from './speaker.model';

/**
 * YYYY-MM-DDTHH:MM, without timezone.
 */
type datetime = string;

/**
 * The max number of stars you can give to a session.
 */
const MAX_RATING = 5;

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
  speakers: SpeakerLinked[];
  /**
   * The number of participants currently registered
   */
  numberOfParticipants: number;
  /**
   * The limit of participants for this session.
   */
  limitOfParticipants: number;
  /**
   * Wether the sessions requires registration.
   */
  requiresRegistration: boolean;
  /**
   * The counts of each star rating given to the session as feedback.
   * Indices 0-4 correspond to 1-5 star ratings.
   */
  feedbackResults?: number[];
  /**
   * A list of feedback comments from the participants.
   */
  feedbackComments?: string[];

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
    this.requiresRegistration = this.type !== SessionType.COMMON;
    if (this.requiresRegistration) {
      this.numberOfParticipants = this.clean(x.numberOfParticipants, Number, 0);
      this.limitOfParticipants = this.clean(x.limitOfParticipants, Number);
    }
    this.feedbackResults = [];
    for (let i = 0; i < MAX_RATING; i++)
      this.feedbackResults[i] = x.feedbackResults ? Number(x.feedbackResults[i] ?? 0) : 0;
    this.feedbackComments = this.cleanArray(x.feedbackComments, String);
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
    if (this.requiresRegistration && !this.limitOfParticipants) e.push('limitOfParticipants');
    return e;
  }

  // @todo add a method to check if a user/speaker is in the session or not

  calcDatetimeWithoutTimezone(dateToFormat: Date | string | number, bufferInMinutes = 0): datetime {
    const date = new Date(dateToFormat);
    return new Date(
      date.getTime() -
        this.convertMinutesToMilliseconds(date.getTimezoneOffset()) +
        this.convertMinutesToMilliseconds(bufferInMinutes)
    )
      .toISOString()
      .slice(0, 16);
  }

  convertMinutesToMilliseconds(minutes: number) {
    return minutes * 60 * 1000;
  }

  isFull(): boolean {
    return this.requiresRegistration ? this.numberOfParticipants >= this.limitOfParticipants : false;
  }

  getSpeakers(): string {
    return this.speakers.map(s => s.name).join(', ');
  }

  /**
   * Return an exportable flat version of the resource.
   */
  exportFlat(): SessionFlat {
    return new SessionFlat(this);
  }

  /**
   * Import a flat structure and set the internal attributes accordingly.
   */
  importFlat(x: SessionFlat): void {
    this.sessionId = x['Session ID'];
    this.code = x['Session Code'];
    this.name = x['Session Name'];
    this.description = x['Description'];
    this.type = x['Session Type'];
    this.startsAt = this.calcDatetimeWithoutTimezone(x['Starts At']);
    this.endsAt = this.calcDatetimeWithoutTimezone(x['Ends At']);
    this.durationMinutes = x['Duration (m)'];
    this.room = new RoomLinked({ roomId: x['Room Id'] });
    this.speakers = x['Speaker Ids'].split(',').map(speakerId => new SpeakerLinked({ speakerId }));
    this.numberOfParticipants = x['Nr. of Participants'];
    this.limitOfParticipants = x['Limit of Participants'];
    this.requiresRegistration = !!x['Requires Registration'];
  }
}

/**
 * A flat version of the resource, useful for exports.
 */
export class SessionFlat {
  sessionId: string;
  code: string;
  name: string;
  description: string;
  type: SessionType;
  startsAt: datetime;
  endsAt: datetime;
  durationMinutes: number;
  room: RoomLinked;
  speakers: SpeakerLinked[];
  numberOfParticipants: number;
  limitOfParticipants: number;
  requiresRegistration: boolean;

  'Session ID': string;
  'Session Code': string;
  'Session Name': string;
  'Description': string;
  'Session Type': SessionType;
  'Starts At': datetime;
  'Ends At': datetime;
  'Duration (m)': number;
  'Room Id': string;
  'Speaker Ids': string;
  'Nr. of Participants': number;
  'Limit of Participants': number;
  'Requires Registration': boolean;

  constructor(x?: Session) {
    x = x || ({} as any);
    this['Session ID'] = x.sessionId;
    this['Session Code'] = x.code;
    this['Session Name'] = x.name;
    this['Description'] = x.description;
    this['Session Type'] = x.type;
    this['Starts At'] = x.startsAt;
    this['Ends At'] = x.endsAt;
    this['Duration (m)'] = x.durationMinutes;
    this['Room Id'] = x.room?.roomId;
    this['Speaker Ids'] = x.speakers?.map(s => s.speakerId).join(',');
    this['Nr. of Participants'] = x.numberOfParticipants;
    this['Limit of Participants'] = x.limitOfParticipants;
    this['Requires Registration'] = x.requiresRegistration;
  }
}

export enum SessionType {
  DISCUSSION = 'DISCUSSION',
  TALK = 'TALK',
  IGNITE = 'IGNITE',
  CAMPFIRE = 'CAMPFIRE',
  INCUBATOR = 'INCUBATOR',
  HUB = 'HUB',
  COMMON = 'COMMON'
}
