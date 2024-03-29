import { Resource } from 'idea-toolbox';

import { Session } from './session.model';

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
  /**
   * The user's name.
   */
  name: string;
  /**
   * The user's ESN Country if any.
   */
  sectionCountry?: string;
  /**
   * Whether the user has rated the session.
   */
  hasUserRated: boolean;

  load(x: any): void {
    super.load(x);
    this.sessionId = this.clean(x.sessionId, String);
    this.userId = this.clean(x.userId, String);
    this.registrationDateInMs = this.clean(x.registrationDateInMs, t => new Date(t).getTime());
    this.name = this.clean(x.name, String);
    if (x.sectionCountry) this.sectionCountry = this.clean(x.sectionCountry, String);
  }

  /**
   * Get the exportable version of the list of registrations for a session.
   */
  static export(session: Session, registrations: SessionRegistration[]): SessionRegistrationExportable[] {
    if (!registrations.length)
      return [
        {
          Session: session.name,
          Code: session.code ?? null,
          Type: session.type,
          Participant: null,
          'ESN Country': null
        }
      ];
    return registrations.map(r => ({
      Session: session.name,
      Code: session.code ?? null,
      Type: session.type,
      Participant: r.name,
      'ESN Country': r.sectionCountry ?? null
    }));
  }
}

/**
 * An exportable version of a session registration.
 */
export interface SessionRegistrationExportable {
  Session: string;
  Code: string | null;
  Type: string;
  Participant: string | null;
  'ESN Country': string | null;
}
