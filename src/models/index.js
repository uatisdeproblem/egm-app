// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const SessionType = {
  "PARTNER": "PARTNER",
  "WORKSHOP": "WORKSHOP",
  "SMALL_SESSION": "SMALL_SESSION",
  "KEYNOTE": "KEYNOTE"
};

const { UserFavoriteSession, Venue, Speaker, Session, SessionSpeaker } = initSchema(schema);

export {
  UserFavoriteSession,
  Venue,
  Speaker,
  Session,
  SessionSpeaker,
  SessionType
};