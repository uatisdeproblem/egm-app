export const parameters: Parameters = {
  project: 'egm',
  awsAccount: '767203414619',
  awsRegion: 'eu-central-1',
  apiDomain: 'api.egm-app.click',
  mediaDomain: 'media.egm-app.click',
  firstAdminEmail: 'egm-technical@esn.org'
};

export const stages: { [stage: string]: Stage } = {
  prod: {
    domain: 'egm-app.click',
    destroyDataOnDelete: false
  },
  dev: {
    domain: 'dev.egm-app.click',
    destroyDataOnDelete: true
  }
};

export const versionStatus: VersionStatus = {
  latestVersion: '2.0.0',
  minVersion: null,
  maintenance: false
};

export interface Parameters {
  /**
   * Project key (unique to the AWS account).
   */
  project: string;
  /**
   * The AWS account where the cloud resources will be deployed.
   */
  awsAccount: string;
  /**
   * The AWS region where the cloud resources will be deployed.
   */
  awsRegion: string;
  /**
   * API for each environment will be available at `${apiDomain}/${env.stage}`.
   */
  apiDomain: string;
  /**
   * The domain name where to reach the front-end's media files.
   */
  mediaDomain: string;
  /**
   * The email address of the first (admin) user.
   */
  firstAdminEmail: string;
}

export interface Stage {
  /**
   * The domain name where to reach the front-end.
   */
  domain: string;
  /**
   * Whether to delete the data when the environment is deleted.
   * It should be True for dev and False for prod environments.
   */
  destroyDataOnDelete: boolean;
}

export interface VersionStatus {
  /**
   * The latest version of the app currently available.
   */
  latestVersion: string;
  /**
   * The minimum app version required to run the front-end, if any.
   */
  minVersion: string | null;
  /**
   * Wether the app is in maintenance mode.
   */
  maintenance: boolean;
}
