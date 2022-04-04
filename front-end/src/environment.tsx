const CURRENT_STAGE = 'prod';

const environments = {
  prod: {
    url: 'https://egm-app.link'
  },
  dev: {
    url: 'https://dev.egm-app.link'
  }
};

const parameters = {
  currentStage: CURRENT_STAGE,
  stage: { url: 'placeholder' },
  version: '1.2.1',
  supportEmail: 'egm.it@esnportugal.org',
  privacyPolicyURL: 'https://www.iubenda.com/privacy-policy/47311861',
  apiUrl: 'https://api.egm-app.link',
  mediaUrl: 'https://media.egm-app.link',
  cognito: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_SlQedanI2',
    clientId: '79oefmmgrarj9to179mbcraqfn',
    identityPoolId: 'eu-central-1:fb226784-32e8-4b54-a220-3f482ced6a16'
  },
  geo: {
    region: 'eu-central-1',
    mapName: 'egm-map',
    mapStyle: 'VectorEsriLightGrayCanvas'
  }
};

export const getEnv = () => {
  parameters.stage = environments[CURRENT_STAGE];
  return parameters;
};
