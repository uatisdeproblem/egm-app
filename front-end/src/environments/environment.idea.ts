/**
 * Variables to configure an ITER IDEA's cloud app, together with its inner modules.
 */
export const environment = {
  idea: {
    project: 'egm-app',
    app: {
      version: '3.3.1',
      bundle: 'com.esn.egmapp',
      url: 'https://app.erasmusgeneration.org',
      mediaUrl: 'https://media.egm-app.click',
      appleStoreURL: '',
      googleStoreURL: ''
    },
    api: {
      url: 'api.egm-app.click',
      stage: 'prod'
    },
    auth: {
      title: 'EGM app',
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
    ionicExtraModules: ['common']
  },
  aws: {
    cognito: {
      userPoolId: 'eu-central-1_kKAKoQ0Nb',
      userPoolClientId: '6cve8rpmb6g8m54spjujl9bt0n'
    },
    location: {
      region: 'eu-central-1',
      mapName: 'egm-map',
      apiKey:
        'v1.public.eyJqdGkiOiI0ZDhkN2JmNi1mZDJiLTRjZWItYmU3YS0xZTQ1N2NjYzgyMGEifVKV78jhs72z9PLOwFDnjd15qS7y8-0f4jU8pzzZWzg-6ydvzVfavRTUBJImixDHWccxkPsvqzUQa_B4fltdZ8vho-Omp4hAd3vjO5gv9FqJrrMeAsvJm2gMoG0pA92pT00hnzZ3dZi2TTCxHSuztLFRl8q3GHOU9ZTjewscLNoFKZ36kP9qT1YqFNAdU2kAjtsTwDwkwtC-63Jj7x2cIngxfE-nteRDyVc_duQbANg36nO8lcZAZJSHwRbwvpzO0chEmrvGsmT01_5Ggsrrjr0SSXrYSNYbY7UATEwdQ87x3nKdKO0RcKESkwBHH9CMgVPRfk4GzID_TfkfLQO4eRU.Y2MzMTcwNWYtZTgwMy00NGZlLWFiNGItNzVkMDFmMDM0Nzcy'
    }
  }
};
