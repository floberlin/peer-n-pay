import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flo.app',
  appName: 'PeerNPay',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
