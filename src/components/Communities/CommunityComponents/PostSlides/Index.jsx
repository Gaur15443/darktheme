/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, memo, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Pressable,
  ImageBackground,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import Video from 'react-native-video';
import Image from 'react-native-scalable-image';
import Constants from '../../../../common/Constants';
import { Text, useTheme } from 'react-native-paper';
import { VideoThumbnail } from '../../../../core';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import { DocumentFileIcon } from '../../../../images';
import Toast from 'react-native-toast-message';
import { createThumbnail } from 'react-native-create-thumbnail';
import { useSelector } from 'react-redux';
import FastImage from '@d11/react-native-fast-image';

function PostSlides({
  mediaUrls = [],
  onPress,
  aspectRatio = 1,
  discussionData,
  thumbnailUrl,
  disableBackAction
}) {
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState({});

  const width = Constants.Dimension.ScreenWidth() - 24;
  const height = calculateHeight(aspectRatio, width);
  const theme = useTheme();

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );

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

  function handleMediaClick() { }

  const openFile = src => {
    disableBackAction(true)
    const localFile = `${RNFS.DocumentDirectoryPath}/${src?.fileName}`; // Replace with your file name and type
    // Download the file to local storage
    RNFS.downloadFile({
      fromUrl: src?.mediaUrl, // Replace with the remote file URL
      toFile: localFile,
    })
      .promise.then(() => {
        // Open the file using react-native-file-viewer
        FileViewer.open(localFile, { showOpenWithDialog: true })
          .then(() => {
            disableBackAction(false)
          })
          .catch(error => {
            let errorMessage = toastMessages?.['5015'];

            // Check for specific error types to provide a more user-friendly message
            if (
              error.message.includes('No app associated with this mime type')
            ) {
              errorMessage = toastMessages?.['5016'];
            } else if (error.message.includes('network')) {
              errorMessage = toastMessages?.['5017'];
            }

            Toast.show({
              type: 'error',
              text1: errorMessage,
            });
          });
      })
      .catch(error => {
        Alert.alert(toastMessages?.validation?.['5019']);
      });
  };

  useEffect(() => {
    const generateThumbnails = async () => {
      const newThumbnails = {};

      // Loop through mediaUrls and generate thumbnails for videos
      await Promise.all(
        mediaUrls.map(async (src, index) => {
          if (src?.urlType?.toLowerCase() === 'video' && !thumbnailUri[index]) {
            try {
              const { path } = await createThumbnail({
                url: src.mediaUrl,
                timeStamp: 2000, // 2 seconds
              });

              newThumbnails[index] = path; // Store in temporary object
            } catch (error) { }
          }
        }),
      );
      // Update state with newly generated thumbnails
      setThumbnailUri(prev => ({ ...prev, ...newThumbnails }));
    };

    generateThumbnails();
  }, [mediaUrls]);

  return (
    <Swiper
      height={calculateHeight(aspectRatio)}
      style={{
        paddingLeft: 1,
      }}
      loop={false}
      dotStyle={{
        marginBottom: -30,
      }}
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
          onPress={handleMediaClick}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            height,
            width,
            position: 'relative',
          }}>
          {src.urlType === 'Image' || src.type === 'Image' ? (
            <Image
              source={{ uri: src?.mediaUrl }}
              width={Dimensions.get('window').width - 24}
              style={{
                aspectRatio: aspectRatio,
                borderRadius: 8,
              }}
            />
          ) : src.urlType === 'Video' || src.type === 'Video' ? (
            <VideoThumbnail
              renderLocalThumbnailIos={true}
              thumbnailUrl={thumbnailUri[index] || src?.thumbnailUrl}
              resize="contain"
              src={src.mediaUrl}
              preventPlay={false}
              imuwMediaStyle={{
                height,
                width,
                borderRadius: 8,
              }}
              imuwThumbStyle={{
                height,
                width,
                borderRadius: 8,
              }}
            />
          ) : (
            <TouchableOpacity
              onPress={() => openFile(src)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
                overflow: 'hidden',
              }}>
              <View>
                <FastImage
                  source={{ uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/bgimgdocumen.png' }} // Ensure this path is correct
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  resizeMode="cover">
                  <View
                    style={{
                      flex: 1, // Ensure the view takes full space of the ImageBackground
                      justifyContent: 'center', // Center content vertically
                      alignItems: 'center', // Center content horizontally
                    }}>
                    <DocumentFileIcon />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        justifyContent: 'center', // Center content vertically
                        textAlign: 'center',
                      }}>
                      {src?.fileName}
                    </Text>
                  </View>
                </FastImage>
              </View>
            </TouchableOpacity>
          )}
        </Pressable>
      ))}
    </Swiper>
  );
}

PostSlides.displayName = 'PostSlides';

export default memo(PostSlides);

PostSlides.propTypes = {
  mediaUrls: PropTypes.array,
  activeMediaIndex: PropTypes.number,
  showDelete: PropTypes.bool,
};
