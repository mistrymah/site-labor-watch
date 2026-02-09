import { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.contractor.app',
  appName: 'site-labor-watch',
  webDir: 'dist',
  server: {
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e40af",
      showSpinner: false
    }
  }
};

export default config;
