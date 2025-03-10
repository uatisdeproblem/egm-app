import { isEmpty, Resource } from 'idea-toolbox';

import { VenueLinked } from './venue.model';

export class Room extends Resource {
  /**
   * The room ID.
   */
  roomId: string;
  /**
   * The name of the room.
   */
  name: string;
  /**
   * The venue where this room is located
   */
  venue: VenueLinked;
  /**
   * The room's internal location.
   */
  internalLocation: string;
  /**
   * A description for the room.
   */
  description: string;
  /**
   * An URI for an image of the room.
   */
  imageURI: string;

  load(x: any): void {
    super.load(x);
    this.roomId = this.clean(x.roomId, String);
    this.name = this.clean(x.name, String);
    this.venue = typeof x.venue === 'string' ? new VenueLinked({ venueId: x.venue }) : new VenueLinked(x.venue);
    this.internalLocation = this.clean(x.internalLocation, String);
    this.description = this.clean(x.description, String);
    this.imageURI = this.clean(x.imageURI, String);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.roomId = safeData.roomId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (!this.venue.venueId) e.push('venue');
    return e;
  }

  /**
   * Return an exportable flat version of the resource.
   */
  exportFlat(): RoomFlat {
    return new RoomFlat(this);
  }

  /**
   * Import a flat structure and set the internal attributes accordingly.
   */
  importFlat(x: RoomFlat): void {
    this.roomId = x['Room ID'];
    this.name = x['Room name'];
    this.internalLocation = x['Internal Location'];
    this.description = x['Description'];
    this.venue = new VenueLinked({ venueId: x['Venue ID'] });
  }
}

export class RoomLinked extends Resource {
  roomId: string;
  name: string;
  venue: VenueLinked;

  load(x: any): void {
    super.load(x);
    this.roomId = this.clean(x.roomId, String);
    this.name = this.clean(x.name, String);
    this.venue = new VenueLinked(x.venue);
  }
}

/**
 * A flat version of the resource, useful for exports.
 */
export class RoomFlat {
  'Room ID': string;
  'Room name': string;
  'Venue ID': string;
  'Internal Location': string;
  'Description': string;

  constructor(x?: Room) {
    x = x || ({} as any);
    this['Room ID'] = x.roomId;
    this['Room name'] = x.name;
    this['Venue ID'] = x.venue?.venueId;
    this['Internal Location'] = x.internalLocation;
    this['Description'] = x.description;
  }
}
