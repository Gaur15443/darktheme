import nativeConfig from 'react-native-config';
export const CALL_NOTIFICATION_ID = 'incoming_call';
export const MISSED_CALL_NOTIFICATION_ID = 'missed_call';

export const CALL_TIMEOUT = 60;
export const MISSED_CALL_TITLE = 'Missed Call';

export const CALL_NOTIFICATION_CHANNEL = 'Call Channel';
export const MISSED_CALL_NOTIFICATION_CHANNEL = 'Missed Call Channel';

export const CALL_NOTIFICATION_BODY = 'Incoming voice call';
export const MISSED_CALL_NOTIFICATION_BODY = 'You have a missed call';

export const CALL_NOTIFICATION_CHANNEL_DESCRIPTION =
  'This channel is meant to receive call notifications';
export const MISSED_CALL_NOTIFICATION_CHANNEL_DESCRIPTION =
  'This channel is meant to receive missed call notifications';

export const AGORA_API_BASE_URL = nativeConfig.TELEPHONY_BASE_URL;
export const ASTRO_DEFAULT_AVATAR =
  'https://testing-email-template.s3.ap-south-1.amazonaws.com/astro_default_profile.png';

export const INCOMING_CALL_SCREEN_CLOSE_EMITTER = 'CLOSE_CALL_SCREEN';

export const IMEUSWE_LOGO_URL =
  'https://testing-email-template.s3.ap-south-1.amazonaws.com/imeusweHeader.png';

export const CONSULTATION_INIT_COUNTER = 60;
