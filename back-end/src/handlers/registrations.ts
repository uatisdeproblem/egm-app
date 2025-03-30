///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Session } from '../models/session.model';
import { SessionRegistration, SessionRegistrationExportable } from '../models/sessionRegistration.model';
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

export const handler = (ev: any, _: any, cb: any): Promise<void> => new SessionRegistrationsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class SessionRegistrationsRC extends ResourceController {
  user: User;
  configurations: Configurations;
  registration: SessionRegistration;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'sessionId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    const sessionId = this.resourceId;
    const userId = this.principalId;

    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));
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

    if (!sessionId || this.httpMethod === 'POST') return;

    try {
      this.registration = new SessionRegistration(
        await ddb.get({ TableName: DDB_TABLES.registrations, Key: { sessionId, userId } })
      );
    } catch (err) {
      throw new HandledError('Registration not found');
    }
  }

  protected async getResources(): Promise<SessionRegistration[] | SessionRegistrationExportable[]> {
    if (this.queryParams.sessionId) {
      if (this.queryParams.export && this.user.permissions.canManageContents)
        return await this.getExportableSessionRegistrations(this.queryParams.sessionId);
      else return this.getRegistrationsOfSessionById(this.queryParams.sessionId);
    } else {
      if (this.queryParams.export && this.user.permissions.canManageContents)
        return await this.getExportableSessionRegistrations();
      else return await this.getRegistrationsOfUserById(this.principalId);
    }
  }

  protected async postResource(): Promise<any> {
    if (!this.configurations.areSessionRegistrationsOpen) throw new HandledError('Registrations are closed!');

    this.registration = new SessionRegistration({
      sessionId: this.resourceId,
      userId: this.user.userId,
      registrationDateInMs: new Date().getTime(),
      name: this.user.getName(),
      sectionCountry: this.user.sectionCountry
    });

    return await this.putSafeResource();
  }

  protected async getResource(): Promise<SessionRegistration> {
    return this.registration;
  }

  protected async patchResource(): Promise<void> {
    switch (this.body.action) {
      case 'CONFIRM_PARTICIPATION':
        return await this.confirmParticipation();
      default:
        throw new HandledError('Unsupported action');
    }
  }

  private async confirmParticipation(): Promise<void> {
    const { sessionId, userId } = this.registration;

    if (this.registration.hasUserConfirmed) throw new HandledError('Participation already confirmed');

    // @todo find a way to check the date without timezone problems
    // const session = await this.getSessionById(sessionId);
    // if (!session.canConfirmSession()) throw new HandledError('Invalid Time period');

    try {
      const updateParams = {
        TableName: DDB_TABLES.registrations,
        Key: { sessionId, userId },
        UpdateExpression: 'SET hasUserConfirmed = :confirmed',
        ExpressionAttributeValues: {
          ':confirmed': true
        }
      };

      await ddb.update(updateParams);
    } catch (error) {
      throw new HandledError('Could not confirm session participation for this user');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.configurations.areSessionRegistrationsOpen) throw new HandledError('Registrations are closed!');

    const { sessionId, userId } = this.registration;

    const deleteSessionRegistration = { TableName: DDB_TABLES.registrations, Key: { sessionId, userId } };

    const updateSessionCount = {
      TableName: DDB_TABLES.sessions,
      Key: { sessionId },
      UpdateExpression: 'ADD numberOfParticipants :minusOne',
      ExpressionAttributeValues: { ':minusOne': -1 }
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
  }

  private async putSafeResource(): Promise<SessionRegistration> {
    const { sessionId, userId } = this.registration;
    const session = await this.getSessionById(sessionId);
    const isValid = await this.validateRegistration(session, userId);

    if (!isValid) throw new HandledError("User can't sign up for this session!");

    const putSessionRegistration = { TableName: DDB_TABLES.registrations, Item: this.registration };

    const updateSessionCount = {
      TableName: DDB_TABLES.sessions,
      Key: { sessionId },
      UpdateExpression: 'ADD numberOfParticipants :one',
      ConditionExpression: 'numberOfParticipants < :limit',
      ExpressionAttributeValues: { ':one': 1, ':limit': session.limitOfParticipants }
    };

    const addToFavorites = {
      TableName: DDB_TABLES.usersFavoriteSessions,
      Item: { userId: this.principalId, sessionId: this.resourceId }
    };

    await ddb.transactWrites([
      { Put: putSessionRegistration },
      { Put: addToFavorites },
      { Update: updateSessionCount }
    ]);

    return this.registration;
  }

  private async validateRegistration(session: Session, userId: string): Promise<boolean> {
    if (!session.requiresRegistration) throw new HandledError("User can't sign up for this session!");
    if (session.isFull()) throw new HandledError('Session is full! Refresh your page.');

    const userRegistrations = await this.getRegistrationsOfUserById(userId);
    if (!userRegistrations.length) return true;

    if (userRegistrations.length >= this.configurations.maxNrOfSessions)
      throw new HandledError('You have reached the maximum number of sessions you can register to!');

    const sessions = (
      await ddb.batchGet(
        DDB_TABLES.sessions,
        userRegistrations.map(ur => ({ sessionId: ur.sessionId }))
      )
    ).map(s => new Session(s));

    // make sure user doesn't have overlapping schedule
    const validSessions: Session[] = sessions.filter(s => {
      const sessionStartDate = s.calcDatetimeWithoutTimezone(s.startsAt);
      const sessionEndDate = s.calcDatetimeWithoutTimezone(s.endsAt);

      const targetSessionStart = session.calcDatetimeWithoutTimezone(
        session.startsAt,
        -1 * this.configurations.sessionRegistrationBuffer || 0
      );
      const targetSessionEnd = session.calcDatetimeWithoutTimezone(
        session.endsAt,
        this.configurations.sessionRegistrationBuffer || 0
      );

      // it's easier to prove a session is valid than it is to prove it's invalid. (1 vs 5 conditional checks)
      return sessionStartDate >= targetSessionEnd || sessionEndDate <= targetSessionStart;
    });

    if (sessions.length !== validSessions.length)
      throw new HandledError('You have 1 or more sessions during this time period.');

    return true;
  }

  private async getRegistrationsOfUserById(userId: string): Promise<SessionRegistration[]> {
    try {
      const registrationsOfUser: SessionRegistration[] = await ddb.query({
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
  private async getRegistrationsOfSessionById(sessionId: string): Promise<SessionRegistration[]> {
    try {
      const registrationsOfSession: SessionRegistration[] = await ddb.query({
        TableName: DDB_TABLES.registrations,
        KeyConditionExpression: 'sessionId = :sessionId',
        ExpressionAttributeValues: { ':sessionId': sessionId }
      });
      return registrationsOfSession.map(s => new SessionRegistration(s));
    } catch (error) {
      throw new HandledError('Could not load registrations for this session');
    }
  }
  private async getSessionById(sessionId: string): Promise<Session> {
    try {
      return new Session(await ddb.get({ TableName: DDB_TABLES.sessions, Key: { sessionId } }));
    } catch (err) {
      throw new HandledError('Session not found');
    }
  }
  private async getExportableSessionRegistrations(sessionId?: string): Promise<SessionRegistrationExportable[]> {
    let sessions: Session[], registrations: SessionRegistration[];

    if (sessionId) {
      sessions = [await this.getSessionById(sessionId)];
      registrations = await this.getRegistrationsOfSessionById(sessionId);
    } else {
      sessions = (await ddb.scan({ TableName: DDB_TABLES.sessions })).map(x => new Session(x));
      registrations = (await ddb.scan({ TableName: DDB_TABLES.registrations })).map(x => new SessionRegistration(x));
    }

    const list: SessionRegistrationExportable[] = [];
    sessions.map(session =>
      list.push(
        ...SessionRegistration.export(
          session,
          registrations.filter(r => r.sessionId === session.sessionId)
        )
      )
    );

    return list;
  }
}
