import config from 'react-native-config';
//console.log(config, 'config');
const authConfig = {
  storageTokenKeyName: 'imuwAccessToken',
  webError: 'JsonWebTokenError',
  userData: 'userData',
  appBaseUrl: config.APP_BASE_URL,
  authBaseUrl: config.AUTH_BASE_URL,
  astroBaseUrl: config.ASTRO_BASE_URL,
  atrologerBaseUrl: config.ASTROLOGER_BASE_URL,
  telephonyBaseUrl: config.TELEPHONY_BASE_URL,
  treeUrl: config.treeUrl,
  walletBaseUrl: config.WALLET_BASE_URL,
  CRON_BASE_URL: config.CRON_BASE_URL,
  PD_ENTITY_URL: config.PD_ENTITY_URL,
  agoraAppID: config.AGORA_APP_ID,
  agoraAppKey: config.AGORA_APP_KEY,
  shouldForceLogout: false,
  env: config.ENV,
  toastMessagesConsultation: config.TOAST_MESSAGES_CONSULTATION,
  toastMessagesWallet: config.TOAST_MESSAGES_WALLET,
  secretEncryptionKey: config.SECRET_ENCRYPTION_KEY,
  // ipapiTrialKey:config.IPAPI_TRIAL_KEY,
};

let changeCallback = null;

export const setChangeCallback = callback => {
  changeCallback = callback;
};
// Proxy to help call react function outside react
const authConfigProxy = new Proxy(authConfig, {
  set(target, key, value) {
    target[key] = value;
    if (changeCallback) {
      changeCallback({key, value});
    }
    return true;
  },
});

export {authConfigProxy};
export default authConfig;
