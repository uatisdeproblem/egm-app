import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.esn.egm',
  appName: 'ESN EGM App',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
