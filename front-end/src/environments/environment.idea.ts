/**
 * Variables to configure an ITER IDEA's cloud app, together with its inner modules.
 */
export const environment = {
  idea: {
    project: 'egm-app',
    app: {
      version: '3.0.2',
      bundle: 'com.esn.egmapp',
      url: 'https://egm-app.click',
      mediaUrl: 'https://media.egm-app.click',
      title: 'EGM app',
      hasIntroPage: false,
      appleStoreURL: '',
      googleStoreURL: ''
    },
    api: {
      url: 'api.egm-app.click',
      stage: 'prod'
    },
    auth: {
      registrationIsPossible: true,
      singleSimultaneousSession: false,
      forceLoginWithMFA: false,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireDigits: false,
        requireSymbols: false,
        requireUppercase: false
      }
    },
    ionicExtraModules: ['common', 'variables', 'auth'],
    website: 'https://iter-idea.com'
  },
  aws: {
    cognito: {
      userPoolId: 'eu-central-1_kKAKoQ0Nb',
      userPoolClientId: '6cve8rpmb6g8m54spjujl9bt0n'
    }
  }
};
