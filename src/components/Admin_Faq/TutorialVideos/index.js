import React, {useEffect, useState, memo, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import NewTheme from '../../../common/NewTheme';
import {fetchVideos} from '../../../store/apps/Faq';
import FaqVideoPlay from '../../../images/Icons/FaqVideoPlay';
import HomeVideoPlay from '../../../images/Icons/HomeVideoPlay';
import YoutubeIcon from '../../../images/Icons/YoutubeIcon';
import ArrowIcon from '../../../images/Icons/VideoArrowIcon';
import {Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import ErrorBoundary from '../../../common/ErrorBoundary';
import Toast from 'react-native-toast-message';
import {Card} from 'react-native-paper';

const RenderVideoItem = memo(
  ({
    item,
    playingVideoId,
    setPlayingVideoId,
    pausedVideoId,
    setPausedVideoId,
    fromHome,
  }) => {
    try {
       const extractVideoId = (url) => {
      if (!url || typeof url !== 'string') {
        console.error('Invalid or missing URL');
        return null;
      }
      try {
        // Regex handles youtube.com/watch?v=, youtu.be/, youtube.com/embed/, and youtube.com/shorts/
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        const videoId = match ? match[1] : null;
        return videoId;
      } catch (error) {
        console.error('Error extracting video ID:', error);
        return null;
      }
    };
    const videoId = extractVideoId(item?.youtubeUrl)
      const uniqueId = item._id;
      const combinedId = `${uniqueId}-${videoId}`;
      const thumbnailUrl = item?.mediaId?.[0]?.mediaUrl;

      return (
        <ErrorBoundary>
          <View
            style={{
              ...(fromHome
                ? {
                    paddingTop: 1,
                    elevation: 5,
                    borderRadius: 18,
                    marginLeft: 15,
                    marginBottom: Platform.OS === 'ios' ? 14 : 12,
                    height: 240,
                  }
                : {}),
            }}>
            <Card style={fromHome ? styles.videoItemHome : styles.videoItem}>
              {playingVideoId === combinedId ? (
                <View style={{height: 130, overflow: 'hidden'}}>
                  <YoutubePlayer
                    height={200}
                    play={pausedVideoId !== combinedId}
                    videoId={videoId}
                    forceAndroidAutoplay
                    fullscreen={true}
                    onFullScreenChange={isFullscreen => {
                      if (!isFullscreen) {
                        setPlayingVideoId(null);
                        setPausedVideoId(null);
                      }
                    }}
                    onChangeState={event => {
                      if (event === 'paused') {
                        setPausedVideoId(combinedId);
                      } else if (event === 'ended') {
                        setPlayingVideoId(null);
                        setPausedVideoId(null);
                      } else if (event === 'playing') {
                        setPausedVideoId(null);
                      }
                    }}
                  />
                </View>
              ) : (
                <View
                  onStartShouldSetResponder={() => {
                    setPlayingVideoId(combinedId);
                    setPausedVideoId(null);
                  }}
                  style={
                    fromHome
                      ? styles.thumbnailContainerHome
                      : styles.thumbnailContainer
                  }>
                  <Image
                    source={{uri: thumbnailUrl}}
                    style={fromHome ? styles.thumbnailHome : styles.thumbnail}
                    onError={e =>
                      console.error(
                        'Error loading thumbnail:',
                        thumbnailUrl,
                        e.nativeEvent,
                      )
                    }
                  />
                  <View
                    style={fromHome ? styles.homePlayOverlay : styles.playOverlay}>
                    {fromHome ? <HomeVideoPlay /> : <FaqVideoPlay />}
                  </View>
                </View>
              )}
              {fromHome && (
                <View style={{height: '100%'}}>
                  <Text style={styles.videoTitleHome} numberOfLines={3}>
                    {item?.title}
                  </Text>
                </View>
              )}
            </Card>
          </View>
        </ErrorBoundary>
      );
    } catch (err) {
      console.error('Error in RenderVideoItem:', err);
      return null;
    }
  },
);

function TutorialVideos({fromHome}) {
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [pausedVideoId, setPausedVideoId] = useState(null);
  const [isLastItemVisible, setIsLastItemVisible] = useState(false);
  const dispatch = useDispatch();
  const video = useSelector(state => state?.Faq?.videos);
  const flatListRef = useRef(null);


  useEffect(() => {
    const getVideos = async () => {
      try {
        await dispatch(fetchVideos()).unwrap();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching videos',
          text2: error?.message || JSON.stringify(error),
        });
      }
    };
    getVideos();
  }, [dispatch]);

  const videosToDisplay = video;

  const openYoutubeChannel = () => {
    try {
      Linking.openURL('https://youtube.com/@imeuswe?si=kBAOZcOFteHE07nA');
    } catch (err) {
      console.error('Error opening YouTube channel:', err);
    }
  };

  const renderFooter = () => {
    return (
      fromHome && (
        <View style={styles.buttonContainer}>
          <YoutubeIcon style={styles.youtubeIcon} />
          <View style={styles.centerButton}>
            <TouchableOpacity
              onPress={() => {
                openYoutubeChannel();
              }}>
              <View style={styles.imeusweIcon}>
                <Image
                  source={{
                    uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png',
                  }}
                  style={styles.imageIcon}
                  onError={e =>
                    console.error(
                      'Error loading footer image:',
                      e.nativeEvent,
                    )
                  }
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.channelText} numberOfLines={2}>
              Click to watch all the tutorials
            </Text>
          </View>
        </View>
      )
    );
  };

  const handleArrowPress = () => {
    try {
      const newViewPosition = isLastItemVisible ? 0.5 : -0.6;
      flatListRef.current?.scrollToIndex({
        index: isLastItemVisible
          ? 0
          : Math.min(currentVisibleIndex + 1, videosToDisplay?.length - 1),
        viewPosition: newViewPosition,
      });

      if (isLastItemVisible) {
        setIsLastItemVisible(false);
      }
    } catch (err) {
      console.error('[TutorialVideos] Error in handleArrowPress:', err);
    }
  };
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const onViewableItemsChanged = ({viewableItems}) => {
    if (viewableItems.length > 0) {
      const currentIndex = viewableItems[0].index;
      setCurrentVisibleIndex(currentIndex);
      if (currentIndex === videosToDisplay?.length - 1) {
        setIsLastItemVisible(true);
      } else {
        setIsLastItemVisible(false);
      }
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  if (!videosToDisplay || videosToDisplay?.length === 0) {
    return (
      <View style={[styles.container, fromHome && styles.homeContainer]}>
        <Text
          variant="headlineMedium"
          style={[styles.heading, fromHome && styles.headingHome]}>
          Tutorials
        </Text>
        <Text style={styles.noVideosText}>No video at this moment</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, fromHome && styles.homeContainer]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: 1,
          }}>
          <Text
            variant="headlineMedium"
            style={[styles.tutorialHeading, fromHome && styles.headingHome]}>
            Tutorials
          </Text>
          {fromHome && videosToDisplay?.length > 0 && (
            <View style={styles.arrowIconContainer}>
              <TouchableOpacity onPress={handleArrowPress}>
                <ArrowIcon
                  style={{
                    transform: [
                      {rotate: isLastItemVisible ? '180deg' : '0deg'},
                    ],
                    paddingHorizontal: 5,
                  }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={videosToDisplay}
          renderItem={({item}) => (
            <RenderVideoItem
              item={item}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
              pausedVideoId={pausedVideoId}
              setPausedVideoId={setPausedVideoId}
              fromHome={fromHome}
            />
          )}
          keyExtractor={item => item._id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    backgroundColor: NewTheme.colors.backgroundCreamy,
    marginTop: 10,
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: NewTheme.colors.backgroundCreamy,
    marginTop: 10,
    marginLeft: -8,
  },
  heading: {
    color: NewTheme.colors.blackText,
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    marginBottom: 10,
    marginLeft: 20,
    fontFamily: NewTheme.fonts.family.primary,
    marginTop: 20,
  },
  tutorialHeading: {
    color: NewTheme.colors.blackText,
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    marginLeft: 20,
    fontFamily: NewTheme.fonts.family.primary,
    marginVertical: 10,
  },
  headingHome: {
    fontWeight: '700',
    fontSize: 22,
    color: NewTheme.colors.secondaryDarkBlue,
    paddingHorizontal: -15,
  },
  arrowIconContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginRight: 10,
  },
  videoItem: {
    height: 134,
    width: 230,
    marginLeft: 15,
    borderRadius: 10,
    borderWidth: 6,
    borderColor: NewTheme.colors.primaryOrange,
  },
  videoItemHome: {
    position: 'relative',
    height: 240,
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 5,
    flexDirection: 'column',
    paddingTop: 10,
    boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.2509803922)',
  },
  buttonContainer: {
    position: 'relative',
    top: 1,
    height: 240,
    width: 250,
    marginLeft: 15,
    marginRight: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  videoTitleHome: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    color: '#000000',
    marginRight: 'auto',
    paddingHorizontal: 5,
    paddingTop: 11,
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 14,
    borderRadius: 8,
  },
  thumbnailContainerHome: {
    top: 2,
    left: 0,
    right: 0,
    bottom: 14,
    borderRadius: 8,
  },
  thumbnail: {
    width: '100%',
    height: 122,
    borderRadius: 3,
    objectFit: 'fill',
  },
  thumbnailHome: {
    width: '98%',
    height: 135,
    borderRadius: 8,
    objectFit: 'fill',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  playOverlay: {
    position: 'absolute',
    top: 38,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homePlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDetails: {
    marginTop: 155,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  youtubeIcon: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  centerButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    margin: 'auto',
  },
  channelText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 15,
    paddingHorizontal: 20,
    marginTop: -10,
    textAlign: 'center',
  },
  imeusweIcon: {
    height: 102,
    width: 102,
    backgroundColor: '#FFFFFF',
    marginTop: -8,
    marginBottom: 30,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 16px 0px rgba(0, 0, 0, 0.2509803922)',
  },
  iconImageStyle: {
    flex: 1,
    height: 270,
    overflow: 'hidden',
  },
  imageIcon: {
    height: 17,
    width: 75,
    // marginTop: -13,
  },
  noVideosText: {
    paddingHorizontal: 35,
  },
});

export default TutorialVideos;
