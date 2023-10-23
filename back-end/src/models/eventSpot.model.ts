import { Resource, epochISOString } from 'idea-toolbox';

export class EventSpot extends Resource {
  /**
   * The ID of the spot. It's sequential depending on the creation batch (of spots).
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
   * A brief description for the spot, to recognize its batch from the lists.
   */
  description: string;
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
  /**
   * The URI to the proof of payment, if it has been uploaded.
   */
  proofOfPaymentURI?: string;
  /**
   * Whether the payment has been received, and the timestamp when spot/user participation has been confirmed.
   */
  paymentConfirmedAt: epochISOString;

  load(x: any): void {
    super.load(x);
    this.spotId = this.clean(x.spotId, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString(), new Date().toISOString());
    this.type = this.clean(x.type, String);
    this.description = this.clean(x.description, String);
    if (x.userId) this.userId = this.clean(x.userId, String);
    if (x.userName) this.userName = this.clean(x.userName, String);
    if (x.sectionCountry) this.sectionCountry = this.clean(x.sectionCountry, String);
    if (x.proofOfPaymentURI) this.proofOfPaymentURI = this.clean(x.proofOfPaymentURI, String);
    if (x.paymentConfirmedAt)
      this.paymentConfirmedAt = this.clean(x.paymentConfirmedAt, t => new Date(t).toISOString());
  }

  // no safeLoad because no PUT -- only PATCH actions

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.type)) e.push('type');
    return e;
  }
}

/**
 * A spot attached to another entity.
 */
export class EventSpotAttached extends Resource {
  /**
   * The ID of the spot. It's sequential depending on the creation batch (of spots).
   */
  spotId: string;
  /**
   * The spot type, among the ones available in the configuration of the app.
   */
  type: string;
  /**
   * The URI to the proof of payment, if it has been uploaded.
   */
  proofOfPaymentURI?: string;
  /**
   * Whether the payment has been received, and the timestamp when spot/user participation has been confirmed.
   */
  paymentConfirmedAt: epochISOString;

  load(x: any): void {
    super.load(x);
    this.spotId = this.clean(x.spotId, String);
    this.type = this.clean(x.type, String);
    if (x.proofOfPaymentURI) this.proofOfPaymentURI = this.clean(x.proofOfPaymentURI, String);
    if (x.paymentConfirmedAt) this.paymentConfirmedAt = this.clean(x.paymentConfirmedAt, String);
  }
}
