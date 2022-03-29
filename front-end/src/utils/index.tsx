import { SessionType } from 'models/session';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import { isPlatform } from '@ionic/core';

export const SessionTypeStr = {
  [SessionType.KEYNOTE]: 'Keynote',
  [SessionType.WORKSHOP]: 'Workshop',
  [SessionType.TALK]: 'EG Talk',
  [SessionType.QA]: 'Q&A',
  [SessionType.DISCUSSION]: 'Discussion',
  [SessionType.IGNITE]: 'Ignite',
  [SessionType.CAMPFIRE]: 'Campfire',
  [SessionType.LAB]: 'Idea Lab',
  [SessionType.KNOWLEDGE_EXCHANGE]: 'Knowledge Hub',
  [SessionType.PROJECT]: 'Project Work',
  [SessionType.POSTER]: 'Poster'
};

export const SessionTypeColor = {
  [SessionType.KEYNOTE]: 'ESNdarkBlue',
  [SessionType.WORKSHOP]: 'medium',
  [SessionType.TALK]: 'ESNorange',
  [SessionType.QA]: 'medium',
  [SessionType.DISCUSSION]: 'ESNdarkBlue',
  [SessionType.IGNITE]: 'ESNgreen',
  [SessionType.CAMPFIRE]: 'ESNcyan',
  [SessionType.LAB]: 'ESNorange',
  [SessionType.KNOWLEDGE_EXCHANGE]: 'warning',
  [SessionType.PROJECT]: 'ESNpink',
  [SessionType.POSTER]: 'ESNdanger'
};

export const formatTime = (date: string): string =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const formatDateShort = (date: string | Date): string => {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const extractDateTime = (date: string | Date): string => {
  if (!(date instanceof Date)) date = new Date(date);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export const toastMessageDefaults = { duration: 3000, buttons: ['X'] };

export const isMobileMode = () => window.innerWidth < 992;

export const mdParser = new MarkdownIt({ linkify: true, breaks: true, typographer: true });

export const createMapMarker = (color: string, isHome?: boolean): any => {
  const fillColor = color;
  const strokeColor = 'white';
  const lineWidth = 4;

  return {
    width: 64,
    height: 64,
    data: new Uint8Array(64 * 64 * 4),

    onAdd: function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
    },

    render: function () {
      const context = this.context;
      const markerShape = new Path2D(isHome ? HOME_MARKER : LOCATION_MARKER);
      context.stroke(markerShape);
      context.fillStyle = fillColor;
      context.strokeStyle = strokeColor;
      context.lineWidth = lineWidth;
      context.fill(markerShape);

      this.data = context.getImageData(0, 0, this.width, this.height).data;

      return true;
    }
  };
};
const LOCATION_MARKER =
  'M24.8133 38.533C18.76 31.493 13 28.8264 13 20.8264C13.4827 14.9864 16.552 9.67169 21.368 6.33302C33.768 -2.26165 50.824 5.78902 52.0667 20.8264C52.0667 28.613 46.5733 31.6797 40.6533 38.373C32.4933 47.5464 35.4 63.093 32.4933 63.093C29.72 63.093 32.4933 47.5464 24.8133 38.533ZM32.4933 8.23969C26.5573 8.23969 21.7467 13.0504 21.7467 18.9864C21.7467 24.9224 26.5573 29.733 32.4933 29.733C38.4293 29.733 43.24 24.9224 43.24 18.9864C43.24 13.0504 38.4293 8.23969 32.4933 8.23969Z';
const HOME_MARKER =
  'M24.8133 38.533C18.76 31.493 13 28.8264 13 20.8264C13.4827 14.9864 16.552 9.67169 21.368 6.33302C33.768 -2.26165 50.824 5.78902 52.0667 20.8264C52.0667 28.613 46.5733 31.6797 40.6533 38.373C32.4933 47.5464 35.4 63.093 32.4933 63.093C29.72 63.093 32.4933 47.5464';

export const openGeoLocationInMap = (latitude: number, longitude: number): void => {
  if (isPlatform('ios')) window.open(`maps://maps.google.com/maps?daddr=${latitude},${longitude}&amp;ll=`);
  else window.open(`https://maps.google.com/maps?daddr=${latitude},${longitude}&amp;ll=`);
};

const isValidURL = (url: string): boolean => {
  try {
    const safeUrl = new URL(url);
    return safeUrl.protocol === 'http:' || safeUrl.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const getFacebookProfileURL = (link: string): string => {
  if (isValidURL(link)) return link;
  return 'https://fb.com/'.concat(link);
};
export const getInstagramProfileURL = (link: string): string => {
  if (isValidURL(link)) return link;
  return 'https://instagram.com/'.concat(link);
};
export const getTwitterProfileURL = (link: string): string => {
  if (isValidURL(link)) return link;
  return 'https://twitter.com/'.concat(link);
};
export const getTikTokProfileURL = (link: string): string => {
  if (isValidURL(link)) return link;
  return 'https://tiktok.com/@'.concat(link);
};
export const getLinkedinProfileURL = (link: string): string => {
  if (isValidURL(link)) return link;
  return 'https://linkedin.com/in/'.concat(link);
};

export const cleanStrForSearches = (str: string): string =>
  !str ? '' : str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
