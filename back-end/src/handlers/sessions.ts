///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Session } from '../models/session.model';
import { SpeakerLinked } from '../models/speaker.model';
import { RoomLinked } from '../models/room.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
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
  user: User;
  session: Session;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'sessionId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (!this.resourceId) return;

    try {
      this.session = new Session(
        await ddb.get({ TableName: DDB_TABLES.sessions, Key: { sessionId: this.resourceId } })
      );
    } catch (err) {
      throw new HandledError('Session not found');
    }
  }

  protected async getResource(): Promise<Session> {
    return this.session;
  }

  protected async putResource(): Promise<Session> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Session(this.session);
    this.session.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Session> {
    const errors = this.session.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    this.session.room = new RoomLinked(
      await ddb.get({ TableName: DDB_TABLES.rooms, Key: { roomId: this.session.room.roomId } })
    );

    this.session.speakers = (
      await ddb.batchGet(
        DDB_TABLES.speakers,
        this.session.speakers?.map(speakerId => ({ speakerId })),
        true
      )
    ).map(s => new SpeakerLinked(s));

    try {
      const putParams: any = { TableName: DDB_TABLES.sessions, Item: this.session };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(sessionId)';
      await ddb.put(putParams);

      return this.session;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.sessions, Key: { sessionId: this.resourceId } });
    } catch (err) {
      throw new HandledError('Delete failed');
    }
  }

  protected async postResources(): Promise<Session> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.session = new Session(this.body);
    this.session.sessionId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Session[]> {
    try {
      const sessions = (await ddb.scan({ TableName: DDB_TABLES.sessions })).map((x: Session) => new Session(x));

      const filtertedSessions = sessions.filter(
        x =>
          (!this.queryParams.speaker || x.speakers.filter(x => x).includes(this.queryParams.speaker)) &&
          (!this.queryParams.room || x.room.roomId === this.queryParams.room)
      );

      const sortedSessions = filtertedSessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

      return sortedSessions;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }
}
