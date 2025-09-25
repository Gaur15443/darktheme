import {
  ActivityIndicator,
  Keyboard,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useMemo,
} from 'react';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from '@d11/react-native-fast-image';
import {ASTRO_DEFAULT_AVATAR} from '../../../configs/Calls/Constants';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import AgoraInit, {AgoraInitRef} from './AgoraInit';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import SendButton from './ChatComponents/SendButton';
import RenderImage, {
  CustomRenderImageProps,
} from './ChatComponents/RenderImage';
import ChatTextInput from './ChatComponents/ChatTextInput';
import ChatBubble, {ChatReplyAction} from './ChatComponents/ChatBubble';
import ChatReply from './ChatComponents/ChatReplyWrapper';
import {
  consultationEndUser,
  getUserChats,
  setCounter,
  setIsChatScreenInReadOnlyMode,
  setIsUploadingMedia,
  setReadOnlyModeAstrologerName,
  setReadOnlyModeUserId,
  setUploadingMedia,
} from '../../../store/apps/agora';
import Toast from 'react-native-toast-message';
import Confirm from '../../Confirm';
import ChatDialogIcon from '../../../images/Icons/ChatDialogIcon';
import {stopRingtone} from '../../../configs/Calls/CallNotificationConfig';
import useNativeBackHandler from '../../../hooks/useBackHandler';
import Counter from '../AstroAgoraCall/AgoraCallAnswer/Counter/Counter';
import {formatDuration} from '../../../utils/format';
import {ChatMessage, ChatMessageStatusCallback} from 'react-native-agora-chat';
import {Track} from '../../../../App';
import {
  CommonActions,
  RouteProp,
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {RootStackParamList} from '../../../configs/DeepLinks/DeepLinkingConfig';
import {generateRandomString, isMessageSentSuccessfully} from '../../../utils';
import database, {FirebaseDatabaseTypes} from '@react-native-firebase/database';
import Sound from 'react-native-sound';
import authConfig from '../../../configs';
import moment from 'moment';
import {CHATS_PER_PAGE} from '../../../configs/Chats/constants';
import BottomArrowsIcon from './ChatComponents/GeneralIcons/BottomArrowsIcon';
import MediaPreview from '../../MediaPreview';
import {useNetworkStatus} from '../../../hooks/useNetworkStatus';
import {useWallet} from '../../../context/WalletContext';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {BackArrowIcon} from '../../../images';
import {AstroWrapper} from '../../../navigation/AppStack';
import Spinner from '../../../common/Spinner';
import _ from 'lodash';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Pressable} from 'react-native-gesture-handler';
import {useGestureContext} from '../../../context/GestureHandlerRootView';
import {setAdjustNothing, setAdjustPan} from 'rn-android-keyboard-adjust';

const AgoraCallService =
  Platform.OS === 'android' ? NativeModules.AgoraCallService : null;
Sound.setCategory('Playback');

interface IMessageOnSend extends Omit<IMessage, 'image'> {
  media?: OnGetMedia[];
}

export type MessageStatus = 'sent' | 'read';

interface onSendMessageProps extends IMessageOnSend {
  repliedTo?: {
    chatId: string;
    text: string;
    userId: string;
  };
  media?: OnGetMedia[];
}
export interface OnGetMedia {
  mediaUrl: string;
  mimeType: string;
  name: string;
  size?: number | undefined;
  type: string;
  _id?: string | undefined;
  duration?: number;
}

export interface Message {
  _id: number | string;
  text: string;
  createdAt: number | Date;
  user: {
    _id: number | string;
    name?: string | undefined;
  };
  media?:
    | {
        mediaUrl: string;
        thumbnailUrl?: string | undefined;
        mediaType: string;
      }[]
    | string;
  status?: MessageStatus;
}

interface DiscardCtaRef {
  showDialog: () => void;
  closeDialogue: () => void;
}

const getLocalAudioDuration = (path: string): Promise<number> => {
  return new Promise((resolve, _) => {
    const sound = new Sound(path, '', error => {
      if (error) {
        console.log('❌ Error loading sound:', error);
        resolve(0);
        return;
      }

      const duration = sound.getDuration();
      console.log('✅ Duration:', duration, 'seconds');
      sound.release();
      resolve(duration);
    });
  });
};

const DiscardCta = forwardRef(
  (
    {
      children,
      onConfirmPress = () => {},
      loading = false,
    }: {
      children: React.ReactNode;
      onConfirmPress?: () => void;
      loading?: boolean;
    },
    ref: React.Ref<DiscardCtaRef>,
  ) => {
    const userData = useSelector((state: RootState) => state.userInfo);
    const chatReqDetails = useSelector(
      (state: RootState) => state.agoraCallSlice.chatReqDetails,
    );
    const [showDialogue, setShowDialogue] = useState(false);
    const [_loading, setLoading] = useState(loading || false);

    function onDiscardPress() {
      Track({
        cleverTapEvent: 'Chat_Continued',
        mixpanelEvent: 'Chat_Continued',
        userData,
      });
      setShowDialogue(false);
    }

    function showDialog() {
      setShowDialogue(true);
    }

    function closeDialogue() {
      setShowDialogue(false);
    }

    useImperativeHandle(ref, () => ({
      showDialog,
      closeDialogue,
    }));

    return (
      <ErrorBoundary>
        {showDialogue && (
          <Confirm
            isAstrology
            showCross={false}
            onBackgroundClick={onDiscardPress}
            titleStyle={dialogueStyles.titleStyle}
            title={
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ChatDialogIcon />
              </View>
            }
            subTitle={`Are you sure you want to end the chat with ${chatReqDetails.displayName}?`}
            subTitleStyle={dialogueStyles.subTitleStyle}
            backgroundColor={'rgba(42, 32, 83, 0.9)'}
            //@ts-ignore
            continueCtaText={
              _loading ? <ActivityIndicator color={'white'} /> : 'Yes, end chat'
            }
            confirmButtonStyle={dialogueStyles.confirmBtnStyle}
            confirmButtonLabelStyle={dialogueStyles.confirmBtnLabelstyle}
            discardCtaText={'No, continue chat'}
            discardButtonStyle={dialogueStyles.discardBtnStyle}
            discardButtonLabelStyle={dialogueStyles.discardBtnLableStyle}
            onContinue={() => {
              setLoading(true);
              onConfirmPress();
            }}
            disableDiscardBtn={_loading}
            onDiscard={onDiscardPress}
          />
        )}
        {children}
      </ErrorBoundary>
    );
  },
);

const ChatHeader = memo(({onConfirmPress}: {onConfirmPress: () => void}) => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChatScreen'>>();
  const navigation = useNavigation();
  const {top}: EdgeInsets = useSafeAreaInsets();
  const userData = useSelector((state: RootState) => state.userInfo);
  const {totalBalance} = useWallet();
  const discardCtaRef = useRef<DiscardCtaRef>(null);
  const [willEnd, setWillEnd] = useState(false);
  const willEndRef = useRef<boolean>(false);
  const [endingChat, setEndingChat] = useState(false);
  const chatDetails = useSelector(
    (state: RootState) => state.agoraCallSlice.chatReqDetails,
  );
  const chatToken = useSelector(
    (state: RootState) => state.agoraCallSlice.chatToken,
  );
  const astrologerProfilePic = useSelector(
    (state: RootState) =>
      state.agoraCallSlice.chatReqDetails.astrologerPersonalDetails?.profilepic,
  );
  const totalAvailableTime = useSelector(
    (state: RootState) => state.agoraCallSlice.totalAvaiableConsultationTime,
  );

  function onEndPress() {
    if (route?.params?.readOnly) {
      navigation.goBack();
      return;
    }
    Keyboard.dismiss();
    Track({
      cleverTapEvent: 'Clicked_End_Chat',
      mixpanelEvent: 'Clicked_End_Chat',
      userData,
    });
    discardCtaRef.current?.showDialog();
  }

  useNativeBackHandler(onEndPress);

  function onEndChat() {
    try {
      setEndingChat(true);
      const props = {
        'Remaining balance': totalBalance.toFixed(2),
        'Remaining time': formatDuration(totalAvailableTime),
      };

      Track({
        userData,
        cleverTapEvent: 'Chat_Ended',
        mixpanelEvent: 'Chat_Ended',
        cleverTapProps: props,
        mixpanelProps: props,
      });
      onConfirmPress();
      discardCtaRef.current?.closeDialogue();
    } catch (error) {
      console.log(error);
    } finally {
      setEndingChat(false);
    }
  }

  return (
    <ErrorBoundary>
      <DiscardCta
        loading={endingChat}
        ref={discardCtaRef}
        onConfirmPress={onEndChat}>
        <View style={[styles.header, {paddingTop: top + 20}]}>
          <Pressable
            onPress={() => {
              if (route?.params?.readOnly) {
                navigation.goBack();
              }
            }}
            style={styles.backButton}>
            {route?.params?.readOnly && <BackArrowIcon fill={'white'} />}
            <FastImage
              source={{
                uri: route?.params?.readOnly
                  ? route?.params?.astrologerProfilePic
                  : astrologerProfilePic && astrologerProfilePic?.length > 0
                    ? chatDetails?.astrologerPersonalDetails?.profilepic
                    : ASTRO_DEFAULT_AVATAR,
              }}
              style={styles.astrologerImage}
            />
            <View style={{justifyContent: 'flex-start'}}>
              <Text
                style={[styles.astrologerName, {width: 170}]}
                numberOfLines={1}>
                {route?.params?.readOnly
                  ? route?.params?.astrologerName
                  : chatDetails?.displayName}
              </Text>
              {!route?.params?.readOnly && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: 2,
                  }}>
                  {chatToken.length > 0 ? (
                    <Counter
                      textStyle={
                        willEnd ? styles.timeLeftWillEnd : styles.timeLeft
                      }
                      start={chatToken?.length > 0}
                      onChange={time => {
                        if (time < 60) {
                          willEndRef.current = true;
                        } else {
                          willEndRef.current = false;
                        }
                        if (willEndRef.current !== willEnd) {
                          setWillEnd(willEndRef.current);
                        }
                      }}
                    />
                  ) : (
                    <Text>{formatDuration(totalAvailableTime)}</Text>
                  )}
                  <Text
                    style={
                      willEnd ? styles.timeLeftWillEndText : styles.timeLeftText
                    }>
                    mins left
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
          {!route?.params?.readOnly && (
            <Pressable onPress={onEndPress} style={styles.endButton}>
              <Text style={styles.endButtonText}>End Chat</Text>
            </Pressable>
          )}
        </View>
      </DiscardCta>
    </ErrorBoundary>
  );
});

const Loader = memo(() => {
  return (
    <ErrorBoundary>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(18, 16, 41, 1)',
        }}>
        <Spinner />
      </View>
    </ErrorBoundary>
  );
});

export default function ChatScreen() {
  const {setDisableKeyboardDismiss} = useGestureContext();
  const dispatch = useDispatch<AppDispatch>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userData = useSelector((state: RootState) => state.userInfo);
  const {isConnected} = useNetworkStatus();
  const route = useRoute<RouteProp<RootStackParamList, 'ChatScreen'>>();
  const agoraChatRef = useRef<AgoraInitRef>(null);
  const msgIdToBeUpdated = useRef<string | null>(null);
  const uploadedMedia = useRef<Array<string>>([]);
  const blobDataRef = useRef<OnGetMedia[]>([]);
  const messagesRef = useRef<Array<Message>>([]);
  const astrologerId = useRef('');
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFocused = useIsFocused();
  const isInitialized = useRef(false);
  const pageNumber = useRef(1);
  const _isMoreChatsPresent = useRef(true);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [isMoreChatsPresent, setIsMoreChatsPresent] = useState(true);
  const [isReadOnly, setReadOnly] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // --media preview states--
  const [mediaToPreviewCopy, setMediaToPreviewCopy] = useState<any[]>([]);
  const [mediaToPreview, setMediaToPreview] = useState([]);
  const [selectedRatio, setSelectedRatio] = useState(1);
  const [isReEditing, setIsReEditing] = useState(false);

  const chatReqDetails = useSelector(
    (state: RootState) => state?.agoraCallSlice?.chatReqDetails,
  );
  const _kundliData = useSelector(
    (state: RootState) => state.agoraCallSlice.kundliData,
  );

  const replyingChatDetailsRef = useRef<ChatReplyAction>({
    chatId: '',
    text: '',
    userId: '',
    media: [],
  });

  const messageAckCallBack = useRef<ChatMessageStatusCallback>({
    onSuccess(message) {
      if (msgIdToBeUpdated?.current && msgIdToBeUpdated?.current.length > 0) {
        updateLocalId(msgIdToBeUpdated.current, message.msgId);
      }
      updateMessageStatus(message.msgId, 'sent');
      agoraChatRef.current?.updateMessageInFirestore([message.msgId], 'sent');
    },
    onError(_, __) {},
    onProgress(_, __) {},
  });

  const inputText = useRef<string>('');

  const chatUserId = useSelector(
    (state: RootState) => state.agoraCallSlice.chatReqDetails.userId,
  );
  const chatToken = useSelector(
    (state: RootState) => state.agoraCallSlice.chatToken,
  );
  const totalAvailableTime = useSelector(
    (state: RootState) => state.agoraCallSlice.totalAvaiableConsultationTime,
  );

  const [messages, setMessages] = useState<Message[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [audioPath, setAudioPath] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<Array<OnGetMedia>>([]);
  const [replyingChatDetails, setReplyingChatDetails] =
    useState<ChatReplyAction>({
      chatId: '',
      text: '',
      userId: '',
      media: [],
    });

  function formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }
  function formatTime(time: string) {
    return moment(time).format('hh:mm:ss A');
  }

  const onSendMessage = useCallback((_messages: onSendMessageProps[] = []) => {
    let _singleMessage = _messages[0];
    let _content = _messages[0].text;

    /* if user is replying to a message */
    if (
      replyingChatDetailsRef?.current?.text?.length > 0 ||
      (replyingChatDetailsRef?.current?.media &&
        replyingChatDetailsRef?.current?.media?.length > 0)
    ) {
      const repliedTo = {
        chatId: replyingChatDetailsRef.current.chatId,
        text: replyingChatDetailsRef.current.text,
        userId: replyingChatDetailsRef.current.userId,
        media: replyingChatDetailsRef.current.media,
      };
      _singleMessage = {
        ..._singleMessage,
        repliedTo: repliedTo,
      };
      _content = `${_content}<imeuswe-replies>${JSON.stringify(repliedTo)}</imeuswe-replies>`;
      onReplyClose();
    }

    if (!isMessageSentSuccessfully(_singleMessage._id)) {
      msgIdToBeUpdated.current = _singleMessage._id?.toString();
    }

    //@ts-ignore
    setMessages(previousMessages => {
      //@ts-ignore
      messagesRef.current = GiftedChat.append(previousMessages, [
        //@ts-ignore
        _singleMessage,
      ]);
      //@ts-ignore
      return messagesRef.current;
    });

    if (_messages[0].media) {
      upload(_messages);
      return;
    }

    agoraChatRef.current?.sendmsg({content: _content});
  }, []);

  const onRecieveMessage = useCallback((_messages: Message[] = []) => {
    setTimeout(() => {
      setMessages(previousMessages => {
        //@ts-ignore
        messagesRef.current = GiftedChat.append(previousMessages, _messages);
        //@ts-ignore
        return messagesRef.current;
      });
    }, 150);
  }, []);

  async function initialize() {
    try {
      if (isInitialized.current) {
        return;
      }
      isInitialized.current = true;
      setLoading(true);
      await agoraChatRef.current?.init();
      await agoraChatRef.current?.login({
        username: chatUserId ?? '',
        chatToken: chatToken ?? '',
      });
      // const _kundliData = await dispatch(
      //   getKundliData({kundliId: kundliId}),
      // ).unwrap();
      //@ts-ignore
      const birthDetails = `Birth Details\nName: ${_kundliData?.name}\nDate of Birth: ${formatDate(_kundliData?.birthDetails?.birthDateTime)}\nTime of Birth: ${formatTime(_kundliData?.birthDetails?.birthDateTime)}\nPlace of Birth: ${_kundliData?.birthDetails?.birthPlace?.placeName}\nGender: ${_.capitalize(_kundliData?.gender)}`;
      sendCustomMessage(birthDetails);
    } catch (error) {
      console.log('error: ' + error);
    } finally {
      setLoading(false);
    }
  }

  interface EncodeMediaType {
    mediaUrl: string;
    thumbnailUrl: string;
    urlType: string;
    duration?: number;
  }

  function encodeMedia(media: Array<EncodeMediaType>) {
    const encodedMedia = media.map(_media => {
      const _obj = JSON.stringify({
        mediaUrl: _media.mediaUrl,
        thumbnailUrl: _media.thumbnailUrl,
        mediaType: _media.urlType,
        duration: _media?.duration ?? 0,
      });
      return `<imeuswe-media>${_obj}</imeuswe-media>`;
    });
    return encodedMedia;
  }

  function _handleRemoveMedia(e: OnGetMedia) {
    const _localMedia = selectedMedia.filter((_existingMedia: OnGetMedia) => {
      return _existingMedia._id !== e._id;
    });
    blobDataRef.current = _localMedia;
    setSelectedMedia(_localMedia);
  }

  async function upload(content: onSendMessageProps[]) {
    try {
      setMediaToPreviewCopy([]);
      setMediaToPreview([]);
      dispatch(setIsUploadingMedia(true));
      dispatch(setUploadingMedia(blobDataRef.current));
      const data: any[] | undefined =
        await agoraChatRef.current?.uploadMediaToServer({
          userId: chatUserId ?? '',
          data: blobDataRef.current,
        });
      if (data && Array.isArray(data) && data.length > 0) {
        updateLocalSrc(data);
        const _content = `${content[0].text}${JSON.stringify(encodeMedia(data as EncodeMediaType[]))}`;
        agoraChatRef.current?.sendmsg({content: _content});
        return;
      }
    } catch (error) {
      Toast.show({
        text1: 'Error uploading media',
        text2: (error as Error)?.message ?? 'Please try again',
        type: 'error',
      });
    } finally {
      dispatch(setIsUploadingMedia(false));
      setSelectedMedia([]);
      blobDataRef.current = [];
    }
  }

  function _onSend(_messages: IMessage[] = []) {
    let _textMessage: Message = _messages[0];
    const _mediaFiles = blobDataRef.current?.map((media: any) => {
      return {
        mediaUrl: media?.mediaUrl,
        mediaType: media?.type?.toLowerCase(),
        thumbnailUrl: media?.thumbnailUrl,
      };
    });
    if (selectedMedia.length > 0) {
      _textMessage = {
        ..._textMessage,
        media: _mediaFiles,
      };
    }
    onSendMessage([_textMessage as IMessageOnSend]);
    setSelectedMedia([]);
    blobDataRef.current = [];
    uploadedMedia.current = [];
  }

  function _onRecieveMessage(_msg: Message) {
    console.log('receiving message', _msg);
    const msg = [_msg];
    onRecieveMessage(msg);
  }

  function triggerReply({chatId, text, userId, media}: ChatReplyAction) {
    replyingChatDetailsRef.current = {
      chatId,
      text,
      userId,
      media: media && media?.length > 0 ? media : [],
    };
    setReplyingChatDetails({
      chatId,
      text,
      userId,
      media: media && media?.length > 0 ? media : [],
    });
  }

  function onReplyClose() {
    replyingChatDetailsRef.current = {
      chatId: '',
      text: '',
      userId: '',
      media: [],
    };
    setReplyingChatDetails({
      chatId: '',
      text: '',
      userId: '',
      media: [],
    });
  }

  function _handleAudioGetPath(path: string) {
    blobDataRef.current = [];
    setAudioPath(path);
  }

  async function _handleMediaSend() {
    try {
      const content: Message = {
        text: '',
        media: [],
        createdAt: new Date(),
        user: {
          _id: chatUserId ?? '',
        },
        _id: generateRandomString(5),
      };
      msgIdToBeUpdated.current = content._id?.toString();
      if (audioPath?.length > 0) {
        const fileName = audioPath.split('/');
        const duration = await getLocalAudioDuration(audioPath);

        const audioData = {
          name: `${fileName[fileName?.length - 1]}`,
          mediaUrl: `file://${audioPath}`,
          mimeType: 'audio/mp4',
          mediaType: 'Audio',
          duration,
        };

        blobDataRef.current = [
          {
            name: audioData.name,
            mediaUrl: audioData.mediaUrl,
            mimeType: audioData.mimeType,
            type: audioData.mediaType,
            duration: duration,
          },
        ];
        content.media = [audioData];
        onSendMessage([content as unknown as onSendMessageProps]);
      } else if (blobDataRef.current?.length > 0) {
        const mediaData = blobDataRef.current.map(_media => {
          return {
            name: _media.name,
            mediaUrl: _media.mediaUrl,
            mimeType: _media.mimeType,
            mediaType: _media.type,
            thumbnailUrl: _media.mediaUrl,
          };
        });
        content.media = mediaData;
        onSendMessage([content as unknown as onSendMessageProps]);
      }
    } catch (error) {
      console.log('error: ' + error);
      Toast.show({
        text1: 'Error sending audio',
        text2: (error as Error)?.message ?? 'Please try again',
        type: 'error',
      });
    } finally {
      setAudioPath('');
      setSelectedMedia([]);
      blobDataRef.current = [];
    }
  }

  function _handleDeleteAudio() {
    setAudioPath('');
  }

  async function endChatManual() {
    isInitialized.current = false;
    setMessages([]);
    messagesRef.current = [];
    Track({
      userData,
      cleverTapEvent: 'Clicked_End_Chat',
      mixpanelEvent: 'Clicked_End_Chat',
    });
    await dispatch(
      consultationEndUser({
        consultationType: 'chat',
        astrologerId: chatReqDetails?.astrologerId ?? '',
        astrologerName: chatReqDetails?.displayName ?? '',
      }),
    );
    agoraChatRef.current?.logout();
  }

  function updateLocalSrc(_data: any) {
    const findTheLocalFileEntryAndUpdate = messagesRef?.current?.map?.(
      _message => {
        return {
          ..._message,
          media: Array.isArray(_message.media)
            ? _message?.media?.map((_media, index) => {
                if (
                  //@ts-ignore
                  _media?.mediaType?.toLowerCase?.() &&
                  //@ts-ignore
                  (_media?._id?.includes('local') ||
                    _media?.mediaUrl?.includes?.('content://') ||
                    _media?.mediaUrl?.includes?.('file://'))
                ) {
                  return {
                    ..._media,
                    mediaUrl: _data?.[index]?.mediaUrl,
                    thumbnailUrl: _data?.[index]?.thumbnailUrl,
                  };
                } else {
                  return {
                    ..._media,
                  };
                }
              })
            : _message?.media,
        };
      },
    );
    messagesRef.current = findTheLocalFileEntryAndUpdate;
    setMessages(findTheLocalFileEntryAndUpdate);
  }

  function updateLocalId(localId: string, agoraId: string) {
    const findLocalIdAndUpdate = messagesRef?.current?.map?.(_message => {
      return {
        ..._message,
        _id: _message._id == localId ? agoraId : _message._id,
      };
    });
    messagesRef.current = findLocalIdAndUpdate;
    setMessages(findLocalIdAndUpdate);
    msgIdToBeUpdated.current = null;
  }

  function sendCustomMessage(text: string) {
    const message = {
      text: text,
      createdAt: new Date(),
      user: {
        _id: chatUserId ?? '',
      },
      _id: Date.now(),
    };
    msgIdToBeUpdated.current = message._id?.toString();
    onSendMessage([message as unknown as onSendMessageProps]);
  }

  function updateMessageStatus(messageId: string, status: MessageStatus) {
    const updatedMessages = messagesRef.current.map(_msg => {
      if (_msg._id === messageId) {
        return {
          ..._msg,
          status: status,
        };
      } else {
        return {
          ..._msg,
        };
      }
    });
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
  }

  useEffect(() => {
    if (route?.params?.readOnly) {
      setReadOnly(true);
      dispatch(
        setReadOnlyModeAstrologerName(route?.params?.astrologerName ?? ''),
      );
      dispatch(setReadOnlyModeUserId(route?.params?.userId ?? ''));
      dispatch(setIsChatScreenInReadOnlyMode(true));
      loadAllChats();
      return;
    }
    dispatch(setIsChatScreenInReadOnlyMode(false));
    dispatch(setReadOnlyModeAstrologerName(''));
    dispatch(setReadOnlyModeUserId(''));
    if (Platform.OS === 'android') {
      stopRingtone();
    }
    return () => {
      setCounter(0);
    };
  }, [route]);

  useEffect(() => {
    if (chatToken && chatToken?.length > 0) {
      setLoading(false);
      initialize();
    } else {
      setLoading(true);
    }
  }, [route, chatToken]);

  useEffect(() => {
    if (totalAvailableTime > 0) {
      dispatch(setCounter(totalAvailableTime));
    }
  }, [totalAvailableTime]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const chatRoomId = chatReqDetails?.chatRoomId;
    const userId = chatReqDetails?.userId;
    let userRef: FirebaseDatabaseTypes.Reference;
    let connectedRef: any;
    let connectedListener: any;
    let logoutTimer: NodeJS.Timeout | null = null;

    const rdbData = {
      featureType: 'Chat',
      userId,
    };

    const setupPresence = async () => {
      setDisableKeyboardDismiss(true);
      //@ts-ignore
      userRef = database().ref(`/online/${chatRoomId}-${authConfig.env}-user`);
      //@ts-ignore
      connectedRef = database().ref('.info/connected');
      userRef.keepSynced(true);

      connectedListener = connectedRef.on('value', async (snapshot: any) => {
        if (snapshot.val() === true) {
          if (Platform.OS === 'android') {
            AgoraCallService.startCallService(
              'Chat in Progress',
              'Tap to return to chat',
            );
          }
          await userRef.onDisconnect().set({
            online: false,
            firebaseToken: agoraChatRef.current?.getFirebaseAuthToken(),
            ...rdbData,
            endedAt: Date.now(),
          });

          await userRef.set({
            online: true,
            firebaseToken: agoraChatRef.current?.getFirebaseAuthToken(),
            ...rdbData,
            endedAt: Date.now(),
          });
        }
      });

      // Cancel logout if user comes back online
      userRef.on('value', snapshot => {
        const data = snapshot.val();
        if (data?.online === true && logoutTimer) {
          clearTimeout(logoutTimer);
          logoutTimer = null;
        }
      });

      // Debounced logout on child_removed
      userRef.on('child_removed', snapshot => {
        if (userId === snapshot.val()) {
          logoutTimer = setTimeout(() => {
            setMessages([]);
            messagesRef.current = [];
            agoraChatRef.current?.logout();
          }, 5000); // 5-second debounce
        }
      });
    };

    if (chatRoomId && chatRoomId?.length > 0 && userId && userId?.length > 0) {
      setupPresence();
    }

    return () => {
      setDisableKeyboardDismiss(false);
      if (!route?.params?.readOnly) {
        if (connectedRef && connectedListener) {
          connectedRef.off('value', connectedListener);
        }

        if (userRef) {
          userRef.set({
            online: false,
            ...rdbData,
            firebaseToken: agoraChatRef.current?.getFirebaseAuthToken(),
            endedAt: Date.now(),
          });
        }
      }

      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [isFocused, chatReqDetails?.chatRoomId, chatReqDetails?.userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        setAdjustPan();
      }
      const timer = setTimeout(() => {
        if (Platform.OS === 'android') {
          setAdjustNothing();
        }
      }, 500);
      return () => {
        if (Platform.OS === 'android') {
          setAdjustPan();
        }
        clearTimeout(timer);
      };
    }, []),
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  async function loadAllChats() {
    try {
      pageNumber.current = 1;
      setLoading(true);
      const data = await dispatch(
        getUserChats({
          chatRoomId: route?.params?.chatRoomId ?? '',
          pageNumber: pageNumber.current,
        }),
      ).unwrap();
      setMessages(previousMessages => {
        messagesRef.current = GiftedChat.append(previousMessages, [...data]);
        return messagesRef.current;
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error loading chats',
        text2: (error as Error)?.message ?? 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreMessages() {
    try {
      if (!_isMoreChatsPresent.current) {
        return;
      }
      setIsLoadingEarlier(true);
      pageNumber.current += 1;
      const data = await dispatch(
        getUserChats({
          chatRoomId: route?.params?.chatRoomId ?? '',
          pageNumber: pageNumber.current,
        }),
      ).unwrap();
      if (data?.length < CHATS_PER_PAGE) {
        _isMoreChatsPresent.current = false;
        setIsMoreChatsPresent(false);
      }
      setMessages(previousMessages => {
        messagesRef.current = GiftedChat.prepend(previousMessages, [...data]);
        return messagesRef.current;
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingEarlier(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (Platform.OS === 'android' && !isReadOnly) {
          AgoraCallService.stopCallService();
        }
      };
    }, []),
  );

  const uniqueMediaLength = useMemo(() => {
    const combined = [...selectedMedia, ...mediaToPreview];
    const uniqueFiles = new Map();

    combined.forEach(file => {
      if (file._id) {
        uniqueFiles.set(file._id, file);
      }
    });
    return uniqueFiles.size;
  }, [selectedMedia, mediaToPreview]);

  function handleCloseMediaPreview() {
    setMediaToPreview([]);
    setIsReEditing(false);
  }

  function handleBlobData(data: any) {
    setMediaToPreview([]);
    const updatedData = data.map((_file: any, index: number) => {
      const result = {
        ..._file,
        _id:
          _file._id ||
          `local-${Date.now() + index}-${Math.floor(Math.random() * 100000)}`,
      };
      return result;
    });
    if (isReEditing) {
      const newData = updatedData.filter(
        (newFile: any) =>
          !selectedMedia.some(existingFile => existingFile._id === newFile._id),
      );
      setSelectedMedia(prev => {
        return [...prev, ...newData];
      });
      blobDataRef.current = [...blobDataRef.current, ...newData];
    } else {
      setSelectedMedia(prev => [...prev, ...updatedData]);
      blobDataRef.current = [...blobDataRef.current, ...updatedData];
    }
    setIsReEditing(false);
  }

  function handleSaveOriginalCopy(data: any) {
    const updatedData = [...mediaToPreviewCopy, ...data];
    const uniqueData = Array.from(
      new Map(updatedData.map(item => [item._id, item])).values(),
    );
    setMediaToPreviewCopy(uniqueData);
  }

  function handleRemovedFromPreview(_id: any) {
    const updatedBlobData = selectedMedia.filter(b => b._id !== _id);
    const updatedMediaToPreviewCopy = mediaToPreviewCopy.filter(
      media => media._id !== _id,
    );
    const updatedMediaToPreview = mediaToPreview.filter(
      (media: any) => media._id !== _id,
    );
    setMediaToPreviewCopy(updatedMediaToPreviewCopy);
    setMediaToPreview(updatedMediaToPreview);
    setSelectedMedia(updatedBlobData);
    blobDataRef.current = updatedBlobData;
  }

  function handleSetMediaPreview(data: any, shouldAppend = false) {
    const allAreVideoOrFile = data.every(
      (media: any) =>
        media?.type?.toLowerCase?.() === 'video' ||
        media?.type?.toLowerCase?.() === 'application',
    );
    data.forEach((_element: any, index: number) => {
      //set all the video ids which user is trying to upload

      if (!data[index]._id) {
        data[index]._id =
          `local-${Date.now() + index}-${Math.floor(Math.random() * 100000)}`;
      }
      data[index].originalMedia = data[index].mediaUrl;
    });

    // Avoid editing videos
    if (!allAreVideoOrFile || shouldAppend) {
      if (shouldAppend) {
        data = [...mediaToPreview, ...data];
      }
      setMediaToPreview(data);
    } else {
      handleBlobData(data);
      handleSaveOriginalCopy(data);
    }
  }

  function handleReEdit() {
    setIsReEditing(true);
    //@ts-ignore
    setMediaToPreview(mediaToPreviewCopy);
  }

  function onMessagesRead(_msgs: Array<ChatMessage>) {
    const allMessageIds: Array<string> = [];
    _msgs.forEach(_msg => {
      allMessageIds.push(_msg.msgId);
      updateMessageStatus(_msg.msgId, 'read');
    });
    agoraChatRef.current?.updateMessageInFirestore(allMessageIds, 'read');
  }

  function addSystemMessage(text: string) {
    const _sysMessage = {
      _id: Date.now().toString(),
      text,
      createdAt: new Date(),
      system: true,
      user: {
        _id: Date.now().toString(),
        name: 'iMeUsWe',
      },
    };

    setMessages(previousMessages => {
      messagesRef.current = GiftedChat.append(previousMessages, [_sysMessage]);
      return messagesRef.current;
    });
  }

  astrologerId.current = useMemo(() => {
    return chatReqDetails.astrologerId ?? '';
  }, [chatReqDetails]);

  useEffect(() => {
    if (!isConnected) {
      if (messagesRef?.current?.length) {
        addSystemMessage('Reconnecting with the astrologer...');
      }
      disconnectTimerRef.current = setTimeout(() => {
        agoraChatRef.current?.logout();

        if (astrologerId.current?.length) {
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
                    astroId: astrologerId.current,
                    showReview: true,
                  },
                },
              ],
            }),
          );
        }
      }, 30000);
    } else {
      if (messagesRef?.current?.length) {
        addSystemMessage('connected');
      }
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    }
    return () => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    };
  }, [isConnected]);

  return (
    <ErrorBoundary.Screen>
      <AstroWrapper>
        {mediaToPreview.length > 0 && (
          <MediaPreview
            //@ts-ignore
            preAddedMedia={selectedMedia}
            key={mediaToPreview.length}
            totalVideoCountAllowed={1}
            totalImageCountAllowed={9}
            maxFiles={9 - uniqueMediaLength}
            mediaData={mediaToPreview}
            onCloseMediaPreview={handleCloseMediaPreview}
            onSaveMedia={handleBlobData}
            onSavedMediaDataCopy={handleSaveOriginalCopy}
            onAspectRatioChange={event => {
              setSelectedRatio(event);
            }}
            selectedRatio={selectedRatio}
            isEditing={false}
            //@ts-ignore
            onRemovedMedia={handleRemovedFromPreview}
            //@ts-ignore
            onUpdateMediaPreview={e => handleSetMediaPreview(e, true)}
            isAstrology
          />
        )}
        <AgoraInit
          ref={agoraChatRef}
          onChatMessagesRead={onMessagesRead}
          onMessageReceived={_onRecieveMessage}
          onInitSuccess={() => {}}
          messageDeliveryCallBack={messageAckCallBack.current}>
          <View style={styles.container}>
            <ChatHeader onConfirmPress={endChatManual} />
            {!loading ? (
              <View style={{flex: 1}}>
                <GiftedChat
                  maxInputLength={1000}
                  keyboardShouldPersistTaps="handled"
                  shouldUpdateMessage={({currentMessage, nextMessage}) => {
                    return (
                      currentMessage?._id !== nextMessage?._id ||
                      //@ts-ignore
                      currentMessage?.status !== nextMessage?.status ||
                      currentMessage?.text !== nextMessage?.text ||
                      //@ts-ignore
                      JSON.stringify(currentMessage?.media) !==
                        //@ts-ignore
                        JSON.stringify(nextMessage?.media)
                    );
                  }}
                  isScrollToBottomEnabled={true}
                  scrollToBottomComponent={BottomArrowsIcon}
                  scrollToBottomStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                  loadEarlier={isReadOnly && isMoreChatsPresent}
                  isLoadingEarlier={isLoadingEarlier}
                  onLoadEarlier={loadMoreMessages}
                  infiniteScroll={true}
                  renderLoadEarlier={() => (
                    <View
                      style={{
                        alignItems: 'center',
                        paddingVertical: 10,
                        backgroundColor: 'rgba(18, 16, 41, 1)',
                      }}>
                      {isLoadingEarlier && <ActivityIndicator color="white" />}
                    </View>
                  )}
                  listViewProps={{
                    //@ts-ignore
                    contentContainerStyle: {
                      flexGrow: 1,
                      justifyContent: 'flex-start',
                      paddingBottom: keyboardHeight,
                    },
                  }}
                  onInputTextChanged={data => (inputText.current = data)}
                  onSend={_onSend}
                  renderSend={props => (
                    <SendButton
                      onPress={() => {
                        if (inputText?.current?.length <= 0) {
                          _handleMediaSend();
                        }
                      }}
                      props={props}
                    />
                  )}
                  renderCustomView={props => (
                    <RenderImage props={props as CustomRenderImageProps} />
                  )}
                  renderAvatar={null}
                  showUserAvatar={false}
                  showAvatarForEveryMessage={false}
                  messages={messages as IMessage[]}
                  user={{
                    _id:
                      route?.params?.readOnly && route?.params?.userId
                        ? route?.params?.userId
                        : chatUserId
                          ? chatUserId
                          : '',
                  }}
                  renderBubble={props => (
                    <ChatBubble props={props} onReplyAction={triggerReply} />
                  )}
                  renderInputToolbar={props => (
                    <>
                      {route?.params?.readOnly ? (
                        <></>
                      ) : (
                        <ChatReply
                          onClose={onReplyClose}
                          selectedChatDetails={replyingChatDetails}>
                          <ChatTextInput
                            audioPath={audioPath}
                            onRemoveMedia={_handleRemoveMedia}
                            onChooseMedia={handleSetMediaPreview}
                            onGetPath={_handleAudioGetPath}
                            onDelete={_handleDeleteAudio}
                            selectedMedia={selectedMedia}
                            props={props}
                            onEdit={() => handleReEdit()}
                          />
                        </ChatReply>
                      )}
                    </>
                  )}
                />
                {isReadOnly && (
                  <View>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        paddingVertical: 20,
                      }}>
                      This conversation has ended
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Loader />
            )}
          </View>
        </AgoraInit>
      </AstroWrapper>
    </ErrorBoundary.Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: 'white',
    flex: 1,
    backgroundColor: 'rgba(18, 16, 41, 1)',
  },
  header: {
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(18, 16, 41, 1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  headerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    paddingVertical: 10,
  },
  astrologerName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
  },
  timeLeft: {
    color: 'rgba(39, 195, 148, 1)',
    fontSize: 14,
  },
  timeLeftWillEnd: {
    color: 'rgba(239, 68, 68, 1)',
    fontSize: 14,
  },
  timeLeftWillEndText: {
    color: 'rgba(239, 68, 68, 1)',
    fontSize: 14,
  },
  timeLeftText: {
    color: 'rgba(39, 195, 148, 1)',
    fontSize: 13,
  },
  profileContainer: {
    // justifyContent:'center',
  },
  endButton: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#FF4F4F',
    borderRadius: 8,
  },
  endButtonText: {
    color: '#FF4F4F',
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  astrologerImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  quickReplyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  replyText: {color: 'rgba(255, 255, 255, 0.75)'},
  replyScrollContainer: {gap: 10, paddingHorizontal: 10},
  quickReplyMainContainer: {marginBottom: 5},
});

const dialogueStyles = StyleSheet.create({
  titleStyle: {
    color: 'white',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
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
