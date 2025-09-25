import React, { useState, memo, useEffect } from 'react';
import { Pressable as RNPressable, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';

import Constants from './../../../common/Constants';
import { VideoThumbnail } from '../../../core';
import { Text, useTheme } from 'react-native-paper';
import FastImage from '@d11/react-native-fast-image';
import {
  Pressable as GesturePressable,
} from 'react-native-gesture-handler';

const Pressable = Platform.OS === 'ios' ? RNPressable : GesturePressable;

function PostMediaSlides({
  mediaUrls = [],
  onPress,
  aspectRatio = 1,
  onTogglePlay = () => undefined,
}) {
  const [initialIndex, setInitialIndex] = useState(-1);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const width = Constants.Dimension.ScreenWidth();
  const height = calculateHeight(aspectRatio, width);
  const theme = useTheme();

  const buttonStyle = {
    fontSize: 50,
    color: theme.colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    letterSpacing: 0,
    height: 50,
    top: -25,
  };

  const handleSwipeStart = () => {
    setIsVideoPaused(true);
  };

  const handleSwipeEnd = () => {
    // setIsVideoPaused(false);
  };

  function calculateHeight(
    aspectRatio = 4 / 3,
    width = Constants.Dimension.ScreenWidth() - 5,
  ) {
    return width / aspectRatio;
  }

  function handleMediaClick(index) {
    onPress(index);
  }

  useEffect(() => {
    setTimeout(() => {
      setInitialIndex(0);
    }, 0);

  }, [])


  return (
    <Swiper
      height={calculateHeight(aspectRatio)}
      width={Constants.Dimension.ScreenWidth()}
      onIndexChanged={num => setCurrentIndex(num)}
      style={{
        paddingHorizontal: 0,
      }}
      loop={false}
      dotStyle={{
        marginBottom: -30,
      }}
      index={initialIndex}
      nextButton={<Text style={buttonStyle}>›</Text>}
      prevButton={<Text style={buttonStyle}>‹</Text>}
      activeDotStyle={{
        marginBottom: -30,
        backgroundColor: theme.colors.primary,
      }}
      showsButtons={mediaUrls?.length > 1}
      onMomentumScrollBegin={handleSwipeStart}
      onMomentumScrollEnd={handleSwipeEnd}
      buttonWrapperStyle={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height,
        width,
      }}>
      {mediaUrls.map((src, index) => (
        <Pressable
          key={index}
          onPress={() => handleMediaClick(index)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            height,
            width,
            position: 'relative',
          }}>
          {src.urlType === 'Image' || src.type === 'Image' ? (
            <FastImage
              source={{ uri: src?.mediaUrl }}
              width={Constants.Dimension.ScreenWidth()}
              style={{
                width: '100%',
                aspectRatio: aspectRatio,
                marginRight: 5,
              }}
            />
          ) : src.urlType === 'Video' || src.type === 'Video' ? (
            <VideoThumbnail
              key={currentIndex}
              renderLocalThumbnailIos={true}
              thumbnailUrl={src.thumbnailUrl}
              resize="contain"
              src={src.mediaUrl}
              preventPlay={true}
              imuwMediaStyle={{
                height,
                width,
              }}
              imuwThumbStyle={{
                height,
                width,
              }}
              customPress={() => handleMediaClick(index)}
            />
          ) : null}
        </Pressable>
      ))}
    </Swiper>
  );
}

PostMediaSlides.displayName = 'PostMediaSlides';

export default memo(PostMediaSlides);

PostMediaSlides.propTypes = {
  mediaUrls: PropTypes.array,
  activeMediaIndex: PropTypes.number,
  showDelete: PropTypes.bool,
};
