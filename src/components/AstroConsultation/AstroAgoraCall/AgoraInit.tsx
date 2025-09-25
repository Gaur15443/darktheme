import createAgoraRtcEngine, {
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  IRtcEngineEventHandler,
  RtcConnection,
} from 'react-native-agora';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {Buffer} from 'buffer';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {
  resetCallId,
  resetGeneratedToken,
  resetShowCallDialogue,
} from '../../../store/apps/agora';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {NativeModules, Platform} from 'react-native';
import AgoraEngine from '../../../configs/Calls/AgoraEngine';
import RNCallKeep from 'react-native-callkeep';
import authConfig from '../../../configs';
import {useWallet} from '../../../context/WalletContext';
import ErrorBoundary from '../../../common/ErrorBoundary';
import Toast from 'react-native-toast-message';

const {BluetoothModule} = NativeModules;

const AgoraCallService =
  Platform.OS === 'android' ? NativeModules.AgoraCallService : null;
const ProximitySensor =
  Platform.OS === 'android' ? NativeModules.ProximitySensor : null;
const AudioSessionManager =
  Platform.OS === 'ios' ? NativeModules.AudioSessionManager : null;

interface AgoraInitProps {
  children: React.ReactNode;
  appId?: string;
  onInitSuccess: () => Promise<undefined | void>;
}
export interface JoinChannel {
  token: string;
  channel: string;
  uid: string;
  isHost?: boolean;
}

export interface AgoraInitExposedFunctions {
  joinChannel: (data: JoinChannel) => undefined | void;
  leaveChannel: () => undefined | void;
  mute: () => undefined | void;
  unMute: () => undefined | void;
  enableSpeaker: () => undefined | void;
  disableSpeaker: () => undefined | void;
}

const AgoraInit = forwardRef(
  (
    {children, appId = authConfig?.agoraAppID, onInitSuccess}: AgoraInitProps,
    ref,
  ) => {
    let isJoinedChannel = false;
    const dispatch = useDispatch<AppDispatch>();
    const agoraEngineRef = useRef<IRtcEngine | null>(null);
    const astrologerIdRef = useRef<string>('');
    const navigation = useNavigation();
    const {setFreeCallAvailable} = useWallet();
    const UUID = useSelector((state: RootState) => state.agoraCallSlice.UUID);
    const eventHandler = useRef<IRtcEngineEventHandler>({
      onJoinChannelSuccess: () => {
        isJoinedChannel = true;
        if (Platform.OS === 'ios' && RNCallKeep) {
          RNCallKeep.setCurrentCallActive(UUID);
          RNCallKeep.reportConnectedOutgoingCallWithUUID(UUID);
        }
        if (agoraEngineRef.current) {
          setAgoraEngineGlobal(agoraEngineRef.current);
        }
        if (Platform.OS === 'ios') {
          forceBluetoothRoute();
        }
        if (Platform.OS === 'android') {
          AgoraCallService.startCallService(
            'Call in Progress',
            'Tap to return to call',
          );
          ProximitySensor.startProximityListener();
        }
        agoraEngineRef.current.adjustPlaybackSignalVolume(400);
        agoraEngineRef.current.adjustRecordingSignalVolume(400);
      },
      onUserJoined: (_connection: RtcConnection, uid: number) => {
        setFreeCallAvailable(false);
        console.log('Remote user ' + uid + ' joined');
      },
      onUserOffline: (_connection: RtcConnection, uid: number) => {
        console.log('Remote user ' + uid + ' left the channel');
        leaveChannel();

        if (astrologerIdRef.current?.length) {
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
                    astroId: astrologerIdRef.current,
                    showReview: true,
                  },
                },
              ],
            }),
          );
        }
      },
      onConnectionLost: (_connection: RtcConnection) => {
        console.log('connection lost to ', _connection);
      },
      onRequestToken: (_connection: RtcConnection) => {
        console.log('token expired');
        leaveChannel();

        if (astrologerIdRef.current?.length) {
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
                    astroId: astrologerIdRef.current,
                    showReview: true,
                  },
                },
              ],
            }),
          );
        }
      },
    });
    const generateAgoraTokenResponse = useSelector(
      (state: RootState) => state.agoraCallSlice.generatedTokenDetails,
    );

    astrologerIdRef.current = useMemo(() => {
      return generateAgoraTokenResponse.astrologerId;
    }, [generateAgoraTokenResponse]);

    async function setupAudioSession() {
      if (!agoraEngineRef.current) return;
      await agoraEngineRef.current.enableAudio();
      // For Android background audio: Set Agora parameters
      if (Platform.OS === 'android') {
        agoraEngineRef.current.setParameters(
          '{"che.audio.keep.audiosession": true}',
        );
        agoraEngineRef.current.setParameters(
          '{"che.audio.using.communication_volume": true}',
        );
        agoraEngineRef.current.setParameters(
          '{"che.audio.exclusive_mode": true}',
        );
        agoraEngineRef.current.setParameters(
          '{"rtc.background_mode_audio": true}',
        );
        agoraEngineRef.current.setParameters('{"che.audio.ains_mask": 0}');
        agoraEngineRef.current.setParameters('{"che.audio.lowlatency": true}');
        agoraEngineRef.current.setParameters(
          '{"che.audio.device.work.alone": false}',
        );
      } else {
        await agoraEngineRef.current.setAudioProfile(1, 5);
        await agoraEngineRef.current.setParameters(
          '{"che.audio.lowlatency": true}',
        );
        await agoraEngineRef.current.setParameters(
          '{"che.audio.keep.audiosession":true}',
        );
      }
      onInitSuccess();
    }

    async function _setupAudioSDKEngine() {
      try {
        agoraEngineRef.current = createAgoraRtcEngine();
        const agoraEngine = agoraEngineRef.current;
        agoraEngine.registerEventHandler(eventHandler.current);
        agoraEngine.initialize({
          appId: appId,
        });
        if (Platform.OS === 'ios') {
          await AudioSessionManager.setupAudioSession();
        }
      } catch (e) {
        console.log(e);
      } finally {
        setupAudioSession();
      }
    }

    function _release() {
      isJoinedChannel = false;
      dispatch(resetCallId());
      dispatch(resetGeneratedToken());
      if (Platform.OS === 'android') {
        ProximitySensor.stopProximityListener();
        AgoraCallService.stopCallService();
      }
      agoraEngineRef.current?.unregisterEventHandler(eventHandler.current!);
      agoraEngineRef.current?.release();
    }

    async function forceBluetoothRoute() {
      try {
        const res = await AudioSessionManager.routeToBluetooth();
        console.log(res);
      } catch (err) {
        console.error(err);
      }
    }

    function setAgoraEngineGlobal(ref: IRtcEngine) {
      const engine = AgoraEngine.getInstance();
      engine.setRef(ref);
    }

    async function joinChannel({
      token,
      channel,
      uid,
    }: JoinChannel): Promise<void> {
      try {
        // Configure audio for call before joining
        if (BluetoothModule && Platform.OS === 'android') {
          try {
            await BluetoothModule.configureAudioForCall();
          } catch (error) {
            console.log('Bluetooth audio config failed:', error);
          }
        }
        if (AudioSessionManager && Platform.OS === 'ios') {
          try {
            await AudioSessionManager.enableSpeaker(false);
          } catch (error) {
            console.log('Audio session config failed:', error);
          }
        }
        const _token = Buffer.from(token, 'base64').toString('utf8');
        const _uid = uid.toString();
        if (token && channel && uid) {
          if (agoraEngineRef?.current) {
            agoraEngineRef.current.registerLocalUserAccount(
              appId ?? '',
              _uid.toString(),
            );
          }
          agoraEngineRef.current?.joinChannelWithUserAccount(
            _token,
            channel,
            _uid,
            {
              channelProfile: ChannelProfileType.ChannelProfileCommunication,
              clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            },
          );
          RNCallKeep.setCurrentCallActive(UUID);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Something went wrong while initializing call',
            text2: 'Invalid parameters',
          });
          console.log(
            'Something went wrong while initializing call: invalid parameters ',
          );
        }
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong while configuring call',
          text2: (e as Error)?.message,
        });
        console.log(e);
      }
    }

    async function leaveChannel(): Promise<void> {
      try {
        isJoinedChannel = false;
        if (Platform.OS === 'ios' && RNCallKeep) {
          RNCallKeep.endAllCalls();
        }
        if (AudioSessionManager) {
          try {
            await AudioSessionManager.resetAudioSession();
          } catch (error) {
            console.log('Audio session reset failed:', error);
          }
        }
        // Reset audio session after call
        if (BluetoothModule && Platform.OS === 'android') {
          try {
            await BluetoothModule.resetAudioSession();
          } catch (error) {
            console.log('Bluetooth audio reset failed:', error);
          }
        }
        _release();
        dispatch(resetShowCallDialogue());
        agoraEngineRef.current?.leaveChannel();
      } catch (e) {
        console.log(e);
      }
    }

    function mute(): void {
      agoraEngineRef.current?.muteLocalAudioStream(true);
    }

    function unMute(): void {
      agoraEngineRef.current?.muteLocalAudioStream(false);
    }

    async function enableSpeaker(): Promise<void> {
      agoraEngineRef.current?.setEnableSpeakerphone(true);
      if (AudioSessionManager && Platform.OS === 'ios') {
        try {
          await AudioSessionManager.enableSpeaker(true);
        } catch (error) {
          console.log('Audio session reset failed:', error);
        }
      }
      if (BluetoothModule && Platform.OS === 'android') {
        try {
          await BluetoothModule.enableSpeakerphone();
        } catch (error) {
          console.log('Bluetooth audio reset failed:', error);
        }
      }
    }

    async function disableSpeaker(): Promise<void> {
      agoraEngineRef.current?.setEnableSpeakerphone(false);
      if (AudioSessionManager && Platform.OS === 'ios') {
        try {
          await AudioSessionManager.enableSpeaker(false);
        } catch (error) {
          console.log('Audio session reset failed:', error);
        }
      }
      if (BluetoothModule && Platform.OS === 'android') {
        try {
          await BluetoothModule.disableSpeakerphone();
        } catch (error) {
          console.log('Bluetooth audio reset failed:', error);
        }
      }
    }

    useEffect(() => {
      RNCallKeep.addEventListener('endCall', () => {
        leaveChannel();
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
                  astroId: astrologerIdRef.current,
                  showReview: true,
                },
              },
            ],
          }),
        );
      });
      _setupAudioSDKEngine();
      return () => {
        RNCallKeep.removeEventListener('endCall');
      };
    }, []);

    // useFocusEffect(
    //   useCallback(() => {
    //     return () => {
    //       _release();
    //     };
    //   }, []),
    // );

    useImperativeHandle(ref, () => ({
      joinChannel,
      leaveChannel,
      mute,
      unMute,
      enableSpeaker,
      disableSpeaker,
    }));

    return <ErrorBoundary>{children}</ErrorBoundary>;
  },
);
export default AgoraInit;
