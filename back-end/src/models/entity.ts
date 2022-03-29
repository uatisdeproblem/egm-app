import { Organization } from './organization';
import { Speaker } from './speaker';
import { Venue } from './venue';
import { Room } from './room';
import { Session } from './session';
import { Communication } from './communication';

export type Entity = Organization | Speaker | Venue | Room | Session | Communication;

export type EntityType = 'organization' | 'speaker' | 'venue' | 'room' | 'session' | 'communication';
