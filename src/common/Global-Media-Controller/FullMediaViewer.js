import React, {useState, memo, useEffect, useRef} from 'react';
import {
  Image,
  Platform,
  Pressable as RNPressable,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';

import Constants from '../Constants';
import {VideoThumbnail} from '../../core';
import {Text, useTheme, Portal, Modal} from 'react-native-paper';
import {ImageZoom as ImageZoom} from '@likashefqet/react-native-image-zoom';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../../constants/Screens';
import {DeleteWhiteIcon} from '../../images';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Pressable as GesturePressable} from 'react-native-gesture-handler';

const Pressable = Platform.OS === 'ios' ? RNPressable : GesturePressable;
function FullMediaViewer({
  mediaUrls = [],
  onPress,
  aspectRatio = 1,
  onTogglePlay = () => undefined,
  onClose = () => {},
  selectedIndex = 0,
  deleteMedia = () => undefined,
  deleteFlag = false,
  openDeletePopup = () => undefined,
  isDelete = false,
}) {
  const [initialIndex, setInitialIndex] = useState(selectedIndex);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const width = Constants.Dimension.ScreenWidth();
  const height = calculateHeight(aspectRatio, width);
  const theme = useTheme();
  const {top, bottom} = useSafeAreaInsets();
  const swiperRef = useRef(null);
  const buttonStyle = {
    fontSize: 50,
    color: theme.colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    letterSpacing: 0,
    height: 50,
  };

  console.log('mediaUrls', mediaUrls);

  const handleSwipeStart = () => {
    setIsVideoPaused(true);
  };

  const handleSwipeEnd = () => {};

  function calculateHeight(
    aspectRatio = 4 / 3,
    width = Constants.Dimension.ScreenWidth() - 5,
  ) {
    return width / aspectRatio;
  }

  function calculateWidth(
    aspectRatio = 4 / 3,
    height = Constants.Dimension.ScreenHeight(),
  ) {
    return height * aspectRatio;
  }

  const OpenDeletePopup = () => {
    openDeletePopup();
  };

  const handleDeletePress = () => {
    const mediaId = mediaUrls[currentIndex]._id;
    OpenDeletePopup();
    deleteMedia(mediaId);
    setCurrentIndex(currentIndex);
  };

  const findVerticalCenterPosition = (largerBoxHeight, smallerBoxHeight) => {
    const verticalCenter = (largerBoxHeight - smallerBoxHeight) / 2;
    return verticalCenter;
  };

  useEffect(() => {
    setTimeout(() => {
      if (selectedIndex >= 0) {
        setInitialIndex(selectedIndex);
      } else {
        setInitialIndex(0);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (deleteFlag) {
      if (mediaUrls?.length === 0 || mediaUrls?.length === undefined) {
        onClose();
      } else {
        if (currentIndex !== null) {
          if (currentIndex === mediaUrls?.length - 1) {
            swiperRef.current.scrollBy(-1);
          } else {
            swiperRef.current.scrollBy(0);
          }
        }
      }
      setCurrentIndex(null);
    }
  }, [deleteFlag, mediaUrls]);

  return (
    <Portal>
      <Modal
        visible={true}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
          paddingTop: 0,
          marginTop: 0,
          marginBottom: 0,
        }}
        contentContainerStyle={{
          height: '100%',
          paddingTop: 0,
          paddingBottom: 0,
          marginBottom: 0,
          marginTop: 0,
        }}
        onDismiss={onClose}>
        {isDelete && (
          <View
            style={{
              paddingTop: top || 10,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              paddingHorizontal: 10,
              position: 'absolute',
              top: 0,
              right: 0,
            }}
            onStartShouldSetResponder={() => {
              handleDeletePress();
              return true;
            }}>
            <Pressable
              accessibilityLabel={'deleteButtonSlide'}
              testID={'deleteButtonSlide'}>
              <DeleteWhiteIcon />
            </Pressable>
          </View>
        )}
        <Swiper
          ref={swiperRef}
          height={SCREEN_HEIGHT}
          width={Constants.Dimension.ScreenWidth()}
          onIndexChanged={num => setCurrentIndex(num)}
          style={{
            paddingHorizontal: 0,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            marginBottom: 0,
          }}
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            marginBottom: 0,
          }}
          containerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
          loop={false}
          dotStyle={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: '#fff',
            marginHorizontal: 4,
            bottom,
          }}
          index={initialIndex}
          nextButton={<Text style={buttonStyle}>›</Text>}
          prevButton={<Text style={buttonStyle}>‹</Text>}
          activeDotStyle={{
            width: 18,
            height: 7,
            borderRadius: 3,
            marginHorizontal: 4,
            bottom,
            backgroundColor: '#fff',
          }}
          showsButtons={mediaUrls?.length > 1}
          onMomentumScrollBegin={handleSwipeStart}
          onMomentumScrollEnd={handleSwipeEnd}
          buttonWrapperStyle={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: SCREEN_HEIGHT,
            width,
          }}>
          {mediaUrls.map((src, index) => (
            <Pressable
              key={index}
              onPress={async event => {
                const {pageY, pageX} = event.nativeEvent;

                if (
                  src?.urlType?.toLowerCase?.() === 'image' ||
                  src?.type?.toLowerCase?.() === 'image'
                ) {
                  try {
                    const {height, width} = await Image.getSize(
                      mediaUrls[0]?.mediaUrl,
                    );
                    const aspectRatio = width / height;
                    let renderedHeight = calculateHeight(
                      aspectRatio,
                      SCREEN_WIDTH,
                    );
                    let renderedWidth = calculateWidth(
                      aspectRatio,
                      SCREEN_HEIGHT,
                    );

                    if (renderedHeight > SCREEN_HEIGHT * 0.7) {
                      renderedWidth = calculateWidth(
                        aspectRatio,
                        renderedHeight * 0.7,
                      );
                      renderedHeight = calculateHeight(
                        aspectRatio,
                        renderedWidth,
                      );
                    }

                    const LEFT_OFFSET = (SCREEN_WIDTH - renderedWidth) / 2;
                    const verticalCenterPosition = findVerticalCenterPosition(
                      SCREEN_HEIGHT,
                      renderedHeight,
                    );
                    const isInsideVertically =
                      pageY >= verticalCenterPosition &&
                      pageY <= verticalCenterPosition + renderedHeight;
                    const isInsideHorizontally =
                      pageX >= LEFT_OFFSET &&
                      pageX <= LEFT_OFFSET + renderedWidth;

                    if (!isInsideVertically || !isInsideHorizontally) {
                      onClose();
                    }
                  } catch (__error) {
                    onClose();
                  }
                } else {
                  const verticalCenterPosition = findVerticalCenterPosition(
                    SCREEN_HEIGHT,
                    height,
                  );
                  const isInsideVertically =
                    pageY >= verticalCenterPosition &&
                    pageY <= verticalCenterPosition + height;
                  if (!isInsideVertically) {
                    onClose();
                  }
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width,
                height: isDelete ? SCREEN_HEIGHT - (top || 10) : SCREEN_HEIGHT,
                position: 'relative',
              }}>
              {src?.urlType?.toLowerCase?.() === 'image' ||
              src?.type?.toLowerCase?.() === 'image' ? (
                <ImageZoom
                  source={{uri: src?.mediaUrl}}
                  style={{
                    width: '100%',
                    height: '75%',
                    resizeMode: 'cover',
                  }}
                />
              ) : src?.urlType?.toLowerCase?.() === 'video' ||
                src?.type?.toLowerCase?.() === 'video' ? (
                <VideoThumbnail
                  key={currentIndex}
                  renderLocalThumbnailIos={true}
                  thumbnailUrl={src.thumbnailUrl}
                  resize="contain"
                  src={src.mediaUrl}
                  preventPlay={false}
                  imuwMediaStyle={{
                    height,
                    width,
                  }}
                  imuwThumbStyle={{
                    height,
                    width,
                  }}
                  onTogglePlay={onTogglePlay}
                />
              ) : null}
            </Pressable>
          ))}
        </Swiper>
      </Modal>
    </Portal>
  );
}

FullMediaViewer.displayName = 'FullMediaViewer';

export default memo(FullMediaViewer);

FullMediaViewer.propTypes = {
  mediaUrls: PropTypes.array,
  onPress: PropTypes.func,
  aspectRatio: PropTypes.number,
  onTogglePlay: PropTypes.func,
  onClose: PropTypes.func,
  selectedIndex: PropTypes.number,
  deleteMedia: PropTypes.func,
  deleteFlag: PropTypes.bool,
  openDeletePopup: PropTypes.func,
  isDelete: PropTypes.bool,
};
