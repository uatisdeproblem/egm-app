import { isEmpty, Resource } from 'idea-toolbox';

import { VenueLinked } from './venue';

export class Room extends Resource {
  roomId: string;
  name: string;
  venue: VenueLinked;
  internalLocation: string;
  description: string;
  imageURI: string;
  planImageURI: string;

  load(x: any): void {
    super.load(x);
    this.roomId = this.clean(x.roomId, String);
    this.name = this.clean(x.name, String);
    this.venue = typeof x.venue === 'string' ? new VenueLinked({ venueId: x.venue }) : new VenueLinked(x.venue);
    this.internalLocation = this.clean(x.internalLocation, String);
    this.description = this.clean(x.description, String);
    this.imageURI = this.clean(x.imageURI, String);
    this.planImageURI = this.clean(x.planImageURI, String);
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
