/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {CommonActions, RouteProp, useRoute} from '@react-navigation/native';
import RNCallKeep from 'react-native-callkeep';
import {RootStackParamList} from '../../../configs/DeepLinks/DeepLinkingConfig';
import {FormattedCallerDetails} from '../../../components/AstroConsultation/Utils/FormatCallerDetails';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import CallButtons from '../../../components/AstroConsultation/AstroAgoraCall/AgoraCallAnswer/CallButtons';
import RemainingCallTime from '../../../components/AstroConsultation/AstroAgoraCall/AgoraCallAnswer/RemainingCallTime';
import FastImage from '@d11/react-native-fast-image';
import AgoraInit, {
  AgoraInitExposedFunctions,
} from '../../../components/AstroConsultation/AstroAgoraCall/AgoraInit';
import {useNavigation} from '@react-navigation/native';
import {
  consultationEndUser,
  generateAgoraToken,
  getTotalTalkTimeCall,
  setCallId,
  setTotalAvaiableConsultationTime,
} from '../../../store/apps/agora';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {
  ASTRO_DEFAULT_AVATAR,
  IMEUSWE_LOGO_URL,
} from '../../../configs/Calls/Constants';
import {stopRingtone} from '../../../configs/Calls/CallNotificationConfig';
import Confirm from '../../../components/Confirm';
import CallDialogueIcon from '../../../images/Icons/CallDialogueIcon';
import useNativeBackHandler from '../../../hooks/useBackHandler';
import {useNetworkStatus} from '../../../hooks/useNetworkStatus';
import ErrorBoundary from '../../../common/ErrorBoundary';

interface DiscardCtaRef {
  showDialog: () => void;
  closeDialog: () => void;
}

const DiscardCta = forwardRef(
  (
    {
      children,
      onConfirmPress = () => {},
      name = '',
      loading = false,
    }: {
      children: React.ReactNode;
      onConfirmPress?: () => void;
      name: string;
      loading?: boolean;
    },
    ref: React.Ref<DiscardCtaRef>,
  ) => {
    const [showDialogue, setShowDialogue] = useState(false);
    const [_loading, setLoading] = useState(loading);

    function onDiscardPress() {
      setShowDialogue(false);
    }

    function showDialog() {
      setShowDialogue(true);
    }

    function closeDialog() {
      setShowDialogue(false);
    }

    useImperativeHandle(ref, () => ({
      showDialog,
      closeDialog,
    }));

    return (
      <ErrorBoundary>
        {showDialogue && (
          <Confirm
            isAstrology
            onBackgroundClick={onDiscardPress}
            showCross={false}
            titleStyle={dialogueStyles.titleStyle}
            title={
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <CallDialogueIcon />
              </View>
            }
            subTitle={`Are you sure you want to end the call with ${name}?`}
            subTitleStyle={dialogueStyles.subTitleStyle}
            backgroundColor={'rgba(37, 35, 46, 0.9)'}
            //@ts-ignore
            continueCtaText={
              _loading ? <ActivityIndicator color={'white'} /> : 'Yes, end call'
            }
            confirmButtonStyle={dialogueStyles.confirmBtnStyle}
            confirmButtonLabelStyle={dialogueStyles.confirmBtnLabelstyle}
            discardCtaText={'No, continue call'}
            discardButtonStyle={dialogueStyles.discardBtnStyle}
            discardButtonLabelStyle={dialogueStyles.discardBtnLableStyle}
            onContinue={() => {
              setLoading(true);
              onConfirmPress();
            }}
            disableDiscardBtn={_loading}
            disableContinueBtn={_loading}
            onDiscard={onDiscardPress}
          />
        )}
        {children}
      </ErrorBoundary>
    );
  },
);

const Avatar = memo(({routeData}: {routeData: FormattedCallerDetails}) => {
  return (
    <>
      <View style={styles.profilePic}>
        <FastImage
          source={{
            uri:
              routeData?.profilePic?.length > 0
                ? routeData?.profilePic
                : ASTRO_DEFAULT_AVATAR,
          }}
          style={styles.fullWidthAndHeight}
          resizeMode="cover"
        />
      </View>
      {routeData?.fullName && (
        <Text style={styles.name} numberOfLines={1}>
          {routeData.displayName}
        </Text>
      )}
    </>
  );
});

const ImeusweLogo = memo(() => {
  return (
    <ErrorBoundary>
      <View style={styles.imgContainer}>
        <FastImage
          source={{
            uri: IMEUSWE_LOGO_URL,
          }}
          style={styles.imeuswe}
          resizeMode="contain"
        />
      </View>
    </ErrorBoundary>
  );
});

export default function CallAnswer() {
  const route = useRoute<RouteProp<RootStackParamList, 'CallAnswer'>>();
  const {bottom}: EdgeInsets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {isConnected} = useNetworkStatus();
  const discardCtaRef = useRef<DiscardCtaRef>(null);
  const hasJoinedChannel = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reConnectingText = 'Reconnecting with the astrologer';
  const connectedText = 'Astrologer is connected';
  const connectingText = 'We are connecting with the astrologer..';
  const [endingCall, setEndingCall] = useState(false);

  const agoraRef = useRef<AgoraInitExposedFunctions>({
    joinChannel: () => undefined,
    leaveChannel: () => undefined,
    mute: () => undefined,
    unMute: () => undefined,
    enableSpeaker: () => undefined,
    disableSpeaker: () => undefined,
  });

  const generateAgoraTokenResponse = useSelector(
    (state: RootState) => state.agoraCallSlice.generatedTokenDetails,
  );

  const [routeData, setRouteData] = useState<FormattedCallerDetails>({
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
  const routeDataRef = useRef<FormattedCallerDetails>(
    JSON?.parse?.(decodeURIComponent(route?.params?.encodedData)),
  );

  const onInitSuccess = useCallback(async () => {
    const payload = {
      callId: routeDataRef.current.callId,
      astrologerId: routeDataRef.current.astrologerId,
      userId: routeDataRef.current.userId,
      expiry: routeDataRef.current.expiry,
    };
    console.log('payload', payload);
    const totalTalktime = await dispatch(
      getTotalTalkTimeCall({callId: routeDataRef.current.callId}),
    ).unwrap();
    console.log('totalTalktime', totalTalktime);
    if (
      totalTalktime?.totalAvailableTalkTime !== routeDataRef?.current?.expiry &&
      totalTalktime?.totalAvailableTalkTime > routeDataRef?.current?.expiry
    ) {
      payload.expiry = totalTalktime?.totalAvailableTalkTime;
    }
    dispatch(setTotalAvaiableConsultationTime(payload.expiry));
    await dispatch(generateAgoraToken(payload)).unwrap();
  }, [routeData]);

  const endCall = useCallback(async () => {
    try {
      setEndingCall(true);
      agoraRef?.current?.leaveChannel();
      if (Platform.OS === 'ios') {
        RNCallKeep.endAllCalls();
      }
      await dispatch(
        consultationEndUser({
          consultationType: 'call',
          astrologerId: routeData.astrologerId,
          astrologerName: routeData.displayName,
        }),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setEndingCall(false);
      discardCtaRef.current?.closeDialog();

      if (routeData.astrologerId?.length) {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'AstroBottomTabs',

                params: {
                  screen: 'Consultation',
                },
              },
              {
                name: 'AstroProfile',
                params: {
                  astroId: routeData.astrologerId,
                  showReview: true,
                },
              },
            ],
          }),
        );
      }
    }
  }, [routeData]);

  useEffect(() => {
    if (!isConnected) {
      reconnectTimeoutRef.current = setTimeout(() => {
        endCall();
      }, 10000);
    } else {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      hasJoinedChannel.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  routeDataRef.current = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(route?.params?.encodedData));
    } catch (e) {
      return {
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
    }
  }, [route?.params?.encodedData]);

  function showEndCallDialogue() {
    discardCtaRef.current?.showDialog();
  }

  useNativeBackHandler(showEndCallDialogue);

  function onMounted(): void {
    const encodedData = route.params?.encodedData;
    if (encodedData) {
      const decodedData: FormattedCallerDetails = JSON.parse(
        decodeURIComponent(encodedData),
      );
      if (decodedData?.callId?.length > 0) {
        dispatch(setCallId(decodedData?.callId));
      }
      routeDataRef.current = decodedData;
      setRouteData(decodedData);
    }
    return;
  }

  useEffect(() => {
    if (generateAgoraTokenResponse.userToken) {
      if (hasJoinedChannel.current) {
        return;
      } else {
        hasJoinedChannel.current = true;
        agoraRef.current.joinChannel({
          token: generateAgoraTokenResponse?.userToken,
          channel: generateAgoraTokenResponse?.channelName,
          uid: generateAgoraTokenResponse?.userId,
        });
      }
    }
  }, [generateAgoraTokenResponse]);

  useEffect(() => {
    try {
      onMounted();
    } catch (error) {
      console.log(error);
    }
  }, [route]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      stopRingtone();
    }
    return () => {
      hasJoinedChannel.current = false;
    };
  }, []);

  return (
    <ErrorBoundary.Screen>
      <DiscardCta
        name={routeData?.displayName ?? ''}
        ref={discardCtaRef}
        loading={endingCall}
        onConfirmPress={endCall}>
        <AgoraInit onInitSuccess={() => onInitSuccess()} ref={agoraRef}>
          <View style={styles.container}>
            <ImeusweLogo />
            <View style={styles.personalDetailsContainer}>
              <Avatar routeData={routeData} />
            </View>
            <View style={styles.fullWidth}>
              <RemainingCallTime
                callStarted={generateAgoraTokenResponse?.userToken?.length > 0}
              />
            </View>
            <View style={styles.fullWidthAndCenter}>
              {generateAgoraTokenResponse?.userToken?.length > 0 ? (
                <Text style={styles.connectingText}>
                  {isConnected ? connectedText : reConnectingText}
                </Text>
              ) : (
                <Text style={styles.connectingText}>{connectingText}</Text>
              )}
            </View>
            <View
              style={[styles.buttonContainer, {marginBottom: bottom + 100}]}>
              <CallButtons
                agoraRef={agoraRef}
                onEndCall={showEndCallDialogue}
                disableAllButtons={
                  !generateAgoraTokenResponse?.userToken?.length
                }
              />
            </View>
          </View>
        </AgoraInit>
      </DiscardCta>
    </ErrorBoundary.Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgb(18,16,41)',
  },
  imgContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  personalDetailsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  profilePic: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    borderRadius: 130 / 2,
    overflow: 'hidden',
  },
  imeuswe: {
    height: '100%',
    width: '100%',
    borderColor: 'white',
    transform: [{scale: 0.5}],
  },
  funcButtons: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: '50%',
  },
  buttonContainer: {
    marginTop: 'auto',
    width: '100%',
    gap: 40,
  },
  fullWidth: {
    width: '100%',
  },
  fullWidthAndHeight: {
    height: '100%',
    width: '100%',
  },
  name: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 23,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgb(18,16,41)',
  },
  fullWidthAndCenter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  connectingText: {
    color: 'rgba(39, 195, 148, 1)',
  },
});

const dialogueStyles = StyleSheet.create({
  titleStyle: {
    color: 'white',
    marginBottom: 15,
  },
  subTitleStyle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  confirmBtnStyle: {
    backgroundColor: '#FF4F4F',
  },
  confirmBtnLabelstyle: {
    fontSize: 15,
  },
  discardBtnStyle: {
    backgroundColor: 'transparent',
  },
  discardBtnLableStyle: {
    color: 'white',
    fontSize: 15,
  },
});
