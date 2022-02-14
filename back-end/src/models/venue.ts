import { isEmpty, Resource } from 'idea-toolbox';

export class Venue extends Resource {
  venueId: string;
  name: string;
  imageURI: string;
  planImageURI: string;
  address: string;
  description: string;
  longitude: number;
  latitude: number;

  static getCoordinates(venue: Venue): [number, number] {
    return [venue.longitude, venue.latitude];
  }

  load(x: any): void {
    super.load(x);
    this.venueId = this.clean(x.venueId, String);
    this.name = this.clean(x.name, String);
    this.imageURI = this.clean(x.imageURI, String);
    this.planImageURI = this.clean(x.planImageURI, String);
    this.address = this.clean(x.address, String);
    this.description = this.clean(x.description, String);
    this.longitude = this.clean(x.longitude, Number);
    this.latitude = this.clean(x.latitude, Number);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.venueId = safeData.venueId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (isEmpty(this.address)) e.push('address');
    if (isEmpty(this.longitude)) e.push('longitude');
    if (isEmpty(this.latitude)) e.push('latitude');
    return e;
  }
}

export class VenueLinked extends Resource {
  venueId: string;
  name: string;

  load(x: any): void {
    super.load(x);
    this.venueId = this.clean(x.venueId, String);
    this.name = this.clean(x.name, String);
  }
}
