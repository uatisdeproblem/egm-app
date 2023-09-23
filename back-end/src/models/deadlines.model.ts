import { Resource } from 'idea-toolbox';

/**
 * Resource used only to keep deadlines centralized and consisted between front-end and back-end.
 * ! Should only contain static, Date properties.
 */
export class Deadlines extends Resource {
  // @todo - this is just an example
  static REGISTRATION_START_I = new Date();
  static REGISTRATION_END_I = new Date();
  static REGISTRATION_START_II = new Date();
  static REGISTRATION_END_II = new Date();
}
