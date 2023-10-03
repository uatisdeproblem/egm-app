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
import { UserProfile } from '@models/userProfile.model';

/**
 * A local fallback URL for the users avatars.
 */
const AVATAR_FALLBACK_URL = './assets/imgs/no-avatar.jpg';
/**
 * The local URL to the icon.
 */
const APP_ICON_PATH = 'assets/icons/icon.svg';

@Injectable({ providedIn: 'root' })
export class AppService {
  initReady = false;
  authReady = false;

  private darkMode: boolean;

  user: UserProfile;

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
   * Get the URL to a user's profile image (avatar).
   */
  getUserImageURL(user: UserProfile): string {
    return user?.avatarURL ? user.avatarURL : AVATAR_FALLBACK_URL;
  }
  // ! IN CASE WE PUT ESN GALAXY AVATARS ON S3
  //   /**
  //  * Get the URL to an image by its URI.
  //  */
  //   getImageURLByURI(imageURI: string): string {
  //     return imageURI ? THUMBNAILS_BASE_URL.concat(imageURI, '.png') : null;
  //   }
  //   /**
  //    * Get the URL to a user's profile image (avatar).
  //    */
  //   getUserImageURL(user: User): string {
  //     return user?.imageURI ? this.getImageURLByURI(user.imageURI) : AVATAR_FALLBACK_URL;
  //   }
  // ! IN CASE WE PUT ESN GALAXY AVATARS ON S3

  /**
   * Actions on the current user.
   */
  async openUserPreferences(): Promise<void> {
    const header = this.user.name;
    const buttons = [
      { text: this.t._('COMMON.LOGOUT'), icon: 'log-out', handler: () => this.logout() },
      { text: this.t._('COMMON.CANCEL'), role: 'cancel', icon: 'arrow-undo' }
    ];

    const actions = await this.actionSheetCtrl.create({ header, buttons });
    actions.present();
  }
  /**
   * Show some app's info.
   */
  async info(): Promise<void> {
    const openPrivacyPolicy = () => Browser.open({ url: this.t._('IDEA_VARIABLES.PRIVACY_POLICY_URL') });

    const header = this.t._('COMMON.APP_NAME');
    const message = this.t._('COMMON.VERSION', { v: env.idea.app.version });
    const buttons = [
      { text: this.t._('IDEA_AUTH.PRIVACY_POLICY'), handler: openPrivacyPolicy },
      { text: this.t._('COMMON.CLOSE') }
    ];

    const alert = await this.alertCtrl.create({ header, message, buttons });
    alert.present();
  }

  /**
   * Sign-out from the current user.
   */
  async logout(): Promise<void> {
    const cognitoLogout = () => {
      this.auth.logout().finally(() => this.storage.clear().then(() => this.reloadApp()));
    };
    const esnLogout = async (): Promise<void> => {
      await this.storage.clear();
      this.reloadApp();
    };

    const doLogout = this.user.isExternal ? cognitoLogout : esnLogout;

    const header = this.t._('COMMON.LOGOUT');
    const message = this.t._('COMMON.ARE_YOU_SURE');
    const buttons = [{ text: this.t._('COMMON.CANCEL') }, { text: this.t._('COMMON.LOGOUT'), handler: doLogout }];

    const alert = await this.alertCtrl.create({ header, message, buttons });
    alert.present();
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
  getIcon(): string {
    return APP_ICON_PATH;
  }
}
