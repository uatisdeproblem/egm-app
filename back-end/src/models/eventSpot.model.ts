import { Resource, epochISOString } from 'idea-toolbox';

export class EventSpot extends Resource {
  /**
   * The ID of the spot.
   */
  spotId: string;
  /**
   * The timestamp when the spot was assigned.
   */
  createdAt: epochISOString;
  /**
   * The spot type, among the ones available in the configuration of the app.
   */
  type: string;
  /**
   * The ID of the user that had the spot assigned (if any).
   */
  userId?: string;
  /**
   * The name of the user that had the spot assigned (if any).
   */
  userName?: string;
  /**
   * The country to which this spot was originally assigned to (if any), before to be given to a specific user.
   */
  sectionCountry?: string;

  load(x: any): void {
    super.load(x);
    this.spotId = this.clean(x.spotId, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString(), new Date().toISOString());
    this.type = this.clean(x.type, String);
    if (x.userId) this.userId = this.clean(x.userId, String);
    if (x.userName) this.userName = this.clean(x.userName, String);
    if (x.sectionCountry) this.sectionCountry = this.clean(x.sectionCountry, String);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.spotId = safeData.spotId;
    this.type = safeData.type;
    if (safeData.userId) this.userId = safeData.userId;
    if (safeData.userName) this.userName = safeData.userName;
    if (safeData.sectionCountry) this.sectionCountry = safeData.sectionCountry;
    this.createdAt = safeData.createdAt;
  }
}
