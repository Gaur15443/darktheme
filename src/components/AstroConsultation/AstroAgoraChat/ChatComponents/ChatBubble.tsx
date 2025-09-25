import {memo, useCallback, useMemo} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  Bubble,
  BubbleProps,
  IMessage,
  MessageTextProps,
} from 'react-native-gifted-chat';
import {Message} from '..';
import FastImage from '@d11/react-native-fast-image';
import Gallery from './ReplyIcons/Gallery';
import Audio from './ReplyIcons/Audio';
import Video from './ReplyIcons/Video';
import File from './ReplyIcons/File';
import {RootState} from '../../../../store';
import {useSelector} from 'react-redux';
import {extractFileNameFromUrl} from './extractFileNameFromUrl';
import {isMessageSentSuccessfully} from '../../../../utils';
import DoubleTickIcon from '../../../../images/Icons/DoubleTickIcon/DoubleTickIcon';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {SwipableView} from '../../../../common/SwipableView/SwipableView';

interface RenderName {
  sessionUserName: string;
  propUserId: string;
  routeUserName: string;
  routeUserId: string;
  sessionUserId: string;
}

interface Media {
  mediaUrl: string;
  mediaType: string;
  thumbnailUrl: string;
}

interface MessageTextCustomProps extends IMessage {
  status?: 'sent' | 'read';
  repliedTo?: {
    text?: string;
    chatId?: string;
    userId: string;
    media?: Array<Media>;
  };
}

const RenderIcon = memo(({media}: {media: Media}) => {
  return (
    <View>
      {media.mediaType?.toLowerCase?.() === 'image' && <Gallery />}
      {media.mediaType?.toLowerCase?.() === 'video' && <Video />}
      {media.mediaType?.toLowerCase?.() === 'audio' && <Audio />}
      {media.mediaType?.toLowerCase?.() === 'application' && <File />}
    </View>
  );
});

const RenderIconNames = ({media}: {media: Media}): string => {
  if (media.mediaType?.toLowerCase?.() === 'image') {
    return 'Image';
  } else if (media.mediaType?.toLowerCase?.() === 'video') {
    return 'Video';
  } else if (media.mediaType?.toLowerCase?.() === 'audio') {
    return 'Audio';
  } else if (media.mediaType?.toLowerCase?.() === 'application') {
    const file = extractFileNameFromUrl(media.mediaUrl);
    const fullFileName = file?.name + '.' + file?.extension;
    return fullFileName.length > 0 ? fullFileName : 'File';
  } else {
    return '';
  }
};

const RenderMultipleIcons = memo(({media}: {media: Array<Media>}) => {
  const totalImages = useMemo(() => {
    return media?.filter?.(
      _media => _media?.mediaType?.toLowerCase?.() === 'image',
    )?.length;
  }, [media]);
  const totalVideos = useMemo(() => {
    return media?.filter?.(
      _media => _media?.mediaType?.toLowerCase?.() === 'video',
    )?.length;
  }, [media]);

  return (
    <View>
      {totalImages > 0 && totalVideos <= 0 && (
        <View style={styles.replyMediaContainer}>
          <Gallery />
          <Text style={{color: 'rgba(255, 255, 255, 0.8)'}}>
            {totalImages} {'Photos'}
          </Text>
        </View>
      )}
      {totalImages <= 0 && totalVideos > 0 && (
        <View style={styles.replyMediaContainer}>
          <Video />
          <Text style={{color: 'rgba(255, 255, 255, 0.8)'}}>
            {totalImages} {'Videos'}
          </Text>
        </View>
      )}
      {totalImages > 0 && totalVideos > 0 && (
        <View style={styles.replyMediaContainer}>
          <Gallery />
          <Text style={{color: 'rgba(255, 255, 255, 0.8)'}}>
            {totalImages} {totalImages > 1 ? 'Photos' : 'Photo'}, {totalVideos}{' '}
            {totalVideos > 1 ? 'Videoa' : 'Video'}
          </Text>
        </View>
      )}
    </View>
  );
});

const RenderReplyMedia = memo(
  ({bubbleProps}: {bubbleProps: MessageTextProps<MessageTextCustomProps>}) => {
    return (
      <>
        {bubbleProps?.currentMessage?.repliedTo?.media?.length === 1 &&
          (bubbleProps?.currentMessage?.repliedTo?.media?.[0]?.mediaType?.toLowerCase?.() ===
            'image' ||
            bubbleProps?.currentMessage?.repliedTo?.media?.[0]?.mediaType?.toLowerCase?.() ===
              'video') && (
            <FastImage
              source={{
                uri:
                  bubbleProps?.currentMessage?.repliedTo?.media?.[0].mediaType?.toLowerCase?.() ===
                  'video'
                    ? bubbleProps?.currentMessage?.repliedTo?.media?.[0]
                        ?.thumbnailUrl
                    : bubbleProps?.currentMessage?.repliedTo?.media?.[0]
                        ?.mediaUrl,
              }}
              resizeMode={FastImage.resizeMode.cover}
              style={{flex: 1, minHeight: 50}}
            />
          )}
      </>
    );
  },
);

function renderName({
  propUserId,
  routeUserName,
  routeUserId,
  sessionUserName,
  sessionUserId,
}: RenderName): string {
  if (sessionUserName?.length > 0 && sessionUserId?.length > 0) {
    return propUserId === sessionUserId ? 'You' : sessionUserName;
  } else {
    return propUserId === routeUserId ? 'You' : routeUserName;
  }
}

const MessageText = memo(
  ({bubbleProps}: {bubbleProps: MessageTextProps<MessageTextCustomProps>}) => {
    const messageText = bubbleProps.currentMessage.text;
    const time = bubbleProps.currentMessage.createdAt;
    const width = Dimensions.get('window').width;
    const chatReqDetails = useSelector(
      (state: RootState) => state.agoraCallSlice.chatReqDetails,
    );
    const readOnlyModeAstrologerName = useSelector(
      (state: RootState) => state.agoraCallSlice.readOnlyModeAstrologerName,
    );
    const readOnlyModeUserId = useSelector(
      (state: RootState) => state.agoraCallSlice.readOnlyModeUserId,
    );

    const isSentByMe = useMemo(() => {
      return (
        bubbleProps?.currentMessage?.user?._id === chatReqDetails?.userId ||
        readOnlyModeUserId === chatReqDetails?.userId
      );
    }, [chatReqDetails, bubbleProps, readOnlyModeUserId]);

    return (
      <>
        {(bubbleProps?.currentMessage?.repliedTo?.text ||
          (bubbleProps?.currentMessage?.repliedTo?.media &&
            bubbleProps?.currentMessage?.repliedTo?.media?.length > 0)) && (
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              width: width * 0.77,
              marginBottom: 5,
            }}>
            <View style={styles.replyContainer}>
              <View style={styles.whiteLine} />
              <View style={styles.replyTextContainer}>
                <Text numberOfLines={1} style={styles.msg}>
                  {renderName({
                    propUserId: bubbleProps?.currentMessage?.repliedTo?.userId
                      ? bubbleProps?.currentMessage?.repliedTo?.userId
                      : '',
                    sessionUserId: chatReqDetails.userId
                      ? chatReqDetails.userId
                      : '',
                    routeUserId: readOnlyModeUserId,
                    sessionUserName: chatReqDetails?.displayName,
                    routeUserName: readOnlyModeAstrologerName,
                  })}
                </Text>
                {bubbleProps?.currentMessage?.repliedTo?.text &&
                  bubbleProps?.currentMessage?.repliedTo?.text?.length > 0 &&
                  !bubbleProps?.currentMessage?.repliedTo?.media?.length && (
                    <Text numberOfLines={3} style={styles.replyText}>
                      {bubbleProps?.currentMessage?.repliedTo?.text}
                    </Text>
                  )}
                {bubbleProps?.currentMessage?.repliedTo?.media?.length === 1 ? (
                  <Text numberOfLines={3} style={styles.replyText}>
                    <RenderIcon
                      media={bubbleProps?.currentMessage?.repliedTo?.media[0]}
                    />{' '}
                    {bubbleProps?.currentMessage?.repliedTo?.text &&
                    bubbleProps?.currentMessage?.repliedTo?.text.length > 0
                      ? bubbleProps?.currentMessage?.repliedTo?.text
                      : RenderIconNames({
                          media:
                            bubbleProps?.currentMessage?.repliedTo?.media[0],
                        })}
                  </Text>
                ) : (
                  <RenderMultipleIcons
                    //@ts-ignore
                    media={bubbleProps?.currentMessage?.repliedTo?.media}
                  />
                )}
              </View>
            </View>
            <RenderReplyMedia bubbleProps={bubbleProps} />
          </View>
        )}
        <View
          style={[
            styles.textContainerStyle,
            {
              minWidth: isSentByMe ? 90 : 70,
            },
          ]}>
          <View>
            <Text style={styles.messageTextStyle}>{messageText}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginLeft: 'auto',
            }}>
            <Text style={styles.messageTimeStyle}>
              {new Date(time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isSentByMe && (
              <View>
                {bubbleProps.currentMessage?.status === 'read' ? (
                  <DoubleTickIcon color={'white'} opacity="1" />
                ) : (
                  <DoubleTickIcon />
                )}
              </View>
            )}
          </View>
        </View>
      </>
    );
  },
);

export interface ChatReplyAction {
  chatId: string;
  text: string;
  userId: string;
  media?:
    | {
        mediaUrl: string;
        mediaType: string;
      }[]
    | string;
}

interface ChatBubbleProps {
  props: BubbleProps<Message>;
  onReplyAction: ({chatId, text, userId, media}: ChatReplyAction) => void;
}

export default memo(function ChatBubble({
  onReplyAction,
  props,
}: ChatBubbleProps) {
  const id = props.currentMessage._id;
  const isChatScreenOpenedInReadOnlyMode = useSelector(
    (state: RootState) => state?.agoraCallSlice?.readOnlyMode,
  );

  const onLeftAction = useCallback(() => {
    const replyDetails = {
      chatId: props.currentMessage._id.toString(),
      text: props.currentMessage.text,
      userId: String(props.currentMessage?.user?._id) || '',
      media: props.currentMessage?.media,
    };
    onReplyAction(replyDetails);
  }, [id]);
  return (
    <ErrorBoundary>
      {/* @ts-ignore */}
      <SwipableView
        disabled={
          !isMessageSentSuccessfully(props?.currentMessage?._id) ||
          isChatScreenOpenedInReadOnlyMode
        }
        onSwipeEnd={onLeftAction}>
        <Bubble
          {...props}
          textStyle={{
            left: styles.leftTextStyle,
            right: styles.rightTextStyle,
          }}
          wrapperStyle={{
            left: styles.leftBubbleStyle,
            right: styles.rightBubbleStyle,
          }}
          renderTime={() => null}
          renderMessageText={bubbleProps => (
            <MessageText bubbleProps={bubbleProps} />
          )}
        />
      </SwipableView>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  leftBubbleStyle: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderColor: 'rgba(105, 68, 211, 0.20)',
    backgroundColor: 'rgba(105, 68, 211, 0.25);',
    borderWidth: 1,
    marginBottom: 10,
  },
  rightBubbleStyle: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    marginBottom: 10,
  },
  messageTextStyle: {
    color: '#fff',
    fontSize: 15,
  },
  messageTimeStyle: {
    color: '#ccc',
    fontSize: 10,
  },
  textContainerStyle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 5,
  },
  leftTextStyle: {
    color: 'white',
  },
  rightTextStyle: {
    color: 'white',
  },
  whiteLine: {
    minHeight: 20,
    height: '100%',
    width: 2,
    backgroundColor: 'white',
  },
  replyContainer: {
    borderColor: 'white',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    borderRadius: 3,
    flex: 4,
    alignItems: 'center',
  },
  replyTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 5,
    gap: 5,
  },
  replyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  replyMediaContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  msg: {fontSize: 13, color: 'rgba(255, 255, 255, 0.75)'},
});
