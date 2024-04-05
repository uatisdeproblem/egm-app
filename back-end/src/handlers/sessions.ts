///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Session } from '../models/session.model';
import { SpeakerLinked } from '../models/speaker.model';
import { RoomLinked } from '../models/room.model';
import { User } from '../models/user.model';
import { SessionRegistration } from '../models/sessionRegistration.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;
const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  sessions: process.env.DDB_TABLE_sessions,
  rooms: process.env.DDB_TABLE_rooms,
  speakers: process.env.DDB_TABLE_speakers,
  registrations: process.env.DDB_TABLE_registrations
};
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new SessionsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class SessionsRC extends ResourceController {
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
    if (!this.user.permissions.canManageContents || !this.user.permissions.isAdmin) {
      delete this.session.feedbackResults;
      delete this.session.feedbackComments;
    }
    return this.session;
  }

  protected async putResource(): Promise<Session> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Session(this.session);
    this.session.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Session> {
    this.session.room = new RoomLinked(
      await ddb.get({ TableName: DDB_TABLES.rooms, Key: { roomId: this.session.room.roomId } })
    );

    const getSpeakers: SpeakerLinked[] = await ddb.batchGet(
      DDB_TABLES.speakers,
      this.session.speakers?.map(s => ({ speakerId: s.speakerId })),
      true
    );
    this.session.speakers = getSpeakers.map(s => new SpeakerLinked(s));

    const errors = this.session.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.sessions, Item: this.session };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(sessionId)';
      await ddb.put(putParams);

      return this.session;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }

  protected async patchResource(): Promise<void> {
    switch (this.body.action) {
      case 'GIVE_FEEDBACK':
        return await this.userFeedback(this.body.rating, this.body.comment);
      default:
        throw new HandledError('Unsupported action');
    }
  }

  private async userFeedback(rating: number, comment?: string): Promise<void> {
    let sessionRegistration: SessionRegistration;
    try {
      sessionRegistration = new SessionRegistration(
        await ddb.get({
          TableName: DDB_TABLES.registrations,
          Key: { sessionId: this.session.sessionId, userId: this.user.userId }
        })
      );
    } catch (error) {
      throw new HandledError("Can't rate a session without being registered");
    }

    if (!sessionRegistration) throw new HandledError("Can't rate a session without being registered");

    if (sessionRegistration.hasUserRated) throw new HandledError('Already rated this session');

    if (new Date().toISOString() < this.session.endsAt)
      throw new HandledError("Can't rate a session before it has ended");

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) throw new HandledError('Invalid rating');

    const addUserRatingToSession = {
      TableName: DDB_TABLES.sessions,
      Key: { sessionId: this.session.sessionId },
      UpdateExpression: `ADD feedbackResults[${rating - 1}] :one`,
      ExpressionAttributeValues: { ':one': 1 }
    };

    const setHasUserRated = {
      TableName: DDB_TABLES.registrations,
      Key: { sessionId: this.session.sessionId, userId: this.user.userId },
      UpdateExpression: 'SET hasUserRated = :true',
      ExpressionAttributeValues: { ':true': true }
    };

    await ddb.transactWrites([{ Update: addUserRatingToSession }, { Update: setHasUserRated }]);

    if (comment) {
      await ddb.update({
        TableName: DDB_TABLES.sessions,
        Key: { sessionId: this.session.sessionId },
        UpdateExpression: 'SET feedbackComments = list_append(feedbackComments, :comment)',
        ExpressionAttributeValues: { ':comment': [comment] }
      });
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    await ddb.delete({ TableName: DDB_TABLES.sessions, Key: { sessionId: this.resourceId } });
  }

  protected async postResources(): Promise<Session> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.session = new Session(this.body);
    this.session.sessionId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Session[]> {
    const sessions = (await ddb.scan({ TableName: DDB_TABLES.sessions })).map(x => new Session(x));

    const filteredSessions = sessions.filter(
      x =>
        (!this.queryParams.speaker || x.speakers.some(speaker => speaker.speakerId === this.queryParams.speaker)) &&
        (!this.queryParams.room || x.room.roomId === this.queryParams.room)
    );

    if (!this.user.permissions.canManageContents) {
      filteredSessions.forEach(session => {
        delete session.feedbackResults;
        delete session.feedbackComments;
      });
    }

    return filteredSessions.sort((a, b): number => a.startsAt.localeCompare(b.startsAt));
  }
}
