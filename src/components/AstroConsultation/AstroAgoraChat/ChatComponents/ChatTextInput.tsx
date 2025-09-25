import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  Children,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, Text} from 'react-native-paper';
import FastImage from '@d11/react-native-fast-image';
import {
  IMessage,
  InputToolbar,
  InputToolbarProps,
} from 'react-native-gifted-chat';
import TextComposer from './Composer';
import {OnGetMedia} from '..';
import {CrossIcon} from '../../../../images';
import AudioRecordeChats, {
  AudioRecorderRef,
} from '../Audios/AudioRecorder/index';
import RecordIcon from '../Audios/Playericons/RecordIcon';
import PauseIcon from '../Audios/Playericons/PauseIcon';
import ChatDeleteIcon from '../../../../images/Icons/ChatDeleteIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ChatAudioPlayer from './ChatAudioPlayer';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {VideoThumbnail} from '../../../../core';
import {Pressable} from 'react-native-gesture-handler';

interface AudioRecorderProps {
  children: React.ReactNode;
  onButtonHold: boolean;
  onButtonStateChange: (onButtonHold: boolean) => void;
  onGetPath: (path: string) => void;
  onDelete: () => void;
  audioPath: string;
}

interface AudioRcorderRef {
  startRecording: () => void;
  handleStopRecording: () => Promise<undefined>;
}

const AudioRecorder = memo(
  forwardRef(
    (
      {
        children,
        onButtonHold,
        onButtonStateChange,
        onGetPath = () => {},
        onDelete = () => {},
        audioPath = '',
      }: AudioRecorderProps,
      ref,
    ) => {
      const audioRecorderRef = useRef<AudioRecorderRef>(null);

      function startRecording() {
        audioRecorderRef?.current?.handleStartRecording?.();
      }

      async function handleStopRecording() {
        try {
          const path = await audioRecorderRef?.current?.handleStopRecording?.();
          onGetPath(path ?? '');
        } catch (error) {
          console.log(error);
        } finally {
          onButtonStateChange(false);
        }
      }

      useImperativeHandle(ref, () => ({
        startRecording,
        handleStopRecording,
      }));

      return (
        <ErrorBoundary>
          {(audioPath?.length > 0 || onButtonHold) && (
            <View style={styles.buttonsContainer}>
              {onButtonHold && (
                <Pressable style={styles.buttonStyle}>
                  <RecordIcon />
                </Pressable>
              )}
              {onButtonHold ? (
                <View style={styles.audioContainerStyle}>
                  <AudioRecordeChats ref={audioRecorderRef} />
                </View>
              ) : (
                <View style={styles.audioPlayerContainerStyle}>
                  <ChatAudioPlayer
                    useMicIcon
                    buttonContainerStyle={audioStyles.buttonContainerStyle}
                    buttonStyle={audioStyles.buttonStyle}
                    sliderContainer={{
                      marginTop: Platform.OS === 'ios' ? 2 : 12,
                    }}
                    mainContainerStyle={audioStyles.mainContainer}
                    src={audioPath}
                  />
                </View>
              )}
              <Pressable
                onPress={() => {
                  onDelete();
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  height: 40,
                  width: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50,
                }}>
                <ChatDeleteIcon />
              </Pressable>
            </View>
          )}
          {children}
        </ErrorBoundary>
      );
    },
  ),
);

const ShowMediaPreview = memo(
  ({
    children,
    selectedMedia,
    onRemoveMedia,
    onEdit,
  }: {
    children: React.ReactNode;
    selectedMedia: Array<OnGetMedia>;
    onRemoveMedia: (e: OnGetMedia) => void;
    onEdit: () => void;
  }) => {
    return (
      <ErrorBoundary>
        {selectedMedia.length > 0 && (
          <View style={styles.selectedMediaContainer}>
            {selectedMedia?.[0]?.type?.toLowerCase?.() === 'application' ? (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <Text style={{color: 'white'}} numberOfLines={1}>
                    {selectedMedia?.[0]?.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onRemoveMedia(selectedMedia[0])}
                  style={{
                    marginLeft: 'auto',
                    padding: 10,
                  }}>
                  <CrossIcon
                    fill="white"
                    width="15"
                    height="15"
                    testID={'file_discard'}
                  />
                </Pressable>
              </View>
            ) : (
              <ScrollView
                horizontal
                contentContainerStyle={{zIndex: 100, position: 'relative'}}
                showsHorizontalScrollIndicator={false}>
                {selectedMedia.map((_media, _index) => {
                  return (
                    <TouchableOpacity
                      style={styles.imageContainer}
                      key={_index}
                      onPress={() => onEdit()}>
                      <TouchableOpacity
                        onPress={() => onRemoveMedia(_media)}
                        style={styles.crossIconContainer}>
                        <CrossIcon
                          fill={'rgb(133,130,126)'}
                          width={'10'}
                          height={'10'}
                          testID="cross-icon"
                        />
                      </TouchableOpacity>
                      {_media?.type?.toLowerCase?.() === 'video' ? (
                        <VideoThumbnail
                          renderLocalThumbnailIos={true}
                          thumbnailUrl={_media.mediaUrl}
                          src={_media.mediaUrl}
                          preventPlay={true}
                          resize="cover"
                          imuwMediaStyle={styles.selectedImage}
                          imuwThumbStyle={{borderRadius: 6, width: '100%'}}
                          thumbnailIconHeight={30}
                          thumbnailIconWidth={30}
                          imuwThumbnailIconStyle={{top: '70%', left: '70%'}}
                        />
                      ) : (
                        // <></>
                        <FastImage
                          source={{uri: _media.mediaUrl}}
                          style={styles.selectedImage}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
        {children}
      </ErrorBoundary>
    );
  },
);

export default memo(function ChatTextInput({
  selectedMedia,
  onChooseMedia = () => {},
  onRemoveMedia = () => {},
  onGetPath = () => {},
  onDelete = () => {},
  audioPath = '',
  onEdit,
  props,
}: {
  selectedMedia: Array<OnGetMedia>;
  props: InputToolbarProps<IMessage>;
  onChooseMedia: (e: OnGetMedia[]) => void;
  onRemoveMedia: (e: OnGetMedia) => void;
  onGetPath: (path: string) => void;
  onDelete: () => void;
  audioPath: string;
  onEdit: () => void;
}) {
  const [onButtonHold, setOnButtonHold] = useState(false);
  const audioPlayerRef = useRef<AudioRcorderRef>(null);
  const {bottom} = useSafeAreaInsets();

  return (
    <ErrorBoundary>
      <AudioRecorder
        audioPath={audioPath}
        ref={audioPlayerRef}
        onButtonHold={onButtonHold}
        onDelete={onDelete}
        onButtonStateChange={setOnButtonHold}
        onGetPath={onGetPath}>
        <ShowMediaPreview
          onEdit={onEdit}
          selectedMedia={selectedMedia}
          onRemoveMedia={onRemoveMedia}>
          <InputToolbar
            {...props}
            containerStyle={[
              styles.inputToolbarContainer,
              Platform.OS === 'ios' ? {marginBottom: bottom - 15} : {},
            ]}
            renderComposer={composerProps => (
              <TextComposer
                selectedMedia={selectedMedia}
                audioPath={audioPath}
                onChooseMedia={onChooseMedia}
                composerProps={composerProps}
                onButtonHold={() => {
                  setOnButtonHold(true);
                  setTimeout(() => {
                    audioPlayerRef.current?.startRecording?.();
                  }, 500);
                }}
                onButtonRelease={() => {
                  audioPlayerRef.current?.handleStopRecording?.();
                }}
              />
            )}
          />
        </ShowMediaPreview>
      </AudioRecorder>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  selectedMediaContainer: {
    position: 'relative',
    marginHorizontal: 5,
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    zIndex: 100,
  },
  imageContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    borderRadius: 5,
    zIndex: 100,
    marginVertical: 12,
    marginHorizontal: 10,
  },
  loadingContainer: {
    zIndex: 100,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    borderRadius: 5,
    width: '100%',
    height: '100%',
    zIndex: 99,
  },
  inputToolbarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 5,
    margin: 5,
    borderRadius: 50,
  },
  uploadButtonsContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  crossIconContainer: {
    position: 'absolute',
    top: -12,
    right: -12,
    zIndex: 201,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  audioPlayerContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    gap: 10,
    top: 5,
  },
  buttonStyle: {
    backgroundColor: 'white',
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
});

const audioStyles = StyleSheet.create({
  buttonContainerStyle: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 43,
    width: 43,
    right: 1,
  },

  mainContainer: {
    paddingVertical: 15,
  },
});
