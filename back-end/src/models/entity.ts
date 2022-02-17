import { Organization } from './organization';
import { Speaker } from './speaker';
import { Venue } from './venue';
import { Session } from './session';

export type Entity = Organization | Speaker | Venue | Session;

export type EntityType = 'organization' | 'speaker' | 'venue' | 'session';
