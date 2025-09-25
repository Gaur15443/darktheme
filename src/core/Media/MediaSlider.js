import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {Text} from 'react-native-paper';
import Swiper from 'react-native-swiper';
import VideoThumbnail from '../Media/VideoThumbnail';
import {SCREEN_HEIGHT} from '../../constants/Screens';
import {DeleteWhiteIcon} from '../../images';
import {useNavigation} from '@react-navigation/native';
import PropTypes from 'prop-types';
import useNativeBackHandler from '../../hooks/useBackHandler';
import {SafeAreaView} from 'react-native-safe-area-context';
const MediaSlider = ({
  slides = [],
  selectedIndex = 0,
  isDelete = false,
  deleteMedia = () => undefined,
  openDeletePopup = () => undefined,
  deleteFlag = false,
  closeModal = () => undefined,
}) => {
  const styles = createStyles();
  const navigation = useNavigation();
  useNativeBackHandler(closeModal);
  const swiperRef = useRef(null);
  const [newCurrentIndex, setCurrentIndex] = useState(selectedIndex);

  const OpenDeletePopup = () => {
    openDeletePopup();
  };

  const handleDeletePress = (mediaId, currentIndex) => {
    OpenDeletePopup();
    deleteMedia(mediaId);
    setCurrentIndex(currentIndex);
  };

  useEffect(() => {
    if (deleteFlag) {
      if (slides?.length === 0 || slides?.length === undefined) {

        closeModal();
      } else {
        if (newCurrentIndex !== null) {
          if (newCurrentIndex === slides?.length - 1) {
            swiperRef.current.scrollBy(-1);
          } else {
            swiperRef.current.scrollBy(0);
          }
        }
      }
      setCurrentIndex(null);
    }
  }, [deleteFlag, slides]);

  const renderPagination = (index, total, context) => {
    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText} accessibilityLabel={`${index + 1}/${total}`}>
          {index + 1}/{total}
        </Text>
      </View>
    );
  };

  const handleBackdropPress = () => {
    closeModal();
  };

  const handleContentPress = e => {
    e.stopPropagation();
  };

  return (
    <TouchableWithoutFeedback onPress={handleBackdropPress}>
      <SafeAreaView style={[styles.container, {height: SCREEN_HEIGHT}]}>
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            style={styles.wrapper}
            showsPagination={true}
            renderPagination={renderPagination}
            loop={false}
            index={selectedIndex}>
            {slides?.map((slide, index) => (
              <View key={slide.mediaUrl} style={styles.slideWrapper}>
                <TouchableWithoutFeedback onPress={handleContentPress}>
                  <View style={styles.deleteButtonContainer}>
                    {isDelete && (
                      <TouchableOpacity
                        onPress={() => handleDeletePress(slide._id, index)}
                        testID="deleteButtonSlide" accessibilityLabel={'deleteButtonSlide'}>
                        <DeleteWhiteIcon />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={handleContentPress}>
                  <View
                    style={[
                      styles.slideContainer,
                      {
                        marginTop:
                          Platform.OS === 'ios'
                            ? SCREEN_HEIGHT / 2 - 250
                            : SCREEN_HEIGHT / 2 - 200,
                      },
                    ]}
                    accessibilityLabel={'slideContainer'}
                    >
                    {(slide.type === 'Image' || slide.urlType === 'Image') && (
                      <View
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          height: 300,
                          width: '100%',
                        }}>
                        <Image
                          source={{uri: slide.mediaUrl}}
                          style={[styles.image]}
                          accessibilityLabel={`image-${index}`}
                        />
                      </View>
                    )}
                    {(slide.type === 'Video' || slide.urlType === 'Video') && (
                      <VideoThumbnail
                      key={index}
                      thumbnailUrl={slide.thumbnailUrl}
                      renderLocalThumbnailIos={true}
                        src={slide.mediaUrl}
                        accessibilityLabel={`video-${index}`}
                        preventPlay={false}
                        thumbnailStyle={{ width: '50%', height: '200%' }}
                       imuwMediaStyle={{ width: '100%', height: 300,resizeMode:'contain' }}
                       imuwThumbStyle={{ borderRadius: 6, width: '100%' }}
                       style={{ height: '100%', borderRadius: 6, overflow: 'hidden',resizeMode:'contain'}}
                       resize="contain"
                      />
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            ))}
          </Swiper>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const createStyles = function () {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    swiperContainer: {
      flex: 1,
    },
    slideWrapper: {
      flex: 1,
    },
    deleteButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      padding: 10,
    },
    slideContainer: {
      height: 300,
      width: '100%',
      backgroundColor:'black',
    },
    image: {
      height: 300,
      width: '100%',
      resizeMode:'contain',
    },
    paginationContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    paginationText: {
      fontSize: 20,
      color: '#fff',
    },
  });
};

MediaSlider.propTypes = {
  slides: PropTypes.array.isRequired,
  selectedIndex: PropTypes.number.isRequired,
  isDelete: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  openDeletePopup: PropTypes.func,
  deleteMedia: PropTypes.func,
  deleteFlag: PropTypes.bool,
};

MediaSlider.displayName = 'MediaSlider';

export default MediaSlider;
