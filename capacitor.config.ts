import { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.contractor.app',
  appName: 'site-labor-watch',
  webDir: 'dist',
  server: {
    url: "https://28359371-72e1-4d29-87a7-233f7c4c1615.lovableproject.com?forceHideBadge=true",
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
