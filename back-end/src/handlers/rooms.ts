///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Room } from '../models/room.model';
import { VenueLinked } from '../models/venue.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  rooms: process.env.DDB_TABLE_rooms,
  venues: process.env.DDB_TABLE_venues
};

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Rooms(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Rooms extends ResourceController {
  user: User;
  room: Room;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'roomId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (this.httpMethod === 'POST' || !this.resourceId) return;

    try {
      this.room = new Room(await ddb.get({ TableName: DDB_TABLES.rooms, Key: { roomId: this.resourceId } }));
    } catch (err) {
      throw new HandledError('Room not found');
    }
  }

  protected async getResource(): Promise<Room> {
    return this.room;
  }

  protected async putResource(): Promise<Room> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Room(this.room);
    this.room.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }

  protected async postResource(): Promise<Room> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.room = new Room(this.body);

    return await this.putSafeResource({ noOverwrite: true });
  }

  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Room> {
    const errors = this.room.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    this.room.venue = new VenueLinked(
      await ddb.get({ TableName: DDB_TABLES.venues, Key: { venueId: this.room.venue.venueId } })
    );

    try {
      const putParams: any = { TableName: DDB_TABLES.rooms, Item: this.room };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(roomId)';
      await ddb.put(putParams);

      return this.room;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.rooms, Key: { roomId: this.resourceId } });
    } catch (err) {
      throw new HandledError('Delete failed');
    }
  }

  protected async postResources(): Promise<Room> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.room = new Room(this.body);
    this.room.roomId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Room[]> {
    try {
      const rooms = (await ddb.scan({ TableName: DDB_TABLES.rooms })).map((x: Room) => new Room(x));

      const filteredRooms = this.queryParams.venue
        ? rooms.filter(x => x.venue.venueId === this.queryParams.venue)
        : rooms;

      const sortedRooms = filteredRooms.sort((a, b) => a.name.localeCompare(b.name));

      return sortedRooms;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }
}
