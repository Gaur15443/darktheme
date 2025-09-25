/* eslint-disable react-native/no-inline-styles */
import {
  BackHandler,
  Image,
  Text,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
  AppState,
  NativeEventSubscription,
  AppStateStatus,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CallAnswer from '../../../images/Icons/CallAnswer';
import CallDecline from '../../../images/Icons/CallDecline';
import notifee, {InitialNotification} from '@notifee/react-native';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {ASTRO_DEFAULT_AVATAR} from '../../../configs/Calls/Constants';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {
  ChatDetails,
  formatChatDetails,
} from '../../../configs/Chats/FormatChatDetails';
import {INCOMING_CHAT_SCREEN_CLOSE_EMITTER} from '../../../configs/Chats/constants';
import {
  onAnswer,
  onDecline,
} from '../../../configs/Chats/ChatNotificationConfig';
import ChatDecline from '../../../images/Icons/ChatDecline';
import ChatAnswer from '../../../images/Icons/ChatAnswer';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function IncomingChat({
  backgroundNotifiationData,
}: {
  backgroundNotifiationData: FirebaseMessagingTypes.RemoteMessage;
}) {
  let _appState: 'background' | 'foreground' = 'background';
  // const dispatch = useDispatch<AppDispatch>();
  const [notificationData, setNotificationData] = useState<ChatDetails>({
    astrologerId: '',
    userId: '',
    channelName: '',
    chatRoomId: '',
    astrologerPersonalDetails: {
      gender: '',
      relationStatus: '',
      profilepic: '',
      livingStatus: '',
      lastname: '',
      name: '',
    },
    displayName: '',
    expiry: 0,
    kundliId: '',
  });

  useEffect(() => {
    let appStateListener: NativeEventSubscription | null = null;
    appStateListener = AppState.addEventListener(
      'change',
      (screenState: AppStateStatus) => {
        if (screenState === 'background') {
          _appState = 'background';
        } else {
          _appState = 'foreground';
        }
      },
    );

    const sub = DeviceEventEmitter.addListener(
      INCOMING_CHAT_SCREEN_CLOSE_EMITTER,
      () => {
        setTimeout(() => {
          if (_appState === 'foreground') {
            BackHandler.exitApp();
          }
        }, 300);
      },
    );

    return () => {
      appStateListener.remove();
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!backgroundNotifiationData) {
      notifee
        .getInitialNotification()
        .then((notification: InitialNotification | null) => {
          if (!notification || !notification.notification?.data) return;
          const data: ChatDetails | any = notification?.notification.data;
          setNotificationData({
            astrologerId: data.astrologerId,
            userId: data.userId,
            channelName: data.channelName,
            chatRoomId: data.chatRoomId,
            astrologerPersonalDetails: data.astrologerPersonalDetails,
            displayName: data.displayName,
            expiry: data.expiry,
            kundliId: data.kundliId,
          });
        });
    } else {
      if (
        backgroundNotifiationData?.data?.chatDetails &&
        typeof backgroundNotifiationData?.data?.chatDetails === 'string'
      ) {
        const callerDetails = JSON.parse(
          backgroundNotifiationData?.data?.chatDetails,
        );
        const extractedData = formatChatDetails(callerDetails);
        setNotificationData(extractedData);
      }
      return;
    }
  }, []);

  async function goToHome() {
    try {
      await onAnswer();
    } catch (_err) {
      console.log(_err);
    }
  }

  return (
    <ErrorBoundary>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'rgb(18,16,41)',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: '100%',
            height: 100,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 100,
          }}>
          <Image
            source={{
              uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/imeusweHeader.png',
            }}
            style={{
              height: '100%',
              width: '100%',
              borderColor: 'white',
              transform: [{scale: 0.5}],
            }}
            resizeMode="contain"
          />
        </View>
        <View style={{alignItems: 'center', gap: 15}}>
          <View
            style={{
              width: 130,
              height: 130,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 30,
              borderRadius: 130 / 2,
              overflow: 'hidden',
            }}>
            <Image
              source={{
                uri:
                  notificationData?.astrologerPersonalDetails &&
                  notificationData?.astrologerPersonalDetails?.profilepic
                    ?.length > 0
                    ? notificationData?.astrologerPersonalDetails?.profilepic
                    : ASTRO_DEFAULT_AVATAR,
              }}
              style={{
                height: '100%',
                width: '100%',
              }}
              resizeMode="cover"
            />
          </View>
          {notificationData?.displayName && (
            <Text style={{color: 'white', fontSize: 22, fontWeight: '600'}}>
              {notificationData.displayName}
            </Text>
          )}
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: 13,
              fontWeight: '400',
              top: -10,
            }}>
            Invited you for a chat
          </Text>
        </View>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 40,
            marginTop: 'auto',
            marginBottom: 30,
          }}>
          <TouchableOpacity
            style={{alignItems: 'center', gap: 7}}
            activeOpacity={0.7}
            onPress={() => {
              onDecline();
              BackHandler.exitApp();
            }}>
            <ChatDecline />
            <Text style={{color: 'white'}}>Decline Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{alignItems: 'center', gap: 7}}
            activeOpacity={0.7}
            onPress={() => goToHome()}>
            <ChatAnswer />
            <Text style={{color: 'white'}}>Accept Chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
