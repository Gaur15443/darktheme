import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import PropTypes from 'prop-types';

import VideoThumbnail from '../Media/VideoThumbnail';
import { useTheme, Text } from 'react-native-paper';
const MediaContainer = ({ postMedia = [], preventPlay, customPress, onMediaPress }) => {
  const theme = useTheme();

  const handleMediaPress = (activeIndex) => {

    if (onMediaPress) {

      onMediaPress(activeIndex);
    }
  };

  return (
    <View style={styles.imuwPostMedia}>
      {postMedia.length === 1 && postMedia[0]?.type === 'Image' && (

        <View style={styles.backgroundImageWrapper} accessibilityLabel={'backgroundImageWrapper'}>
          <ImageBackground
            source={{ uri: postMedia[0].mediaUrl }}
            style={[styles.backgroundImage, { borderRadius: 6 }, { height: '400%', width: '100%' }]}
            blurRadius={4}>

            <Image
              source={{ uri: postMedia[0].mediaUrl }}
              style={[
                styles.singleImage,
                { width: postMedia.length > 1 ? '50%' : '100%' },
              ]}
              accessibilityLabel={'singleImage'}


            />

          </ImageBackground>
        </View>
      )}
      {postMedia.length === 1 && postMedia[0]?.type === 'Video' && (
        <VideoThumbnail
          key={postMedia[0].thumbnailUrl}
          renderLocalThumbnailIos={true}
          thumbnailUrl={postMedia[0].thumbnailUrl ? postMedia[0].thumbnailUrl : postMedia[0].mediaUrl}
          src={postMedia[0].mediaUrl}
          preventPlay={preventPlay}
          customPress={() => customPress()}
          thumbnailStyle={{ width: '50%', height: '102%' }}
          imuwMediaStyle={{ width: '100%', height: '102%' }}
          imuwThumbStyle={{ borderRadius: 6, width: '100%' }}
          style={{ height: '100%', width: '100%', borderRadius: 6, overflow: 'hidden' }}
          resize="cover"


        />



      )}


      {postMedia.length !== 1 &&
        postMedia[0]?.mediaUrl &&
        postMedia[0]?.type === 'Image' && (
          <TouchableOpacity onPress={() => { customPress(); handleMediaPress(0); }} style={{ width: postMedia.length > 1 ? '50%' : '100%', height: '102%' }}>
            <Image
              source={{ uri: postMedia[0].mediaUrl }}
              style={[
                styles.image,
                { width: postMedia.length > 1 ? '100%' : '100%', height: '100%' },
              ]}


            />
          </TouchableOpacity>
        )}
      {postMedia.length !== 1 &&
        postMedia[0]?.mediaUrl &&
        postMedia[0]?.type === 'Video' && (
          <TouchableOpacity style={{ height: '100%', width: '50%' }}>

            <VideoThumbnail
              key={postMedia[0].thumbnailUrl}
              renderLocalThumbnailIos={true}
              thumbnailUrl={postMedia[0].thumbnailUrl}
              src={postMedia[0].mediaUrl}
              preventPlay={preventPlay}
              customPress={() => {
                customPress();
                handleMediaPress(0);
              }}
              thumbnailStyle={{ width: '100%', height: '102%' }}
              imuwMediaStyle={{ width: '100%', height: '102%' }}
              imuwThumbStyle={{ borderRadius: 6, width: '100%', height: '102%' }}
              resize="cover"

            />
          </TouchableOpacity>
        )}
      {postMedia.length === 2 &&
        postMedia[1]?.mediaUrl &&
        postMedia[1]?.type === 'Image' && (
          <TouchableOpacity onPress={() => {
            customPress();
            handleMediaPress(1);
          }} style={{ width: postMedia.length > 1 ? '50%' : '100%', height: '102%' }}>
            <Image
              source={{ uri: postMedia[1].mediaUrl }}
              style={[
                styles.image,
                { width: postMedia.length > 1 ? '100%' : '100%', height: '100%' },
              ]}

            />
          </TouchableOpacity>
        )}
      {postMedia.length === 2 &&
        postMedia[1]?.mediaUrl &&
        postMedia[1]?.type === 'Video' && (
          <TouchableOpacity style={{ height: '100%', width: '50%' }}>

            <VideoThumbnail
              key={postMedia[1].thumbnailUrl}
              renderLocalThumbnailIos={true}
              thumbnailUrl={postMedia[1].thumbnailUrl}
              src={postMedia[1].mediaUrl}
              preventPlay={preventPlay}
              customPress={() => {
                customPress();
                handleMediaPress(1);
              }}
              thumbnailStyle={{ width: '100%', height: '102%' }}
              imuwMediaStyle={{ width: '100%', height: '102%' }}
              imuwThumbStyle={{ borderRadius: 6, width: '100%', height: '102%' }}
              resize="cover"

            />
          </TouchableOpacity>
        )}

      <View style={{ display: 'flex', width: '100%', rowGap: 1.2 }}>

        {postMedia.length > 2 &&
          postMedia.length <= 3 &&
          postMedia[1]?.mediaUrl &&
          postMedia[1]?.type === 'Image' && (

            <TouchableOpacity onPress={() => { customPress(); handleMediaPress(1); }} style={{ width: postMedia.length > 1 ? '100%' : '100%', height: '50%' }}>

              <Image
                source={{ uri: postMedia[1].mediaUrl }}
                style={[
                  styles.image1,
                  { width: postMedia.length > 1 ? '50%' : '100%', height: '100%' },
                ]}

              />
            </TouchableOpacity>
          )}
        {postMedia.length > 2 &&
          postMedia.length <= 3 &&
          postMedia[1]?.mediaUrl &&
          postMedia[1]?.type === 'Video' && (
            <TouchableOpacity style={{ width: postMedia.length > 1 ? '100%' : '100%', height: '50%' }}>

              <VideoThumbnail
                key={postMedia[1].thumbnailUrl}
                renderLocalThumbnailIos={true}
                thumbnailUrl={postMedia[1].thumbnailUrl}
                src={postMedia[1].mediaUrl}
                preventPlay={preventPlay}
                customPress={() => {
                  customPress();
                  handleMediaPress(1);
                }}
                thumbnailStyle={{ width: '50%', height: '100%' }}
                imuwMediaStyle={{ width: '100%', height: '100%' }}
                imuwThumbStyle={{ borderRadius: 6, width: '50%', height: '100%' }}
                resize="cover"
              />
            </TouchableOpacity>
          )}
        {postMedia.length > 2 &&
          postMedia.length <= 3 &&
          postMedia[2]?.mediaUrl &&
          postMedia[2]?.type === 'Image' && (
            <TouchableOpacity onPress={() => { customPress(); handleMediaPress(2); }} style={{ width: postMedia.length > 1 ? '100%' : '100%', height: '50%' }}>

              <Image
                source={{ uri: postMedia[2].mediaUrl }}
                style={[
                  styles.image1,
                  { width: postMedia.length > 1 ? '50%' : '100%', height: '100%' },

                ]}

              />
            </TouchableOpacity>
          )}
        {postMedia.length > 2 &&
          postMedia.length <= 3 &&
          postMedia[2]?.mediaUrl &&
          postMedia[2]?.type === 'Video' && (
            <TouchableOpacity style={{ height: '50%', width: '100%' }}>

              <VideoThumbnail
                key={postMedia[2].thumbnailUrl}
                renderLocalThumbnailIos={true}
                thumbnailUrl={postMedia[2].thumbnailUrl}
                src={postMedia[2].mediaUrl}
                preventPlay={preventPlay}
                customPress={() => {
                  customPress();
                  handleMediaPress(2);
                }}
                thumbnailStyle={{ width: '100%', height: '100%' }}
                imuwMediaStyle={{ width: '100%', height: '100%' }}
                imuwThumbStyle={{ borderRadius: 6, width: '50%', height: '100%' }}
                resize="cover"

              />
            </TouchableOpacity>

          )}
      </View>
      <View style={{ display: 'flex', width: '100%', height: '99.9%', gap: 2 }}>

        {postMedia.length > 3 &&
          postMedia[1]?.mediaUrl &&
          postMedia[1]?.type === 'Image' && (
            <TouchableOpacity onPress={() => { customPress(); handleMediaPress(1); }} style={{ width: postMedia.length > 1 ? '100%' : '100%', height: '50%' }}>

              <Image
                source={{ uri: postMedia[1].mediaUrl }}
                style={[
                  styles.image1,
                  { width: postMedia.length > 1 ? '50%' : '100%' },
                ]}

              />
            </TouchableOpacity>
          )}
        {postMedia.length > 3 &&
          postMedia[1]?.mediaUrl &&
          postMedia[1]?.type === 'Video' && (
            <TouchableOpacity style={{ height: '50%', width: '100%' }}>

              <VideoThumbnail
                key={postMedia[1].thumbnailUrl}
                renderLocalThumbnailIos={true}
                thumbnailUrl={postMedia[1].thumbnailUrl}
                src={postMedia[1].mediaUrl}
                preventPlay={preventPlay}
                customPress={() => {
                  customPress();
                  handleMediaPress(1);

                }}
                thumbnailStyle={{ width: '100%', height: '100%' }}
                imuwMediaStyle={{ width: '100%', height: '100%' }}
                imuwThumbStyle={{ borderRadius: 6, width: '50%', height: '100%' }}
                resize="cover"

              />
            </TouchableOpacity>
          )}
        {postMedia.length > 3 &&
          postMedia[2]?.mediaUrl &&
          postMedia[2]?.type === 'Image' && (
            <TouchableOpacity onPress={() => { customPress(); handleMediaPress(2); }} style={{ width: postMedia.length > 1 ? '100%' : '100%', height: '50%' }}>

              <Image
                source={{ uri: postMedia[2].mediaUrl }}
                style={[
                  styles.image2,
                  { width: postMedia.length > 1 ? '50%' : '100%', height: '100%' },
                ]}

              />
            </TouchableOpacity>
          )}
        {postMedia.length > 3 &&
          postMedia[2]?.mediaUrl &&
          postMedia[2]?.type === 'Video' && (
            <TouchableOpacity style={{ height: '50%', width: '100%' }}>

              <VideoThumbnail
                key={postMedia[2].thumbnailUrl}
                renderLocalThumbnailIos={true}
                thumbnailUrl={postMedia[2].thumbnailUrl}
                src={postMedia[2].mediaUrl}
                preventPlay={preventPlay}
                customPress={() => {
                  customPress();
                  handleMediaPress(2);
                }}
                thumbnailStyle={{ width: '100%', height: '100%' }}
                imuwMediaStyle={{ width: '100%', height: '100%' }}
                imuwThumbStyle={{ borderRadius: 6, width: '50%', height: '100%' }}
                resize="cover"

              />
            </TouchableOpacity>
          )}
      </View>
      {postMedia.length > 3 &&
        postMedia[2]?.mediaUrl
        && (
          <View
            style={{
              backgroundColor: theme.colors.mediaContainerOverlay,
              position: 'absolute',
              width: '50%',
              height: '50%',
              borderRadius: 6,
              right: 0,
              left: '50.3%',

              bottom: 0,
              top: '50.7%',

              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: theme.colors.onSecondary, fontSize: 22 }}>
              +{postMedia.length - 3}
            </Text>
          </View>
        )}

    </View>
  );
};

const styles = StyleSheet.create({
  imuwPostMedia: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    height: 185,
    position: 'relative',
    rowGap: 0.1,
    columnGap: 1.2,
  },

  centered: {

  },
  fontWeightBold: {
    fontWeight: 'bold',
  },

  halfHeight: {
    height: '50%',
  },
  halfWidth: {
    width: '50%',
  },
  flexCenter: {
    display: 'flex',
  },
  singleImageContainer: {
    height: '100%',
    borderRadius: 6,
    width: '100%',
  },

  singleImage: {
    height: '100%',
    resizeMode: 'contain',

  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    borderRadius: 6,
  },
  image: {
    height: '100%',
    borderRadius: 6,

  },
  image1: {
    height: '100%',
    borderRadius: 6,
  },
  image2: {
    height: '50%',
    borderRadius: 6,
  },

  backgroundImageWrapper: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',

    borderRadius: 6,
  },
  thumbnail: {
    height: '50%',
    borderRadius: 6,
  },
});

export default MediaContainer;
MediaContainer.propTypes = {

  postMedia: PropTypes.array.isRequired,
  onMediaPress: PropTypes.func,
};
