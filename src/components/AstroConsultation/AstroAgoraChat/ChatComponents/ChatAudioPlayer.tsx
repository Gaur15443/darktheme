import React, {memo, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import Slider from '@react-native-community/slider';
import PlayIcon from '../../AstroAgoraChat/Audios/Playericons/PlayIcon';
import PauseIcon from '../../AstroAgoraChat/Audios/Playericons/PauseIcon';
import {formatDuration} from '../../../../utils/format';
import {ViewStyle} from 'react-native';
import RecordIcon from '../Audios/Playericons/RecordIcon';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {Pressable} from 'react-native-gesture-handler';

interface ChatAudioPlayerProps {
  src: string;
  buttonContainerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  sliderContainer?: StyleProp<ViewStyle>;
  mainContainerStyle?: StyleProp<ViewStyle>;
  useMicIcon?: boolean;
}

const ChatAudioPlayer = ({
  src,
  buttonContainerStyle = {},
  buttonStyle = {},
  sliderContainer = {},
  mainContainerStyle = {},
  useMicIcon = false,
}: ChatAudioPlayerProps) => {
  const audioRef = useRef<VideoRef>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);

  const onLoad = (data: any) => {
    setDuration(data.duration);
  };

  const onProgress = (data: any) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const onSeek = (value: number) => {
    setCurrentTime(value);
    audioRef.current?.seek(value);
    setIsSeeking(false);
    if (paused) {
      audioRef?.current?.pause();
      setPaused(true);
    } else {
      audioRef.current?.resume();
      setPaused(false);
    }
  };

  function onActionClick() {
    if (paused) {
      audioRef.current?.resume();
    } else {
      audioRef.current?.pause();
    }
    setPaused(prev => !prev);
  }

  function onAudioEnd() {
    audioRef.current?.seek(0);
    audioRef.current?.pause();
    setCurrentTime(0);
    setPaused(true);
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, mainContainerStyle]}>
        <View style={[styles.actionsContainer, buttonContainerStyle]}>
          <Pressable
            onPress={onActionClick}
            style={[styles.button, buttonStyle]}>
            {paused ? (
              useMicIcon ? (
                <RecordIcon />
              ) : (
                <PlayIcon />
              )
            ) : (
              <PauseIcon />
            )}
          </Pressable>
          <Text style={styles.counterFont}>
            {formatDuration(Math.round(duration - currentTime))}
          </Text>
        </View>
        <View style={[styles.sliderContainer, sliderContainer]}>
          <Video
            onEnd={onAudioEnd}
            //@ts-ignore
            audioOnly={true}
            ref={audioRef}
            source={{
              uri: src,
            }}
            volume={1.0}
            muted={false}
            controls={true}
            paused={true}
            onLoad={onLoad}
            onProgress={onProgress}
            onError={error => console.log(src, 'Video error:', error)}
            style={styles.videoPlayer}
          />

          {/* Slider / Progress Bar */}
          <Slider
            value={currentTime}
            minimumValue={0}
            maximumValue={duration}
            minimumTrackTintColor="#6944D3"
            maximumTrackTintColor="#fff"
            thumbTintColor="#fff"
            onSlidingStart={() => setIsSeeking(true)}
            onSlidingComplete={onSeek}
          />
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  actionsContainer: {
    alignItems: 'center',
    gap: 5,
  },
  counterFont: {
    color: 'white',
    fontSize: 12,
  },
  videoPlayer: {width: '100%', height: 0},
  sliderContainer: {flex: 1, marginTop: 15},
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: 'white',
    borderWidth: 1,
    padding: 13,
    borderRadius: 50,
  },
  icon: {
    width: 17,
    height: 17,
  },
});

export default memo(ChatAudioPlayer);
