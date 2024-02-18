import { Resource } from 'idea-toolbox';

export class SessionRegistration extends Resource {
  /**
   * The session ID.
   */
  sessionId: string;
  /**
   * The user's ID.
   */
  userId: string;
  /**
   * The date of the registration.
   */
  registrationDateInMs: number;

  load(x: any): void {
    super.load(x);
    this.sessionId = this.clean(x.sessionId, String);
    this.userId = this.clean(x.userId, String);
    this.registrationDateInMs = this.clean(x.registrationDateInMs, t => new Date(t).getTime());
  }
}
