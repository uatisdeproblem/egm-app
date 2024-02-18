///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Session } from '../models/session.model';
import { SessionRegistration } from '../models/sessionRegistration.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  sessions: process.env.DDB_TABLE_sessions,
  registrations: process.env.DDB_TABLE_registrations
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new SessionRegistrations(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class SessionRegistrations extends ResourceController {
  user: User;
  registration: SessionRegistration;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'sessionId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new RCError('User not found');
    }

    if (!this.resourceId) return;

    try {
      this.registration = new SessionRegistration(
        await ddb.get({
          TableName: DDB_TABLES.registrations,
          Key: { sessionId: this.resourceId, userId: this.principalId }
        })
      );
    } catch (err) {
      throw new RCError('Registration not found');
    }
  }

  protected async getResources(): Promise<SessionRegistration[]> {
    if (this.queryParams.sessionId) {
      try {
        const registrationsOfSession = await ddb.query({
          TableName: DDB_TABLES.registrations,
          KeyConditionExpression: 'sessionId = :sessionId',
          ExpressionAttributeValues: { ':sessionId': this.queryParams.sessionId }
        });
        return registrationsOfSession.map(s => new SessionRegistration(s));
      } catch (error) {
        throw new RCError('Could not load registrations for this session');
      }
    } else {
      return await this.getUsersRegistrations(this.principalId);
    }
  }

  protected async postResources(): Promise<any> {
    // @todo configurations.canSignUpForSessions()

    if (!this.body.sessionId) throw new RCError('Missing session ID!');

    this.registration = new SessionRegistration({
      sessionId: this.body.sessionId,
      userId: this.principalId,
      registrationDateInMs: new Date().getTime()
    });

    return await this.putSafeResource();
  }

  protected async getResource(): Promise<SessionRegistration> {
    return this.registration;
  }

  protected async deleteResource(): Promise<void> {
    // @todo configurations.canSignUpForSessions()

    try {
      const { sessionId, userId } = this.registration;

      const deleteSessionRegistration = { TableName: DDB_TABLES.registrations, Key: { sessionId, userId } };

      const updateSessionCount = {
        TableName: DDB_TABLES.sessions,
        Key: { sessionId },
        UpdateExpression: 'ADD numberOfParticipants :minusOne',
        ExpressionAttributeValues: {
          ':minusOne': -1
        }
      };

      await ddb.transactWrites([{ Delete: deleteSessionRegistration }, { Update: updateSessionCount }]);
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  private async putSafeResource(): Promise<SessionRegistration> {
    const { sessionId, userId } = this.registration;
    const isValid = await this.validateRegistration(sessionId, userId);

    if (!isValid) throw new RCError("User can't sign up for this session!");

    try {
      const putSessionRegistration = { TableName: DDB_TABLES.registrations, Item: this.registration };

      const updateSessionCount = {
        TableName: DDB_TABLES.sessions,
        Key: { sessionId },
        UpdateExpression: 'ADD numberOfParticipants :one',
        ExpressionAttributeValues: {
          ':one': 1
        }
      };

      await ddb.transactWrites([{ Put: putSessionRegistration }, { Update: updateSessionCount }]);

      return this.registration;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  private async validateRegistration(sessionId: string, userId: string) {
    const session: Session = new Session(await ddb.get({ TableName: DDB_TABLES.sessions, Key: { sessionId } }));

    if (!session.requiresRegistration) throw new RCError("User can't sign up for this session!");
    if (session.isFull()) throw new RCError('Session is full! Refresh your page.');

    const userRegistrations: SessionRegistration[] = await this.getUsersRegistrations(userId);

    if (!userRegistrations.length) return true;

    const sessions: Session[] = (
      await ddb.batchGet(
        DDB_TABLES.sessions,
        userRegistrations.map(ur => ({ sessionId: ur.sessionId }))
      )
    ).map(s => new Session(s));

    // make sure user doesn't have overlapping schedule
    const validSessions: Session[] = sessions.filter(s => {
      const sessionStartDate = s.calcDatetimeWithoutTimezone(s.startsAt);
      const sessionEndDate = s.calcDatetimeWithoutTimezone(s.endsAt);

      const targetSessionStart = session.calcDatetimeWithoutTimezone(session.startsAt);
      const targetSessionEnd = session.calcDatetimeWithoutTimezone(session.endsAt);

      // it's easier to prove a session is valid than it is to prove it's invalid. (1 vs 5 conditional checks)
      return sessionStartDate >= targetSessionEnd || sessionEndDate <= targetSessionStart;
    });

    if (sessions.length !== validSessions.length)
      throw new RCError('You have 1 or more sessions during this time period.');

    return true;
  }

  private async getUsersRegistrations(userId: string): Promise<SessionRegistration[]> {
    try {
      const registrationsOfUser = await ddb.query({
        TableName: DDB_TABLES.registrations,
        IndexName: 'userId-sessionId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      });
      return registrationsOfUser.map(s => new SessionRegistration(s));
    } catch (error) {
      throw new RCError('Could not load registrations for this user');
    }
  }
}
