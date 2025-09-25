import notifee, {
  AndroidCategory,
  AndroidFlags,
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import Axios from '../../plugin/Axios';
import _BackgroundTimer from 'react-native-background-timer';
import InCallManager from 'react-native-incall-manager';
import {
  AGORA_API_BASE_URL,
  ASTRO_DEFAULT_AVATAR,
  CHAT_NOTIFICATION_BODY,
  CHAT_NOTIFICATION_CHANNEL,
  CHAT_NOTIFICATION_CHANNEL_DESCRIPTION,
  CHAT_NOTIFICATION_ID,
  CHAT_TIMEOUT,
  INCOMING_CHAT_SCREEN_CLOSE_EMITTER,
  MISSED_CHAT_NOTIFICATION_BODY,
  MISSED_CHAT_NOTIFICATION_CHANNEL,
  MISSED_CHAT_NOTIFICATION_CHANNEL_DESCRIPTION,
  MISSED_CHAT_NOTIFICATION_ID,
  MISSED_CHAT_TITLE,
} from './constants';
import {ChatDetails} from './FormatChatDetails';
import {store} from '../../store';
import {
  getKundliData,
  resetShowCallDialogue,
  setChatReqDetails,
  setKundliId,
  setShowUnavailableDialogue,
  setTotalAvaiableConsultationTime,
} from '../../store/apps/agora';
import Toast from 'react-native-toast-message';
import {DeviceEventEmitter, Linking, Platform} from 'react-native';
import {navigate} from '../Voip/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export let chatId: string | null = null;
let profilePic: string = ASTRO_DEFAULT_AVATAR;
let astrologerId: string | null = null;
let userId: string | null = null;
let timeRef = CHAT_TIMEOUT;
let notificationData: ChatDetails | null = null;
const from = 'user';
let timer: any = null;

async function logMissedChatEvent() {
  try {
    const payload = {
      chatRoomId: chatId,
      userId: userId,
    };
    await Axios.post(`${AGORA_API_BASE_URL}/chat/missedChatUser`, payload);
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Something went wrong',
      text2: (error as Error).message,
    });
  }
}

export async function logChatDecline() {
  try {
    await Axios.post(
      `${AGORA_API_BASE_URL}/chat/chatReqDecline/${from}/${userId}/${astrologerId}/${chatId}`,
    );
  } catch (_err) {
    Toast.show({
      type: 'error',
      text1: 'Something went wrong',
      text2: (_err as Error).message,
    });
    console.log(_err);
  }
}

function startMissedChatTimer() {
  timer = _BackgroundTimer.setInterval(() => {
    console.log('timeRef', timeRef);
    if (timeRef <= 1) {
      stopRingtone();
      closeIncomingChatScreen();
      notifee.cancelNotification(CHAT_NOTIFICATION_ID);
      _BackgroundTimer.clearInterval(timer);
      // triggerMissedChatNotification();
    } else {
      timeRef -= 1;
    }
  }, 1000);
}

function clearMissedChatTimer() {
  _BackgroundTimer.clearInterval(timer);
  timeRef = CHAT_TIMEOUT;
}

async function triggerMissedChatNotification() {
  await logMissedChatEvent();
  const channelId = await notifee.createChannel({
    id: MISSED_CHAT_NOTIFICATION_ID,
    name: MISSED_CHAT_NOTIFICATION_CHANNEL,
    description: MISSED_CHAT_NOTIFICATION_CHANNEL_DESCRIPTION,
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    id: MISSED_CHAT_NOTIFICATION_ID,
    title: MISSED_CHAT_TITLE,
    body: MISSED_CHAT_NOTIFICATION_BODY,
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
  clearMissedChatTimer();
  if (Platform.OS === 'android') {
    InCallManager.stopRingtone();
  }
}

export async function playRingTone() {
  try {
    stopRingtone();
    if (Platform.OS === 'android') {
      InCallManager.startRingtone(
        '_DEFAULT_',
        [0, 500, 1000],
        '',
        CHAT_TIMEOUT,
      );
    }
    startMissedChatTimer();
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function onAnswer(_notificationData?: ChatDetails) {
  if (notificationData || _notificationData) {
    if (Platform.OS === 'android') {
      notifee.cancelNotification(CHAT_NOTIFICATION_ID);
    }
    clearMissedChatTimer();
    stopRingtone();
    console.log(notificationData?.kundliId);
    if (notificationData?.kundliId) {
      await store
        .dispatch(getKundliData({kundliId: notificationData?.kundliId}))
        .unwrap();
    }
    //@ts-ignore
    if (notificationData) {
      store.dispatch(setChatReqDetails(notificationData));
    }
    if (_notificationData) {
      store.dispatch(setChatReqDetails(_notificationData));
    }
    if (Platform.OS === 'ios') {
      navigate('ChatScreen');
    } else {
      Linking.openURL(`imeuswe://ChatScreen`);
    }
  }
}

export function closeIncomingChatScreen() {
  DeviceEventEmitter.emit(INCOMING_CHAT_SCREEN_CLOSE_EMITTER);
}

export const onDisplayChatNotification = async (
  data: ChatDetails,
  isDataRefresh = false,
) => {
  await Promise.all([
    AsyncStorage.setItem('lastIncomingChat', JSON.stringify(data)),
    AsyncStorage.removeItem('consultationInitTime'),
  ]);
  playRingTone();
  store.dispatch(resetShowCallDialogue());
  store.dispatch(setKundliId(data.kundliId));
  store.dispatch(setTotalAvaiableConsultationTime(data.expiry));
  chatId = data?.chatRoomId ?? '';
  astrologerId = data.astrologerId ?? '';
  profilePic =
    data?.astrologerPersonalDetails?.profilepic &&
    data?.astrologerPersonalDetails?.profilepic?.length > 0
      ? data.astrologerPersonalDetails?.profilepic
      : ASTRO_DEFAULT_AVATAR;
  userId = data.userId ?? '';
  notificationData = data;
  if (isDataRefresh) {
    return;
  }
  if (Platform.OS === 'android') {
    const channelId = await notifee.createChannel({
      id: CHAT_NOTIFICATION_ID,
      name: CHAT_NOTIFICATION_CHANNEL,
      bypassDnd: true,
      description: CHAT_NOTIFICATION_CHANNEL_DESCRIPTION,
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      id: CHAT_NOTIFICATION_ID,
      title: data.displayName ?? 'Username',
      body: CHAT_NOTIFICATION_BODY,
      data: {
        channelName: data?.channelName ?? '',
        userId: data?.userId ?? '',
        fullName: data?.displayName ?? '',
        profilePic:
          data?.astrologerPersonalDetails?.profilepic &&
          data?.astrologerPersonalDetails?.profilepic?.length > 0
            ? data.astrologerPersonalDetails?.profilepic
            : ASTRO_DEFAULT_AVATAR,
        astrologerId: data.astrologerId ?? '',
        chatId: data.chatRoomId ?? '',
        displayName: data.displayName,
        astrologerPersonalDetails: data.astrologerPersonalDetails ?? '',
        chatRoomId: data.chatRoomId ?? '',
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
          launchActivity: 'com.imeuswe.app.IncomingChatActivity',
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
          launchActivity: 'com.imeuswe.app.IncomingChatActivity',
        },
      },
    });
  }
};

export async function onDecline() {
  if (Platform.OS === 'ios' && timeRef < 5) {
    stopRingtone();
    closeIncomingChatScreen();
    store.dispatch(setShowUnavailableDialogue(true));
    notifee.cancelNotification(CHAT_NOTIFICATION_ID);
    _BackgroundTimer.clearInterval(timer);
  } else {
    notifee.cancelNotification(CHAT_NOTIFICATION_ID);
    clearMissedChatTimer();
    closeIncomingChatScreen();
    stopRingtone();
    store.dispatch(resetShowCallDialogue());
    await logChatDecline();
    navigate('Consultation');
  }
}

notifee.onForegroundEvent(async ({type, detail}) => {
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'reject' &&
    detail.notification?.id === CHAT_NOTIFICATION_ID
  ) {
    onDecline();
  }
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'accept' &&
    detail.notification?.id === CHAT_NOTIFICATION_ID
  ) {
    await onAnswer();
  }
  if (
    type === EventType.DISMISSED &&
    detail.notification?.id === CHAT_NOTIFICATION_ID
  ) {
    //@ts-ignore
    onDisplayChatNotification(detail.notification.data);
  }
});
