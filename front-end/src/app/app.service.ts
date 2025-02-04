import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { IDEAApiService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';

import { environment as env } from '@env';
import { AuthServices, User, UserPermissions } from '@models/user.model';
import { Configurations } from '@models/configurations.model';

/**
 * The base URLs where the thumbnails are located.
 */
const THUMBNAILS_BASE_URL = env.idea.app.mediaUrl.concat('/images/', env.idea.api.stage, '/');
/**
 * A local fallback URL for the users avatars.
 */
const AVATAR_FALLBACK_URL = './assets/imgs/no-avatar.jpg';
/**
 * The local URL to the icon.
 */
const APP_ICON_PATH = './assets/icons/icon.svg';
/**
 * The local URL to the icon.
 */
const APP_ICON_WHITE_PATH = './assets/icons/star-white.svg';

@Injectable({ providedIn: 'root' })
export class AppService {
  initReady = false;
  authReady = false;

  private darkMode: boolean;

  user: User;
  configurations: Configurations;

  linkToOpenViaFab: string;

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private message: IDEAMessageService,
    private t: IDEATranslationsService,
    private api: IDEAApiService
  ) {
    this.darkMode = this.respondToColorSchemePreferenceChanges();
  }
  private respondToColorSchemePreferenceChanges(): boolean {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => (this.darkMode = e.matches));
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Whether we are running the app in developer mode (from localhost).
   */
  isDeveloperMode(): boolean {
    return env.debug;
  }
  /**
   * Open an alert to get the token for running requests against this project's API.
   */
  async getTokenId(): Promise<void> {
    const message = this.api.authToken as string;
    const alert = await this.alertCtrl.create({ message, buttons: ['Thanks 🙌'], cssClass: 'selectable' });
    alert.present();
  }

  /**
   * Whether we should display a UX designed for smaller screens.
   */
  isInMobileMode(): boolean {
    return this.platform.width() < 768;
  }
  /**
   * Whether the current color scheme preference is set to dark.
   */
  isInDarkMode(): boolean {
    return this.darkMode;
  }

  /**
   * Reload the app.
   */
  reloadApp(): void {
    window.location.assign('');
  }
  /**
   * Navigate to a page by its path.
   */
  goTo(path: string[], options: { back?: boolean; root?: boolean; queryParams?: Params } = {}): void {
    if (options.back) this.navCtrl.navigateBack(path, options);
    else if (options.root) this.navCtrl.navigateRoot(path, options);
    else this.navCtrl.navigateForward(path, options);
  }
  /**
   * Navigate to a page in the tabs routing by its path.
   */
  goToInTabs(path: string[], options: { back?: boolean; root?: boolean; queryParams?: Params } = {}): void {
    this.goTo(['t', ...path], options);
  }
  /**
   * Close the current page and navigate back, optionally displaying an error message.
   */
  closePage(errorMessage?: string, pathBack?: string[]): void {
    if (errorMessage) this.message.error(errorMessage);
    try {
      this.navCtrl.back();
    } catch (_) {
      this.navCtrl.navigateBack(pathBack || []);
    }
  }

  /**
   * Get the URL to an image by its URI.
   */
  getImageURLByURI(imageURI: string): string {
    return THUMBNAILS_BASE_URL.concat(imageURI, '.png');
  }
  /**
   * Load a fallback URL when an avatar is missing.
   */
  fallbackAvatar(targetImg: any, star = false): void {
    const fallbackURL = star ? APP_ICON_WHITE_PATH : AVATAR_FALLBACK_URL;
    if (targetImg && targetImg.src !== fallbackURL) targetImg.src = AVATAR_FALLBACK_URL;
  }
  /**
   * Get the URL to the fallback avatar's image.
   */
  getAvatarFallbackURL(star = false): string {
    return star ? APP_ICON_WHITE_PATH : AVATAR_FALLBACK_URL;
  }

  /**
   * Open the URL in the browser.
   */
  async openURL(url: string): Promise<void> {
    if (this.platform.is('ios')) {
      // https://stackoverflow.com/a/39387533/13168139
      // Safari block the opening of any URL which is made inside an async call.
      // Usually ´Browser.open({ url, windowName: '_parent' })` would work, but there is a bug in Angular/Ionic that,
      // once you go back from the URL open to the app, blanks all the input fields
      this.linkToOpenViaFab = url;
      setTimeout((): void => {
        if (this.linkToOpenViaFab === url) this.linkToOpenViaFab = null;
      }, 10 * 1000);
    } else await Browser.open({ url });
  }
  /**
   * Open a user's profile on ESN Accounts.
   */
  getUserProfileInESNAccounts(user: User): string {
    if (user.authService !== AuthServices.ESN_ACCOUNTS) return null;
    const galaxyId = user.getAuthServiceUserId();
    const cleanESNAccountsIdForURL = (id: string): string => id.replace(/[._@]/gm, '').replace(/\s/gm, '-');
    return 'https://accounts.esn.org/user/'.concat(cleanESNAccountsIdForURL(galaxyId));
  }

  /**
   * Utility to generate a numeric array.
   * Useful for skeleton interfaces.
   */
  generateNumericArray(length: number): number[] {
    return [...Array(length).keys()];
  }

  /**
   * Get the app's main icon.
   */
  getIcon(white = false): string {
    return white ? APP_ICON_WHITE_PATH : APP_ICON_PATH;
  }

  /**
   * Open a new window in the browser to download some data as a file.
   */
  downloadDataAsFile(data: any, type: string, fileName: string): void {
    const uri = `data:${type};charset=utf-8,${encodeURIComponent(data)}`;

    const downloadLink = document.createElement('a');
    downloadLink.href = uri;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  /**
   * Get the permissions of a user as printable string.
   */
  getUserPermissionsString(permissions: UserPermissions, short = false): string {
    if (permissions.isAdmin) return this.t._('USER.ADMINISTRATOR'.concat(short ? '_SHORT' : ''));
    const arrPermissions = [];
    if (permissions.isCountryLeader)
      arrPermissions.push(this.t._('USER.DELEGATION_LEADER'.concat(short ? '_SHORT' : '')));
    if (permissions.canManageRegistrations)
      arrPermissions.push(this.t._('USER.CAN_MANAGE_REGISTRATIONS'.concat(short ? '_SHORT' : '')));
    if (permissions.canManageContents)
      arrPermissions.push(this.t._('USER.CAN_MANAGE_CONTENTS'.concat(short ? '_SHORT' : '')));
    return arrPermissions.join(', ');
  }
  /**
   * Whether the user is administrator or can manage some of the sections.
   */
  userCanManageSomething(): boolean {
    const p = this.user.permissions;
    return p.isAdmin || p.canManageRegistrations || p.canManageContents;
  }

  formatDateShort = (date: string | Date): string => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  formatTime(date: string | Date): string {
    if (!(date instanceof Date)) date = new Date(date);
    return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
}
