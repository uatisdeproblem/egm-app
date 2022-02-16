export const parameters: Parameters = {
  project: 'egm',
  awsAccount: '008360868121',
  awsRegion: 'eu-central-1',
  apiDomain: 'api.egm-app.link',
  mediaDomain: 'media.egm-app.link',
  firstAdminEmail: 'matteo.carbone@iter-idea.com'
};

export const environments: { [stage: string]: Stage } = {
  prod: {
    domain: 'egm-app.link',
    destroyDataOnDelete: false
  },
  dev: {
    domain: 'dev.egm-app.link',
    destroyDataOnDelete: true
  }
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
