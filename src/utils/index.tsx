import { SessionType } from '../models';

export const SessionTypeStr = {
  [SessionType.KEYNOTE]: 'Keynote',
  [SessionType.PARTNER]: 'Partner',
  [SessionType.SMALL_SESSION]: 'Small session',
  [SessionType.WORKSHOP]: 'Workshop'
};

export const SessionTypeColor = {
  [SessionType.KEYNOTE]: 'ESNdarkBlue',
  [SessionType.PARTNER]: 'ESNcyan',
  [SessionType.SMALL_SESSION]: 'ESNorange',
  [SessionType.WORKSHOP]: 'ESNgreen'
};

export const formatTime = (date: string): string =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const formatDateShort = (date: string | Date): string => {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const toastMessageDefaults = { duration: 3000, buttons: ['X'] };

export const isMobileMode = () => window.innerWidth < 992;
