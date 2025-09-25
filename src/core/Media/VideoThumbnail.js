import React, {useEffect, useState, useRef} from 'react';
import {
  Image,
  StyleSheet,
  Pressable as RNPressable,
  Platform,
  View,
  Text,
} from 'react-native';
import {Pressable as GesturePressable} from 'react-native-gesture-handler';
import {Modal, Portal} from 'react-native-paper';
import PropTypes from 'prop-types';
import Video from 'react-native-video';
import ThumbnailIcon from './ThumbnailIcon';
import VideoPlayer from 'react-native-media-console';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import VideoFullScreen from '../VideoFullScreen';
import FastImage from '@d11/react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentVideoInstance} from '../../store/apps/mediaSlice';
import {colors} from '../../common/NewTheme';

const Pressable = Platform.OS === 'ios' ? RNPressable : GesturePressable;

const VideoThumbnail = ({
  resize = 'contain',
  customPress = () => undefined,
  thumbnailUrl,
  src,
  autoPlay = false,
  preventPlay = false,
  thumbnailStyle = {},
  imuwMediaStyle = {},
  imuwThumbnailIconStyle = {},
  imuwThumbStyle = {},
  renderLocalThumbnailIos = false,
  thumbnailIconHeight = 50,
  thumbnailIconWidth = 50,
  Audiomuted = false,
  androidVolume = 1,
  disableFullscreen = false,
  disableSeekbar = false,
  disablePlayPause = false,
  disableTimer = false,
  useFastImage = false,
  onTogglePlay = () => undefined,
  ...props
}) => {
  const [showThumbnail, setShowThumbnail] = useState(!autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playAndroidVideo, setplayAndroidVideo] = useState(autoPlay);
  const [openFullscreen, setopenFullScreen] = useState(false);

  const ios = Platform.OS === 'ios';
  const pageIsFocused = useIsFocused();
  const dispatch = useDispatch();

  const componentIdRef = useRef((Math.random() + Date.now()).toString(5));

  const videoInstance = useSelector(state => state.media.currentVideoInstance);

  useEffect(() => {
    if (typeof onTogglePlay === 'function') {
      onTogglePlay(playAndroidVideo || isPlaying);
    }
  }, [playAndroidVideo, isPlaying]);

  useEffect(() => {
    if (autoPlay) {
      return;
    }
    if (!showThumbnail) {
      dispatch(setCurrentVideoInstance(componentIdRef.current));
    }
  }, [showThumbnail]);

  useEffect(() => {
    if (autoPlay) {
      return;
    }
    if (videoInstance && videoInstance !== componentIdRef.current && !ios) {
      setShowThumbnail(true);
      setIsPlaying(false);
      setplayAndroidVideo(false);
    }
  }, [videoInstance, autoPlay]);

  useEffect(() => {
    if (!pageIsFocused) {
      setShowThumbnail(true);
      setIsPlaying(false);
      setplayAndroidVideo(false);
    }
  }, [pageIsFocused]);

  return (
    <>
      {(!playAndroidVideo || ios) && (
        <Pressable
          onPress={() => {
            customPress();
            if (showThumbnail && !preventPlay) {
              setShowThumbnail(false);
              setplayAndroidVideo(true);
              setIsPlaying(true);
            }
          }}
          style={[styles.imuwThumbnailComponent, imuwThumbStyle]}
          {...props}>
          {showThumbnail && (
            <View
              style={[
                {
                  borderWidth: 1,
                  borderColor: colors.primaryOrange,
                  borderRadius: thumbnailIconWidth / 2,
                  width: thumbnailIconWidth,
                  zIndex: 1,
                  margin: 'auto',
                  top: thumbnailIconHeight,
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                },
                styles.thumbnail,
                imuwThumbnailIconStyle,
              ]}>
              <ThumbnailIcon
                showStroke={false}
                width={thumbnailIconWidth}
                height={thumbnailIconHeight}
                accessibilityLabel="thumbnail icon"
              />
            </View>
          )}
          {showThumbnail && !src?.startsWith?.(ios ? 'file' : 'blob') && (
            <>
              {useFastImage ? (
                <FastImage
                  accessibilityLabel="video thumbnail"
                  style={[imuwMediaStyle]}
                  source={{uri: thumbnailUrl}}
                />
              ) : (
                <Image
                  accessibilityLabel="video thumbnail"
                  style={[imuwMediaStyle]}
                  source={{uri: thumbnailUrl}}
                />
              )}
            </>
          )}
          {ios && (!showThumbnail || renderLocalThumbnailIos) && (
            <Video
              style={[styles.imuwMedia, imuwMediaStyle]}
              source={{uri: src}}
              controls={!autoPlay}
              {...(Platform.OS === 'ios'
                ? {selectedAudioTrack: {type: 'index', value: 0}}
                : {})}
              paused={!isPlaying}
              ignoreSilentSwitch="ignore"
              autoplay
              resizeMode={resize}
              muted={Audiomuted}
              repeat={autoPlay}
            />
          )}
        </Pressable>
      )}
      {!showThumbnail && !ios && (
        <>
          {!openFullscreen && (
            <VideoPlayer
              disableBack={true}
              disableVolume={true}
              disableFullscreen={disableFullscreen} // Disable fullscreen button
              disableSeekbar={disableSeekbar} // Disable seek bar
              disablePlayPause={disablePlayPause} // Disable play/pause controls
              disableTimer={disableTimer}
              videoStyle={[styles.imuwMedia, imuwMediaStyle]}
              containerStyle={[styles.imuwMedia, imuwMediaStyle]}
              resizeMode={resize}
              onEnterFullscreen={() => {
                if (!autoPlay) {
                  setopenFullScreen(true);
                }
              }}
              source={{uri: src}}
              volume={androidVolume}
              repeat={autoPlay}
              disableOverlay={autoPlay}
            />
          )}
          {openFullscreen && (
            <Portal>
              <Modal
                visible
                transparent={false}
                animationType="slide"
                contentContainerStyle={{
                  flex: 1,
                  marginBottom: 0,
                  marginTop: 0,
                }}
                style={{
                  marginBottom: 0,
                  marginTop: 0,
                  flex: 1,
                }}
                onDismiss={() => setopenFullScreen(false)}>
                <VideoFullScreen
                  source={src}
                  onBackClick={() => setopenFullScreen(false)}
                />
              </Modal>
            </Portal>
          )}
        </>
      )}
    </>
  );
};

VideoThumbnail.propTypes = {
  thumbnailUrl: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  preventPlay: PropTypes.bool,
  thumbnailStyle: PropTypes.object,
  imuwMediaStyle: PropTypes.object,
  imuwThumbnailIconStyle: PropTypes.object,
  imuwThumbStyle: PropTypes.object,
  customPress: PropTypes.func,
  resize: PropTypes.string,
  renderLocalThumbnailIos: PropTypes.bool,
  thumbnailIconHeight: PropTypes.number,
  thumbnailIconWidth: PropTypes.number,
  autoPlay: PropTypes.bool,
  Audiomuted: PropTypes.bool,
  androidVolume: PropTypes.number,
  disableFullscreen: PropTypes.bool,
  disableSeekbar: PropTypes.bool,
  disablePlayPause: PropTypes.bool,
  disableTimer: PropTypes.bool,
};

const styles = StyleSheet.create({
  imuwThumbnailComponent: {
    position: 'relative',
    overflow: 'hidden',
  },
  imuwMedia: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    resizeMode: 'cover',
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -25,
    marginTop: -25,
    zIndex: 1000,
  },
});

VideoThumbnail.displayName = 'VideoThumbnail';

export default VideoThumbnail;
