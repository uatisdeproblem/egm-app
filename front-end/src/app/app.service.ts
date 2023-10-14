import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import {
  IDEAActionSheetController,
  IDEAApiService,
  IDEAMessageService,
  IDEAStorageService,
  IDEATranslationsService
} from '@idea-ionic/common';
import { IDEAAuthService } from '@idea-ionic/auth';

import { environment as env } from '@env';
import { AuthServices, User } from '@models/user.model';

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

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private message: IDEAMessageService,
    private storage: IDEAStorageService,
    private actionSheetCtrl: IDEAActionSheetController,
    private auth: IDEAAuthService,
    private api: IDEAApiService,
    private t: IDEATranslationsService
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
    const windowName = this.platform.is('ios') ? '_parent' : '_blank';
    await Browser.open({ url, windowName });
  }
  /**
   * Open a user's profile on ESN Accounts.
   */
  async openUserProfileInESNAccounts(user: User): Promise<void> {
    if (user.authService !== AuthServices.ESN_ACCOUNTS) return;
    const galaxyId = user.getAuthServiceUserId();
    const cleanESNAccountsIdForURL = (id: string): string => id.replace(/[._@]/gm, '').replace(/\s/gm, '-');
    await this.openURL('https://accounts.esn.org/user/'.concat(cleanESNAccountsIdForURL(galaxyId)));
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
}
