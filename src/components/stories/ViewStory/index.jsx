import React, { useState, useMemo, useEffect, useRef } from 'react';
import HTMLView from 'react-native-htmlview';
import SoundPlayer from 'react-native-sound-player';

import {
  Image,
  PermissionsAndroid,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Pressable,
  Keyboard,
} from 'react-native';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteStory,
  resetSingleStory,
  fetchOneStory,
  fetchStoryLikes,
  markStoryFavorite,
  resetFetchAllStories,
  resetSavedStories,
} from '../../../store/apps/story';
import moment from 'moment';
import {
  BottomQuoteIcon,
  CommentButton,
  LikeButton,
  SaveButton,
  StorieEmptyState,
  TopQuoteIcon,
  VisibilityIcon,
  SubGroup,
  FamIcon,
  VisibilityImg,
  TagIcon,
  SendIcon,
} from '../../../images';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import _ from 'lodash';

import {
  CollabProfileView,
  Comments,
  DefaultImage,
  PostLikes,
  ViewStoriesHeader,
} from '../../../components';
import { Platform, Modal as RNModal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Confirm from '../../Confirm';
import { useTheme, Text, Modal, Portal } from 'react-native-paper';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  formatLinkText,
  formatTagsText,
  timePassed,
} from '../../../utils/format';
import { useFocusEffect } from '@react-navigation/native';
import CustomBottomSheet from './../../CustomBottomSheet/index';
import PostMediaSlides from '../PostMediaSlides';
import Spinner from '../../../common/Spinner';
import Constants from './../../../common/Constants';
import { CloseIcon } from '../../../images/Icons/ModalIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardHeight from './../../../hooks/useKeyboardheight';
import {
  getStoryTaggedMembers,
  removeStoryTaggedMembers,
} from './../../../store/apps/tagSlice/index';
import LottieView from 'lottie-react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';
import ShareIcon from '../../../images/Icons/ShareIcon';
import Share from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FastImage from '@d11/react-native-fast-image';
import FullMediaViewer from '../../../common/Global-Media-Controller/FullMediaViewer';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants/Screens';
import { KeyboardController, AndroidSoftInputModes, KeyboardStickyView } from 'react-native-keyboard-controller';
import MentionsInput from '../../MentionsInput';
import CrossIconComment from '../../../images/Icons/CrossIconComment';
import { setAdjustNothing, setAdjustPan } from 'rn-android-keyboard-adjust';

const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 16,
    color: '#777777',
    fontWeight: 600,
    fontFamily: 'PublicSans Regular',
  },
});

export default function ViewStory({ route }) {
  let { SingleStoryId } = route.params;
  const groupId = useSelector(state => state?.Tree?.groupId)
  const commentRef = useRef(null);
  const editorRef = useRef(null);
  const [personReplyingTo, setPersonReplyingTo] = useState('');

  const scrollParentRef = useRef(null);
  const sharedWithElement = useRef(null);
  const styles = createStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const keyboardHeight = useKeyboardHeight();
  const { bottom, top } = useSafeAreaInsets();
  const userId = useSelector(state => state.userInfo._id);
  const singleStoryTags = useSelector(state => state.tag.singleStoryTags);
  const [description, setDescription] = useState('');
  const [readMore, setReadMore] = useState(false);
  const [animationValue, setAnimationValue] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const singleStory = useSelector(state => state.story.singleStory);
  const [showUsersLikes, setShowUsersLikes] = useState(false);
  const [deletePopUp, setDeletePopUp] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentAudioDuration, setCurrentAudioDuration] = useState(0);
  const [shouldResumePlay, setShouldResumePlay] = useState(false);
  const [tempLike, setTempLike] = useState(null);
  const [tempSave, setTempSave] = useState(null);
  const [tagToRemove, setTagToRemove] = useState(null);
  const [showRemoveTag, setShowRemoveTag] = useState(false);
  const [viewTagsDrawer, setViewTagsDrawer] = useState(false);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const mediaContainerRef = useRef(null);
  const [commentContent, setCommentContent] = useState('');
  const [editorHasFocus, setEditorHasFocus] = useState(false);
  const [openFullScreen, setOpenFullScreen] = useState({
    open: false,
    index: 0,
  });
  const [visibilityIconMeasurements, setVisibilityIconMeasurements] = useState({
    top: 0,
    right: 0,
  });

  const [posting, setPosting] = useState(false);

  const wavesImage = require('../../../images/waves.png');

  const [visible, setVisible] = React.useState(false);

  const progress = useSharedValue(0);
  const height = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: (bottom || 5) + (progress.value * (height.value))
  }));

  const hasText = useMemo(() => {
    const hasTemplateContent = commentContent?.trim?.()?.length > 0;
    return hasTemplateContent;
  }, [commentContent]);

  const showDialog = () => {
    if (sharedWithElement.current) {
      sharedWithElement.current.measure((x, y, width, height, pageX, pageY) => {
        setVisibilityIconMeasurements({
          top: pageY,
          right: pageX,
        });
      });
    }
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);


  useFocusEffect(
    React.useCallback(() => {
      /**
       * Toggle adjustments with a delay
       * so it works in Vivo20
       */
      if (Platform.OS === 'android') {
        setAdjustPan();
      }
      const timer = setTimeout(() => {
        if (Platform.OS === 'android') {
          setAdjustNothing();
        }
      }, 500);
      return () => {
        if (Platform.OS === 'android') {
          setAdjustPan();
        }
        clearTimeout(timer);
      };
    }, []),
  );

  // Updated useEffect to Check for DeepLink Data:
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setShowNotFound(false);
      const fetchStory = async () => {
        if (!SingleStoryId || `${SingleStoryId?.visible}` === 'false') {
          setLoading(false);
          setShowNotFound(true);
          return;
        }

        const fetchData = async () => {
          try {
            //Check for DeepLink Data:
            const storyId =
              typeof SingleStoryId === 'object'
                ? SingleStoryId?._id
                : SingleStoryId;

            if (!storyId) {
              setShowNotFound(true);
              return;
            }

            const result = await dispatch(fetchOneStory(storyId)).unwrap();

            if (!result || Object.keys(result).length === 0) {
              setShowNotFound(true);
            } else {
              setShowNotFound(false);
            }
          } catch (error) {
            setShowNotFound(true);
          } finally {
            setLoading(false);
          }
        };
        await fetchData();
      };
      fetchStory();

      return () => {
        setLoading(true);
      };
    }, [SingleStoryId, dispatch]),
  );

  useFocusEffect(
    React.useCallback(() => {
      setCommentContent('');
      setPersonReplyingTo('');
      setPosting(false);
    }, []),
  );

  useEffect(() => {
    const _onFinishedPlayingSubscription = SoundPlayer.addEventListener?.(
      'FinishedPlaying',
      ({ _success }) => {
        setIsPlaying(false);
      },
    );

    return () => {
      if (_onFinishedPlayingSubscription) {
        _onFinishedPlayingSubscription.remove?.();
      }
      SoundPlayer.stop();
      setIsPlaying(false);
    };
  }, []);

  useEffect(() => {
    if (currentAudioDuration >= audioDuration) {
      setIsPlaying(false);
      setCurrentAudioDuration(0);
      setAudioDuration(0);
    }
  }, [currentAudioDuration, audioDuration]);

  const onShare = async story => {
    try {
      const mediaUrl = story?.contents?.[0]?.elements?.[0]?.mediaUrl || '';
      const deepLinkUrl = `https://invite.imeuswe.in/story/${story._id}`;
      const fixedUrl = 'https://invite.imeuswe.in/';
      const message = `Check out this story on Imeuswe App!`;
      const title = story?.storiesTitle || 'Untitled Story';
      const clickHereText =
        '👉 Already have the app, Click below to view the story 👈';

      let imagePath = null;
      let useFixedUrl = !mediaUrl || mediaUrl.includes('/video/');

      if (!useFixedUrl) {
        try {
          const response = await ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: 'png',
          }).fetch('GET', mediaUrl);
          imagePath = response.path();
        } catch (error) {
          useFixedUrl = true;
        }
      }

      // Prepare the sharing options
      const options = {
        title: title,
        subject: title,
        message: `Title of the story: ${title}\n\n${message}\n\nDownload the App now : ${fixedUrl}\n\n${clickHereText}\n${deepLinkUrl}`,
        url: useFixedUrl ? fixedUrl : imagePath,
      };

      if (!useFixedUrl && imagePath) {
        if (Platform.OS === 'android') {
          options.url = `file://${imagePath}`;
        } else {
          options.url = imagePath;
        }
      }

      if (Platform.OS === 'ios') {
        options.excludedActivityTypes = [
          'com.apple.UIKit.activity.Print',
          'com.apple.UIKit.activity.AssignToContact',
          'com.apple.UIKit.activity.AddToReadingList',
          'com.apple.UIKit.activity.AirDrop',
          'com.apple.UIKit.activity.OpenInIBooks',
        ];
      }

      await Share.open(options);

      // Clean up the temporary file
      if (imagePath) {
        await ReactNativeBlobUtil.fs.unlink(imagePath);
      }
    } catch (error) { }
  };

  function playBackListener(event) {
    setCurrentAudioDuration(event.currentPosition);
    setAudioDuration(event.duration);
  }

  function calculateHeight(
    aspectRatio = 4 / 3,
    width = Constants.Dimension.ScreenWidth() - 5,
  ) {
    return width / aspectRatio;
  }

  async function handleRemoveTag(tagId) {
    try {
      const tagsLength = singleStoryTags?.length;
      const payload = {
        storyId: singleStory._id,
        removedTag: [tagId],
      };
      await dispatch(removeStoryTaggedMembers(payload)).unwrap();
      if (tagsLength < 2) {
        setViewTagsDrawer(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setShowRemoveTag(false);
    }
  }

  const markPostAsFavorite = async () => {
    try {
      setTempSave(!hasFavorite);
      await dispatch(markStoryFavorite(singleStory._id)).unwrap();
      dispatch(resetFetchAllStories(groupId));
      // TODO: Fix without reseting.
      dispatch(resetSavedStories());
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setTempSave(null);
    }
  };

  function pluralize(count, noun, suffix = 's') {
    count = count || 0;
    noun = noun || '';
    const result = `${count} ${noun}${count > 1 ? suffix : ''}`;
    return result;
  }

  const handleToggleLike = async () => {
    try {
      setTempLike(!hasLiked);
      await dispatch(fetchStoryLikes(singleStory._id)).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setTempLike(null);
    }
  };

  const hasMedia = useMemo(() => {
    return singleStory?.contents?.[0]?.elements?.length > 0;
  }, [singleStory]);

  const hasFavorite = useMemo(() => {
    if (singleStory?.favouriteUsers?.includes?.(userId)) {
      return true;
    }
    return false;
  }, [singleStory]);

  const hasLiked = useMemo(() => {
    if (singleStory?.storylikes?.includes?.(userId)) {
      return true;
    }
    return false;
  }, [singleStory]);

  const getTabNumber = name => {
    if (name?.toString() === 'Moment') {
      return 1;
    } else if (name?.toString() === 'Audios') {
      return 2;
    } else if (name?.toString() === 'Quotes') {
      return 3;
    } else {
      return 0;
    }
  };

  const deleteUserStory = async () => {
    try {
      setDeleting(true);
      await dispatch(deleteStory(singleStory._id)).unwrap();
      setDeletePopUp(false);
      dispatch(resetFetchAllStories(groupId));
      navigator.navigate('Stories');
      dispatch(resetSingleStory());
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setDeletePopUp(false);
      setDeleting(false);
      navigator.navigate('Stories');
    }
  };

  async function checkStoragePermissions() {
    let permission;
    let result;

    if (Platform.OS === 'ios') {
      // permission = PERMISSIONS.IOS.MEDIA_LIBRARY;
      // result = await request(permission);
    } else if (Platform.OS === 'android') {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        result = PermissionsAndroid.RESULTS.GRANTED;
      } else {
        result = RESULTS.DENIED;
      }
    }

    return result;
  }
  async function onStartPlay(url) {
    try {
      await checkStoragePermissions();

      if (!shouldResumePlay) {
        SoundPlayer.playUrl(url);

        setIsPlaying(true);
      } else {
        SoundPlayer.resume();

        setIsPlaying(true);
        setShouldResumePlay(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  async function onPausePlay() {
    if (isPlaying) {
      SoundPlayer.pause();
      setIsPlaying(false);
      setShouldResumePlay(true);
    }
  }

  async function fetchStoryTags() {
    try {
      Keyboard.dismiss();
      setViewTagsDrawer(true);
      //Check for DeepLink Data:
      const storyId =
        typeof SingleStoryId === 'object' ? SingleStoryId._id : SingleStoryId;
      await dispatch(getStoryTaggedMembers(storyId)).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  function handleScroll() {
    // TODO: To be confirmed
    // if (
    //   mediaContainerRef.current &&
    //   singleStory?.contents?.[0]?.elements?.length
    // ) {
    //   mediaContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
    //     const bottomOfElement = pageY + height;

    //     const isOutsideScreen = bottomOfElement < 0;

    //     if (isOutsideScreen) {
    //       setAnimationValue(1);
    //     } else {
    //       setAnimationValue(0);
    //     }
    //   });
    // }
  }

  const isAuthor = useMemo(() => {
    if (!Object.keys(singleStory).length > 0) {
      return true;
    }
    return userId === singleStory?.createdBy?._id;
  }, [userId, singleStory]);

  const unCancelledInvites = useMemo(
    () =>
      (singleStory?.collaboratingMembers || []).filter(
        collab => collab.collabStatus !== 'Cancelled',
      ),
    [singleStory],
  );

  const isCollaborator = useMemo(
    () =>
      unCancelledInvites.some(collab => collab?.collaboratorId?._id === userId),
    [unCancelledInvites, userId],
  );

  const isAudio = useMemo(() => {
    return singleStory?.categoryId?.[0]?.categoryName === 'Audios';
  }, [singleStory]);

  function renderItem(item, index) {
    return (
      <ErrorBoundary>
        {item?.type?.toLowerCase() === 'audio' && (
          <View style={[styles.imageContainer, { marginTop: 74 + top }]}>
            {!isPlaying && (
              <TouchableOpacity onPress={() => onStartPlay(item?.mediaUrl)}>
                <Icon name="play-arrow" color={'#E77237'} size={40} />
              </TouchableOpacity>
            )}
            {isPlaying && (
              <TouchableOpacity onPress={() => onPausePlay(item?.mediaUrl)}>
                <Icon name="pause" color={'#E77237'} size={40} />
              </TouchableOpacity>
            )}
            <FastImage
              source={wavesImage}
              style={{
                width: '100%',
                height: 200,
                resizeMode: 'contain',
              }}
            />
          </View>
        )}
      </ErrorBoundary>
    );
  }
  // eslint-disable-next-line react/no-unstable-nested-components
  function ScrollViewHeader() {
    return (
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute',
          top: 0,
          zIndex: 1,
          width: '100%',
          backgroundColor: theme.colors.background,
        }}>
        <Text
          style={{
            marginVertical: 20,
            color: 'black',
            fontSize: 20,
            fontWeight: 600,
          }}>
          Likes
        </Text>
      </View>
    );
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  function ViewTagsHeader() {
    return (
      <View
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute',
          paddingHorizontal: 4,
          top: 0,
          zIndex: 1,
          width: '100%',
          height: 36,
          backgroundColor: theme.colors.background,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}>
          <View
            style={{
              paddingTop: 6,
            }}>
            <TagIcon fill={'#000'} />
          </View>
          <Text
            variant="bold"
            style={{
              fontSize: 20,
            }}>
            Tagged Members
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={{ position: 'relative', flex: 1 }}>
        {visible && (
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideDialog}
              contentContainerStyle={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalContent,
                    {
                      position: 'absolute',
                      top:
                        visibilityIconMeasurements.top > 0
                          ? visibilityIconMeasurements.top - 24
                          : 0,
                    },
                  ]}>
                  <View style={styles.closeWrapper}>
                    <TouchableOpacity
                      accessibilityLabel="dialogclose"
                      onPress={hideDialog}
                      style={{
                        backgroundColor: 'lightgray',
                        marginRight: -10,
                        marginTop: -20,
                        borderRadius: 5,
                      }}>
                      <CloseIcon />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingBottom: 12,
                    }}>
                    <VisibilityImg fill="#E77237" />
                    <Text
                      style={{
                        marginHorizontal: 12,
                        fontWeight: 600,
                        fontSize: 20,
                      }}>
                      Shared with
                    </Text>
                  </View>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {singleStory?.familyGroupId?.map((group, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 3,
                        }}>
                        {group?.groupType?.groupType1 === 'SG' ? (
                          <SubGroup
                            style={{
                              marginTop: 4,
                              marginLeft: 2,
                            }}
                          />
                        ) : (
                          <FamIcon
                            style={{
                              marginTop: 4,
                              marginLeft: 2,
                            }}
                          />
                        )}

                        <Text
                          style={{
                            fontWeight: 500,
                            color: 'black',
                            fontSize: 14,
                            marginLeft: 6,
                          }}>
                          {group?.groupType?.groupType1 === 'SG'
                            ? group.groupName
                            : `${group.groupName.replace(/family/gi, '').trim()} Family`}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </Portal>
        )}
        <View style={{ zIndex: 999 }}>
          <ViewStoriesHeader
            onDelete={() => setDeletePopUp(true)}
            isAuthor={isAuthor}
            loading={loading}
            shouldShowEdit={
              !isAudio &&
              (isAuthor ||
                (isCollaborator && singleStory?.status?.toString?.() === 'Draft'))
            }
            animationValue={0}
            storyId={singleStory}
            tabNumber={getTabNumber(
              SingleStoryId?.categoryId?.[0]?.categoryName || 'default',
            )}
            iconsHeight={30}
            ellipsisWidth={16}
            ellipsisHeight={16}
          />
        </View>
        <View
          style={{
            position: 'relative',
            flex: 1,
          }}>

          {deletePopUp && (
            <Confirm
              title={'Are you sure you want to delete your post?'}
              subTitle={''}
              loading={deleting}
              discardCtaText={'Cancel'}
              continueCtaText={'Delete'}
              onContinue={() => deleteUserStory()}
              onBackgroundClick={() => setDeletePopUp(false)}
              onDiscard={() => setDeletePopUp(false)}
              onCrossClick={() => setDeletePopUp(false)}
            />
          )}
          {loading ? (
            <Spinner />
          ) : (
            <View style={{ flex: 1, position: 'relative' }}>
              <ScrollView
                keyboardShouldPersistTaps={'always'}
                style={{ flex: 1 }}
              >
                {showNotFound || Object.keys(singleStory || {})?.length < 1 ? (
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: SCREEN_HEIGHT,
                      paddingTop: top,
                      paddingBottom: bottom,
                    }}>
                    <StorieEmptyState />
                    <View style={styles.emptyStateTextContainer}>
                      <View>
                        <View style={[styles.emptyStateLockContainer, {
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          paddingHorizontal: 25
                        }]}>
                          <View>
                            <Icon
                              name="lock"
                              size={28}
                              color={'#000'}
                              style={{
                                paddingTop: 6,
                              }}
                            />
                          </View>
                          <Text
                            variant="headlineLarge"
                            style={[styles.emptyStateTitle, { padding: 1 }]}>
                            This post isn&apos;t available.
                          </Text>
                        </View>
                        <Text style={styles.emptyStateSubtitle}>
                          When this happens, it&apos;s usually because the owner has
                          deleted it or has changed the visibility settings of the
                          post.
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View
                    ref={scrollParentRef}
                    keyboardShouldPersistTaps="always"
                    style={{ flex: 1 }}>
                    <View style={styles.parentContainer}>
                      {singleStory?.contents?.[0]?.elements?.length > 0 &&
                        !isAudio ? (
                        <View
                          onLayout={() => {
                            handleScroll();
                          }}
                          ref={mediaContainerRef}
                          style={{
                            width: Constants.Dimension.ScreenWidth() - 5,
                            height: calculateHeight(singleStory?.aspectRatio || 1),
                            position: 'relative',
                          }}>
                          <PostMediaSlides
                            onPress={idx => {
                              setOpenFullScreen({
                                open: true,
                                index: idx,
                              });
                            }}
                            onTogglePlay={e => setVideoIsPlaying(e)}
                            aspectRatio={singleStory.aspectRatio}
                            mediaUrls={singleStory?.contents?.[0]?.elements}
                          />

                          {!videoIsPlaying && (
                            <View
                              style={{
                                position: 'absolute',
                                bottom: 12,
                                backgroundColor: '#000000B3',
                                opacity: 0.7,
                                borderRadius: 8,
                                width: Constants.Dimension.ScreenWidth() - 20,
                                alignSelf: 'center',
                                right: 10,
                                left: 10,
                                padding: 8,
                              }}>
                              <Text
                                variant='bold'
                                style={styles.storyTitle}
                                accessibilityLabel="story title">
                                {singleStory?.storiesTitle}
                              </Text>
                              <Text
                                variant='bold'
                                style={{
                                  fontSize: 12,
                                  color: 'white',
                                }}>
                                {typeof singleStory?.location === 'string'
                                  ? singleStory?.location
                                  : (singleStory?.location?.formatted_address ??
                                    '')}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        renderItem(singleStory?.contents?.[0]?.elements?.[0])
                      )}
                      <View
                        style={{
                          marginHorizontal: 12,
                          marginTop: !hasMedia ? 70 + top + 10 : 0,
                        }}>
                        <View style={{
                          ...(
                            !hasMedia && singleStory?.categoryId?.[0]?.categoryName !==
                              'Quotes'
                              ? {
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#000',
                                shadowColor: '#000',
                                shadowOffset: {
                                  width: 0,
                                  height: 2,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,

                                elevation: 5,
                                backgroundColor: theme.colors.background,
                                paddingLeft: 15,
                              }
                              : {}
                          )
                        }}>
                          {/* profile starts */}
                          <Animated.View
                            entering={FadeInUp.duration(500).damping(20).springify()}
                            style={[styles.profileContainer, {
                              ...(!hasMedia && singleStory?.categoryId?.[0]?.categoryName !==
                                'Quotes' && {
                                marginTop: 7
                              })
                            }]}>
                            {singleStory?.collaboratingMembers?.length > 0 ? (
                              <View
                                style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {typeof singleStory?.createdBy?.personalDetails
                                  ?.profilepic === 'string' ? (
                                  <Image
                                    style={styles.storyProfileImage}
                                    source={{
                                      uri: singleStory?.createdBy?.personalDetails
                                        ?.profilepic,
                                    }}
                                  />
                                ) : (
                                  <DefaultImage
                                    fontWeight={700}
                                    fontSize={15}
                                    borderRadius={50}
                                    height={20}
                                    width={20}
                                    firstName={
                                      singleStory?.createdBy?.personalDetails?.name
                                    }
                                    lastName={
                                      singleStory?.createdBy?.personalDetails
                                        ?.lastname
                                    }
                                    gender={
                                      singleStory?.createdBy?.personalDetails?.gender
                                    }
                                  />
                                )}
                                <View style={styles.collabBox}>
                                  <CollabProfileView
                                    imgSize={20}
                                    imgFontSize={10}
                                    fontSize={16}
                                    storyData={singleStory}
                                  />
                                </View>

                                <View style={{ flex: 3 }}>
                                  {singleStory?.familyGroupId?.every(
                                    group => group?.groupType?.groupType1 !== 'AD',
                                  ) && (
                                      <>
                                        <TouchableOpacity
                                          ref={sharedWithElement}
                                          onPress={showDialog}
                                          accessibilityLabel="publish">
                                          <VisibilityIcon fill="#E77237" />
                                        </TouchableOpacity>
                                      </>
                                    )}
                                </View>
                              </View>
                            ) : (
                              <>
                                {typeof singleStory?.createdBy?.personalDetails
                                  ?.profilepic === 'string' ? (
                                  <Image
                                    accessibilityLabel="author image"
                                    style={styles.storyProfileImage}
                                    source={{
                                      uri: singleStory?.createdBy?.personalDetails
                                        ?.profilepic,
                                    }}
                                  />
                                ) : (
                                  <DefaultImage
                                    accessibilityLabel="author image"
                                    fontWeight={700}
                                    fontSize={10}
                                    borderRadius={50}
                                    height={20}
                                    width={20}
                                    firstName={
                                      singleStory?.createdBy?.personalDetails?.name
                                    }
                                    lastName={
                                      singleStory?.createdBy?.personalDetails
                                        ?.lastname
                                    }
                                    gender={
                                      singleStory?.createdBy?.personalDetails?.gender
                                    }
                                  />
                                )}
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <View style={{ flex: 9.5 }}>
                                    <Text style={styles.storyPersonName}>
                                      {singleStory?.createdBy?.personalDetails?.name}{' '}
                                      {
                                        singleStory?.createdBy?.personalDetails
                                          ?.lastname
                                      }
                                    </Text>
                                  </View>

                                  <View style={{ flex: 2.5 }}>
                                    {singleStory?.familyGroupId?.every(
                                      group => group?.groupType?.groupType1 !== 'AD',
                                    ) && (
                                        <>
                                          <TouchableOpacity
                                            ref={sharedWithElement}
                                            onPress={showDialog}
                                            accessibilityLabel="publish">
                                            <VisibilityIcon fill="#E77237" />
                                          </TouchableOpacity>
                                        </>
                                      )}
                                  </View>
                                </View>
                              </>
                            )}
                          </Animated.View>
                          {/* profile ends */}
                          <View style={styles.quotesWrapper}>
                            {/* title and location starts */}
                            {singleStory?.categoryId?.[0]?.categoryName ===
                              'Quotes' && (
                                <>
                                  <View style={styles.topQuote}>
                                    <TopQuoteIcon width={'90'} height={'90'} />
                                  </View>
                                  <View style={styles.bottomQuote}>
                                    <BottomQuoteIcon width={'90'} height={'90'} />
                                  </View>
                                </>
                              )}
                            <Animated.View
                              entering={FadeInUp.duration(500)
                                .damping(20)
                                .springify()}
                              style={[styles.storyTitleContainer, {
                                ...(!hasMedia && singleStory?.categoryId?.[0]?.categoryName !==
                                  'Quotes' && {
                                  marginVertical: 7
                                })
                              }]}>
                              {singleStory?.categoryId?.[0]?.categoryName ===
                                'Quotes' && (
                                  <Text style={styles.StoryLocation}>
                                    {typeof singleStory?.location === 'string'
                                      ? singleStory?.location
                                      : (singleStory?.location?.formatted_address ??
                                        '')}
                                  </Text>
                                )}
                              {singleStory?.categoryId?.[0]?.categoryName !==
                                'Quotes' && (
                                  <View
                                  >
                                    {!hasMedia && !isAudio && (
                                      <Text
                                        style={[
                                          styles.storyTitle,
                                          { color: theme.colors.text },
                                        ]}
                                        accessibilityLabel="story title">
                                        {singleStory?.storiesTitle}
                                      </Text>
                                    )}
                                    {!hasMedia && !isAudio && singleStory?.location && (
                                      <Text style={styles.storyLocation}>
                                        {typeof singleStory?.location === 'string'
                                          ? singleStory?.location
                                          : (singleStory?.location
                                            ?.formatted_address ?? '')}
                                      </Text>
                                    )}
                                  </View>
                                )}
                            </Animated.View>
                          </View>
                          {/* title and location ends */}

                        </View>
                        {/* description starts */}
                        <Animated.View
                          entering={FadeInDown.duration(500)
                            .damping(20)
                            .springify()}>
                          <HTMLView
                            value={`<p>${formatLinkText(formatTagsText(singleStory?.contents?.[0]?.templateContent))}</p>`}
                            stylesheet={htmlStyles}
                          />
                        </Animated.View>
                        {/* description ends */}

                        {singleStory?.status !== 'Draft' && (
                          <>
                            {/*likes comments save and date */}
                            <Animated.View
                              entering={FadeInUp.duration(500)
                                .damping(20)
                                .springify()}
                              style={styles.dateAndOptions}>
                              <View style={styles.fourOptions}>
                                <TouchableOpacity
                                  accessibilityLabel="toggleStoryLike"
                                  onPress={() => handleToggleLike(singleStory._id)}>
                                  {!tempLike ? (
                                    <>
                                      <LikeButton
                                        size={20}
                                        isLiked={
                                          tempLike === null ? hasLiked : tempLike
                                        }
                                      />
                                    </>
                                  ) : (
                                    <View style={{ width: 20, height: 20 }}>
                                      <LottieView
                                        source={require('../../../animation/lottie/like_story.json')}
                                        style={styles.likeAnimation}
                                        autoPlay
                                        speed={1.5}
                                        loop
                                      />
                                    </View>
                                  )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                  accessibilityLabel="toggleSave"
                                  onPress={() =>
                                    markPostAsFavorite(singleStory._id)
                                  }>
                                  {!tempSave ? (
                                    <SaveButton
                                      width={20}
                                      height={20}
                                      isSaved={
                                        tempSave === null ? hasFavorite : tempSave
                                      }
                                    />
                                  ) : (
                                    <View
                                      style={{
                                        width: 20,
                                        height: 20,
                                      }}>
                                      <LottieView
                                        source={require('../../../animation/lottie/save_story.json')}
                                        style={styles.saveAnimation}
                                        autoPlay
                                        speed={1.5}
                                        loop
                                      />
                                    </View>
                                  )}
                                </TouchableOpacity>
                                <CommentButton
                                  size={20}
                                  accessibilityLabel="add comment icon"
                                />
                                {singleStory.featureTags?.length > 0 && (
                                  <Pressable
                                    style={{
                                      paddingTop: 2,
                                    }}
                                    onPress={fetchStoryTags}>
                                    <TagIcon fill="#000" />
                                  </Pressable>
                                )}
                              </View>

                              <View style={styles.eventDate}>
                                <Text
                                  style={styles.eventDateText}
                                  accessibilityLabel="story event date">
                                  {moment(singleStory?.eventDate).format(
                                    'Do MMM YYYY',
                                  )}
                                </Text>
                              </View>
                            </Animated.View>
                            {/*likes comments save and date ends*/}

                            {/*the grey dividerrrrrrr */}
                            <View
                              entering={FadeInDown.duration(500)
                                .damping(20)
                                .springify()}
                              style={styles.greyLine}
                            />
                            {/*the grey dividerrrrrrr */}

                            {/* likes count, comments count and post date */}
                            <Animated.View
                              entering={FadeInDown.duration(500)
                                .damping(20)
                                .springify()}
                              style={styles.likesAndCommentsContainer}>
                              <View style={styles.likesAndComments}>
                                {!singleStory?.storylikes?.length ? (
                                  <TouchableOpacity>
                                    <Text
                                      accessibilityLabel="showUsersLikes"
                                      style={styles.likesAndCommentsText}>
                                      0 Likes
                                    </Text>
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    accessibilityLabel="showUsersLikes1"
                                    onPress={() => setShowUsersLikes(true)}>
                                    <Text style={styles.likesAndCommentsText}>
                                      {pluralize(
                                        singleStory?.storylikes?.length,
                                        'Like',
                                      )}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                {/* <Text style={styles.likesAndCommentsText}>.</Text> */}

                                {!singleStory?.commentsCount ? (
                                  <Text
                                    accessibilityLabel="comments count"
                                    style={styles.likesAndCommentsText}>
                                    0 Comments{' '}
                                  </Text>
                                ) : (
                                  <Text
                                    accessibilityLabel="comments count"
                                    style={styles.likesAndCommentsText}>
                                    {pluralize(
                                      singleStory?.commentsCount,
                                      'Comment',
                                    )}
                                  </Text>
                                )}
                              </View>
                              <View
                                accessibilityLabel="story published date"
                                style={styles.postedAt}>
                                <Text style={styles.likesAndCommentsText}>
                                  Posted {timePassed(singleStory?.publishedAt)}
                                </Text>
                              </View>
                            </Animated.View>
                            {/* likes count, comments count and post date ends */}

                            {/* listing comments */}
                            {!loading && singleStory._id && <Comments
                              ref={commentRef}
                              commentContent={commentContent}
                              setCommentContent={setCommentContent}
                              personReplyingTo={personReplyingTo}
                              onPersonReplyingToChange={setPersonReplyingTo}
                              onPostingChange={setPosting}
                              onPostedComment={() => {
                                setCommentContent('');
                              }}
                            />}
                            {/* comments ends */}
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
              {!loading && singleStory._id && <KeyboardStickyView>
                <Animated.View
                  style={[{
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: 0,
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                    backgroundColor: '#FEF9F1',
                    zIndex: 1,
                    minHeight: 94,
                    borderTopColor: '#00000010',
                    borderTopWidth: 1.5,
                  },
                    animatedStyle
                  ]}>
                  {personReplyingTo?.length > 0 && (
                    <View
                      style={{
                        height: 40,
                        backgroundColor: '#EEEEEE',
                        padding: 10,
                        borderTopRightRadius: 8,
                        borderTopLeftRadius: 8,
                        color: 'gray',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 10,
                        borderTopWidth: 1,
                        borderColor: 'transparent',
                        borderTopRightRadius: 8,
                        borderTopLeftRadius: 8,
                        borderWidth: 1,
                      }}>
                      <Text numberOfLines={1}
                        ellipsizeMode="tail" style={{ color: 'gray', flex: 1 }}>
                        Replying to
                        <Text variant='bold' style={{ fontWeight: 'bold', color: 'gray', }}>
                          &nbsp;{personReplyingTo} : {commentRef?.current?.focusedComment?.content}
                        </Text>
                      </Text>
                      <TouchableOpacity onPress={() => {
                        commentRef?.current?.cancelReply();
                      }} style={{
                        color: 'gray',
                        paddingLeft: 10,
                        fontWeight: 'bold',
                      }}>
                        <CrossIconComment />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View
                    style={[
                      styles.commentBox,
                      {
                        borderColor: hasText || editorHasFocus ? '#E77237' : '#000',
                        borderWidth: hasText || editorHasFocus ? 2 : 2,
                        alignItems: 'flex-end',
                      },
                    ]}>
                    <MentionsInput
                      ref={editorRef}
                      value={commentContent}
                      showBorder={false}
                      accessibilityLabel="Add comment"
                      inputHeight={100}
                      contentStyle={{
                        flex: 1,
                        width: hasText ? SCREEN_WIDTH - 70 : '100%',
                        borderRadius: 10,
                        maxHeight: 125,
                        paddingRight: 2,
                        paddingVertical: 15,
                      }}
                      onFocus={() => setEditorHasFocus(true)}
                      onBlur={() => setEditorHasFocus(false)}
                      textAlignVertical="center"
                      placeholder="Add comment"
                      onChangeText={(text) => {
                        setCommentContent(text);
                      }}
                      tagStyles={{
                        marginHorizontal: 14,
                        width: SCREEN_WIDTH - 80 - 32,
                      }}
                    />
                    {hasText && (
                      <TouchableOpacity
                        onPress={() => {
                          setTimeout(() => {
                            if (!hasText) return;
                            commentRef.current?.postComment(commentContent);
                          }, 0);
                        }}
                        accessibilityLabel="post comment"
                        disabled={posting || !hasText}
                        style={[
                          styles.postButton,
                          {
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            paddingRight: 4,
                            maxHeight: 124,
                          },
                        ]}>
                        <View style={styles.sendIconMain}>
                          <SendIcon />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              </KeyboardStickyView>}
            </View>
          )}
          {showRemoveTag && (
            <Confirm
              title={'Remove my tag from this post'}
              subTitle={''}
              discardCtaText={'Cancel'}
              continueCtaText={'Confirm'}
              onContinue={() => handleRemoveTag(tagToRemove)}
              onBackgroundClick={() => setShowRemoveTag(false)}
              onDiscard={() => setShowRemoveTag(false)}
              onCrossClick={() => setShowRemoveTag(false)}
              primaryColor="#E77237"
              secondaryColor="#E77237"
            />
          )}

          {/* Tags display */}
          {viewTagsDrawer && keyboardHeight < 1 && (
            <CustomBottomSheet
              onClose={() => setViewTagsDrawer(false)}
              snapPoints={[400]}
              useScrollView
              enableDynamicSizing={false}
              BottomSheetHeader={<ViewTagsHeader />}
              backgroundColor={theme.colors.background}>
              <View
                style={{
                  height: 400 - 12,
                  paddingBottom: bottom,
                }}>
                <GestureScrollView
                  style={{
                    paddingHorizontal: 28,
                    width: '100%',
                    height: '100%',
                    paddingTop: 60,
                  }}>
                  <Toast
                    position="bottom"
                    bottomOffset={20}
                    autoHide
                    visibilityTime={3000}
                  />
                  {singleStoryTags.length > 0 &&
                    singleStoryTags.map(({ _id, personalDetails }, index) => (
                      <View
                        key={_id}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingBottom: 10,
                          gap: 6,
                        }}>
                        {personalDetails.profilepic?.length > 0 ? (
                          <FastImage
                            source={{ uri: personalDetails.profilepic }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                            }}
                          />
                        ) : (
                          <DefaultImage
                            accessibilityLabel="author image"
                            fontWeight={700}
                            fontSize={15}
                            borderRadius={50}
                            height={40}
                            width={40}
                            firstName={personalDetails.name}
                            lastName={personalDetails.lastname}
                            gender={personalDetails.gender}
                          />
                        )}
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flex: 1,
                          }}>
                          <Text
                            variant="bold"
                            style={{
                              textAlign: 'left',
                              flex: 1,
                            }}>
                            {personalDetails.name} {personalDetails.lastname}{' '}
                          </Text>
                          {userId === _id && (
                            <Pressable
                              style={{
                                borderColor: theme.colors.orange,
                                borderWidth: 1,
                                borderRadius: 8,
                                padding: 6,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#fff',
                              }}
                              onPress={() => {
                                setTagToRemove(_id);
                                setShowRemoveTag(true);
                              }}>
                              <Text
                                style={{
                                  color: theme.colors.orange,
                                }}>
                                Remove Tag
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    ))}
                  <View style={{ height: 60 }} />
                </GestureScrollView>
              </View>
            </CustomBottomSheet>
          )}

          {showUsersLikes && (
            <CustomBottomSheet
              onClose={() => setShowUsersLikes(false)}
              enableDynamicSizing={false}
              snapPoints={[400]}
              useScrollView
              BottomSheetHeader={<ScrollViewHeader />}
              backgroundColor={theme.colors.background}>
              <PostLikes storyId={singleStory?._id} />
            </CustomBottomSheet>
          )}
        </View>
        {openFullScreen?.open && (
          <FullMediaViewer
            mediaUrls={singleStory?.contents?.[0]?.elements}
            selectedIndex={openFullScreen?.index ?? 0}
            visible={visible}
            onClose={() =>
              setOpenFullScreen({
                open: false,
                index: 0,
              })
            }
          />
        )}
      </View>
    </ErrorBoundary >
  );
}

function createStyles() {
  const theme = useTheme();
  return StyleSheet.create({
    parentContainer: {
      // marginHorizontal: 12,
      marginBottom: 200,
    },
    commentContent: {
      marginTop: 10,
      fontWeight: '600',
      fontSize: 16,
      color: 'black',
    },
    sendIconMain: {
      width: 28,
      height: 28,
      backgroundColor: '#E77237',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    commentBox: {
      // marginTop: 25,
      flexDirection: 'row',
      gap: 5,
      display: 'flex',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: theme.colors.onBackground,
    },
    postButton: {
      borderRadius: 4,
      width: 34,
      minHeight: 50,
      display: 'flex',
      alignItems: 'center',
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 20,
      flex: 1,
    },
    storyProfileImage: { width: 20, height: 20, borderRadius: 50 },
    storyPersonName: { fontSize: 16, color: 'black', fontWeight: 'bold' },
    storyTitleContainer: {
      flexDirection: 'column',
      alignItems: 'start',
      marginVertical: 10,
    },
    storyTitle: {
      fontSize: 20,
      color: '#fff',
      fontWeight: 'bold',
    },
    storyLocation: {
      fontSize: 15,
      color: 'black',
      fontWeight: '500',
    },
    videoContainer: {
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: { width: '100%', height: 350 },
    descriptionImage: {
      resizeMode: 'contain',
      width: '100%',
      height: '100%',
    },
    storyDescription: { fontWeight: '600', color: 'black', fontSize: 18 },
    ReadMore: { color: 'blue', fontWeight: 'bold' },
    fourOptions: { flexDirection: 'row', gap: 10, marginTop: 10, justifyContent: 'space-between', alignItems: 'center' },
    eventDate: {
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginLeft: 'auto',
    },
    eventDateText: { fontWeight: 'bold', color: 'black', fontSize: 14 },
    dateAndOptions: { flexDirection: 'row', gap: 10, marginTop: 10 },
    greyLine: {
      borderWidth: 1,
      borderColor: '#C3C3C3',
      marginBottom: 10,
      marginTop: 5,
    },
    likesAndComments: { flexDirection: 'row', gap: 5, alignItems: 'flex-start' },
    likesAndCommentsText: {
      fontSize: 12,
      color: '#777777',
    },
    likesAndCommentsContainer: {
      flexDirection: 'row',
      gap: 5,
      alignItems: 'flex-start',
    },
    postedAt: { marginLeft: 'auto', alignItems: 'flex-start' },
    collabBox: {
      transform: [{ translateX: -10 }],
      flex: 8.5,
    },
    quotesWrapper: {
      position: 'relative',
    },
    topQuote: {
      position: 'absolute',
    },
    bottomQuote: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      zIndex: -1,
    },
    closeWrapper: {
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      marginTop: -20,
      padding: 10,
      marginRight: -30,
      color: 'black',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: Platform.OS === 'ios' ? '40%' : '30%',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20,
      width: '85%',
      maxWidth: 400,
      minHeight: 100,
    },
    likeAnimation: {
      width: 26,
      height: 26,
      top: -2,
      left: -5,
      position: 'absolute',
    },
    saveAnimation: {
      width: 26,
      height: 26,
      top: -2,
      left: -6,
      position: 'absolute',
    },
    emptyStateTextContainer: {
      flexDirection: 'row',
      marginHorizontal: 25,
      gap: 8,
      alignItems: 'flex-start',
    },
    emptyStateTitle: {
      marginBottom: 10,
      textAlign: 'center',
    },
    emptyStateSubtitle: {
      fontSize: 20,
      textAlign: 'center',
    },
    emptyStateLockContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
  });
}
