/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  // KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
  Keyboard,
  useColorScheme,
  Dimensions,
  Pressable as RNPressable,
  Animated as RNAnimated,
  BackHandler,
} from 'react-native';
import {Button, Divider, Text} from 'react-native-paper';
import {
  SendIcon,
  CommunityReplayIcon,
  LikeButton,
  StorieEmptyState,
  UpVoteIcon,
  DownVoteIcon,
} from '../../../../images';
import Axios from './../../../../plugin/Axios';
import PostSlides from './../../CommunityComponents/PostSlides/Index';
import {GlobalHeader} from './../../../../components';
import theme from '../../../../common/NewTheme';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import DeleteIconCommunity from '../../../../images/Icons/DeleteIconCommunity';
import EditIconCommunity from '../../../../images/Icons/EditIconCommunity';
import EditIconDiscussion from '../../../../images/Icons/EditIconDiscussion';
import DeleteIconDiscussion from '../../../../images/Icons/DeleteIconDiscussion';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import CrossIconComment from '../../../../images/Icons/CrossIconComment';
import Spinner from '../../../../common/Spinner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SmallBottomSheet from '../../../../common/SmallBottomSheet';
import {DefaultImage} from '../../../../core';
import {Track} from '../../../../../App';
import NewTheme from '../../../../common/NewTheme';
import {setAdjustNothing} from 'rn-android-keyboard-adjust';
import {useNavigation} from '@react-navigation/core';
import {useFocusEffect} from '@react-navigation/native';
import {
  Pressable as GesturePressable,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import {
  formatLinkText,
  formatTagsText,
  timePassed,
} from '../../../../utils/format';
import HTMLView from 'react-native-htmlview';
import MentionsInput from '../../../MentionsInput';
import {useGetDiscussionData} from '../../../../store/apps/communitiesApi';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
  Easing,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';

const {height} = Dimensions.get('window');

const Pressable = Platform.OS === 'ios' ? RNPressable : GesturePressable;

const CommentItem = ({
  handleLayout,
  commentRef,
  comment,
  showReplies,
  toggleReplies,
  isTopLevel,
  onReply,
  depth = 1,
  handleLikeComment,
  deleteComment,
  handleEdit,
  userId,
  discussionOwnerId,
  highlight,
  memberStatus, // Accept memberStatus as a prop
  setMemberStatus,
  refetchFunction,
  communityId,
}) => {
  const {
    postedBy,
    replies = [],
    discussionReplies = [],
    createdAt,
    commentedAt,
  } = comment || {};
  const {personalDetails} = postedBy || {};
  const {profilepic, gender, name, lastname} = personalDetails || {};
  const [isLiked, setIsLiked] = useState(comment?.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment?.likescount || 0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [discussionCommentVotes, setDiscussionCommentVotes] = useState(comment);

  // Create separate opacity values for each button
  const [opacities] = useState(() => ({
    upvote: new RNAnimated.Value(1),
    downvote: new RNAnimated.Value(1),
    reply: new RNAnimated.Value(1),
    edit: new RNAnimated.Value(1),
    delete: new RNAnimated.Value(1),
    toggleReplies: new RNAnimated.Value(1),
  }));

  // useFocusEffect(
  //   React.useCallback(() => {
  //     /**
  //      * Toggle adjustments with a delay
  //      * so it works in Vivo20
  //      */
  //               console.log('ENTERED 2 ------ >')

  //     if (Platform.OS === 'android') {
  //       setAdjustPan();
  //     }
  //     const timer = setTimeout(() => {
  //       if (Platform.OS === 'android') {
  //         setAdjustNothing();
  //       }
  //     }, 500);
  //     return () => {
  //       if (Platform.OS === 'android') {
  //         setAdjustPan();
  //       }
  //       clearTimeout(timer);
  //     };
  //   }, []),
  // );

  useEffect(() => {
    setDiscussionCommentVotes(comment);
  }, [comment]);

  useEffect(() => {
    if (highlight) {
      const blinkInterval = setInterval(() => {
        setIsBlinking(isBlinking => !isBlinking);
      }, 1200);
      const stopBlinkingTimeout = setTimeout(() => {
        clearInterval(blinkInterval);
        setIsBlinking(false);
      }, 3000);
      return () => {
        clearInterval(blinkInterval);
        clearTimeout(stopBlinkingTimeout);
      };
    }
  }, [comment, highlight]);

  const onLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      await handleLikeComment(comment);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    }
  };

  const handleUpvoteDiscussionComment = async () => {
    const {
      userVote,
      discussionCommentUpvoteCount,
      discussionCommentDownvoteCount,
    } = discussionCommentVotes || {};
    let updatedVotes = {...discussionCommentVotes};

    switch (userVote) {
      case 'upvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: null,
          discussionCommentUpvoteCount: discussionCommentUpvoteCount - 1,
        };
        break;

      case 'downvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: 'upvote',
          discussionCommentUpvoteCount: discussionCommentUpvoteCount + 1,
          discussionCommentDownvoteCount: discussionCommentDownvoteCount - 1,
        };
        break;

      default: // null or anything else
        updatedVotes = {
          ...updatedVotes,
          userVote: 'upvote',
          discussionCommentUpvoteCount: discussionCommentUpvoteCount + 1,
        };
    }

    setDiscussionCommentVotes(updatedVotes);

    try {
      const commentVoteData = await Axios.post(
        `/upvote/discussionComment/${comment?._id}`,
        {communityId},
      );
      setDiscussionCommentVotes(commentVoteData?.data?.response);
    } catch (error) {}
  };

  const lastTapComment = useRef(null);

  const handleDoubleTapComment = () => {
    handleUpvoteDiscussionComment();
  };

  const handleDoubleTapAreaComment = () => {
    const now = Date.now();
    if (lastTapComment.current && now - lastTapComment.current < 300) {
      handleDoubleTapComment();
      lastTapComment.current = null;
    } else {
      lastTapComment.current = now;
      // reset after timeout so single tap doesn't do anything
      setTimeout(() => {
        lastTapComment.current = null;
      }, 300);
    }
  };

  const handleDownvoteDiscussionComment = async () => {
    const {
      userVote,
      discussionCommentUpvoteCount,
      discussionCommentDownvoteCount,
    } = discussionCommentVotes || {};
    let updatedVotes = {...discussionCommentVotes};

    switch (userVote) {
      case 'downvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: null,
          discussionCommentDownvoteCount: discussionCommentDownvoteCount - 1,
        };
        break;

      case 'upvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: 'downvote',
          discussionCommentUpvoteCount: discussionCommentUpvoteCount - 1,
          discussionCommentDownvoteCount: discussionCommentDownvoteCount + 1,
        };
        break;

      default: // null or anything else
        updatedVotes = {
          ...updatedVotes,
          userVote: 'downvote',
          discussionCommentDownvoteCount: discussionCommentDownvoteCount + 1,
        };
    }

    setDiscussionCommentVotes(updatedVotes);

    try {
      const commentVoteData = await Axios.post(
        `/downvote/discussionComment/${comment?._id}`,
        {communityId},
      );
      setDiscussionCommentVotes(commentVoteData?.data?.response);
    } catch (error) {}
  };

  const hasReplies = discussionReplies.length > 0;
  const isLastInDeepestChain = depth === 6 && !comment.replies?.length;

  const createOpacityHandlers = animatedValue => ({
    onPressIn: () => handlePressIn(animatedValue),
    onPressOut: () => handlePressOut(animatedValue),
  });

  const handlePressIn = opacityKey => {
    RNAnimated.timing(opacityKey, {
      toValue: 0.2, // Reduced opacity when pressed
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = opacityKey => {
    RNAnimated.timing(opacityKey, {
      toValue: 1, // Restore full opacity
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      key={comment._id}
      ref={ref => (commentRef.current[comment?._id] = ref)}
      style={[
        styles.commentItem,
        // isBlinking && styles.blinkingBackground, // Apply blinking style conditionally
        isTopLevel ? {} : {borderLeftWidth: 2, borderColor: '#B8B8B8'},
      ]}>
      <GestureDetector
        gesture={Gesture.Tap()
          .numberOfTaps(2)
          .onEnd((event, success) => {
            if (success) {
              runOnJS(handleUpvoteDiscussionComment)();
            }
          })}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}>
            {comment?.postedBy?.personalDetails?.profilepic ? (
              <Image
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 25,
                  resizeMode: 'cover',
                }}
                source={{
                  uri: comment?.postedBy?.personalDetails?.profilepic,
                }}
              />
            ) : (
              <View style={{marginRight: 4}}>
                <DefaultImage
                  gender={comment?.postedBy?.personalDetails?.gender}
                  size={24}
                  firstName={comment?.postedBy?.personalDetails?.name}
                  lastName={comment?.postedBy?.personalDetails?.lastname?.trim()}
                />
              </View>
            )}

            <Text
              style={{
                color: 'black',
                lineHeight: 16,
                maxWidth: '75%',
              }}
              variant="bold"
              numberOfLines={2}>
              {comment?.postedBy?.personalDetails?.name}
              <Text> </Text>
              {comment?.postedBy?.personalDetails?.lastname}
            </Text>
            {/* Comment Time */}
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: 'black',
              }}
            />
            <Text style={{fontSize: 10, lineHeight: 12}}>
              {timePassed(createdAt || commentedAt)}
            </Text>
          </View>

          <HTMLView
            value={`<p>${formatLinkText(formatTagsText(comment.text))}</p>`}
          />
        </View>
      </GestureDetector>

      <View style={styles.mainStyle}>
        <View style={styles.actionRow}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 10,
            }}>
            <Pressable
              onPressIn={() => handlePressIn(opacities.upvote)}
              onPressOut={() => handlePressOut(opacities.upvote)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessibilityLabel="toggleLike"
              onPress={() =>
                memberStatus === 'ACTIVE'
                  ? handleUpvoteDiscussionComment()
                  : null
              }>
              <RNAnimated.View style={{opacity: opacities.upvote}}>
                <UpVoteIcon
                  isUpvoted={discussionCommentVotes?.userVote === 'upvote'}
                />
              </RNAnimated.View>
            </Pressable>
            <Text
              style={{
                paddingHorizontal: 8,
                color:
                  discussionCommentVotes?.userVote === 'upvote'
                    ? '#078500'
                    : 'black',
                fontSize: 14,
              }}
              variant="bold">
              {discussionCommentVotes?.discussionCommentUpvoteCount}
            </Text>
            <Pressable
              onPressIn={() => handlePressIn(opacities.downvote)}
              onPressOut={() => handlePressOut(opacities.downvote)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessibilityLabel="toggleLike"
              onPress={() =>
                memberStatus === 'ACTIVE'
                  ? handleDownvoteDiscussionComment()
                  : null
              }>
              <RNAnimated.View style={{opacity: opacities.downvote}}>
                <DownVoteIcon
                  isDownvoted={discussionCommentVotes?.userVote === 'downvote'}
                />
              </RNAnimated.View>
            </Pressable>
            <Text
              style={{
                paddingHorizontal: 8,
                color:
                  discussionCommentVotes?.userVote === 'downvote'
                    ? '#c00000'
                    : 'black',
                fontSize: 14,
              }}
              variant="bold">
              {discussionCommentVotes?.discussionCommentDownvoteCount}
            </Text>
          </View>
          {!isLastInDeepestChain && (
            <Pressable
              onPressIn={() => handlePressIn(opacities.reply)}
              onPressOut={() => handlePressOut(opacities.reply)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.iconButton}
              onPress={() =>
                memberStatus === 'ACTIVE' ? onReply(comment) : null
              }>
              <RNAnimated.View style={{opacity: opacities.reply}}>
                <CommunityReplayIcon />
              </RNAnimated.View>
            </Pressable>
          )}

          {(comment?.postedBy?._id === userId ||
            discussionOwnerId === userId) && (
            <View style={{flexDirection: 'row'}}>
              {comment?.postedBy?._id === userId && (
                <Pressable
                  onPressIn={() => handlePressIn(opacities.edit)}
                  onPressOut={() => handlePressOut(opacities.edit)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  onPress={() => handleEdit(comment)}>
                  <RNAnimated.View style={{opacity: opacities.edit}}>
                    <EditIconCommunity />
                  </RNAnimated.View>
                </Pressable>
              )}

              {comment?.postedBy?._id === userId && (
                <Pressable
                  onPressIn={() => handlePressIn(opacities.delete)}
                  onPressOut={() => handlePressOut(opacities.delete)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  onPress={() => deleteComment(comment)}
                  style={{marginLeft: 10}}>
                  <RNAnimated.View style={{opacity: opacities.delete}}>
                    <DeleteIconCommunity />
                  </RNAnimated.View>
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          {isTopLevel && hasReplies && (
            <Pressable
              style={({pressed}) => [
                {
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={() => toggleReplies(comment?._id)}>
              <Text style={styles.replyToggle}>
                {showReplies ? 'Hide Replies' : 'See Replies'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      {showReplies && discussionReplies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.discussionReplies.map(reply => (
            <CommentItem
              commentRef={commentRef}
              reply={true}
              handleLayout={handleLayout}
              key={reply._id}
              comment={reply}
              showReplies={true}
              toggleReplies={toggleReplies}
              isTopLevel={false}
              onReply={onReply}
              depth={depth + 1}
              handleLikeComment={handleLikeComment}
              deleteComment={deleteComment}
              handleEdit={handleEdit}
              userId={userId}
              discussionOwnerId={discussionOwnerId}
              memberStatus={memberStatus}
              setMemberStatus={setMemberStatus}
              highlight={highlight}
              refetchFunction={refetchFunction}
              communityId={communityId}
            />
          ))}
        </View>
      )}
    </View>
  );
};

let voteTimeout;

export default function ViewSingleDiscussion({route}) {
  const {_id, screen} = route.params;
  const {data, isLoading, refetch} = useGetDiscussionData(_id);

  const [showReplies, setShowReplies] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [discussionComments, setDiscussionComments] = useState([]);
  const [discussionData, setDiscussionData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [replyId, setReplyId] = useState();
  const [memberStatus, setMemberStatus] = useState(null);
  const [isCommenting, setCommenting] = useState(false);
  const [openConfirmPopupDeleteDiscussion, seOpenConfirmPopupDeleteDiscussion] =
    useState(false);
  const [openConfirmPopupDeleteComment, seOpenConfirmPopupDeleteComment] =
    useState(false);

  const [editId, setEditId] = useState();
  const [editComment, setEditComment] = useState();
  const navigation = useNavigation();
  const [memberRole, setMemberRole] = useState();
  const [deleteCommentId, setDeleteCommentId] = useState();
  const [newlyPostedCommentId, setNewlyPostedCommentId] = useState(null);
  const bottomSheetRef = useRef(null);
  const [disscussionNotFound, setDisscussionNotFound] = useState(false);
  const {_id: userId, userRoles} = useSelector(state => state?.userInfo);
  const userInfo = useSelector(state => state?.userInfo);
  const [url, setUrl] = useState(null);
  const [disscussionCreationDate, setDisscussionCreationDate] = useState(null);
  const [commentTyped, setCommentTyped] = useState(true);
  const [disableBackButton, setDisableBackButton] = useState(false);

  const colorScheme = useColorScheme();
  const [discussionVotes, setDiscussionVotes] = useState(null);
  const [userVoted, setuserVoted] = useState(false);
  const [opacities] = useState(() => ({
    upvote: new RNAnimated.Value(1),
    downvote: new RNAnimated.Value(1),
    descripion: new RNAnimated.Value(1),
  }));

  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });
  const keyboardHeight = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!disableBackButton) return;

    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
    });

    return unsubscribe;
  }, [navigation, disableBackButton]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, event => {
      keyboardHeight.value = withTiming(event.endCoordinates.height, {
        duration: Platform.OS === 'ios' ? 50 : 100,
        easing: Easing.out(Easing.ease),
      });
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      keyboardHeight.value = withTiming(0, {
        duration: Platform.OS === 'ios' ? 50 : 100,
        easing: Easing.out(Easing.ease),
      });
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    const isKeyboardOpen = keyboard.height.value > 0;
    return {
      transform: [
        {
          translateY: isKeyboardOpen
            ? -keyboard.height.value + insets.bottom
            : -keyboard.height.value,
        },
      ],
    };
  });

  const animatedStylesIOS = useAnimatedStyle(() => {
    const isKeyboardOpen = keyboardHeight.value > 0;
    const offset = isKeyboardOpen
      ? -keyboardHeight.value + insets.bottom
      : -keyboardHeight.value;
    return {
      transform: [{translateY: offset}],
    };
  });

  useFocusEffect(
    React.useCallback(() => {
      /**
       * Toggle adjustments with a delay
       * so it works in Vivo20
       */
      if (Platform.OS === 'android') {
        setAdjustNothing();
      }
      const timer = setTimeout(() => {
        if (Platform.OS === 'android') {
          setAdjustNothing();
        }
      }, 500);
      return () => {
        if (Platform.OS === 'android') {
          setAdjustNothing();
        }
        clearTimeout(timer);
      };
    }, []),
  );

  // Sync query data with state when it changes
  useEffect(() => {
    if (data) {
      setDiscussionData(data?.data);
      setDiscussionVotes(data?.data);
      setDiscussionComments(data?.discussionComments);
      setMemberRole(data?.loggedInMemberData?.memberRole);
      setMemberStatus(data?.loggedInMemberData?.memberStatus);
    }
  }, [data]);

  const toggleReplies = commentId => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setLoader(false);
    refetch();
  };

  const handleReply = comment => {
    setEditId(null);
    setEditComment(null);
    setCommentText(null);
    setReplyId(comment?._id);
    setReplyTo(comment);
  };
  const handleEdit = comment => {
    setReplyTo(null);
    setEditId(comment?._id);
    setEditComment(comment);
    setCommentText(comment?.text);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
      };
    }, []),
  );

  const goBack = useCallback(
    dispatchAction => {
      Keyboard.dismiss();

      if (screen === 'home' && route?.params?.updated) {
        route?.params?.routeParamsForsetData?.onGoBack({
          newUpdated: Math.random(),
          newDiscussionData: route?.params?.newDiscussionData,
          thumbnailUrl: url,
          createdAt: disscussionCreationDate,
        });
      } else if (screen === 'community' && route?.params?.updated) {
        route?.params?.routeParamsForsetData?.onGoBack?.({
          newUpdated: Math.random(),
          communityId: discussionData?.communityDetails?._id,
          newDiscussionData: route?.params?.newDiscussionData,
          thumbnailUrl: url,
          createdAt: disscussionCreationDate,
        });
      } else {
        if (route.params?.onGoBack && userVoted) {
          route.params.onGoBack({
            discussionId: discussionData?._id,
            ...discussionVotes,
          });
        }
      }

      if (dispatchAction) {
        navigation.dispatch(dispatchAction);
      } else {
        navigation.goBack();
      }
    },
    [
      navigation,
      route,
      screen,
      discussionData,
      userVoted,
      url,
      disscussionCreationDate,
      discussionVotes,
    ],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault(); // stop default back
      goBack(e.data.action); // pass the original action
    });

    return unsubscribe;
  }, [navigation, goBack]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [goBack]),
  );

  const handleCreateDiscussionComment = async () => {
    try {
      const uniqueTagIds = [
        ...new Set(
          commentText
            .match(/imeuswe:([a-f0-9]+)/g)
            ?.map(id => id.split(':')[1]),
        ),
      ];

      const payload = {
        comment: commentText,
        tagUserIds: uniqueTagIds,
        communityId: data?.data?.communityDetails?._id,
      };

      const createDiscussionData = await Axios.post(
        `/createDiscussionComment/${_id}`,
        payload,
      );

      setCommentText('');

      if (createDiscussionData) {
        setReplyTo(null);
        refetch();
        setNewlyPostedCommentId(
          createDiscussionData?.createDiscussionData?.discussionCommentData
            ?._id,
        );
        setTimeout(() => {
          setNewlyPostedCommentId(null);
        }, 5000);
      }
    } catch (error) {}
  };

  const handleReplyDiscussionComment = async () => {
    try {
      const uniqueTagIds = [
        ...new Set(
          commentText
            .match(/imeuswe:([a-f0-9]+)/g)
            ?.map(id => id.split(':')[1]),
        ),
      ];
      const payload = {
        replyText: commentText,
        tagUserIds: uniqueTagIds,
        communityId: data?.data?.communityDetails?._id,
      };

      const data1 = await Axios.post(
        `/replyDiscussionComment/${_id}/${replyId}`,
        payload,
      );
      setCommentText('');

      if (data1) {
        setReplyTo(null);
        refetch();
      }
    } catch (error) {}
  };

  useEffect(() => {
    const fetchDiscussionData = async () => {
      try {
        setLoader(true);
        const {data} = await refetch(); // Await refetch to get new data
        if (!data || !data?.data) {
          setDisscussionNotFound(true); // ✅ Set state if API does not return data
        }
      } catch (error) {
        setDisscussionNotFound(true);
      } finally {
        setLoader(false);
      }
    };

    if (!_id) {
      return;
    }
    fetchDiscussionData();

    // Generated Thumb
    if (route?.params?.thumbnailUrl && route?.params?.createdAt) {
      setUrl(route?.params?.thumbnailUrl);
      setDisscussionCreationDate(route?.params?.createdAt);
    }
  }, [navigation, route, _id]);

  const handlecancleEdit = () => {
    setEditId(null);
    setEditComment(null);
    setCommentText(null);
  };

  const capitalizeFirstLetter = str => {
    if (typeof str !== 'string') return str;
    return str?.charAt?.(0)?.toUpperCase() + str?.slice?.(1);
  };

  const handleEditComment = async () => {
    try {
      const uniqueTagIds = [
        ...new Set(
          commentText
            .match(/imeuswe:([a-f0-9]+)/g)
            ?.map(id => id.split(':')[1]),
        ),
      ];

      const payload = {
        comment: commentText,
        tagUserIds: uniqueTagIds,
      };
      const response = await Axios.put(
        `editDiscussionComment/${editId}`,
        payload,
      );
      if (response.data) {
        refetch();
        setEditId(null);
        setEditComment(null);
        setCommentText(null);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    }
  };
  const handlecancleReply = async () => {
    setReplyTo(null);
  };

  const handleLikePost = async () => {
    setDiscussionData(prevData => ({
      ...prevData,
      isLiked: !prevData.isLiked,
      likescount: prevData.isLiked
        ? prevData.likescount - 1
        : prevData.likescount + 1,
    }));

    try {
      await Axios.put(`markDiscussionLikes/${_id}`);
    } catch (error) {
      setDiscussionData(prevData => ({
        ...prevData,
        isLiked: !prevData.isLiked,
        likescount: prevData.isLiked
          ? prevData.likescount + 1
          : prevData.likescount - 1,
      }));
    }
  };

  const handleUpvotePost = async () => {
    const {userVote, discussionUpvoteCount, discussionDownvoteCount} =
      discussionVotes || {};
    let updatedVotes = {...discussionVotes};

    switch (userVote) {
      case 'upvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: null,
          discussionUpvoteCount: discussionUpvoteCount - 1,
        };
        break;

      case 'downvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: 'upvote',
          discussionUpvoteCount: discussionUpvoteCount + 1,
          discussionDownvoteCount: discussionDownvoteCount - 1,
        };
        break;

      default: // null or anything else
        updatedVotes = {
          ...updatedVotes,
          userVote: 'upvote',
          discussionUpvoteCount: discussionUpvoteCount + 1,
        };
    }

    setDiscussionVotes(updatedVotes);

    try {
      const VoteData = await Axios.post(`/upvote/discussion/${_id}`, {
        communityId: data?.data?.communityDetails?._id,
      });

      setuserVoted(true);
      setDiscussionVotes(VoteData?.data?.response);
    } catch (error) {}
  };

  const lastTap = useRef(null);

  const handleDoubleTap = () => {
    handleUpvotePost();
  };

  const handleDoubleTapArea = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      handleDoubleTap();
      lastTap.current = null;
    } else {
      lastTap.current = now;
      // reset after timeout so single tap doesn't do anything
      setTimeout(() => {
        lastTap.current = null;
      }, 300);
    }
  };

  const handleDownvotePost = async () => {
    const {userVote, discussionUpvoteCount, discussionDownvoteCount} =
      discussionVotes || {};
    let updatedVotes = {...discussionVotes};

    switch (userVote) {
      case 'downvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: null,
          discussionDownvoteCount: discussionDownvoteCount - 1,
        };
        break;

      case 'upvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: 'downvote',
          discussionUpvoteCount: discussionUpvoteCount - 1,
          discussionDownvoteCount: discussionDownvoteCount + 1,
        };
        break;

      default: // null or anything else
        updatedVotes = {
          ...updatedVotes,
          userVote: 'downvote',
          discussionDownvoteCount: discussionDownvoteCount + 1,
        };
    }

    setDiscussionVotes(updatedVotes);

    try {
      const VoteData = await Axios.post(`/downvote/discussion/${_id}`, {
        communityId: data?.data?.communityDetails?._id,
      });

      setuserVoted(true);
      setDiscussionVotes(VoteData?.data?.response);
    } catch (error) {}
  };

  const handleLikeComment = async comment => {
    try {
      const data = await Axios.put(`markDiscussionCommentLikes/${comment._id}`);
      return data.data;
    } catch (error) {}
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const deleteDiscussion = async () => {
    try {
      const response = await Axios.delete(`discussion/${_id}`);
      if (response?.data?.success) {
        if (screen === 'community') {
          route.params.onGoBack({
            random: Math.random(),
            _id: _id, // Update or pass new parameters
          });
          // Go back to the previous screen
          navigation.goBack();
        } else {
          route.params.onGoBack({
            random: Math.random(),
            _id: _id, // Update or pass new parameters
          });
          // Go back to the previous screen
          navigation.goBack();
        }
      }
      /* customer io and mixpanel event changes  start */
      const props = {
        community_name: discussionData?.communityDetails?.communityName,
        title: discussionData?.title,
      };
      Track({
        cleverTapEvent: 'discussion_deleted',
        mixpanelEvent: 'discussion_deleted',
        userInfo,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      /* clevertap and mixpanel events ---end****/
    } catch (error) {}
  };

  const deleteComment = async comment => {
    try {
      if (memberStatus !== 'ACTIVE') {
        return;
      }
      setDeleteCommentId(comment?._id);
      seOpenConfirmPopupDeleteComment(true);
    } catch (error) {}
  };

  const handleDeleteComment = async () => {
    const response = await Axios.delete(
      `deleteDiscussionComment/${_id}/${deleteCommentId}`,
    );
    if (response?.data) {
      refetch();
    }
  };
  const editDiscussion = () => {
    navigation.navigate('CreateCommunityPosts', {
      previousRouteParams: route?.params,
      discussionData: discussionData,
      action: 'Edit',
      screen: screen,
    });
  };
  const options = [
    {
      icon: EditIconDiscussion,
      text: 'Edit Discussion',
      onPress: () => {
        editDiscussion();
      },
    },
    {
      icon: DeleteIconDiscussion,
      text: 'Delete Discussion',
      onPress: () => {
        seOpenConfirmPopupDeleteDiscussion(true);
      },
    },
  ];

  const openModelBottom = () => {
    bottomSheetRef.current?.open();
  };

  useEffect(() => {
    if (commentText?.length === 0 || !commentText) {
      setCommentTyped(true);
    }
  }, [commentText]);

  const goToCommunity = item => {
    navigation.replace('CommunityDetails', {
      item: item,
      fromInsideDiscussion: Math.random(),
    });
  };

  const scrollViewRef = useRef(null);
  const commentRef = useRef({});

  const scrollToItem = commentid => {
    const targetRef = commentRef.current[commentid];
    if (targetRef) {
      targetRef.measureLayout(
        scrollViewRef.current, // ScrollView container
        (x, y) => {
          scrollViewRef.current.scrollTo({x: 0, y, animated: true});
        },
        error => {},
      );
    }
  };

  useEffect(() => {
    setLoader(true);
    if (route?.params?.type === 'reply' && route?.params?.mainCommentId) {
      toggleReplies(route?.params?.mainCommentId);
    }
    if (route?.params?.type === 'reply' && route?.params?.replyId) {
      setTimeout(() => {
        scrollToItem(route?.params?.replyId);
      }, 1000);
    }
    if (route?.params?.type === 'mainComment' && route?.params?.mainCommentId) {
      setTimeout(() => {
        scrollToItem(route?.params?.mainCommentId);
      }, 1000);
    }
  }, [route?.params]);

  if (isLoading || disableBackButton) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Spinner />
      </View>
    );
  }

  const handlePressIn = opacityKey => {
    RNAnimated.timing(opacityKey, {
      toValue: 0.2, // Reduced opacity when pressed
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = opacityKey => {
    RNAnimated.timing(opacityKey, {
      toValue: 1, // Restore full opacity
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const setDisableBackAction = param => {
    setDisableBackButton(param);
  };

  return (
    <>
      <GlobalHeader
        onBack={goBack}
        backgroundColor={theme.colors.backgroundCreamy}
        onPressAction={
          discussionData?.owner?._id === userId && memberStatus === 'ACTIVE'
            ? openModelBottom
            : false
        }
      />
      {openConfirmPopupDeleteDiscussion && (
        <Confirm
          title="Are you sure you want to delete this discussion"
          subTitle=""
          discardCtaText="Cancel"
          continueCtaText="Delete"
          onContinue={() => {
            seOpenConfirmPopupDeleteDiscussion(false);
            deleteDiscussion();
          }}
          onDiscard={() => {
            seOpenConfirmPopupDeleteDiscussion(false);
          }}
          accessibilityLabel="confirm-popup-basic-fact"
          onCrossClick={() => seOpenConfirmPopupDeleteDiscussion(false)}
        />
      )}

      {openConfirmPopupDeleteComment && (
        <Confirm
          title="Are you sure you want to delete this comment"
          subTitle=""
          discardCtaText="Cancel"
          continueCtaText="Delete"
          onContinue={() => {
            seOpenConfirmPopupDeleteComment(false);
            handleDeleteComment();
          }}
          onDiscard={() => {
            seOpenConfirmPopupDeleteComment(false);
          }}
          accessibilityLabel="confirm-popup-basic-fact"
          onCrossClick={() => seOpenConfirmPopupDeleteComment(false)}
        />
      )}
      {disscussionNotFound ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -100,
          }}>
          <StorieEmptyState />
          <View style={styles.emptyStateTextContainer}>
            <View>
              <View style={styles.emptyStateLockContainer}>
                <Icon
                  name="lock"
                  size={28}
                  color={'#000'}
                  style={{
                    paddingTop: 6,
                  }}
                />
                <Text variant="headlineLarge" style={styles.emptyStateTitle}>
                  This post isn&apos;t available.
                </Text>
              </View>
              <Text style={styles.emptyStateSubtitle}>
                When this happens, it&apos;s usually because owner has deleted
                the post.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <SafeAreaView
          style={[
            styles.container,
            {
              paddingBottom: insets.bottom,
              backgroundColor: theme.colors.backgroundCreamy,
            },
          ]}>
          <ScrollView style={styles.scrollableSection} ref={scrollViewRef}>
            <View style={styles.content}>
              <View style={styles.main}>
                <View
                  style={styles.shadow}
                  accessibilityLabel="Discussion post">
                  <View style={styles.nameTextMain}>
                    {discussionData?.owner?.personalDetails?.profilepic ? (
                      <Image
                        style={{
                          width: 25,
                          height: 25,
                          borderRadius: 25,
                          resizeMode: 'cover',
                        }}
                        source={{
                          uri: discussionData?.owner?.personalDetails
                            ?.profilepic,
                        }}
                        accessibilityLabel="User profile picture"
                      />
                    ) : (
                      <View
                        style={{marginRight: 4}}
                        accessibilityLabel="Default user profile picture">
                        <DefaultImage
                          gender={
                            discussionData?.owner?.personalDetails?.gender
                          }
                          size={24}
                          firstName={
                            discussionData?.owner?.personalDetails?.name
                          }
                          lastName={discussionData?.owner?.personalDetails?.lastname?.trim()}
                        />
                      </View>
                    )}
                    <Text
                      variant="bold"
                      style={{fontSize: 16, paddingLeft: 3, color: 'black'}}
                      accessibilityLabel={`Posted by ${discussionData?.owner?.personalDetails?.name} ${discussionData?.owner?.personalDetails?.lastname}`}>
                      {discussionData?.owner?.personalDetails?.name}
                      <Text> </Text>
                      {discussionData?.owner?.personalDetails?.lastname}
                    </Text>
                  </View>
                  <GestureDetector
                    gesture={Gesture.Tap()
                      .maxDuration(250)
                      .numberOfTaps(2)
                      .onEnd((event, success) => {
                        if (success) {
                          runOnJS(handleUpvotePost)(); // your double-tap action
                        }
                      })}>
                    <View>
                      {discussionData?.mediaDetails?.length > 0 && (
                        <PostSlides
                          mediaUrls={discussionData?.mediaDetails}
                          aspectRatio={1}
                          discussionData={discussionData}
                          thumbnailUrl={
                            discussionData?.createdAt ===
                              disscussionCreationDate && url
                              ? url
                              : null
                          }
                          disableBackAction={setDisableBackAction}
                        />
                      )}
                    </View>
                  </GestureDetector>
                  <View
                    style={{
                      padding: 10,
                      paddingTop: 0,
                      marginTop: 0,
                    }}>
                    <GestureDetector
                      gesture={Gesture.Tap()
                        .maxDuration(250)
                        .numberOfTaps(2)
                        .onEnd((event, success) => {
                          if (success) {
                            runOnJS(handleUpvotePost)(); // your double-tap action
                          }
                        })}>
                      <View>
                        <TouchableOpacity
                          style={{
                            alignSelf: 'flex-start',
                          }}
                          hitSlop={{top: 10, bottom: 10, right: 10, left: 10}}
                          disabled={
                            discussionData?.owner?.userRoles?.includes('COM')
                              ? userRoles?.includes('COM')
                                ? false
                                : true
                              : false
                          }
                          onPress={() =>
                            goToCommunity(discussionData?.communityDetails)
                          }>
                          <Text
                            accessibilityLabel={`Community name: ${discussionData?.communityDetails?.communityName}`}
                            style={{
                              color: '#FF725E',
                              fontSize: 15,
                              fontWeight: '600',
                              paddingBottom: 10,
                            }}>
                            {discussionData?.communityDetails?.communityName}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </GestureDetector>
                    <GestureDetector
                      gesture={Gesture.Tap()
                        .maxDuration(250)
                        .numberOfTaps(2)
                        .onEnd((event, success) => {
                          if (success) {
                            runOnJS(handleUpvotePost)(); // your double-tap action
                          }
                        })}>
                      <View>
                        <Text
                          accessibilityLabel={`Discussion title: ${discussionData?.title}`}
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: 'black',
                          }}>
                          {discussionData?.title}
                        </Text>

                        <HTMLView
                          value={`<p>${formatLinkText(
                            formatTagsText(
                              isExpanded
                                ? discussionData?.shortDescription
                                : discussionData?.shortDescription?.length > 200
                                  ? `${discussionData.shortDescription.substring(0, 200)}...`
                                  : discussionData?.shortDescription,
                            ),
                          )}</p>`}
                        />
                        {discussionData?.shortDescription?.length > 200 && (
                          <GesturePressable
                            onPressIn={() =>
                              handlePressIn(opacities.descripion)
                            }
                            onPressOut={() =>
                              handlePressOut(opacities.descripion)
                            }
                            onPress={() => toggleExpanded()}
                            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                            style={{paddingTop: 10}}
                            accessibilityLabel={
                              isExpanded ? 'Show less' : 'Read more'
                            }>
                            <RNAnimated.View
                              style={{opacity: opacities.descripion}}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: '600',
                                  color: '#E77237',
                                }}>
                                {isExpanded ? 'Show Less' : 'Read More'}
                              </Text>
                            </RNAnimated.View>
                          </GesturePressable>
                        )}
                      </View>
                    </GestureDetector>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 10,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 20,
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          justifyContent: 'space-between',
                          backgroundColor: 'white',
                          borderWidth: 1.3,
                          borderColor: '#dbdbdb',
                        }}>
                        <Pressable
                          onPressIn={() => handlePressIn(opacities.upvote)}
                          onPressOut={() => handlePressOut(opacities.upvote)}
                          accessibilityLabel="toggleLike"
                          style={{marginLeft: -5}}
                          onPress={() => {
                            handleUpvotePost();
                          }}>
                          <RNAnimated.View style={{opacity: opacities.upvote}}>
                            <UpVoteIcon
                              isUpvoted={
                                discussionVotes?.userVote === 'upvote'
                                  ? true
                                  : false
                              }
                            />
                          </RNAnimated.View>
                        </Pressable>
                        <Text
                          style={{
                            paddingHorizontal: 10,
                            //  borderWidth: 1,
                            color:
                              discussionVotes?.userVote === 'upvote'
                                ? '#078500'
                                : 'black',
                            fontSize: 14,
                          }}
                          variant="bold"
                          accessibilityLabel={`LikesCount: ${discussionVotes?.likescount}`}>
                          {discussionVotes?.discussionUpvoteCount}
                        </Text>
                        <View
                          style={{
                            backgroundColor: 'lightgrey',
                            height: 18,
                            width: 1.5,
                          }}></View>
                        <Pressable
                          onPressIn={() => handlePressIn(opacities.downvote)}
                          onPressOut={() => handlePressOut(opacities.downvote)}
                          accessibilityLabel="toggleLike"
                          style={{marginLeft: 6}}
                          onPress={() => {
                            handleDownvotePost();
                          }}>
                          <RNAnimated.View
                            style={{opacity: opacities.downvote}}>
                            <DownVoteIcon
                              isDownvoted={
                                discussionVotes?.userVote === 'downvote'
                                  ? true
                                  : false
                              }
                              size={20}
                            />
                          </RNAnimated.View>
                        </Pressable>
                        <Text
                          style={{
                            paddingHorizontal: 8,
                            color:
                              discussionVotes?.userVote === 'downvote'
                                ? '#c00000'
                                : 'black',
                            fontSize: 14,
                          }}
                          variant="bold"
                          accessibilityLabel={`LikesCount: ${discussionVotes?.discussonDownvoteCount}`}>
                          {discussionVotes?.discussionDownvoteCount}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={{color: 'black', fontSize: 14}}
                          variant="bold"
                          accessibilityLabel={`Posted on ${moment(discussionData?.createdAt).format('Do MMM YYYY')}`}>
                          {moment(discussionData?.createdAt).format(
                            'Do MMM YYYY',
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{marginHorizontal: 10}}>
                  {/* <Divider
                  bold
                  style={{
                    borderColor: '#B4B4B4',
                    borderWidth: 1,
                    marginBottom: 10,
                    marginTop: -5,
                  }}
                /> */}
                </View>
                <View style={{marginBottom: insets.bottom + height * 0.08}}>
                  {discussionComments
                    .slice()
                    .reverse()
                    .map(comment => (
                      <View key={comment._id}>
                        <CommentItem
                          commentRef={commentRef}
                          comment={comment}
                          showReplies={showReplies[comment?._id]}
                          toggleReplies={toggleReplies}
                          isTopLevel={true}
                          onReply={handleReply}
                          handleLikeComment={handleLikeComment}
                          deleteComment={deleteComment}
                          handleEdit={handleEdit}
                          userId={userId}
                          discussionOwnerId={discussionData?.owner?._id}
                          highlight={comment._id === newlyPostedCommentId}
                          memberStatus={memberStatus}
                          setMemberStatus={setMemberStatus}
                          refetchFunction={refetch}
                          communityId={data?.data?.communityDetails?._id}
                        />
                      </View>
                    ))}
                </View>
              </View>
            </View>
          </ScrollView>
          <Animated.View
            style={[styles.container1, {paddingBottom: keyboardHeight}]}>
            <Animated.View
              style={[
                styles.inputContainer1,
                Platform.OS === 'ios' ? animatedStylesIOS : animatedStyles,
              ]}>
              <View style={styles.replyInputContainer}>
                {replyTo && (
                  <View style={styles.replyingToText}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{color: 'gray', flex: 1}}>
                      Replying to
                      <Text style={{fontWeight: 'bold', color: 'gray'}}>
                        <Text></Text> {replyTo.postedBy?.personalDetails?.name}{' '}
                        {replyTo.postedBy?.personalDetails?.lastname}
                      </Text>
                      : {replyTo.text}
                    </Text>
                    <TouchableOpacity
                      onPress={handlecancleReply}
                      style={styles.cancelIcon}>
                      <CrossIconComment />
                    </TouchableOpacity>
                  </View>
                )}

                {editComment && (
                  <View style={styles.replyingToText}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{color: 'gray', flex: 1, fontWeight: 'bold'}}
                      accessibilityLabel="Editing comment">
                      Editing Comment
                    </Text>
                    <TouchableOpacity
                      onPress={handlecancleEdit}
                      style={styles.cancelIcon}
                      accessibilityLabel="Cancel edit">
                      <CrossIconComment />
                    </TouchableOpacity>
                  </View>
                )}
                <ScrollView
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps={'always'}
                  bounces={false}
                  style={[
                    {
                      maxHeight: 124,
                    },
                    memberStatus === 'ACTIVE' && {
                      borderColor: isCommenting
                        ? NewTheme.colors.primaryOrange
                        : 'black',
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                  ]}
                  showsVerticalScrollIndicator={false}>
                  <View style={styles.inputContainer}>
                    {memberStatus === 'ACTIVE' && (
                      <>
                        <MentionsInput
                          placeholder={
                            replyTo ? 'Add a reply' : 'Add a comment'
                          }
                          required
                          autoCorrect={true}
                          useCommunityApi={true}
                          inputHeight={100}
                          textVerticalAlign="top"
                          showBorder={false}
                          style={styles.replyInputMain}
                          accessibilityLabel="Comment input field"
                          value={commentText}
                          onChangeText={text => {
                            let inputValue = text;
                            if (text?.length > 0 && commentTyped) {
                              inputValue = capitalizeFirstLetter(inputValue);
                              setTimeout(() => {
                                setCommentTyped(false);
                              }, 1000);
                            }
                            if (
                              text?.length === 0 ||
                              commentText?.length === 0 ||
                              !commentText
                            ) {
                              setCommentTyped(true);
                            }
                            setCommentText(inputValue);
                          }}
                          onFocus={() => setCommenting(true)}
                          onBlur={() => setCommenting(false)}
                          placeholderTextColor="gray"
                          communityId={discussionData?.communityDetails?._id}
                        />
                        <TouchableOpacity
                          style={styles.sendButtonMain}
                          onPress={() => {
                            Keyboard.dismiss();
                            if (editComment) {
                              handleEditComment();
                            } else if (replyTo) {
                              handleReplyDiscussionComment();
                            } else {
                              handleCreateDiscussionComment();
                            }
                            /* customer io and mixpanel event changes  start */
                            const props = {
                              community_name:
                                discussionData?.communityDetails?.communityName,
                              title: discussionData?.title,
                              category:
                                discussionData?.communityDetails?.categoryName,
                            };
                            Track({
                              cleverTapEvent: 'commented_on_discussion',
                              mixpanelEvent: 'commented_on_discussion',
                              userInfo,
                              cleverTapProps: props,
                              mixpanelProps: props,
                            });
                            /* clevertap and mixpanel events ---end****/
                          }}
                          accessibilityLabel="Send comment">
                          {commentText?.trim()?.length > 0 && (
                            <View style={styles.sendIconMain}>
                              <SendIcon />
                            </View>
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </ScrollView>
              </View>
            </Animated.View>
          </Animated.View>
          <SmallBottomSheet
            ref={bottomSheetRef}
            options={options}
            customOptionStyle={{fontSize: 18, color: 'black'}}
            optionVariant="bold"
            enableCrossIcon={false}
            containerStyle={{height: 170}}
            disableSnapPoint={true}
            enableDynamicSizingProp={false}
            contentHeight={300}
          />
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container1: {
    justifyContent: 'flex-end', // Align content to the bottom
  },
  inputContainer1: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input1: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
  },
  fixedBottom: {},
  fixedText: {
    fontSize: 20,
    color: '#fff',
  },
  content: {
    paddingBottom: 10,
  },
  scrollableSection: {
    flex: 1,
    paddingHorizontal: 10,
  },
  commentContainer: {
    marginVertical: 5,
    paddingLeft: 20,
    borderLeftWidth: 2,
    borderColor: '#B8B8B8',
    marginLeft: -10,
  },
  nameText: {
    marginBottom: 2,
    // paddingBottom: 20,
    color: 'black',
  },
  nameTextMain: {
    padding: 10,
    paddingLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 16,
    // marginBottom: 5,
    color: 'black',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  iconButton: {
    marginRight: 10,
  },
  iconText: {
    color: '#007BFF',
  },
  replyToggle: {
    color: '#E77237',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFEAE0',
    paddingBottom: 10,
    paddingTop: 10,
  },
  repliesContainer: {
    paddingLeft: 20,
  },
  replyInputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: 'transparent',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    borderWidth: 1,
  },
  replyingToText: {
    height: 40,
    backgroundColor: '#EEEEEE',
    padding: 10,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    color: 'gray',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelIcon: {
    color: 'gray',
    paddingLeft: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    backgroundColor: 'white',
  },
  headerIcon: {width: 30, height: 30, marginLeft: 10},

  mainStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 5,
    marginRight: 30,
    justifyContent: 'space-between',
  },
  replyInput: {
    flex: 1,
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingRight: 40,
    color: '#000000',
  },
  replyInputMain: {
    // flex: 1,
    // maxHeight: 100,
    // marginBottom: 0,
    // padding: 10,
    // textAlignVertical: 'center',
    // backgroundColor: '#FFFFFF',
    // borderBottomRightRadius: 8,
    // borderBottomLeftRadius: 8,
    borderWidth: 0,
    paddingRight: 40,
    color: 'black',
  },
  sendButton: {
    position: 'absolute',
    right: 10,
    top: 6,
  },
  sendIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#E77237',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  sendButtonMain: {
    position: 'absolute',
    right: 10,
    bottom: Platform.OS === 'ios' ? 5 : 7,
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
  commentItem: {
    marginVertical: 5,
    paddingLeft: 20,

    marginLeft: -10,
    backgroundColor: 'transparent',
  },
  blinkingBackground: {
    backgroundColor: '#fce4ca',
    animationName: 'blinking',
    animationDuration: '4s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
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
