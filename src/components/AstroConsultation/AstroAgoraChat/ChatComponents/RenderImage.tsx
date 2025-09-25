import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {memo, useMemo, useState} from 'react';
import {IMessage, MessageImageProps} from 'react-native-gifted-chat';
import CustomGrid from './Grid';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../store';
import FullMediaViewer from '../../../../common/Global-Media-Controller/FullMediaViewer';
import DoubleTickIcon from '../../../../images/Icons/DoubleTickIcon/DoubleTickIcon';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {Platform} from 'react-native';
import {TouchableOpacity} from 'react-native';

export interface CustomRenderImageProps
  extends Omit<MessageImageProps<IMessage>, 'currentMessage'> {
  currentMessage: UnWindedMessage;
}

interface RenderThreeMediaProps {
  _messages: UnWindedMessage[];
  onMediaClick: (obj: OnMediaClick) => {};
}

interface RenderMultipleMedia {
  _messages: UnWindedMessage[];
  onMediaClick: (obj: OnMediaClick) => {};
}

interface RenderTwoMediaProps {
  _messages: UnWindedMessage[];
  onMediaClick: (obj: OnMediaClick) => {};
}

interface RenderOneMediaProps {
  _messages: UnWindedMessage[];
  onMediaClick: (obj: OnMediaClick) => {};
}

interface OnMediaClick {
  selectedIndex: number;
  mediaUrls: Array<Media>;
}

interface UnWindedMessage extends Omit<IMessage, 'image'> {
  media?: Media;
}

interface Media {
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: string;
  duration?: number;
}

const RenderThreeMedia = memo(
  ({_messages, onMediaClick}: RenderThreeMediaProps) => {
    const firstMedia = _messages[0];
    const restMedia = _messages.slice(1, 3);
    const mediaUrls = useMemo(() => {
      return _messages.map(message => {
        return {
          ...message.media,
          type:
            message?.media?.mediaType && message?.media?.mediaType?.length > 0
              ? message?.media?.mediaType
              : //@ts-ignore
                message?.media?.type,
        };
      });
    }, [_messages]);
    return (
      <ErrorBoundary>
        <CustomGrid>
          <CustomGrid.Container
            style={[
              styles.renderImageContainer,
              styles.renderThreeMediaContainer,
            ]}>
            <CustomGrid.Equal>
              <TouchableOpacity
                onPress={() => {
                  const _obj: OnMediaClick = {
                    selectedIndex: 0,
                    //@ts-ignore
                    mediaUrls: mediaUrls,
                  };
                  onMediaClick(_obj);
                }}>
                <CustomGrid.RenderMedia
                  onVideoPress={() => {
                    const _obj: OnMediaClick = {
                      selectedIndex: 0,
                      //@ts-ignore
                      mediaUrls: mediaUrls,
                    };
                    onMediaClick(_obj);
                  }}
                  type={firstMedia.media?.mediaType ?? ''}
                  src={firstMedia.media?.mediaUrl ?? ''}
                  thumbnailUrl={firstMedia?.media?.thumbnailUrl}
                />
              </TouchableOpacity>
            </CustomGrid.Equal>
            <CustomGrid.Column>
              {restMedia.map((_msg: UnWindedMessage, _index: number) => {
                return (
                  <CustomGrid.Equal key={_index}>
                    <TouchableOpacity
                      key={_index}
                      onPress={() => {
                        const _obj: OnMediaClick = {
                          selectedIndex: _index + 1,
                          //@ts-ignore
                          mediaUrls: mediaUrls,
                        };
                        onMediaClick(_obj);
                      }}>
                      <CustomGrid.RenderMedia
                        onVideoPress={() => {
                          const _obj: OnMediaClick = {
                            selectedIndex: _index + 1,
                            //@ts-ignore
                            mediaUrls: mediaUrls,
                          };
                          onMediaClick(_obj);
                        }}
                        key={_index}
                        type={_msg.media?.mediaType ?? ''}
                        src={_msg.media?.mediaUrl ?? ''}
                        thumbnailUrl={_msg?.media?.thumbnailUrl}
                      />
                    </TouchableOpacity>
                  </CustomGrid.Equal>
                );
              })}
            </CustomGrid.Column>
          </CustomGrid.Container>
        </CustomGrid>
      </ErrorBoundary>
    );
  },
);

const RenderMultipleMedia = memo(
  ({_messages, onMediaClick}: RenderMultipleMedia) => {
    const upperTwoMedia = _messages.slice(0, 2);
    const lowerTwoMedia = _messages.slice(2, 4);
    let restMedia: number | null = null;
    if (_messages.length > 4) {
      restMedia = _messages.slice(4).length;
    }
    const mediaUrls = useMemo(() => {
      return _messages.map(message => {
        return {
          ...message.media,
          type: message.media?.mediaType,
        };
      });
    }, [_messages]);
    return (
      <ErrorBoundary>
        <CustomGrid>
          <CustomGrid.Container
            style={[
              styles.renderImageContainer,
              styles.renderMultiMediaContainer,
            ]}>
            <CustomGrid.Row>
              {upperTwoMedia.map((_msg: UnWindedMessage, _index: number) => {
                return (
                  <CustomGrid.Equal key={_index}>
                    <TouchableOpacity
                      key={_index}
                      onPress={() => {
                        const _obj: OnMediaClick = {
                          selectedIndex: _index,
                          //@ts-ignore
                          mediaUrls: mediaUrls,
                        };
                        onMediaClick(_obj);
                      }}>
                      <CustomGrid.RenderMedia
                        onVideoPress={() => {
                          if (Platform.OS === 'ios') {
                            const _obj: OnMediaClick = {
                              selectedIndex: _index,
                              //@ts-ignore
                              mediaUrls: mediaUrls,
                            };
                            onMediaClick(_obj);
                          }
                        }}
                        thumbnailUrl={_msg?.media?.thumbnailUrl}
                        type={_msg.media?.mediaType ?? ''}
                        src={_msg.media?.mediaUrl ?? ''}
                      />
                    </TouchableOpacity>
                  </CustomGrid.Equal>
                );
              })}
            </CustomGrid.Row>
            <CustomGrid.Row>
              {lowerTwoMedia.map((_msg: UnWindedMessage, _index: number) => {
                return (
                  <CustomGrid.Equal key={_index}>
                    <TouchableOpacity
                      key={_index}
                      onPress={() => {
                        const _obj: OnMediaClick = {
                          selectedIndex: _index === 1 ? 3 : 2,
                          //@ts-ignore
                          mediaUrls: mediaUrls,
                        };
                        onMediaClick(_obj);
                      }}>
                      <CustomGrid.Mask
                        textStyle={styles.count}
                        style={styles.maskContainer}
                        _index={_index}
                        activateIndex={restMedia ? 1 : null}
                        count={restMedia}>
                        <CustomGrid.RenderMedia
                          onVideoPress={() => {
                            if (Platform.OS === 'ios') {
                              const _obj: OnMediaClick = {
                                selectedIndex: _index === 1 ? 3 : 2,
                                //@ts-ignore
                                mediaUrls: mediaUrls,
                              };
                              onMediaClick(_obj);
                            }
                          }}
                          thumbnailUrl={_msg?.media?.thumbnailUrl}
                          type={lowerTwoMedia[_index].media?.mediaType ?? ''}
                          src={lowerTwoMedia[_index].media?.mediaUrl ?? ''}
                        />
                      </CustomGrid.Mask>
                    </TouchableOpacity>
                  </CustomGrid.Equal>
                );
              })}
            </CustomGrid.Row>
          </CustomGrid.Container>
        </CustomGrid>
      </ErrorBoundary>
    );
  },
);

const RenderTwoMedia = memo(
  ({_messages, onMediaClick}: RenderTwoMediaProps) => {
    const mediaUrls = useMemo(() => {
      return _messages.map(message => {
        return {
          ...message.media,
          type: message.media?.mediaType,
        };
      });
    }, [_messages]);
    return (
      <ErrorBoundary>
        <CustomGrid>
          <CustomGrid.Container
            style={(styles.renderImageContainer, {width: 300, height: 150})}>
            <CustomGrid.Row>
              {_messages.map((_msg: UnWindedMessage, _index: number) => (
                <CustomGrid.Equal>
                  <TouchableOpacity
                    key={_index}
                    onPress={() => {
                      const _obj: OnMediaClick = {
                        selectedIndex: _index,
                        //@ts-ignore
                        mediaUrls: mediaUrls,
                      };
                      onMediaClick(_obj);
                    }}>
                    <CustomGrid.RenderMedia
                      onVideoPress={() => {
                        if (Platform.OS === 'ios') {
                          const _obj: OnMediaClick = {
                            selectedIndex: _index,
                            //@ts-ignore
                            mediaUrls: mediaUrls,
                          };
                          onMediaClick(_obj);
                        }
                      }}
                      thumbnailUrl={_msg?.media?.thumbnailUrl}
                      src={_msg.media?.mediaUrl ?? ''}
                      type={_msg.media?.mediaType ?? ''}
                    />
                  </TouchableOpacity>
                </CustomGrid.Equal>
              ))}
            </CustomGrid.Row>
          </CustomGrid.Container>
        </CustomGrid>
      </ErrorBoundary>
    );
  },
);

const RenderOneMedia = memo(
  ({_messages, onMediaClick}: RenderOneMediaProps) => {
    const mediaUrls = useMemo(() => {
      return _messages.map(message => {
        return {
          ...message.media,
          type: message.media?.mediaType,
        };
      });
    }, [_messages]);
    return (
      // <ErrorBoundary>
      <TouchableOpacity
        onPress={() => {
          if (
            _messages?.[0].media?.mediaType?.toLowerCase?.() === 'audio' ||
            _messages?.[0].media?.mediaType
              ?.toLowerCase?.()
              ?.includes?.('application')
          ) {
            return;
          }
          const _obj: OnMediaClick = {
            selectedIndex: 0,
            //@ts-ignore
            mediaUrls: mediaUrls,
          };
          onMediaClick(_obj);
        }}>
        <CustomGrid>
          <CustomGrid.Container
            style={
              (styles.renderImageContainer,
              {
                width: 300,
                height:
                  _messages?.[0].media?.mediaType?.toLowerCase?.() === 'audio'
                    ? 45
                    : _messages?.[0].media?.mediaType
                          ?.toLowerCase?.()
                          ?.includes?.('application')
                      ? 40
                      : 300,
              })
            }>
            <CustomGrid.Row>
              {_messages.map((_msg: UnWindedMessage, _index: number) => (
                <CustomGrid.Equal key={_index}>
                  <CustomGrid.RenderMedia
                    onVideoPress={() => {
                      if (Platform.OS === 'ios') {
                        const _obj: OnMediaClick = {
                          selectedIndex: 0,
                          //@ts-ignore
                          mediaUrls: mediaUrls,
                        };
                        onMediaClick(_obj);
                      }
                    }}
                    thumbnailUrl={_msg?.media?.thumbnailUrl}
                    src={_msg.media?.mediaUrl ?? ''}
                    type={_msg.media?.mediaType ?? ''}
                    duration={_msg.media?.duration ?? 0}
                  />
                </CustomGrid.Equal>
              ))}
            </CustomGrid.Row>
          </CustomGrid.Container>
        </CustomGrid>
      </TouchableOpacity>
      // </ErrorBoundary>
    );
  },
);

const Loader = memo(() => {
  return (
    <View style={styles.loadingMask}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
});

const RenderImage = ({props}: {props: CustomRenderImageProps}) => {
  const uploadingMedia = useSelector(
    (state: RootState) => state.agoraCallSlice.uploadingMedia,
  );
  const isUploadingMedia = useSelector(
    (state: RootState) => state.agoraCallSlice.isUploadingMedia,
  );
  const chatReqDetails = useSelector(
    (state: RootState) => state.agoraCallSlice.chatReqDetails,
  );
  const [openFullScreen, setOpenFullScreen] = useState({
    open: false,
    index: 0,
    mediaUrls: [],
  });

  const _messages: UnWindedMessage[] | undefined = useMemo(() => {
    if (
      Array.isArray(props?.currentMessage?.media) &&
      props?.currentMessage?.media.length > 0
    ) {
      return props?.currentMessage?.media?.map(
        (_img: {mediaUrl: string; mediaType: string}) => {
          return {
            ...props.currentMessage,
            media: _img,
          };
        },
      );
    } else if (typeof props?.currentMessage?.media === 'string') {
      return [props.currentMessage];
    }
    return;
  }, [props?.currentMessage?.media]);

  const allUploadingMedia = useMemo(() => {
    return uploadingMedia?.map(media => media?.mediaUrl);
  }, [uploadingMedia]);

  const isSentByMe = useMemo(() => {
    return props?.currentMessage?.user?._id === chatReqDetails?.userId;
  }, [chatReqDetails, props]);

  function onMediaClick(_obj: OnMediaClick) {
    Keyboard.dismiss();
    setOpenFullScreen({
      open: true,
      index: _obj.selectedIndex,
      //@ts-ignore
      mediaUrls: _obj.mediaUrls,
    });
  }

  return (
    <ErrorBoundary>
      <View style={{position: 'relative'}}>
        {openFullScreen?.open && (
          <FullMediaViewer
            mediaUrls={openFullScreen.mediaUrls}
            selectedIndex={openFullScreen?.index ?? 0}
            onClose={() =>
              setOpenFullScreen({
                open: false,
                index: 0,
                mediaUrls: [],
              })
            }
          />
        )}
        {_messages && _messages?.length > 0 && (
          <>
            {allUploadingMedia?.includes?.(
              _messages?.[0]?.media?.mediaUrl ?? '',
            ) &&
              isUploadingMedia && <Loader />}
          </>
        )}
        {_messages?.length && _messages.length === 1 && (
          //@ts-ignore
          <RenderOneMedia onMediaClick={onMediaClick} _messages={_messages} />
        )}
        {_messages?.length && _messages.length === 2 && (
          //@ts-ignore
          <RenderTwoMedia onMediaClick={onMediaClick} _messages={_messages} />
        )}
        {_messages?.length && _messages.length === 3 && (
          //@ts-ignore
          <RenderThreeMedia onMediaClick={onMediaClick} _messages={_messages} />
        )}
        {_messages?.length && _messages.length > 3 && (
          <RenderMultipleMedia
            //@ts-ignore
            onMediaClick={onMediaClick}
            _messages={_messages}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 'auto',
            gap: 5,
          }}>
          {_messages &&
            _messages?.length > 0 &&
            _messages?.[0].text.length <= 0 &&
            !(
              allUploadingMedia?.includes?.(
                _messages?.[0]?.media?.mediaUrl ?? '',
              ) && isUploadingMedia
            ) && (
              <Text style={styles.messageTimeStyle}>
                {new Date(_messages?.[0]?.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          {isSentByMe && props.currentMessage?.text?.length <= 0 && (
            <View style={{top: 3}}>
              {/* @ts-ignore */}
              {props.currentMessage?.status === 'read' ? (
                <DoubleTickIcon color={'white'} opacity="1" />
              ) : (
                <DoubleTickIcon />
              )}
            </View>
          )}
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  renderImageContainer: {
    position: 'relative',
    display: 'flex',
    zIndex: 99,
  },
  loadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  renderThreeMediaContainer: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    gap: 10,
  },
  renderMultiMediaContainer: {
    width: 300,
    height: 300,
    gap: 10,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },

  maskContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
  },
  loadingMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0, 0.6)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageTimeStyle: {
    color: '#ccc',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
});

export default memo(RenderImage);
