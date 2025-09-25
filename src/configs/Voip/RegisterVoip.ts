import VoipPushNotification from 'react-native-voip-push-notification';
import {formatCallerDetails} from '../../components/AstroConsultation/Utils/FormatCallerDetails';
import RNCallKeep, {
  AudioSessionCategoryOption,
  AudioSessionMode,
} from 'react-native-callkeep';
import {goBack, navigate} from './NavigationService';
import AgoraEngine from '../Calls/AgoraEngine';
import {
  onAnswer,
  onDecline,
  onDisplayChatNotification,
} from '../Chats/ChatNotificationConfig';
import {
  onDecline as onCallDecline,
  onDisplayCallNotification,
} from '../Calls/CallNotificationConfig';
import {ChatDetails} from '../Chats/FormatChatDetails';
import BackgroundTimer from '../../common/BackgroundCounter/BackgroundCounterConfig';
import {store} from '../../store';
import {resetShowCallDialogue, setUUID} from '../../store/apps/agora';
import {DeviceEventEmitter} from 'react-native';
import {END_CHAT_SESSION_EMITTER} from '../Chats/constants';
interface VoipNotification {
  callDetails?: string;
  uuid?: string;
  [key: string]: any;
}

class RegisterVoipService {
  private static instance: RegisterVoipService;
  private isCallKeepSetup: boolean = false;
  private listenersRegistered: boolean = false;
  private encodedData: string | null = null;
  private featureType: 'Call' | 'Chat' = 'Call';
  private chatDetails: ChatDetails | null = null;
  private isRoutingToChatScreen: boolean = false;
  private isRoutingToCallScreen: boolean = false;

  static getInstance(): RegisterVoipService {
    if (!RegisterVoipService.instance) {
      RegisterVoipService.instance = new RegisterVoipService();
      RegisterVoipService.instance.setupListeners();
    }
    return RegisterVoipService.instance;
  }

  registerAndRetriveToken(_cb: (_cbData: {_token: string}) => void) {
    try {
      VoipPushNotification.registerVoipToken();
      VoipPushNotification.addEventListener('register', _token => {
        _cb({_token});
      });
    } catch (_err) {
      console.log(_err);
    }
  }

  private setupListeners() {
    if (!this.listenersRegistered) {
      this.onNotification();
      this.onLoadWithEvents();
      this.listenersRegistered = true;
    }
  }

  private constructor() {
    this.removeEventListeners();
  }

  private callKeepSetupIos() {
    try {
      if (this.isCallKeepSetup) return;
      // @ts-ignore
      RNCallKeep.setup({
        ios: {
          appName: 'iMeUsWe',
          supportsVideo: false,
          maximumCallGroups: '1',
          maximumCallsPerCallGroup: '1',
        },
      });
      this.isCallKeepSetup = true;
    } catch (_err) {
      console.log('Error in callkeep initialization: ', _err);
    }
  }

  private onIncomingCallAnswer = (_: {callUUID: string}) => {
    if (this.encodedData && this.featureType === 'Call') {
      this.isRoutingToCallScreen = true;
      navigate('CallAnswer', {
        encodedData: encodeURIComponent(this.encodedData),
      });
    } else {
      if (this.chatDetails) {
        this.isRoutingToChatScreen = true;
        onAnswer(this.chatDetails);
      }
    }
  };

  private onEndIncomingCall = () => {
    console.log('ending', this.featureType, this.isRoutingToCallScreen);
    if (this.featureType === 'Call') {
      if (this.isRoutingToCallScreen) {
        this.isRoutingToCallScreen = false;
        const engine = AgoraEngine.getInstance();
        const agoraEngineRef = engine.getRef();
        agoraEngineRef?.leaveChannel?.();
        RNCallKeep.endAllCalls();
        return;
      } else {
        console.log('came to decline');
        onCallDecline();
      }
    } else {
      if (!this.isRoutingToChatScreen) {
        onDecline();
      } else {
        this.isRoutingToChatScreen = false;
        RNCallKeep.endAllCalls();
        DeviceEventEmitter.emit(END_CHAT_SESSION_EMITTER);
      }
    }
  };

  private refactorData(_callDetails: string) {
    try {
      const callerDetails = JSON.parse(_callDetails);
      const extractedData = formatCallerDetails(callerDetails);
      BackgroundTimer.clearInterval();
      store.dispatch(resetShowCallDialogue());
      onDisplayCallNotification(extractedData);
      this.encodedData = JSON.stringify(extractedData);
    } catch (error) {
      console.error('Invalid callDetails JSON:', error);
    }
  }

  private registerCallKeepListeners() {
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('endCall');
    RNCallKeep.addEventListener('answerCall', this.onIncomingCallAnswer);
    RNCallKeep.addEventListener('endCall', this.onEndIncomingCall);
  }

  private onNotification() {
    VoipPushNotification.addEventListener(
      'notification',
      (notification: VoipNotification) => {
        this.featureType = notification?.data?.callDetails ? 'Call' : 'Chat';
        this.callKeepSetupIos();
        this.registerCallKeepListeners();
        if (notification.uuid) {
          store.dispatch(setUUID(notification.uuid));
        }
        if (
          this.featureType === 'Chat' &&
          notification?.data?.chatDetails &&
          typeof notification?.data?.chatDetails === 'string'
        ) {
          BackgroundTimer.clearInterval();
          store.dispatch(resetShowCallDialogue());
          this.chatDetails = JSON.parse(notification?.data?.chatDetails);
          onDisplayChatNotification(
            JSON.parse(notification?.data?.chatDetails),
          );
        }
        if (
          notification?.data?.callDetails &&
          typeof notification?.data?.callDetails === 'string'
        ) {
          this.refactorData(notification?.data?.callDetails);
          if (typeof notification?.uuid === 'string') {
            VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
          }
        }
      },
    );
  }

  private onLoadWithEvents() {
    VoipPushNotification.addEventListener('didLoadWithEvents', events => {
      if (Array.isArray(events) && events?.length > 1 && events?.[1]?.data) {
        const {callDetails = undefined, chatDetails = undefined} = events[1]
          .data as {
          callDetails: string;
          chatDetails: string;
        };
        if (callDetails) {
          if (!this.encodedData || this.encodedData.length === 0) {
            this.refactorData(callDetails);
          }
        }
        if (chatDetails) {
          this.chatDetails = JSON.parse(chatDetails);
          BackgroundTimer.clearInterval();
          store.dispatch(resetShowCallDialogue());
          onDisplayChatNotification(JSON.parse(chatDetails));
        }
      }
      this.registerCallKeepListeners();
    });
  }

  private removeEventListeners() {
    VoipPushNotification.removeEventListener('notification');
    VoipPushNotification.removeEventListener('didLoadWithEvents');
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('endCall');
  }
}

export default RegisterVoipService;
