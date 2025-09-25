import React, {useEffect} from 'react';
import VideoPlayer from 'react-native-media-console';
import {useOrientation} from '../../context/OrientationContext';

export default function VideoFullScreen({source, onBackClick}) {
  const {lockToPortrait, unlockAllOrientations} = useOrientation();

  useEffect(() => {
    unlockAllOrientations();

    return () => {
      lockToPortrait();
    };
  }, [lockToPortrait, unlockAllOrientations]);

  return (
    <VideoPlayer
      disableVolume={false}
      disableFullscreen={true}
      isFullscreen={true}
      videoStyle={{width: '100%', height: '100%', margin: 0}}
      containerStyle={{width: '100%', height: '100%', margin: 0}}
      resizeMode={'cover'}
      source={{uri: source}}
      onBack={() => onBackClick()}
    />
  );
}
