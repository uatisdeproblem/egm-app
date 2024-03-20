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
    alternativeDomain: 'app.erasmusgeneration.org',
    frontEndCertificateARN: 'arn:aws:acm:us-east-1:767203414619:certificate/a82a1829-9d1b-4e0e-a2e7-fda8ef7a72d6',
    destroyDataOnDelete: false,
    logLevel: 'INFO'
  },
  dev: {
    domain: 'dev.egm-app.click',
    frontEndCertificateARN: 'arn:aws:acm:us-east-1:767203414619:certificate/fb400353-44df-4148-a1f7-53f180c7db70',
    destroyDataOnDelete: true,
    logLevel: 'DEBUG'
  }
};

export const versionStatus: VersionStatus = {
  latestVersion: '0.1.0',
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
   * An alternative domain name where to reach the front-end.
   */
  alternativeDomain?: string;
  /**
   * The ARN of the certificate to use for the front-end's CloudFront distribution.
   */
  frontEndCertificateARN: string;
  /**
   * Whether to delete the data when the environment is deleted.
   * It should be True for dev and False for prod environments.
   */
  destroyDataOnDelete: boolean;
  /**
    * The minimum level of log to print in functions (default: `INFO`).
    */
  logLevel?: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
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
