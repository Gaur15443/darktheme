import {PermissionsAndroid, Platform} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import {store} from '../../../../store';
import {
  setGlobalPopUpType,
  setRequestPermissionState,
  setShouldOpenGlobalPopUp,
} from '../../../../store/apps/pushnotification';

export interface Callback {
  allowed: boolean;
  message: string | null;
}

export interface Permission {
  granted: boolean;
  OS: 'android' | 'ios' | 'any';
  area: 'audio' | 'notification' | 'both';
  message?: string;
}

interface Message {
  grant_success: Permission;
  audio_not_allowed_android: Permission;
  audio_not_allowed_ios: Permission;
  notification_not_allowed_android: Permission;
  both_not_allowed: Permission;
}

type PermissionCallback = (message: Callback) => void;

const AUDIO_NOT_ALLOWED = 'Please enable microphone access for calls.';
const NOTIFICATION_NOT_ALLOWED =
  'Please enable notifications to receive call alerts.';
const BOTH_NOT_ALLOWED =
  'Please enable microphone and notification permissions to access for calls.';

const _message: Message = {
  grant_success: {
    granted: true,
    OS: 'android',
    area: 'both',
    message: '',
  },
  audio_not_allowed_android: {
    granted: false,
    OS: 'android',
    area: 'audio',
    message: AUDIO_NOT_ALLOWED,
  },
  audio_not_allowed_ios: {
    granted: false,
    OS: 'ios',
    area: 'audio',
    message: AUDIO_NOT_ALLOWED,
  },
  notification_not_allowed_android: {
    granted: false,
    OS: 'android',
    area: 'notification',
    message: NOTIFICATION_NOT_ALLOWED,
  },
  both_not_allowed: {
    granted: false,
    OS: 'android',
    area: 'both',
    message: BOTH_NOT_ALLOWED,
  },
};

async function checkAudioPermissions(): Promise<Permission> {
  let audioGranted = false;
  const audioStatus = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );
  if (audioStatus) {
    audioGranted = true;
  } else {
    const audioRequest = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    audioGranted = audioRequest === PermissionsAndroid.RESULTS.GRANTED;
  }
  return {granted: audioGranted, OS: 'android', area: 'audio'};
}

async function checkAndRequestPermissions(): Promise<Permission> {
  try {
    let notificationGranted = false;
    const {status} = await checkNotifications();
    if (status === 'granted') {
      notificationGranted = true;
    } else {
      const notifRequest = await requestNotifications(['alert', 'sound']);
      notificationGranted = notifRequest.status === 'granted';
    }
    return {
      granted: notificationGranted,
      OS: Platform.OS === 'ios' ? 'ios' : 'android',
      area: 'notification',
    };
  } catch (err) {
    console.warn('Permission error:', err);
    return {
      granted: false,
      OS: Platform.OS === 'ios' ? 'ios' : 'android',
      area: 'both',
    };
  }
}

async function checkAndRequestPermissionsIOS(): Promise<Permission> {
  try {
    let audioGranted = false;
    const status = await check(PERMISSIONS.IOS.MICROPHONE);
    if (status === RESULTS.GRANTED) {
      audioGranted = true;
    }
    if (status === RESULTS.DENIED || status === RESULTS.LIMITED) {
      const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
      audioGranted = requestResult === RESULTS.GRANTED;
    }
    return {granted: audioGranted, OS: 'ios', area: 'audio'};
  } catch (err) {
    console.warn('Microphone permission error (iOS):', err);
    return {granted: false, OS: 'ios', area: 'audio'};
  }
}

export async function checkAndRequestCallPermissions(): Promise<Permission> {
  if (Platform.OS === 'ios') {
    const audioPermissionIos = await checkAndRequestPermissionsIOS();
    if (audioPermissionIos.granted) {
      return _message.grant_success;
    } else {
      store.dispatch(setGlobalPopUpType('mic'));
      store.dispatch(setShouldOpenGlobalPopUp(true));
      return _message.audio_not_allowed_ios;
    }
  }
  const audioPermission = await checkAudioPermissions();
  const notificationPermission = await checkAndRequestPermissions();
  if (audioPermission.granted && notificationPermission.granted) {
    return _message.grant_success;
  } else if (!audioPermission.granted) {
    store.dispatch(setGlobalPopUpType('mic'));
    store.dispatch(setShouldOpenGlobalPopUp(true));
    return _message.audio_not_allowed_android;
  } else if (!notificationPermission.granted) {
    store.dispatch(setGlobalPopUpType('push'));
    store.dispatch(setShouldOpenGlobalPopUp(true));
    return _message.notification_not_allowed_android;
  } else {
    store.dispatch(setGlobalPopUpType('push'));
    store.dispatch(setShouldOpenGlobalPopUp(true));
    return _message.both_not_allowed;
  }
}

export async function checkAndRequestChatPermissions(): Promise<Permission> {
  const notificationPermission = await checkAndRequestPermissions();
  if (notificationPermission.granted) {
    return _message.grant_success;
  } else {
    store.dispatch(setGlobalPopUpType('push'));
    store.dispatch(setShouldOpenGlobalPopUp(true));
    return _message.notification_not_allowed_android;
  }
}
