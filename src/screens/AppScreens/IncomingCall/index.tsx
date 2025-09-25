/* eslint-disable react-native/no-inline-styles */
import {
  BackHandler,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
  AppState,
  NativeEventSubscription,
  AppStateStatus,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CallAnswer from '../../../images/Icons/CallAnswer';
import CallDecline from '../../../images/Icons/CallDecline';
import notifee, {InitialNotification} from '@notifee/react-native';
import {
  formatCallerDetails,
  FormattedCallerDetails,
} from '../../../components/AstroConsultation/Utils/FormatCallerDetails';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {
  onDecline,
  stopRingtone,
} from '../../../configs/Calls/CallNotificationConfig';
import {
  ASTRO_DEFAULT_AVATAR,
  CALL_NOTIFICATION_ID,
  INCOMING_CALL_SCREEN_CLOSE_EMITTER,
} from '../../../configs/Calls/Constants';
import {resetShowCallDialogue} from '../../../store/apps/agora';
import {store} from '../../../store';
import BackgroundTimer from '../../../common/BackgroundCounter/BackgroundCounterConfig';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function IncomingCall({
  backgroundNotifiationData,
}: {
  backgroundNotifiationData: FirebaseMessagingTypes.RemoteMessage;
}) {
  let _appState: 'background' | 'foreground' = 'background';
  // const dispatch = useDispatch<AppDispatch>();
  const [notificationData, setNotificationData] =
    useState<FormattedCallerDetails>({
      channelName: '',
      userId: '',
      expiry: 0,
      gender: '',
      fullName: '',
      profilePic: '',
      astrologerId: '',
      callId: '',
      displayName: '',
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
      INCOMING_CALL_SCREEN_CLOSE_EMITTER,
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
          const data: FormattedCallerDetails | any =
            notification?.notification.data;
          setNotificationData({
            channelName: data.channelName,
            userId: data.userId,
            expiry: data.expiry,
            gender: data.gender,
            fullName: data.fullName,
            profilePic: data.profilePic,
            astrologerId: data.astrologerId,
            callId: data.callId,
            displayName: data.displayName,
          });
        });
    } else {
      if (
        backgroundNotifiationData?.data?.callDetails &&
        typeof backgroundNotifiationData?.data?.callDetails === 'string'
      ) {
        const callerDetails = JSON.parse(
          backgroundNotifiationData?.data?.callDetails,
        );
        const extractedData = formatCallerDetails(callerDetails);
        setNotificationData(extractedData);
      }
      return;
    }
  }, []);

  function goToHome() {
    try {
      BackgroundTimer.clearInterval();
      notifee.cancelNotification(CALL_NOTIFICATION_ID);
      stopRingtone();
      const encodedData = JSON.stringify(notificationData);
      Linking.openURL(
        `imeuswe://CallAnswer/${encodeURIComponent(encodedData)}`,
      );
      store.dispatch(resetShowCallDialogue());
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
                  notificationData?.profilePic?.length > 0
                    ? notificationData?.profilePic
                    : ASTRO_DEFAULT_AVATAR,
              }}
              style={{
                height: '100%',
                width: '100%',
              }}
              resizeMode="cover"
            />
          </View>
          {notificationData?.fullName && (
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
            Invited you for a call
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
            <CallDecline />
            <Text style={{color: 'white'}}>Decline Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => goToHome()}
            style={{alignItems: 'center', gap: 7}}>
            <CallAnswer />
            <Text style={{color: 'white'}}>Answer Call</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
