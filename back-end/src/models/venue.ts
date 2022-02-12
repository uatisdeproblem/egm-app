import { Resource } from 'idea-toolbox';

export type LngLat = [number, number];

export class Venue extends Resource {
  venueId: string;
  name: string;
  address: string;
  description: string;
  coordinates: LngLat;

  load(x: any): void {
    super.load(x);
    this.venueId = this.clean(x.venueId, String);
    this.name = this.clean(x.name, String);
    this.address = this.clean(x.address, String);
    this.description = this.clean(x.description, String);
    if (!x.coordinates) x.coordinates = [];
    this.coordinates = [this.clean(x.coordinates[0], Number), this.clean(x.coordinates[1], Number)];
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.venueId = safeData.venueId;
  }
  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.address)) e.push('address');
    if (this.iE(this.coordinates[0]) || this.iE(this.coordinates[1])) e.push('coordinates');
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
