import notifee, {
  AndroidCategory,
  AndroidFlags,
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import {DeviceEventEmitter, Linking, Platform} from 'react-native';
import {FormattedCallerDetails} from '../../components/AstroConsultation/Utils/FormatCallerDetails';
import {
  CALL_NOTIFICATION_BODY,
  CALL_NOTIFICATION_CHANNEL,
  CALL_NOTIFICATION_CHANNEL_DESCRIPTION,
  CALL_NOTIFICATION_ID,
  CALL_TIMEOUT,
  MISSED_CALL_NOTIFICATION_BODY,
  MISSED_CALL_NOTIFICATION_CHANNEL_DESCRIPTION,
  MISSED_CALL_NOTIFICATION_CHANNEL,
  MISSED_CALL_NOTIFICATION_ID,
  MISSED_CALL_TITLE,
  AGORA_API_BASE_URL,
  ASTRO_DEFAULT_AVATAR,
  INCOMING_CALL_SCREEN_CLOSE_EMITTER,
} from './Constants';
import Axios from '../../plugin/Axios';
import {store} from '../../store';
import {
  resetShowCallDialogue,
  setShowCallDialogue,
  setShowUnavailableDialogue,
} from '../../store/apps/agora';
import {AxiosError} from 'axios';
import _BackgroundTimer from 'react-native-background-timer';
import InCallManager from 'react-native-incall-manager';
import {navigationRef} from '../Voip/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export let callId: string | null = null;
let profilePic: string = ASTRO_DEFAULT_AVATAR;
let astrologerId: string | null = null;
let userId: string | null = null;
let allNotificationData: FormattedCallerDetails = {
  channelName: '',
  userId: '',
  expiry: 0,
  gender: '',
  fullName: '',
  profilePic: '',
  astrologerId: '',
  callId: '',
  displayName: '',
};
let timeRef = CALL_TIMEOUT;
let timer: any = null;

export function closeIncomingCallScreen() {
  DeviceEventEmitter.emit(INCOMING_CALL_SCREEN_CLOSE_EMITTER);
}

async function logMissedCallEvent() {
  try {
    const payload = {callId, userId};
    await Axios.post(`${AGORA_API_BASE_URL}/call/missedCallUser`, payload);
  } catch (_err) {
    console.log(_err);
  }
}

export async function logMissedCallEventAstrologer(prop: {
  callId?: string;
  astrologerId?: string;
}) {
  try {
    const payload = {
      callId: prop?.callId ?? callId,
      astrologerId: prop?.astrologerId ?? astrologerId,
    };
    await Axios.post(
      `${AGORA_API_BASE_URL}/call/missedCallAstrologer`,
      payload,
    );
  } catch (_err) {
    console.log((_err as AxiosError).message);
  }
}

export async function logCallDecline(
  callIdParam: string | null = null,
  _astrologerId: string | null = null,
) {
  try {
    const payload = callId ? {callId} : {callId: callIdParam};
    astrologerId =
      astrologerId && astrologerId?.length > 0 ? astrologerId : _astrologerId;
    await Axios.post(
      `${AGORA_API_BASE_URL}/call/callDecline/user/${astrologerId}`,
      payload,
    );
  } catch (_err) {
    console.log(_err);
  }
}

function startMissedCallTimer() {
  timer = _BackgroundTimer.setInterval(() => {
    if (timeRef <= 1) {
      stopRingtone();
      notifee.cancelNotification(CALL_NOTIFICATION_ID);
      store.dispatch(resetShowCallDialogue());
      _BackgroundTimer.clearInterval(timer);
      closeIncomingCallScreen();
      // triggerMissedCallNotification();
    } else {
      timeRef -= 1;
    }
  }, 1000);
}

function clearMissedCallTimer() {
  _BackgroundTimer.clearInterval(timer);
  timeRef = CALL_TIMEOUT;
}

async function triggerMissedCallNotification() {
  await logMissedCallEvent();
  const channelId = await notifee.createChannel({
    id: MISSED_CALL_NOTIFICATION_ID,
    name: MISSED_CALL_NOTIFICATION_CHANNEL,
    description: MISSED_CALL_NOTIFICATION_CHANNEL_DESCRIPTION,
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    id: MISSED_CALL_NOTIFICATION_ID,
    title: MISSED_CALL_TITLE,
    body: MISSED_CALL_NOTIFICATION_BODY,
    android: {
      channelId,
      category: AndroidCategory.CALL,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      smallIcon: 'ic_notification',
      largeIcon: profilePic,
      circularLargeIcon: true,
      timestamp: Date.now(),
      showTimestamp: true,
    },
  });
}

export function stopRingtone() {
  clearMissedCallTimer();
  InCallManager.stopRingtone();
}

export async function playRingTone() {
  try {
    stopRingtone();
    InCallManager.startRingtone('_DEFAULT_', [0, 500, 1000], '', CALL_TIMEOUT);
    clearMissedCallTimer();
    startMissedCallTimer();
  } catch (error) {
    console.error('Error:', error);
  }
}

export function onAnswer() {
  const notificationData = allNotificationData;
  _BackgroundTimer.clearInterval(timer);
  store.dispatch(resetShowCallDialogue());
  notifee.cancelNotification(CALL_NOTIFICATION_ID);
  stopRingtone();
  const encodedData = JSON.stringify(notificationData);
  Linking.openURL(`imeuswe://CallAnswer/${encodeURIComponent(encodedData)}`);
}

export const onDisplayCallNotification = async (
  data: FormattedCallerDetails,
  isDataRefresh = false,
) => {
  await Promise.all([
    AsyncStorage.setItem('lastIncomingCall', JSON.stringify(data)),
    AsyncStorage.removeItem('consultationInitTime'),
  ]);
  allNotificationData = data;
  callId = data.callId;
  astrologerId = data.astrologerId;
  profilePic =
    data?.profilePic?.length > 0 ? data.profilePic : ASTRO_DEFAULT_AVATAR;
  userId = data.userId;
  console.log('data', data);
  store.dispatch(resetShowCallDialogue());
  if (isDataRefresh) {
    return;
  }

  if (Platform.OS === 'android') {
    const channelId = await notifee.createChannel({
      id: CALL_NOTIFICATION_ID,
      name: CALL_NOTIFICATION_CHANNEL,
      bypassDnd: true,
      description: CALL_NOTIFICATION_CHANNEL_DESCRIPTION,
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      id: CALL_NOTIFICATION_ID,
      title: data.displayName ?? 'Username',
      body: CALL_NOTIFICATION_BODY,
      data: {
        channelName: data?.channelName ?? '',
        userId: data?.userId ?? '',
        expiry: data?.expiry ?? '',
        gender: data?.gender ?? '',
        fullName: data?.displayName ?? '',
        profilePic: data?.profilePic ?? '',
        astrologerId: data.astrologerId ?? '',
        callId: data.callId ?? '',
        displayName: data.displayName,
      },
      android: {
        ongoing: true,
        autoCancel: false,
        flags: [AndroidFlags.FLAG_NO_CLEAR, AndroidFlags.FLAG_INSISTENT],
        channelId,
        category: AndroidCategory.CALL,
        visibility: AndroidVisibility.PUBLIC,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification',
        largeIcon: profilePic,
        circularLargeIcon: true,
        lightUpScreen: true,
        timestamp: Date.now(),
        showTimestamp: true,
        pressAction: {
          id: 'default',
          launchActivity: 'com.imeuswe.app.IncomingCallActivity',
        },
        actions: [
          {
            title: 'Accept',
            pressAction: {
              id: 'accept',
            },
          },
          {
            title: 'Decline',
            pressAction: {
              id: 'reject',
            },
          },
        ],
        fullScreenAction: {
          id: 'default',
          launchActivity: 'com.imeuswe.app.IncomingCallActivity',
        },
      },
    });
  }
};

export async function onDecline() {
  if (Platform.OS === 'ios' && timeRef < 5) {
    stopRingtone();
    notifee.cancelNotification(CALL_NOTIFICATION_ID);
    store.dispatch(resetShowCallDialogue());
    store.dispatch(setShowUnavailableDialogue(true));
    _BackgroundTimer.clearInterval(timer);
    closeIncomingCallScreen();
  } else {
    notifee.cancelNotification(CALL_NOTIFICATION_ID);
    clearMissedCallTimer();
    stopRingtone();
    closeIncomingCallScreen();
    store.dispatch(setShowCallDialogue(false));
    await logCallDecline();
    //@ts-ignore
    navigationRef.navigate('AstroBottomTabs', {screen: 'Consultation'});
  }
}

notifee.onForegroundEvent(({type, detail}) => {
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'reject' &&
    detail.notification?.id === CALL_NOTIFICATION_ID
  ) {
    onDecline();
  }
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'accept' &&
    detail.notification?.id === CALL_NOTIFICATION_ID
  ) {
    onAnswer();
  }
  if (
    type === EventType.DISMISSED &&
    detail.notification?.id === CALL_NOTIFICATION_ID
  ) {
    //@ts-ignore
    onDisplayCallNotification(detail.notification.data);
  }
});
