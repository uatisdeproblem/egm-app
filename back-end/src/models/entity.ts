import { Organization } from './organization';
import { Speaker } from './speaker';
import { Venue } from './venue';
import { Session } from './session';
import { Communication } from './communication';

export type Entity = Organization | Speaker | Venue | Session | Communication;

export type EntityType = 'organization' | 'speaker' | 'venue' | 'session' | 'communication';
