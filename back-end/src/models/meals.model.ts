import { Resource, epochISOString, isEmpty } from 'idea-toolbox';

export class MealTicket extends Resource {
  /**
   * The ID of the Meal Ticket.
   */
  mealTicketId: string;

  /**
   * The ID of the user related to the meal ticket.
   */
  userId: string;

  /**
   * The timestamp when the ticket has been generated.
   */
  createdAt: epochISOString;

  /**
   * The timestamp when the ticket has been approved.
   */
  approvedAt?: epochISOString;

  /**
   * The userID of who approve the ticket
   */
  approvedBy?: string;

  /**
   * The type of the approve done for the ticket (manual or by QRscan)
   */
  approvedType?: ApprovedType;

  /**
   * The meal type of the ticket, based on food choices and needs.
   */
  type: string;

  /**
   * Status of the ticket (true when has been used and false when not yet used)
   */
  status: boolean;


  load(x: any): void {
    super.load(x);
    this.mealTicketId = this.clean(x.mealTicketId, String);
    this.userId = this.clean(x.userId, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString(), new Date().toISOString());

    if (x.approvedAt) this.approvedAt = this.clean(x.createdAt, t => new Date(t).toISOString());
    if (x.approvedBy) this.approvedBy = this.clean(x.approvedBy, String);
    if (x.approvedType) this.approvedType = this.clean(x.approvedType, String) as ApprovedType;

    this.type = this.clean(x.type, String);
    this.status = this.clean(x.status, Boolean, false);
  }

  safeLoad(newData: any, safeData: any, options?: any): void {
    super.safeLoad(newData, safeData);
    this.mealTicketId = safeData.mealTicketId;
    this.userId = safeData.userId;
    this.createdAt = safeData.createdAt;

    if (safeData.approvedAt) this.approvedAt = safeData.approvedAt;
    if (safeData.approvedBy) this.approvedBy = safeData.approvedBy;
    if (safeData.approvedType) this.approvedType = safeData.approvedType;
  }

  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.mealTicketId)) e.push('mealId');
    if (isEmpty(this.userId)) e.push('userId');
    if (isEmpty(this.type)) e.push('type');
    if (isEmpty(this.createdAt, 'date')) e.push('createdAt');
    return e;
  }
}

export enum ApprovedType {
  MANUAL = 'MANUAL',
  QR_SCAN = 'QR_SCAN'
}