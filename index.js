/**
 * @format
 */

import {
  AppRegistry,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IncomingCall from './src/screens/AppScreens/IncomingCall';
import incommingCallNotificationHandler from './src/configs/Calls/IncommingCallNotificationHandler';
import RegisterVoipService from './src/configs/Voip/RegisterVoip';
import {store} from './src/store';
import {
  setShowCallDialogue,
  setShowUnavailableDialogue,
} from './src/store/apps/agora';
import {formatChatDetails} from './src/configs/Chats/FormatChatDetails';
import {
  chatId,
  onDisplayChatNotification,
} from './src/configs/Chats/ChatNotificationConfig';
import IncomingChat from './src/screens/AppScreens/IncomingChat';
import {VolumeManager} from 'react-native-volume-manager';
import InCallManager from 'react-native-incall-manager';
import {
  callId,
  onAnswer,
  onDecline,
  onDisplayCallNotification,
} from './src/configs/Calls/CallNotificationConfig';
import {
  onAnswer as onChatAnswer,
  onDecline as onChatDecline,
} from './src/configs/Chats/ChatNotificationConfig';
import notifee, {EventType} from '@notifee/react-native';
import {CALL_NOTIFICATION_ID} from './src/configs/Calls/Constants';
import {CHAT_NOTIFICATION_ID} from './src/configs/Chats/constants';

AsyncStorage.removeItem('addMember_MD');
AsyncStorage.removeItem('addMember_ED');
AsyncStorage.removeItem('addMember_WD');
AsyncStorage.removeItem('addMember_MH');
AsyncStorage.removeItem('addMember_CD');
AsyncStorage.removeItem('addMember_SD');

const isIos = Platform.OS === 'ios';
let _notificationData = null;
let _notificationChatData = null;

if (isIos) {
  RegisterVoipService.getInstance();
}

async function refreshCallData() {
  if (!callId) {
    const stored = await AsyncStorage.getItem('lastIncomingCall');
    await onDisplayCallNotification(JSON.parse(stored), true);
  }
}

async function refreshChatData() {
  if (!chatId) {
    const stored = await AsyncStorage.getItem('lastIncomingChat');
    await onDisplayChatNotification(JSON.parse(stored), true);
  }
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (
    remoteMessage?.data?.declineDetails &&
    typeof remoteMessage?.data?.declineDetails === 'string'
  ) {
    store.dispatch(setShowUnavailableDialogue(true));
    store.dispatch(setShowCallDialogue(false));
    AsyncStorage.removeItem('consultationInitTime');
  } else if (
    remoteMessage?.data?.callDetails &&
    typeof remoteMessage?.data?.callDetails === 'string'
  ) {
    _notificationData = remoteMessage;
    incommingCallNotificationHandler(remoteMessage);
  } else if (
    remoteMessage?.data?.chatDetails &&
    typeof remoteMessage?.data?.chatDetails === 'string'
  ) {
    const extractedData = formatChatDetails(remoteMessage);
    _notificationChatData = remoteMessage;
    onDisplayChatNotification(extractedData);
  } else if (remoteMessage?.data.notificationCategory === 'notifyMe') {
    const notifyMeData = JSON.parse(
      typeof remoteMessage?.data?.astrologerId === 'string'
        ? remoteMessage?.data?.astrologerId
        : '{}',
    );
    if (notifyMeData?.astrologerId) {
      messaging().unsubscribeFromTopic(notifyMeData.astrologerId);
    }
  }
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'reject' &&
    detail.notification?.id === CALL_NOTIFICATION_ID
  ) {
    notifee.cancelNotification(CALL_NOTIFICATION_ID);
    await refreshCallData();
    onDecline();
  }
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'accept' &&
    detail.notification?.id === CALL_NOTIFICATION_ID
  ) {
    await refreshCallData();
    onAnswer();
  }
  if (
    type === EventType.DISMISSED &&
    detail.notification?.id === CALL_NOTIFICATION_ID
  ) {
    await refreshCallData();
    await onDisplayCallNotification(detail.notification.data);
  }
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'reject' &&
    detail.notification?.id === CHAT_NOTIFICATION_ID
  ) {
    await refreshChatData();
    onChatDecline();
  }
  if (
    type === EventType.ACTION_PRESS &&
    detail.pressAction?.id === 'accept' &&
    detail.notification?.id === CHAT_NOTIFICATION_ID
  ) {
    await refreshChatData();
    await onChatAnswer();
  }
  if (
    type === EventType.DISMISSED &&
    detail.notification?.id === CHAT_NOTIFICATION_ID
  ) {
    await refreshChatData();
    await onDisplayChatNotification(detail.notification.data);
  }
});

if (Platform.OS !== 'ios') {
  const {PowerButton} = NativeModules;
  const eventEmitter = new NativeEventEmitter(PowerButton);
  VolumeManager.addVolumeListener(_ => {
    InCallManager.stopRingtone();
  });

  PowerButton.startListening();
  eventEmitter.addListener('HardwareButtonEvent', _ => {
    console.log('HardwareButtonEvent', _);
    InCallManager.stopRingtone();
  });
}

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
AppRegistry.registerComponent('incomingcall', () => props => {
  return <IncomingCall backgroundNotifiationData={_notificationData} />;
});
AppRegistry.registerComponent('incomingchat', () => props => {
  return <IncomingChat backgroundNotifiationData={_notificationChatData} />;
});
