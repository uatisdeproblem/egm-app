import { DataStore } from '@aws-amplify/datastore';
import { Storage } from '@aws-amplify/storage';

import { Session, Speaker, UserFavoriteSession, SessionSpeaker, UserProfile, Venue } from '../models';

export const getSessions = async (): Promise<Session[]> => {
  const sessions = (await DataStore.query(Session)) || [];
  return sessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
};
export const getSession = async (sessionId: string): Promise<Session | undefined> => {
  return await DataStore.query(Session, sessionId);
};
export const getSessionSpeakers = async (sessionId: string): Promise<Speaker[]> => {
  return (await DataStore.query(SessionSpeaker)).filter(x => x.session.id === sessionId).map(s => s.speaker);
};
export const isSessionUserFavorite = async (sessionId: string): Promise<boolean> => {
  return (await DataStore.query(UserFavoriteSession)).some(s => s.sessionId === sessionId);
};

export const getUserFavoriteSessionsSet = async (): Promise<Set<string>> => {
  const userFavoriteSessions = (await DataStore.query(UserFavoriteSession)) || [];
  return new Set(userFavoriteSessions.map(s => s.sessionId));
};

export const getSessionsSpeakersMap = async (): Promise<Map<string, Speaker[]>> => {
  const sessionsSpeakers = await DataStore.query(SessionSpeaker);

  const speakersBySession = new Map<string, Speaker[]>();

  sessionsSpeakers.forEach(ss => {
    const sbs = speakersBySession.get(ss.session.id);
    if (sbs) sbs.push(ss.speaker);
    else speakersBySession.set(ss.session.id, [ss.speaker]);
  });

  return speakersBySession;
};

export const getSessionsDays = (sessions: Session[]): string[] => {
  return Array.from(new Set(sessions.map(s => s.startsAt.slice(0, 10)))).sort();
};

export const addSessionToUserFavorites = async (session: Session): Promise<void> => {
  await DataStore.save(new UserFavoriteSession({ sessionId: session.id }));
};
export const removeSessionFromUserFavorites = async (session: Session): Promise<void> => {
  await DataStore.delete(UserFavoriteSession, ufs => ufs.sessionId('eq', session.id));
};

export const getUserProfile = async (): Promise<UserProfile> => {
  return (await DataStore.query(UserProfile))[0];
};
export const saveUserProfile = async (data: any): Promise<void> => {
  let userProfile = await getUserProfile();
  if (userProfile)
    userProfile = UserProfile.copyOf(userProfile, updated => {
      for (const prop in data) (updated as any)[prop] = data[prop];
    });
  else userProfile = new UserProfile(data);

  await DataStore.save(userProfile);
};

export const updateUserAvatar = async (image: File): Promise<void> => {
  const format = image.name.slice(image.name.lastIndexOf('.') + 1);
  await Storage.put('avatar', image, { contentType: `image/${format}` });
};
export const getUserAvatarURL = async (): Promise<string> => {
  return (await Storage.get('avatar')) || fallbackUserAvatar;
};
export const fallbackUserAvatar = '/assets/images/no-avatar.jpg';

export const getVenues = async (): Promise<Venue[]> => {
  return (await DataStore.query(Venue)) || [];
};
export const getVenue = async (venueId: string): Promise<Venue | undefined> => {
  return await DataStore.query(Venue, venueId);
};

export const getSpeakers = async (): Promise<Speaker[]> => {
  return (await DataStore.query(Speaker)) || [];
};
export const getSpeaker = async (speakerId: string): Promise<Speaker | undefined> => {
  return await DataStore.query(Speaker, speakerId);
};
