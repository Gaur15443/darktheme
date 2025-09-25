import React, {useRef, useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import Slider from '@react-native-community/slider';
import PlayIcon from '../../AstroAgoraChat/Audios/Playericons/PlayIcon';
import PauseIcon from '../../AstroAgoraChat/Audios/Playericons/PauseIcon';
import FastImage from '@d11/react-native-fast-image';
import {formatDuration} from '../../../../utils/format';
import ErrorBoundary from '../../../../common/ErrorBoundary';

export default function M3U8Player({src = ''}: {src: string}) {
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
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Video
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
          onError={error => console.log('Video error:', error)}
          style={{width: '100%', height: 0}}
        />
        <View style={styles.sliderContainer}>
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
            style={{
              width: '100%',
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 5,
          }}>
          <Text style={styles.counter}>{formatDuration(currentTime)}</Text>
          <Text style={styles.counter}>{formatDuration(duration)}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() =>
              audioRef.current?.seek(Math.max(currentTime - 10, 0))
            }
            style={styles.button}>
            <FastImage
              style={styles.icon}
              source={{
                uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/backward.png',
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (paused) {
                audioRef.current?.resume();
              } else {
                audioRef.current?.pause();
              }
              setPaused(prev => !prev);
            }}
            style={styles.button}>
            {paused ? <PlayIcon /> : <PauseIcon />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => audioRef.current?.seek(currentTime + 10)}
            style={styles.button}>
            <FastImage
              style={styles.icon}
              source={{
                uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/forward.png',
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(105, 68, 211, 0.25)',
    borderColor: 'rgba(105, 68, 211, 0.45)',
    borderRadius: 8,
    padding: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: 'white',
    padding: 13,
    borderRadius: 50,
  },
  icon: {
    width: 17,
    height: 17,
  },
  counter: {
    color: 'white',
    fontSize: 10,

    fontWeight: '600',
  },
  sliderContainer: {
    width: '110%',
    right: 14,
  },
});
