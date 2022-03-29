///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Session } from '../models/session';
import { SpeakerLinked } from '../models/speaker';
import { RoomLinked } from '../models/room';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  sessions: process.env.DDB_TABLE_sessions,
  rooms: process.env.DDB_TABLE_rooms,
  speakers: process.env.DDB_TABLE_speakers
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Sessions(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Sessions extends ResourceController {
  session: Session;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'sessionId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.resourceId) return;

    try {
      this.session = new Session(
        await ddb.get({ TableName: DDB_TABLES.sessions, Key: { sessionId: this.resourceId } })
      );
    } catch (err) {
      throw new RCError('Session not found');
    }
  }

  protected async getResource(): Promise<Session> {
    return this.session;
  }

  protected async putResource(): Promise<Session> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    const oldResource = new Session(this.session);
    this.session.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Session> {
    const errors = this.session.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    this.session.room = new RoomLinked(
      await ddb.get({ TableName: DDB_TABLES.rooms, Key: { roomId: this.session.room.roomId } })
    );
    this.session.speaker1 = new SpeakerLinked(
      await ddb.get({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.session.speaker1.speakerId } })
    );
    if (this.session.speaker2.speakerId)
      this.session.speaker2 = new SpeakerLinked(
        await ddb.get({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.session.speaker2.speakerId } })
      );
    if (this.session.speaker3.speakerId)
      this.session.speaker3 = new SpeakerLinked(
        await ddb.get({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.session.speaker3.speakerId } })
      );
    if (this.session.speaker4.speakerId)
      this.session.speaker4 = new SpeakerLinked(
        await ddb.get({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.session.speaker4.speakerId } })
      );
    if (this.session.speaker5.speakerId)
      this.session.speaker5 = new SpeakerLinked(
        await ddb.get({ TableName: DDB_TABLES.speakers, Key: { speakerId: this.session.speaker5.speakerId } })
      );

    try {
      const putParams: any = { TableName: DDB_TABLES.sessions, Item: this.session };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(sessionId)';
      await ddb.put(putParams);

      return this.session;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.sessions, Key: { sessionId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  protected async postResources(): Promise<Session> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    this.session = new Session(this.body);
    this.session.sessionId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Session[]> {
    try {
      const sessions = (await ddb.scan({ TableName: DDB_TABLES.sessions })).map((x: Session) => new Session(x));

      const filtertedSessions = sessions.filter(
        x =>
          (!this.queryParams.speaker ||
            [
              x.speaker1.speakerId,
              x.speaker2.speakerId,
              x.speaker3.speakerId,
              x.speaker4.speakerId,
              x.speaker5.speakerId
            ].includes(this.queryParams.speaker)) &&
          (!this.queryParams.room || x.room.roomId === this.queryParams.room)
      );

      const sortedSessions = filtertedSessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

      return sortedSessions;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }
}
