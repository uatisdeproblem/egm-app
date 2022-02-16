import { Auth } from 'aws-amplify';
import { Browser } from '@capacitor/browser';

import { UserProfile } from 'models/userProfile';
import { Organization } from 'models/organization';
import { Venue } from 'models/venue';
import { Speaker } from 'models/speaker';
import { Session } from 'models/session';

import { getEnv } from '../environment';

//
// SESSIONS
//

export const getSessions = async (): Promise<Session[]> => {
  return (await apiRequest('GET', 'sessions')).map((x: Session) => new Session(x));
};
export const getSession = async (sessionId: string): Promise<Session> => {
  return new Session(await apiRequest('GET', ['sessions', sessionId]));
};
export const saveSession = async (session: Session): Promise<Session> => {
  if (session.sessionId) return await apiRequest('PUT', ['sessions', session.sessionId], session);
  else return await apiRequest('POST', 'sessions', session);
};
export const deleteSession = async (session: Session): Promise<void> => {
  return await apiRequest('DELETE', ['sessions', session.sessionId]);
};

export const isSessionUserFavorite = async (sessionId: string): Promise<boolean> => {
  return (await getUserFavoriteSessionsSet()).has(sessionId);
};
export const getUserFavoriteSessionsSet = async (): Promise<Set<string>> => {
  return new Set(await apiRequest('PATCH', ['users', 'me'], { action: 'GET_FAVORITE_SESSIONS' }));
};
export const getSessionsDays = (sessions: Session[]): string[] => {
  return Array.from(new Set(sessions.map(s => s.startsAt.slice(0, 10)))).sort();
};
export const addSessionToUserFavorites = async (session: Session): Promise<void> => {
  const body = { action: 'ADD_FAVORITE_SESSION', sessionId: session.sessionId };
  return await apiRequest('PATCH', ['users', 'me'], body);
};
export const removeSessionFromUserFavorites = async (session: Session): Promise<void> => {
  const body = { action: 'REMOVE_FAVORITE_SESSION', sessionId: session.sessionId };
  return await apiRequest('PATCH', ['users', 'me'], body);
};

//
// USER PROFILE
//

export const getUserProfile = async (): Promise<UserProfile> => {
  return new UserProfile(await apiRequest('GET', ['users', 'me']));
};
export const saveUserProfile = async (userProfile: UserProfile): Promise<void> => {
  return await apiRequest('PUT', ['users', 'me'], userProfile);
};
export const updateUserAvatar = async (image: File): Promise<void> => {
  const { url, id } = await apiRequest('PATCH', ['users', 'me'], { action: 'GET_IMAGE_UPLOAD_URL' });
  await fetch(url, { method: 'PUT', body: image, headers: { 'Content-Type': image.type } });
  return id;
};
export const usersFallbackImageURL = '/assets/images/no-avatar.jpg';

export const isUserAdmin = async (): Promise<boolean> => {
  const userData = await Auth.currentAuthenticatedUser();
  if (!userData) return false;
  const groups = userData.signInUserSession.accessToken.payload['cognito:groups'];
  return groups?.includes('admins');
};

//
// VENUES
//

export const getVenues = async (): Promise<Venue[]> => {
  return (await apiRequest('GET', 'venues')).map((x: Venue) => new Venue(x));
};
export const getVenue = async (venueId: string): Promise<Venue> => {
  return new Venue(await apiRequest('GET', ['venues', venueId]));
};
export const venuesFallbackImageURL = '/assets/images/no-room.jpg';
export const saveVenue = async (venue: Venue): Promise<Venue> => {
  if (venue.venueId) return await apiRequest('PUT', ['venues', venue.venueId], venue);
  else return await apiRequest('POST', 'venues', venue);
};
export const deleteVenue = async (venue: Venue): Promise<void> => {
  return await apiRequest('DELETE', ['venues', venue.venueId]);
};

//
// SPEAKERS
//

export const getSpeakers = async (): Promise<Speaker[]> => {
  return (await apiRequest('GET', 'speakers')).map((x: Speaker) => new Speaker(x));
};
export const getSpeaker = async (speakerId: string): Promise<Speaker> => {
  return new Speaker(await apiRequest('GET', ['speakers', speakerId]));
};
export const speakersFallbackImageURL = '/assets/images/no-avatar.jpg';
export const saveSpeaker = async (speaker: Speaker): Promise<Speaker> => {
  if (speaker.speakerId) return await apiRequest('PUT', ['speakers', speaker.speakerId], speaker);
  else return await apiRequest('POST', 'speakers', speaker);
};
export const deleteSpeaker = async (speaker: Speaker): Promise<void> => {
  return await apiRequest('DELETE', ['speakers', speaker.speakerId]);
};

//
// ORGANIZATIONS
//

export const getOrganizations = async (): Promise<Organization[]> => {
  return (await apiRequest('GET', 'organizations')).map((x: Organization) => new Organization(x));
};
export const getOrganization = async (organizationId: string): Promise<Organization> => {
  return new Organization(await apiRequest('GET', ['organizations', organizationId]));
};
export const organizationsFallbackImageURL = '/assets/images/no-logo.jpg';
export const saveOrganization = async (organization: Organization): Promise<Organization> => {
  if (organization.organizationId)
    return await apiRequest('PUT', ['organizations', organization.organizationId], organization);
  else return await apiRequest('POST', 'organizations', organization);
};
export const deleteOrganization = async (organization: Organization): Promise<void> => {
  return await apiRequest('DELETE', ['organizations', organization.organizationId]);
};

//
// IMAGES
//

export const uploadImageAndGetURI = async (image: File): Promise<string> => {
  const { url, id } = await apiRequest('POST', 'images');
  await fetch(url, { method: 'PUT', body: image, headers: { 'Content-Type': image.type } });
  return id;
};
export const getImageURLByURI = (imageURI: string): string => {
  return IMAGES_BASE_URL.concat('/', imageURI, '.png');
};
export const openImage = async (imageURI: string): Promise<void> => {
  await Browser.open({ url: getImageURLByURI(imageURI) });
};

//
// HELPERS
//

const env = getEnv();
const IMAGES_BASE_URL = env.mediaUrl.concat('/', env.currentStage, '/thumbnails/images');

const apiRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string[] | string,
  body?: any
): Promise<any> => {
  const authSession = await Auth.currentSession();
  const headers = { Authorization: authSession.getAccessToken().getJwtToken() };
  let url = env.apiUrl.concat('/', env.currentStage, '/', Array.isArray(path) ? path.join('/') : path);
  const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
  if (res.status === 200) return res.json();
  else {
    let errMessage: string;
    try {
      errMessage = (res.json() as any).message;
    } catch (err) {
      errMessage = 'Operation failed';
    }
    throw new Error(errMessage);
  }
};
