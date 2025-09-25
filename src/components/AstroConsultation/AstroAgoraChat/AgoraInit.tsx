// Imports dependencies.
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
  ChatMessageEventListener,
  ChatConnectEventListener,
  ChatTextMessageBody,
  ChatRoomEventListener,
  ChatMessageStatusCallback,
  ChatManager,
  ChatRoomManager,
} from 'react-native-agora-chat';
import {
  resetAgoraChatRoomId,
  // logChatEnd,
  resetChatReqDetails,
  setChatToken,
} from '../../../store/apps/agora';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import Toast from 'react-native-toast-message';
import {Message, MessageStatus} from '.';
import {uploadMedia} from '../../../store/apps/mediaSlice';
import {getRandomLetters} from '../../../utils';
import {AppStateStatus, DeviceEventEmitter} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import _ from 'lodash';
import useAppStateListener from '../../../hooks/useAppStateListener';
import authConfig from '../../../configs';
import {useWallet} from '../../../context/WalletContext';
import ErrorBoundary from '../../../common/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {END_CHAT_SESSION_EMITTER} from '../../../configs/Chats/constants';
import RNCallKeep from 'react-native-callkeep';

interface AgoraInitProps {
  appKey?: string;
  onInitSuccess: () => void | undefined;
  children: React.ReactNode;
  onMessageReceived: (msg: Message) => void | undefined;
  messageDeliveryCallBack?: ChatMessageStatusCallback;
  onChatMessagesRead?: (msg: Array<ChatMessage>) => void | undefined;
}

export interface AgoraInitRef {
  init: () => Promise<void | undefined>;
  login: ({
    username,
    chatToken,
  }: {
    username: string;
    chatToken: string;
  }) => Promise<void | undefined>;
  logout: () => Promise<void | undefined>;
  sendmsg: ({content}: {content: string}) => Promise<void | undefined>;
  uploadMediaToServer: (payload: {userId: string; data: any}) => Promise<any[]>;
  updateMessageInFirestore: (
    msgIds: Array<string>,
    status: MessageStatus,
  ) => void;
  getFirebaseAuthToken: () => string;
}

// Defines the App object.
const AgoraInit = forwardRef(
  (
    {
      appKey = authConfig.agoraAppKey,
      onInitSuccess = () => {},
      onMessageReceived = (_: Message) => {},
      onChatMessagesRead = () => {},
      children,
      messageDeliveryCallBack = {
        onSuccess(_) {},
        onError(_, __) {},
        onProgress(_, __) {},
      },
    }: AgoraInitProps,
    ref: React.Ref<AgoraInitRef>,
  ) => {
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const appState = useAppStateListener();
    const {setFreeCallAvailable} = useWallet();
    const UUID = useSelector((state: RootState) => state?.agoraCallSlice?.UUID);

    const chatClientRef = useRef<ChatClient>();
    const chatManagerRef = useRef<ChatManager>();
    const agoraChatRoomManagerRef = useRef<ChatRoomManager>();
    const appStateRef = useRef<AppStateStatus>('active');
    const isChatEnded = useRef<boolean>(false);

    const messagesToBeRead = useRef<Array<ChatMessage>>([]);
    const _firebaseAuthToken = useRef<string>('');

    const chatReceiverId = useSelector(
      (state: RootState) => state?.agoraCallSlice?.chatReqDetails?.astrologerId,
    );
    const chatReqDetails = useSelector(
      (state: RootState) => state?.agoraCallSlice?.chatReqDetails,
    );
    const agoraChatRoomId = useSelector(
      (state: RootState) => state?.agoraCallSlice?.agoraChatRoomId,
    );
    const isChatScreenOpenedInReadOnlyMode = useSelector(
      (state: RootState) => state?.agoraCallSlice?.readOnlyMode,
    );
    const consultationToasts = useSelector(
      (state: RootState) =>
        state.agoraCallSlice.consultationToasts.consultation,
    );

    const _options = useRef(
      new ChatOptions({
        autoLogin: false,
        appKey: appKey ?? '',
        requireDeliveryAck: true,
        requireAck: true,
      }),
    );
    const eventHandler = useRef<ChatMessageEventListener>({
      onMessagesReceived(messages) {
        for (let index = 0; index < messages.length; index++) {
          if (appStateRef.current === 'background') {
            messagesToBeRead.current.push(messages[index]);
          } else {
            chatManagerRef?.current?.sendMessageReadAck(messages[index]);
          }
          let _text: string = (messages?.[index]?.body as ChatTextMessageBody)
            ?.content;
          let _urls: Array<{
            mediaUrl: string;
            thumbnailUrl: string;
            mediaType: string;
          }> = [];
          let _repliedTo: object = [];

          if (_text.includes('<imeuswe-media>')) {
            const decodeData = extractAndCleanMedia(_text);
            const parsedUrls = decodeData.urls.map(url => JSON.parse(url));
            _text = decodeData.cleanedStr;
            _urls = parsedUrls;
          }

          if (_text.includes('<imeuswe-replies>')) {
            const decodeData = extractAndCleanReplies(_text);
            _text = decodeData.cleanedStr;
            _repliedTo = decodeData.data;
          }

          const msg: Message = {
            _id: messages?.[index]?.msgId,
            text: _text,
            ...(_urls.length > 0 ? {media: _urls} : {}),
            ...(Object.keys(_repliedTo || {}).length > 0
              ? {repliedTo: _repliedTo}
              : {}),
            createdAt: new Date(),
            user: {
              _id: messages?.[index]?.from,
            },
          };

          onMessageReceived(msg);
          sendMessageToFirestore(msg);
        }
      },
      onMessagesRead(messages) {
        onChatMessagesRead(messages);
      },
    });

    const eventListener = useRef<ChatConnectEventListener>({
      onTokenDidExpire() {
        console.log('expired');
        logout();
      },
      onConnected() {
        setMessageListener();
      },
      onDisconnected() {},
    });

    const agoraChatRoomListener = useRef<ChatRoomEventListener>({
      onMemberJoined(_: {roomId: string; participant: string}): void {
        setFreeCallAvailable(false);
      },
      onMemberExited(_: {
        roomId: string;
        participant: string;
        roomName?: string | undefined;
      }): void {
        console.log('member exited');
        logout();
      },
    });

    async function init() {
      try {
        const chatClient = ChatClient.getInstance();
        const chatManager = chatClient.chatManager;
        const agoraChatRoomManager = chatClient.roomManager;

        chatClientRef.current = chatClient;
        chatManagerRef.current = chatManager;
        agoraChatRoomManagerRef.current = agoraChatRoomManager;

        chatClient.removeAllConnectionListener();
        await chatClient.init(_options.current);
        chatClient.addConnectionListener(eventListener.current);
        onInitSuccess();
      } catch (error) {
        console.log('init fail: ' + JSON.stringify(error));
      }
    }

    function setMessageListener() {
      chatManagerRef?.current?.removeAllMessageListener?.();
      agoraChatRoomManagerRef?.current?.removeAllRoomListener?.();
      chatManagerRef?.current?.addMessageListener?.(eventHandler.current);
      agoraChatRoomManagerRef?.current?.addRoomListener?.(
        agoraChatRoomListener.current,
      );
    }

    async function joinAgoraChatRoom() {
      try {
        await agoraChatRoomManagerRef?.current?.joinChatRoom?.(agoraChatRoomId);
      } catch (error) {
        console.log('error joining room', error);
        // Toast.show({
        //   type: 'error',
        //   text1: 'Error joining the chat room',
        //   text2: (error as Error).message,
        // });
      }
    }

    async function leaveChatRoom() {
      try {
        await agoraChatRoomManagerRef?.current?.leaveChatRoom?.(
          agoraChatRoomId,
        );
      } catch (error) {
        console.log('Error leaving the chat room', error);
      }
    }

    async function login({
      username,
      chatToken,
    }: {
      username: string;
      chatToken: string;
    }) {
      try {
        // Alert.alert('login');
        // Alert.alert(username, chatToken);
        await chatClientRef?.current?.loginWithToken?.(username, chatToken);
        await joinAgoraChatRoom();
        RNCallKeep.setCurrentCallActive(UUID);
        RNCallKeep.reportConnectedOutgoingCallWithUUID(UUID);
      } catch (error) {
        console.log('login fail: ' + JSON.stringify(error));
      }
    }

    async function logout() {
      try {
        if (isChatEnded.current) {
          return;
        } else {
          isChatEnded.current = true;
          RNCallKeep.endAllCalls();
          dispatch(setChatToken(''));
          dispatch(resetAgoraChatRoomId());
          dispatch(resetChatReqDetails());
          chatManagerRef?.current?.removeAllMessageListener?.();
          agoraChatRoomManagerRef?.current?.removeAllRoomListener?.();
          await leaveChatRoom();
          chatClientRef?.current?.logout?.();

          if (chatReqDetails.astrologerId?.length) {
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
                      astroId: chatReqDetails.astrologerId,
                      showReview: true,
                    },
                  },
                ],
              }),
            );
          }
        }
      } catch (error) {
        if (isChatEnded.current) {
          return;
        } else {
          if (chatReqDetails.astrologerId?.length) {
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
                      astroId: chatReqDetails.astrologerId,
                      showReview: true,
                    },
                  },
                ],
              }),
            );
          }
        }
        console.log('error in closing seeion', error);
      }
    }

    useEffect(() => {
      const sub = DeviceEventEmitter.addListener(
        END_CHAT_SESSION_EMITTER,
        () => {
          console.log('end chat session');
          logout();
        },
      );
      return () => {
        sub.remove();
      };
    }, []);

    function createMessage(content: string) {
      return ChatMessage.createTextMessage(
        typeof chatReceiverId === 'string' ? chatReceiverId : '',
        content,
        ChatMessageChatType.PeerChat,
      );
    }

    async function sendmsg({content}: {content: string}) {
      try {
        if (!chatReceiverId) {
          Toast.show({
            text1: 'Chat receiver ID is not set',
            type: 'error',
          });
          return;
        }
        const _message = createMessage(content);
        _message.hasReadAck = true;
        _message.hasDeliverAck = true;
        _message.deliverOnlineOnly = true;
        await chatClientRef?.current?.chatManager?.sendMessage?.(
          _message,
          messageDeliveryCallBack,
        );
      } catch (error) {
        Toast.show({
          text1: consultationToasts.run_time_errors.message_not_sent.text1,
          text2: (error as Error).message,
          type: 'error',
        });
        console.log('send message fail: ' + JSON.stringify(error));
      }
    }

    function shouldUseOriginalFileName(mimeType: string): boolean {
      return (
        mimeType?.includes?.('Application') ||
        mimeType?.includes?.('application') ||
        mimeType?.includes?.('Audio') ||
        mimeType?.includes?.('udio')
      );
    }

    function getOriginalFileName(_fileName: string): string {
      const file = _fileName?.replaceAll?.(' ', '_');
      const splitWrtDots = file?.split?.('.');
      const extension = splitWrtDots?.[splitWrtDots?.length - 1];
      splitWrtDots?.pop();
      const fileName =
        splitWrtDots?.join?.('') + '_' + Date.now() + '.' + extension;
      return fileName;
    }

    async function _uploadMedia({userId, data}: {userId: string; data: any[]}) {
      try {
        const batchSize = 2;
        const results: any[] = [];

        // Split into batches of 2
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);

          const formData = new FormData();
          batch.forEach((blobData: any) => {
            const fileName = shouldUseOriginalFileName(blobData?.mimeType)
              ? getOriginalFileName(blobData?.name)
              : getRandomLetters?.();

            formData.append('image', {
              uri: blobData?.mediaUrl,
              name: fileName,
              type: blobData?.mimeType,
              duration: blobData.duration,
            });
          });

          if (batch.length > 0) {
            if (batch.length === 1 && batch?.[0]?.duration >= 0) {
              formData.append('duration', batch?.[0]?.duration);
            }
            formData.append('groupId', JSON.stringify([]));
            formData.append('imgCategory', 'Memory');
          }

          const payload = {id: userId, formData};

          // Upload current batch
          // @ts-ignore
          const response = await dispatch(uploadMedia(payload)).unwrap();
          results.push(response.data);
        }

        return results.flat();
      } catch (error) {
        console.log('err', error);
        throw new Error((error as Error).message);
      }
    }

    function extractAndCleanMedia(str: string): {
      urls: string[];
      cleanedStr: string;
    } {
      const urls = [];
      const tagRegex = /<imeuswe-media>(.*?)<\/imeuswe-media>/g;
      let match;

      while ((match = tagRegex.exec(str)) !== null) {
        const _jsonStringified = `"${match[1]}"`;
        const _json = JSON.parse(_jsonStringified);
        urls.push(_json);
      }

      const cleanedStr = str
        .replace(
          /\[\s*(?:"<imeuswe-media>.*?<\/imeuswe-media>"\s*,?\s*)+\]/g,
          '',
        )
        .trim();

      return {urls, cleanedStr};
    }

    function extractAndCleanReplies(str: string) {
      const tagRegex = /<imeuswe-replies>(.*?)<\/imeuswe-replies>/;

      const match = str.match(tagRegex);
      let data = null;

      if (match) {
        try {
          data = JSON.parse(match[1]);
        } catch (e) {
          console.error('Invalid JSON in tag:', match[1]);
        }
      }

      const cleanedStr = str
        .replace(
          /\[\s*(?:"<imeuswe-replies>.*?<\/imeuswe-replies>"\s*,?\s*)+\]/g,
          '',
        )
        .replace(tagRegex, '')
        .trim();

      return {data, cleanedStr};
    }

    function removeSigningFromUrls(
      mediaArray: {
        mediaUrl: string;
        mediaType: string;
        thumbnailUrl: string;
      }[],
    ) {
      return mediaArray.map(_media => {
        if (_media?.thumbnailUrl) {
          return {
            ..._media,
            mediaUrl: _media?.mediaUrl.split('?')?.[0],
            thumbnailUrl: _media?.thumbnailUrl?.split('?')?.[0],
          };
        } else {
          return {
            ..._media,
            mediaUrl: _media?.mediaUrl.split('?')?.[0],
          };
        }
      });
    }

    function sendMessageToFirestore(msg: any) {
      try {
        const msgtoStore = _.cloneDeep(msg);
        msgtoStore.messageId = msg._id;
        msgtoStore.chatRoomId = chatReqDetails.chatRoomId;
        msgtoStore.senderId = chatReqDetails.astrologerId;
        msgtoStore.isDeleted = false;
        msgtoStore.firebaseToken = _firebaseAuthToken.current;

        if (msgtoStore?.media?.length > 0) {
          msgtoStore.media = removeSigningFromUrls(msgtoStore?.media);
        }

        delete msgtoStore?._id;

        firestore()
          .collection(chatReqDetails.chatRoomId ?? '')
          .add(msgtoStore)
          .then(() => {})
          .catch(err => {
            console.log('error', err);
          });
      } catch (error) {
        console.log('error', error);
      }
    }

    async function updateMessageInFirestore(
      msgIds: Array<string>,
      status: MessageStatus,
    ) {
      try {
        const chatRoomId = chatReqDetails.chatRoomId ?? '';
        const batch = firestore().batch();
        for (const msgId of msgIds) {
          const querySnapshot = await firestore()
            .collection(chatRoomId)
            .where('messageId', '==', msgId)
            .get();
          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            batch.update(docRef, {
              status,
              firebaseToken: _firebaseAuthToken.current,
            });
          } else {
            console.warn(`No document found for messageId: ${msgId}`);
          }
        }
        await batch.commit();
      } catch (error) {
        console.log('error', error);
      }
    }

    async function getFirebaseToken() {
      try {
        const _token = await AsyncStorage.getItem('firebaseSecureToken');
        _firebaseAuthToken.current = _token ?? '';
      } catch (error) {
        console.log(error);
      }
    }

    function getFirebaseAuthToken() {
      return _firebaseAuthToken.current;
    }

    useEffect(() => {
      getFirebaseToken();
      return () => {
        if (!isChatScreenOpenedInReadOnlyMode) {
          console.log('logout');
          logout();
        }
      };
    }, []);

    useEffect(() => {
      appStateRef.current = appState;
      if (
        appStateRef.current === 'active' &&
        messagesToBeRead?.current &&
        messagesToBeRead?.current?.length > 0
      ) {
        messagesToBeRead.current.forEach(_msg => {
          chatManagerRef?.current?.sendMessageReadAck(_msg);
        });
      }
      RNCallKeep.addEventListener('endCall', () => {
        logout();
      });
      return () => {
        RNCallKeep.removeEventListener('endCall');
      };
    }, [appState]);

    useImperativeHandle(ref, () => ({
      init: init,
      login: login,
      logout: logout,
      sendmsg: sendmsg,
      uploadMediaToServer: _uploadMedia,
      updateMessageInFirestore,
      getFirebaseAuthToken,
    }));

    return <ErrorBoundary>{children}</ErrorBoundary>;
  },
);

export default AgoraInit;
