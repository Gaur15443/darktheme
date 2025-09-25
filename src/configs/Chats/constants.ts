import nativeConfig from 'react-native-config';
export const CHAT_NOTIFICATION_ID = 'incoming_chat_request';
export const MISSED_CHAT_NOTIFICATION_ID = 'missed_chat_request';

export const CHAT_TIMEOUT = 60;
export const MISSED_CHAT_TITLE = 'Missed Chat Request';

export const CHAT_NOTIFICATION_CHANNEL = 'Chat Channel';
export const MISSED_CHAT_NOTIFICATION_CHANNEL = 'Missed Chat Channel';

export const CHAT_NOTIFICATION_BODY = 'Incoming Chat Request';
export const MISSED_CHAT_NOTIFICATION_BODY = 'You have a missed chat';

export const CHAT_NOTIFICATION_CHANNEL_DESCRIPTION =
  'This channel is meant to receive chat notifications';
export const MISSED_CHAT_NOTIFICATION_CHANNEL_DESCRIPTION =
  'This channel is meant to receive missed chat notifications';

export const AGORA_API_BASE_URL = nativeConfig.TELEPHONY_BASE_URL;
export const ASTRO_DEFAULT_AVATAR =
  'https://testing-email-template.s3.ap-south-1.amazonaws.com/astro_default_profile.png';

export const IMEUSWE_LOGO_URL =
  'https://testing-email-template.s3.ap-south-1.amazonaws.com/imeusweHeader.png';

export const CHATS_PER_PAGE = 25;

export const INCOMING_CHAT_SCREEN_CLOSE_EMITTER = 'CLOSE_CHAT_SCREEN';
export const END_CHAT_SESSION_EMITTER = 'END_CHAT_SESSION';
