export const environment = {
  app: {
    url: 'https://egm.iter-idea.com',
    mediaUrl: 'https://egm-#env#-media.s3.eu-south-1.amazonaws.com/thumbnails/images'
  },
  api: {
    url: 'https://api-egm.iter-idea.com',
    stage: 'prod'
  },
  cognito: {
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_W5470JQ4x',
    clientId: 'b5cb9bombpe5a6i0qt68k1hop',
    identityPoolId: 'eu-west-1:d73e72ca-a2eb-4212-94cd-7edf1c770080'
  },
  geo: {
    region: 'eu-west-1',
    mapName: 'egm-map',
    mapStyle: 'VectorEsriLightGrayCanvas'
  }
};
