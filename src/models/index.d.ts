import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum SessionType {
  PARTNER = "PARTNER",
  WORKSHOP = "WORKSHOP",
  SMALL_SESSION = "SMALL_SESSION",
  KEYNOTE = "KEYNOTE"
}



type OrganizationMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserProfileMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserFavoriteSessionMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type VenueMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type SpeakerMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type SessionMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type SessionSpeakerMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Organization {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly logoURL?: string;
  readonly website?: string;
  readonly contactEmail?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Organization, OrganizationMetaData>);
  static copyOf(source: Organization, mutator: (draft: MutableModel<Organization, OrganizationMetaData>) => MutableModel<Organization, OrganizationMetaData> | void): Organization;
}

export declare class UserProfile {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly languages?: (string | null)[];
  readonly fieldOfExpertise?: string;
  readonly ESNCountry?: string;
  readonly ESNSection?: string;
  readonly contactEmail?: string;
  readonly contactPhone?: string;
  readonly bio?: string;
  readonly openToJob?: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserProfile, UserProfileMetaData>);
  static copyOf(source: UserProfile, mutator: (draft: MutableModel<UserProfile, UserProfileMetaData>) => MutableModel<UserProfile, UserProfileMetaData> | void): UserProfile;
}

export declare class UserFavoriteSession {
  readonly id: string;
  readonly sessionId: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserFavoriteSession, UserFavoriteSessionMetaData>);
  static copyOf(source: UserFavoriteSession, mutator: (draft: MutableModel<UserFavoriteSession, UserFavoriteSessionMetaData>) => MutableModel<UserFavoriteSession, UserFavoriteSessionMetaData> | void): UserFavoriteSession;
}

export declare class Venue {
  readonly id: string;
  readonly name: string;
  readonly address?: string;
  readonly longitude: number;
  readonly latitude: number;
  readonly description?: string;
  readonly imageURL?: string;
  readonly planImageURL?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Venue, VenueMetaData>);
  static copyOf(source: Venue, mutator: (draft: MutableModel<Venue, VenueMetaData>) => MutableModel<Venue, VenueMetaData> | void): Venue;
}

export declare class Speaker {
  readonly id: string;
  readonly name: string;
  readonly title?: string;
  readonly description?: string;
  readonly imageURL?: string;
  readonly contactEmail?: string;
  readonly Organization: Organization;
  readonly Sessions?: (SessionSpeaker | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly speakerOrganizationId: string;
  constructor(init: ModelInit<Speaker, SpeakerMetaData>);
  static copyOf(source: Speaker, mutator: (draft: MutableModel<Speaker, SpeakerMetaData>) => MutableModel<Speaker, SpeakerMetaData> | void): Speaker;
}

export declare class Session {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: SessionType | keyof typeof SessionType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly Venue: Venue;
  readonly Speakers?: (SessionSpeaker | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly sessionVenueId: string;
  constructor(init: ModelInit<Session, SessionMetaData>);
  static copyOf(source: Session, mutator: (draft: MutableModel<Session, SessionMetaData>) => MutableModel<Session, SessionMetaData> | void): Session;
}

export declare class SessionSpeaker {
  readonly id: string;
  readonly speaker: Speaker;
  readonly session: Session;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<SessionSpeaker, SessionSpeakerMetaData>);
  static copyOf(source: SessionSpeaker, mutator: (draft: MutableModel<SessionSpeaker, SessionSpeakerMetaData>) => MutableModel<SessionSpeaker, SessionSpeakerMetaData> | void): SessionSpeaker;
}