import {GenerateChatTokenPayload} from '../../store/apps/agora/types';
import {store} from '../../store';
import {
  generateAgoraChatToken,
  resetShowCallDialogue,
  setChatTokenDetails,
} from '../../store/apps/agora';
import BackgroundTimer from '../../common/BackgroundCounter/BackgroundCounterConfig';
import {navigate, navigationRef} from '../Voip/NavigationService';
import Toast from 'react-native-toast-message';

export async function getChatToken({
  astrologerId,
  userId,
  expiry,
}: {
  astrologerId: string;
  userId: string;
  expiry: number;
}) {
  try {
    const state = store.getState();
    const _payload: GenerateChatTokenPayload = {
      astrologerId: astrologerId,
      userId: userId,
      expiry: expiry,
      chatRoomId: state?.agoraCallSlice?.chatReqDetails?.chatRoomId ?? '',
    };
    const data = await store
      .dispatch(generateAgoraChatToken(_payload))
      .unwrap();
    store.dispatch(
      setChatTokenDetails({
        userToken: data.userToken,
        agoraChatRoomId: data.agoraChatRoomId,
      }),
    );
    BackgroundTimer.clearInterval();
    store.dispatch(resetShowCallDialogue());
    return;
  } catch (error) {
    store.dispatch(resetShowCallDialogue());
    Toast.show({
      type: 'error',
      text1: 'Something went wrong connnecting to chat',
      text2: (error as Error).message,
    });
  }
}
