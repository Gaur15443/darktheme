import {RouteProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import AstroAgoraCallInitiate from '../AstroAgoraCall';
import {
  checkAndRequestCallPermissions,
  Permission,
} from '../AstroAgoraCall/AgoraPermisions/AgoraPermissions';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {getUserInfo} from '../../../store/apps/userInfo';
import Toast from 'react-native-toast-message';
import {
  getIsCallActive,
  getIsChatActive,
  initChatReqToAstrologer,
  setAstrologerName,
  setKundliId,
  setShowCallDialogue,
  setTotalAvaiableConsultationTime,
  setWaitingCounter,
  setShowUnavailableDialogue,
  setChatToken,
  resetChatReqDetails,
  resetAgoraChatRoomId,
  registerVoipToken,
} from '../../../store/apps/agora';
import {AstroWrapper} from '../../../navigation/AppStack';
import {InitChatReqToAstrologerPayload} from '../../../store/apps/agora/types';
import {useWallet} from '../../../context/WalletContext';
import {measureNetworkLatency} from '../General/PreConsultationTest';
import AstroBirthDetailsTabsReports from './AstroBirthDetailsTabsReports';
import {getAstrologerProfile} from '../../../store/apps/astrologerProfile';
import Spinner from '../../../common/Spinner';
import {Modal, Platform, View} from 'react-native';
import Confirm from '../../Confirm';
import AlreadyInCallIcon from '../../../images/Icons/AlreadyInCallIcon';
import ErrorBoundary from '../../../common/ErrorBoundary';
import AstroHeader from '../../../common/AstroHeader';
import AstroBirthForm from '../../AstrologyBirthForm';
import {useTheme} from 'react-native-paper';
import {getSavedKundli} from '../../../store/apps/astroKundali';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterVoipService from '../../../configs/Voip/RegisterVoip';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import analytics from '@react-native-firebase/analytics';
import config from 'react-native-config';
import moment from 'moment';
import {getDifferenceInTime} from '../../../../src/utils/format';
import {CONSULTATION_INIT_COUNTER} from '../../../configs/Calls/Constants';
import {CHAT_TIMEOUT} from '../../../configs/Chats/constants';

export type AstroBirthDetailsParams = {
  astrologerId: string;
  type: 'Call' | 'Chat';
  rate: number;
  agreedRate: number;
  offerId: string;
  consultationInitTime: number;
};

type AstroBirthDetailsRouteProp = RouteProp<
  {AstroBirthDetailsTabs: AstroBirthDetailsParams},
  'AstroBirthDetailsTabs'
>;

interface Props {
  route: AstroBirthDetailsRouteProp;
}

export interface AstrologerPrices {
  displayActualRate: number;
  agreedRate: number;
  offerId: string;
}

export interface CallAstrologerFunctions {
  callAstrologer: (
    kundliId: string,
    totalAvailableTalkTismeRef: number,
    astrologerPrices: AstrologerPrices,
  ) => Promise<{
    callId: string;
    astrologerId: string;
    initiate: string;
  }>;
}

export interface ChatReqInitDetails {
  chatRoomId: string;
  astrologerId: string;
  userId: string;
  channelName: string;
}

export interface CallReqDetails {
  callId: string;
  astrologerId: string;
}

function AstroLoader() {
  return (
    <ErrorBoundary>
      <Modal transparent={true} visible={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Spinner />
        </View>
      </Modal>
    </ErrorBoundary>
  );
}

const AstroBirthDetailsTabs: React.FC<Props> = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector<RootState>(state => state.userInfo._id);
  const theme = useTheme();

  const selectedFeature = useRef<'Call' | 'Chat'>(
    route?.params?.type || 'Call',
  );
  const consultationToasts = useSelector(
    (state: RootState) => state.agoraCallSlice.consultationToasts.consultation,
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const astrologerProfileDetails = useSelector(
    (state: RootState) => state.astrologerProfile.astrologerProfileDetails,
  );
  const savedKundlis = useSelector(
    (state: RootState) => state.astroKundaliSlice.savedKundlis,
  );
  const astrologerName =
    astrologerProfileDetails?.astroProfile?.displayName ?? 'Astrologer';
  const requiredMinutes = 5;
  const astrologerId = useRef(route?.params?.astrologerId);

  let kundliId = useRef<string>('');
  const callAstrologerFunctionRef = useRef<CallAstrologerFunctions>(null);
  const astrologerPrice = useRef<AstrologerPrices>({
    displayActualRate: 0,
    agreedRate: 0,
    offerId: '',
  });

  const [isLoading, setLoading] = useState<boolean>(false);
  const [hasKundli, setHasKundli] = useState(false);
  const [preparingTabs, setPreparingTabs] = useState(true);
  const [isInAnotherConsultation, setIsInAnotherConsultation] = useState(false);
  const [chatReqInitDetails, setChatReqInitDetails] =
    useState<ChatReqInitDetails>({
      chatRoomId: '',
      astrologerId: '',
      userId: '',
      channelName: '',
    });
  const [callReqDetails, setCallReqDetails] = useState<CallReqDetails>({
    callId: '',
    astrologerId: '',
  });

  const {fetchWalletData} = useWallet();
  const astrologerCostPerMinute = useRef(route?.params?.rate ?? 0);
  const totalAvailableTalkTimeRef = useRef<number>(0);

  const showPreConsultationTestToasts = {
    battery: () => {
      Toast.show({
        type: 'error',
        text1: consultationToasts.battery.text1,
        text2: consultationToasts.battery.text2,
      });
    },
    network: () => {
      Toast.show({
        type: 'error',
        text1: consultationToasts.network.text1,
        text2: consultationToasts.network.text2,
      });
    },
    permissions: (_permissionResult: Permission) => {
      Toast.show({
        type: 'error',
        text1:
          _permissionResult?.message ?? consultationToasts.permissions.text1,
      });
    },
    astrologerCostCheck: () => {
      Toast.show({
        type: 'error',
        text1: consultationToasts.run_time_errors.invalid_astrologer_cost.text1,
      });
    },
  };

  async function getUserInfoV1() {
    if (!userId) {
      await dispatch(getUserInfo()).unwrap();
    }
  }

  const runChecks = async (_kundliId: string) => {
    try {
      kundliId.current = _kundliId;
      const globalFetchWallet = await fetchWalletData();
      const latestFreeCallChatCheck =
        globalFetchWallet?.freeCallAvailable ?? false;
      const latestTotalBalance = globalFetchWallet?.totalBalance ?? 0;
      const astrologerData = await getAstrologerProfileDetails();
      if (
        astrologerData?.astroProfile?.liveStatus &&
        astrologerData?.astroProfile?.liveStatus?.toLowerCase?.() !== 'online'
      ) {
        dispatch(setShowUnavailableDialogue(true));
        dispatch(
          setAstrologerName(astrologerData?.astroProfile?.displayName ?? ''),
        );
        return;
      }
      if (selectedFeature.current === 'Call') {
        const isInAnotherCall = await dispatch(getIsCallActive()).unwrap();
        if (isInAnotherCall.isInCall) {
          setIsInAnotherConsultation(true);
          return;
        }
      } else {
        const isInAnotherChat = await dispatch(getIsChatActive()).unwrap();
        if (isInAnotherChat.isInChatSession) {
          setIsInAnotherConsultation(true);
          return;
        }
      }

      if (Platform.OS === 'ios') {
        await registerVoipService();
      }

      if (astrologerCostPerMinute.current <= 0) {
        showPreConsultationTestToasts.astrologerCostCheck();
        return;
      }
      const MINIMUM_BALANCE =
        astrologerCostPerMinute?.current * requiredMinutes;
      if (
        (isNaN(latestTotalBalance) || latestTotalBalance < MINIMUM_BALANCE) &&
        !latestFreeCallChatCheck
      ) {
        //@ts-ignore
        navigation.navigate('MoneyPreDefined', {
          showInsufficientBalance: true,
          astrologerName,
          requiredMinutes,
          requiredAmount: MINIMUM_BALANCE,
        });
        return;
      }

      let _permissionResult: Permission;
      if (selectedFeature.current === 'Call') {
        _permissionResult = await checkAndRequestCallPermissions();
      } else {
        _permissionResult = await checkAndRequestCallPermissions();
      }
      const ping = await measureNetworkLatency();

      if (_permissionResult.granted) {
        if (ping && ping >= 1000) {
          showPreConsultationTestToasts.network();
          return;
        }
        // if (!hasSufficientCharge()) {
        //   showPreConsultationTestToasts.battery();
        //   return;
        // }
        calculateTotalConsultationTime(
          latestFreeCallChatCheck
            ? astrologerCostPerMinute.current * 3
            : latestTotalBalance,
          astrologerCostPerMinute.current,
        );
        dispatch(
          setAstrologerName(
            astrologerProfileDetails?.astroProfile?.displayName ?? '',
          ),
        );
        if (selectedFeature.current === 'Chat') {
          dispatch(setChatToken(''));
          dispatch(resetAgoraChatRoomId());
          dispatch(resetChatReqDetails());
          await sendChatRequestToAstrologer();
          await persistData();
          // *** meta and firebase events
          if (config.ENV === 'prod') {
            if (latestFreeCallChatCheck) {
              await analytics().logEvent('Free_Chat');
              AppEventsLogger.logEvent('Free_Chat');
            } else {
              await analytics().logEvent('Paid_Chat');
              AppEventsLogger.logEvent('Paid_Chat');
            }
          }
          return;
        } else {
          await callAstrologer();
          await persistData();
          if (latestFreeCallChatCheck) {
            await analytics().logEvent('Free_Call');
            AppEventsLogger.logEvent('Free_Call');
          } else {
            await analytics().logEvent('Paid_Call');
            AppEventsLogger.logEvent('Paid_Call');
          }
          return;
        }
      } else {
        // showPreConsultationTestToasts.permissions(_permissionResult);
        return;
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  async function sendTokenToBackend(_token: string) {
    try {
      const payload = {
        token: _token,
      };
      const existingToken = await AsyncStorage.getItem('voipToken');
      if (existingToken === _token) {
        return;
      }
      await AsyncStorage.setItem('voipToken', _token);
      await dispatch(registerVoipToken(payload)).unwrap();
    } catch (error) {
      console.error(error);
    }
  }

  async function registerVoipService() {
    const VoipService = RegisterVoipService.getInstance();
    VoipService.registerAndRetriveToken(data => {
      if (data?._token?.length > 0) {
        sendTokenToBackend(data._token);
      }
    });
  }

  const callAstrologer = async () => {
    try {
      console.log('callAstrologer', astrologerPrice.current);
      setLoading(true);
      const data = await callAstrologerFunctionRef?.current?.callAstrologer?.(
        kundliId.current,
        totalAvailableTalkTimeRef.current,
        astrologerPrice.current,
      );
      setCallReqDetails({
        callId: data?.callId ?? '',
        astrologerId: data?.astrologerId ?? '',
      });
      dispatch(setWaitingCounter(CONSULTATION_INIT_COUNTER));
      dispatch(setShowCallDialogue(true));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          consultationToasts.run_time_errors.invalid_astrologer_token_calls
            .text1,
        //@ts-ignore
        text2: (error as Error).details?.includes('404')
          ? consultationToasts.run_time_errors.invalid_astrologer_token_calls
              .text2
          : //@ts-ignore
            (error as Error).details
            ? //@ts-ignore
              (error as Error).details
            : (error as Error)?.message,
      });
      dispatch(setWaitingCounter(0));
      dispatch(setShowCallDialogue(false));
    } finally {
      setLoading(false);
    }
  };

  async function sendChatRequestToAstrologer() {
    try {
      setLoading(true);
      dispatch(setKundliId(kundliId.current));
      const _payload: InitChatReqToAstrologerPayload = {
        astrologerId: astrologerId.current,
        //@ts-ignore
        callerPersonalDetails: userInfo?.personalDetails,
        callerBirthDetails: kundliId.current,
        totalAvailableTalkTime: totalAvailableTalkTimeRef.current ?? 0,
        isIos: Platform.OS === 'ios',
        //@ts-ignore
        userToken:
          Platform.OS === 'ios' ? await AsyncStorage.getItem('voipToken') : '',
        astrologerPrice: astrologerPrice.current,
      };
      const data = await dispatch(initChatReqToAstrologer(_payload)).unwrap();
      const _data = {
        chatRoomId: data.chatRoomId ?? '',
        astrologerId: astrologerId.current ?? '',
        userId: userInfo?._id ?? '',
        channelName: data.channelName ?? '',
      };
      setChatReqInitDetails(_data);
      dispatch(setWaitingCounter(CONSULTATION_INIT_COUNTER));
      dispatch(setShowCallDialogue(true));
    } catch (error) {
      console.log('errorororor', error);
      Toast.show({
        type: 'error',
        text1:
          consultationToasts.run_time_errors.invalid_astrologer_token_chats
            .text1,
        //@ts-ignore
        text2: (error as Error).details?.includes('404')
          ? consultationToasts.run_time_errors.invalid_astrologer_token_chats
              .text2
          : //@ts-ignore
            (error as Error).details
            ? //@ts-ignore
              (error as Error).details
            : (error as Error)?.message,
      });
      dispatch(setShowCallDialogue(false));
    } finally {
      setLoading(false);
    }
  }

  async function getAstrologerProfileDetails() {
    return await dispatch(
      getAstrologerProfile({userId: astrologerId.current}),
    ).unwrap();
  }

  async function getUserssavedKundlis() {
    try {
      setPreparingTabs(true);
      setLoading(true);
      const data = await dispatch(getSavedKundli()).unwrap();
      if (data?.length > 0) {
        setHasKundli(true);
      } else {
        setHasKundli(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong while fetching users kundli',
      });
    } finally {
      setLoading(false);
      setPreparingTabs(false);
    }
  }

  useEffect(() => {
    getUserssavedKundlis();
    getUserInfoV1();
  }, []);

  useEffect(() => {
    if (astrologerId.current) {
      getAstrologerProfileDetails();
    }
  }, [astrologerId.current]);

  async function persistData() {
    const data = {
      astrologerId: astrologerId.current,
      type: selectedFeature.current,
      rate: astrologerPrice.current?.displayActualRate,
      agreedRate: astrologerPrice.current?.agreedRate,
      offerId: astrologerPrice.current?.offerId,
      consultationInitTime: new Date().toString(),
    };
    await AsyncStorage.setItem('consultationInitTime', JSON.stringify(data));
  }

  function calculateTotalConsultationTime(
    _walletBalance: number,
    _astrologerCost: number,
  ): number {
    const totalConsultationTime = _walletBalance / _astrologerCost; // this is in miutes
    const totalConsultationTimeInSeconds = Math.round(
      Number(totalConsultationTime.toFixed(4)) * 60,
    ); // this is in seconds
    if (
      !isNaN(totalConsultationTimeInSeconds) &&
      totalConsultationTimeInSeconds > 0
    ) {
      totalAvailableTalkTimeRef.current = totalConsultationTimeInSeconds;
      dispatch(
        setTotalAvaiableConsultationTime(totalConsultationTimeInSeconds),
      );
      return totalConsultationTimeInSeconds;
    } else {
      Toast.show({
        type: 'error',
        text1:
          consultationToasts.run_time_errors.invalid_consultation_time.text1,
      });
    }
    return 0;
  }

  astrologerId.current = useMemo(() => {
    return route?.params?.astrologerId;
  }, [route]);

  astrologerCostPerMinute.current = useMemo(() => {
    return route?.params?.rate;
  }, [route]);

  selectedFeature.current = useMemo(() => {
    return route?.params?.type;
  }, [route]);

  async function getPersistedTimeandShowPopUp() {
    const consultationStartTime = await AsyncStorage.getItem(
      'consultationInitTime',
    );
    if (consultationStartTime) {
      const data = JSON.parse(consultationStartTime);
      const diffInSeconds = getDifferenceInTime(
        moment(data.consultationInitTime),
        moment(),
      );
      dispatch(setWaitingCounter(Number(CHAT_TIMEOUT - diffInSeconds)));
      dispatch(setShowCallDialogue(true));
    }
  }

  useEffect(() => {
    if (route?.params?.consultationInitTime) {
      getPersistedTimeandShowPopUp();
    }
  }, [route]);

  useMemo(() => {
    if (route.params.agreedRate && route.params.rate) {
      astrologerPrice.current = {
        displayActualRate: route?.params?.rate,
        agreedRate: route?.params?.agreedRate,
        //@ts-ignore
        offerId:
          route?.params?.offerId?.length > 0 ? route?.params?.offerId : null,
      };
    }
  }, [route]);

  return (
    <ErrorBoundary.Screen>
      <AstroWrapper>
        {isLoading && <AstroLoader />}
        {isInAnotherConsultation && (
          <Confirm
            showCross={false}
            isAstrology
            onContinue={() => {
              setIsInAnotherConsultation(false);
            }}
            discardCtaText={false}
            continueCtaText={'Okay'}
            confirmButtonStyle={{backgroundColor: 'white'}}
            confirmButtonLabelStyle={{color: 'rgba(105, 68, 211, 1)'}}
            subTitleStyle={{
              fontWeight: '600',
              fontSize: 16,
              color: 'white',
            }}
            subTitle={`You’re already in an active consultation. Please complete or end the current session before starting a new one`}
            backgroundColor={'rgba(42, 32, 83, 0.9)'}
            title={
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 15,
                }}>
                <AlreadyInCallIcon />
              </View>
            }
            titleStyle={{
              alignItems: 'center',
              // justifyContent: 'center',
            }}
          />
        )}

        {!preparingTabs ? (
          <AstroAgoraCallInitiate
            selectedFeature={selectedFeature.current}
            astrologerId={astrologerId.current}
            ref={callAstrologerFunctionRef}
            chatReqInitDetails={chatReqInitDetails}
            callReqDetails={callReqDetails}>
            {savedKundlis?.length > 0 || hasKundli ? (
              <AstroBirthDetailsTabsReports
                onBack={() => navigation.goBack()}
                //@ts-ignore
                onArrowClick={_data => {
                  setLoading(true);
                  //@ts-ignore
                  runChecks(_data._id);
                }}
                //@ts-ignore
                onNewKundli={_data => {
                  setLoading(true);
                  //@ts-ignore
                  runChecks(_data._id);
                }}
              />
            ) : (
              <ErrorBoundary.Screen>
                <View
                  style={{flex: 1, backgroundColor: theme.colors.background}}>
                  <AstroHeader>
                    <AstroHeader.BackAction
                      onPress={() => navigation.goBack()}
                    />
                    <AstroHeader.Content title="Birth Details" />
                  </AstroHeader>
                  <AstroBirthForm
                    isConsultation
                    onGetKundliId={async id => {
                      setLoading(true);
                      // await dispatch(getSavedKundli()).unwrap();
                      runChecks(id);
                    }}
                  />
                </View>
              </ErrorBoundary.Screen>
            )}
          </AstroAgoraCallInitiate>
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(18, 16, 41, 1)',
            }}
          />
        )}
      </AstroWrapper>
    </ErrorBoundary.Screen>
  );
};

export default AstroBirthDetailsTabs;
