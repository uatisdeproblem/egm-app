///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Session } from '../models/session.model';
import { SessionRegistration } from '../models/sessionRegistration.model';
import { User } from '../models/user.model';
import { Configurations } from '../models/configurations.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  sessions: process.env.DDB_TABLE_sessions,
  configurations: process.env.DDB_TABLE_configurations,
  registrations: process.env.DDB_TABLE_registrations,
  usersFavoriteSessions: process.env.DDB_TABLE_usersFavoriteSessions
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new SessionRegistrations(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class SessionRegistrations extends ResourceController {
  user: User;
  configurations: Configurations;
  registration: SessionRegistration;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'sessionId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {


    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    try {
      this.configurations = new Configurations(
        await ddb.get({ TableName: DDB_TABLES.configurations, Key: { PK: Configurations.PK } })
      );
    } catch (err) {
      throw new HandledError('Configuration not found');
    }

    if (!this.resourceId || this.httpMethod === 'POST') return;

    try {
      this.registration = new SessionRegistration(
        await ddb.get({
          TableName: DDB_TABLES.registrations,
          Key: { sessionId: this.resourceId, userId: this.principalId }
        })
      );
    } catch (err) {
      throw new HandledError('Registration not found');
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
        throw new HandledError('Could not load registrations for this session');
      }
    } else {
      return await this.getUsersRegistrations(this.principalId);
    }
  }

  protected async postResource(): Promise<any> {
    if (!this.configurations.areSessionRegistrationsOpen) throw new HandledError('Registrations are closed!')

    this.registration = new SessionRegistration({
      sessionId: this.resourceId,
      userId: this.user.userId,
      registrationDateInMs: new Date().getTime(),
      name: this.user.getName(),
      esnCountry: this.user.sectionCountry
    });

    return await this.putSafeResource();
  }

  protected async getResource(): Promise<SessionRegistration> {
    return this.registration;
  }

  protected async deleteResource(): Promise<void> {
    if (!this.configurations.areSessionRegistrationsOpen) throw new HandledError('Registrations are closed!')

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

      const removeFromFavorites = {
        TableName: DDB_TABLES.usersFavoriteSessions,
        Key: { userId: this.principalId, sessionId }
      };

      await ddb.transactWrites([
        { Delete: deleteSessionRegistration },
        { Delete: removeFromFavorites },
        { Update: updateSessionCount }
      ]);
    } catch (err) {
      throw new HandledError('Delete failed');
    }
  }

  private async putSafeResource(): Promise<SessionRegistration> {
    const { sessionId, userId } = this.registration;
    const isValid = await this.validateRegistration(sessionId, userId);

    if (!isValid) throw new HandledError("User can't sign up for this session!");

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

      const addToFavorites = {
        TableName: DDB_TABLES.usersFavoriteSessions,
        Item: { userId: this.principalId, sessionId: this.resourceId }
      }

      await ddb.transactWrites([
        { Put: putSessionRegistration },
        { Put: addToFavorites },
        { Update: updateSessionCount }
      ]);

      return this.registration;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }

  private async validateRegistration(sessionId: string, userId: string) {
    const session: Session = new Session(await ddb.get({ TableName: DDB_TABLES.sessions, Key: { sessionId } }));

    if (!session.requiresRegistration) throw new HandledError("User can't sign up for this session!");
    if (session.isFull()) throw new HandledError('Session is full! Refresh your page.');

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
      throw new HandledError('You have 1 or more sessions during this time period.');

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
      throw new HandledError('Could not load registrations for this user');
    }
  }
}
