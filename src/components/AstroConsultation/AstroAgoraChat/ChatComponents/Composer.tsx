import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {forwardRef, memo, useEffect, useRef, useState} from 'react';
import {Composer, ComposerProps} from 'react-native-gifted-chat';
import ChatMicIcon from '../../../../images/Icons/ChatMicIcon';
import AstroChatPlusIcon from '../../../../images/Icons/AstroChatPlusIcon';
import FileUploader, {Media} from '../../../../common/media-uploader';
import {OnGetMedia} from '..';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {Pressable} from 'react-native-gesture-handler';

const ChatButtons = memo(
  ({
    onButtonHold,
    onButtonRelease,
    selectedMedia,
  }: {
    onButtonHold: () => void;
    onButtonRelease: () => void;
    selectedMedia: Array<OnGetMedia>;
  }) => {
    return (
      <ErrorBoundary>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={selectedMedia?.length > 0 ? styles.disabledButtonStyle : {}}
            disabled={selectedMedia?.length > 0}
            onPressIn={onButtonHold}
            onPressOut={onButtonRelease}>
            <ChatMicIcon />
          </TouchableOpacity>
        </View>
      </ErrorBoundary>
    );
  },
);

const TextComposer = memo(
  ({
    composerProps,
    onChooseMedia = (e: OnGetMedia[]) => {},
    onButtonHold = () => {},
    onButtonRelease = () => {},
    audioPath = '',
    selectedMedia,
  }: {
    composerProps: ComposerProps;
    onChooseMedia: (e: OnGetMedia[]) => void;
    onButtonHold: () => void;
    onButtonRelease: () => void;
    audioPath: string;
    selectedMedia: Array<OnGetMedia>;
  }) => {
    const [isButtonHold, setIsButtonHold] = useState(false);
    return (
      <ErrorBoundary>
        <View style={styles.composerContainer}>
          <View
            style={{
              padding: 10,
              marginBottom: 0,
              alignSelf: 'flex-end',
              marginTop: 'auto',
            }}>
            <FileUploader
              disabled={audioPath?.length > 0 || isButtonHold}
              isAstroTheme
              documentUpload
              blobData={selectedMedia as Media[]}
              totalImageCountAllowed={9}
              totalVideoCountAllowed={1}
              allowedFiles={['image', 'video']}
              //@ts-ignore
              onGetMedia={e => {
                onChooseMedia(e);
              }}>
              <View
                style={
                  audioPath?.length > 0 || isButtonHold
                    ? styles.disabledButtonStyle
                    : {}
                }>
                <AstroChatPlusIcon />
              </View>
            </FileUploader>
          </View>
          <Composer
            disableComposer={audioPath?.length > 0 || isButtonHold}
            {...composerProps}
            placeholder={
              isButtonHold
                ? 'Hold to record...'
                : audioPath?.length > 0
                  ? 'Click to send...'
                  : 'Write your message...'
            }
            textInputStyle={[
              {top: Platform.OS === 'ios' ? -5 : 0},
              styles.textInputStyle,
            ]}
          />
          <ChatButtons
            selectedMedia={selectedMedia}
            onButtonHold={() => {
              setIsButtonHold(true);
              onButtonHold();
            }}
            onButtonRelease={() => {
              setIsButtonHold(false);
              onButtonRelease();
            }}
          />
        </View>
      </ErrorBoundary>
    );
  },
);

const styles = StyleSheet.create({
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  textInputStyle: {
    color: '#fff',
    right: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    right: 5,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  disabledButtonStyle: {opacity: 0.5},
});

export default TextComposer;
