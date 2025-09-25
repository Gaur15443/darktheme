import React, { useEffect, useState, useMemo, memo, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import {
  createComment,
  deleteComment,
  fetchStoryCommentByID,
  likeComment,
  likeReply,
  resetCommentEmptyStatus,
  resetStoryComments,
  setNewStoryComments,
  setStoryReply,
  toggleCommentReply,
  updateCommentsCount,
} from '../../../store/apps/story';
import { Text, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LikeButton, CommentDeleteIcon, CommunityReplayIcon as ReplyIcon, } from '../../../images';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import Confirm from '../../Confirm';
import DefaultImage from '../DefaultImage';
import HTMLView from 'react-native-htmlview';
import { formatTagsText, formatLinkText } from './../../../utils/format';
import LottieView from 'lottie-react-native';
import { colors } from '../../../common/NewTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue } from 'react-native-reanimated';

const Comments = forwardRef(({ personReplyingTo, onPersonReplyingToChange, onPostingChange, onPostedComment }, ref) => {
  const dispatch = useDispatch();
  const { bottom } = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        progress.value = e.progress;
        height.value = e.height;
      }
    },
    {
      onEnd: (e) => {
        'worklet';
        progress.value = e.progress;
        height.value = e.height;
      }
    },
    []
  );


  const singleStory = useSelector(state => state.story.singleStory);
  const userId = useSelector(state => state.userInfo._id);
  const personalDetails = useSelector(state => state.userInfo.personalDetails);
  const getStoryComments = useSelector(state => state.story.storyComments);

  const [tempLiked, setTempLiked] = useState({
    index: 0,
    liked: false,
  });

  const [tempLikedReply, setTempLikedReply] = useState({
    index: 0,
    liked: false,
    parentId: null,
  });
  const [showReply, setShowReply] = useState(false);
  const [commentReplyIndex, setCommentReplyIndex] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posting, setPosting] = useState(false);
  const [reset, setReset] = useState(false);
  const [deletePopUp, setDeletePopUp] = useState({
    state: false,
    commentId: null,
    parentId: null
  });
  const [deleting, setDeleting] = useState(false);
  const [focusedComment, setFocusedComment] = useState('');

  const storyId = useMemo(() => {
    return singleStory._id;
  }, [singleStory]);


  useEffect(() => {
    try {
      setLoading(true);
      (async () => {
        if (!singleStory?._id) {
          return;
        }

        // Clear cache first
        dispatch(resetStoryComments());

        dispatch(resetCommentEmptyStatus());

        await dispatch(
          fetchStoryCommentByID({
            storyId: singleStory?._id,
            pageNo,
          }),
        ).unwrap();
      })();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }

    return () => {
      dispatch(resetStoryComments());
    };
  }, []);

  function focusReply(index) {
    setShowReply(true);
    setCommentReplyIndex(index);
    setFocusedComment(getStoryComments?.[index]);
    onPersonReplyingToChange(getStoryComments?.[index]?.name);
  }
  function cancelReply() {
    setCommentReplyIndex(0);
    onPersonReplyingToChange('');
  }

  async function postComment(commentContent) {
    try {
      Keyboard.dismiss();
    } catch (__err) {
      /** empty. */
    }
    try {

      onPostingChange(true);

      let markDownText = commentContent?.trimEnd?.() || '';
      let tags = markDownText.match(/(imeuswe:(\w+))/gm) || [];
      if (tags.length) {
        tags = Array.from(new Set(tags));

        const ids = tags.map(id => id.split('imeuswe:')[1]);
        tags = ids;
      }

      let data = [];

      if (!personReplyingTo) {
        data = {
          Story_id: storyId,
          content: markDownText,
          tagUserId: tags,
        };
      } else {
        data = {
          parentCommentId: getStoryComments[commentReplyIndex]._id,
          Story_id: storyId,
          content: markDownText,
          tagUserId: tags,
        };
      }

      const res = await dispatch(createComment(data)).unwrap();
      if (res.data) {
        const _personalDetails = {
          profilepic: res.data.profilepic,
          ...personalDetails,
        };

        const _id = res.data.response.createdBy;
        let payload = [];

        if (!personReplyingTo?.length) {
          payload = {
            ...res.data.response,
            replies: [],
            user: { personalDetails: _personalDetails, _id },
            showReplies: false,
          };
        } else {
          payload = {
            ...res.data.response,
            likeCount: res.data.response?.likes?.length || 0,
            user: { personalDetails: _personalDetails, _id },
          };
        }
        payload.name = `${payload.user.personalDetails.name} ${payload.user.personalDetails.lastname}`;
        setReset(true);

        if (!personReplyingTo?.length) {
          // needs to be passed as an array.
          dispatch(setNewStoryComments([payload]));
        }
        else {
          dispatch(setStoryReply({ index: commentReplyIndex, reply: payload }));
        }

        const updatePayload = {
          count: singleStory.commentsCount + 1,
          storyId,
        };
        dispatch(updateCommentsCount(updatePayload));
      }
      onPersonReplyingToChange('');
      onPostedComment(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      onPostingChange(false);
    }
  }

  async function handleDeleteComment(commentId, parentId = null) {
    try {
      if (!singleStory?._id) {
        return;
      }
      setDeleting(true);
      // const parentId = null;
      const payload = {
        storyId: singleStory?._id,
        commentId,
        parentId,
      };
      await dispatch(deleteComment(payload)).unwrap();
      setDeletePopUp({ state: false, commentId: null, parentId: null });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setDeleting(false);
    }
  }

  async function loadMore() {
    try {
      if (getStoryComments.length <= 5) {
        return;
      }
      setLoadingMore(true);
      const page = pageNo + 1;
      setPageNo(page);
      await dispatch(
        fetchStoryCommentByID({
          storyId,
          pageNo: page,
        }),
      ).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoadingMore(false);
    }
  }
  async function handleLikeComment(commentIndex) {
    try {
      setTempLiked(() => ({
        index: commentIndex,
        liked: !hasLiked(commentIndex),
      }));
      const likedComment = getStoryComments?.[commentIndex];
      if (!likedComment) {
        return;
      }
      await dispatch(likeComment(likedComment._id)).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setTimeout(() => {
        setTempLiked(() => ({
          index: 0,
          liked: false,
        }));
      }, 100);
    }
  }
  async function handleLikeReply(replyIndex, parentId) {
    try {
      setTempLikedReply(() => ({
        index: replyIndex,
        liked: !hasLikedReply(replyIndex, parentId),
        parentId,
      }));
      const commentIndex = getStoryComments.findIndex(_comment => _comment._id === parentId);

      if (!(commentIndex >= 0)) {
        return;
      }
      await dispatch(likeReply({
        commentIndex, replyIndex,
      })).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      const timerId = setTimeout(() => {
        clearInterval(timerId);
        setTempLikedReply({
          index: 0,
          liked: false,
          parentId: null,
        });
      }, 100);
    }
  }
  function hasLiked(index) {
    if (getStoryComments[index]?.likes?.includes(userId)) {
      return true;
    }

    return false;
  }
  function hasLikedReply(replyIndex, parentId) {
    const parent = getStoryComments.filter(
      (_comment) => _comment._id === parentId
    )?.[0];

    if (parent && parent?.replies?.[replyIndex]?.likes?.includes?.(userId)) {
      return true;
    }

    return false;
  }

  useImperativeHandle(ref, () => ({
    focusedComment: focusedComment,
    cancelReply: cancelReply,
    postComment: postComment,
  }));

  const renderComments = ({ item: comment, index }) => {
    return (
      <View>
        <SingleComment
          comment={comment}
          index={index}
          key={comment._id}
          focusReply={focusReply}
          setDeletePopUp={setDeletePopUp}
          tempLiked={tempLiked}
          handleLikeComment={handleLikeComment}
          hasLiked={hasLiked}
        />
        {comment?.replies?.filter((a) => a?._id)?.length > 0 &&
          comment.showReplies && (
            <View
              style={{
                marginLeft: 12,
                paddingLeft: 18,
                borderLeftWidth: 1,
                borderLeftColor: '#B8B8B8',
                marginBottom: 10,
              }}>
              {comment?.replies?.filter((a) => a?._id).map((reply, replyIndex, array) => (
                <SingleComment
                  comment={reply}
                  index={replyIndex}
                  key={reply._id}
                  parentId={reply.parentCommentId}
                  focusReply={focusReply}
                  setDeletePopUp={setDeletePopUp}
                  tempLiked={tempLikedReply}
                  hasLiked={() =>
                    hasLikedReply(replyIndex, reply.parentCommentId)
                  }
                  handleLikeComment={() =>
                    handleLikeReply(index, reply.parentCommentId)
                  }
                  style={
                    array.length - 1 === replyIndex
                      ? {
                        marginBottom: 0,
                      }
                      : {}
                  }
                />
              ))}
            </View>
          )}
      </View>
    );
  };

  return (
    <View>
      {deletePopUp.state === true && (
        <Confirm
          title={'Are you sure you want to delete your comment?'}
          subTitle={
            "If you delete this comment you won't be able to view it again."
          }
          loading={deleting}
          discardCtaText={'Cancel'}
          continueCtaText={'Delete Comment'}
          onContinue={() => handleDeleteComment(deletePopUp.commentId, deletePopUp.parentId)}
          onDiscard={() => setDeletePopUp(false)}
          onBackgroundClick={() => setDeletePopUp(false)}
          onCrossClick={() => setDeletePopUp(false)}
        />
      )}

      <View
        style={{
          marginTop: 30,
          paddingBottom: 100,
        }}>
        {getStoryComments.length > 0 && (
          <FlatList
            data={getStoryComments}
            renderItem={renderComments}
            keyExtractor={item => item._id}
            onEndReached={loadMore}
            scrollEnabled={false}
          />
        )}
        {loadingMore && <ActivityIndicator size="large" color="#0000ff" />}
      </View>
    </View>
  );
})

function SingleComment({
  comment,
  index,
  setDeletePopUp,
  focusReply,
  handleLikeComment,
  tempLiked,
  hasLiked,
  style = {},
  ...props
}) {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.userInfo._id);

  const styles = StyleSheet.create({
    likeContainer: {
      flexDirection: 'row',
      gap: 4,
      position: 'relative',
    },
    likeAnimation: {
      position: 'absolute',
      width: 22,
      height: 22,
      left: 5,
      top: 0,
    },
    commentsContainer: {
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 20,
    },
    commentProfileImage: { width: 16, height: 16, borderRadius: 50 },
    commentName: {
      fontWeight: 'bold',
      fontSize: 12,
      color: 'black',
    },
    commentNameContainer: {
      flexDirection: 'row',
      gap: 5,
      justifyContent: 'space-between',
    },
    commentButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 1.6
    },
  });

  return (
    <View
      style={[
        styles.commentsContainer,
        {
          ...style,
        },
      ]}
      key={comment._id}
      {...props}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        {comment?.user?.personalDetails?.profilepic?.length > 0 ? (
          <Image
            source={{ uri: comment?.user?.personalDetails?.profilepic }}
            style={styles.commentProfileImage}
          />
        ) : (
          <DefaultImage
            fontWeight={700}
            fontSize={8}
            borderRadius={50}
            height={16}
            width={16}
            firstName={comment?.user?.personalDetails?.name}
            lastName={comment?.user?.personalDetails?.lastname}
            gender={comment?.user?.personalDetails?.gender}
          />
        )}
        <View style={styles.commentNameContainer}>
          <Text style={styles.commentName}>
            {comment?.user?.personalDetails?.name || 'Deleted user'}{' '}
            {comment?.user?.personalDetails?.lastname}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, width: '100%' }}>
        <HTMLView
          value={`<p>${formatLinkText(formatTagsText(comment?.content))}</p>`}
          // value={`<p>${formatLinkText(formatTagsText(JSON.stringify(comment)))}</p>`}
          stylesheet={htmlStyles}
        />
        {/* Comment buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={styles.commentButtons}>
            <TouchableOpacity
              testID="commentLikeButton"
              style={[
                styles.likeContainer,
                {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}
              onPress={() => {
                handleLikeComment(index)
              }}>
              {'replies' in comment ? <LikeButton
                size={16}
                isLiked={
                  (tempLiked?.index === index && tempLiked.liked) ||
                  hasLiked(index)
                }
              /> : <LikeButton
                size={16}
                isLiked={
                  hasLiked(index, comment.parentCommentId) || tempLiked?.index === index && tempLiked.liked
                }
              />}
              {/* For parent */}
              {tempLiked?.index === index && tempLiked.liked && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    position: 'absolute',
                    left: -8,
                    top: -2
                  }}>
                  <LottieView
                    source={require('../../../animation/lottie/like_story.json')}
                    style={styles.likeAnimation}
                    autoPlay
                    speed={1.5}
                    loop
                  />
                </View>
              )}
              {/* For reply */}
              {tempLiked?.index === index && tempLiked.liked && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    position: 'absolute',
                    left: -8,
                    top: -2
                  }}>
                  <LottieView
                    source={require('../../../animation/lottie/like_story.json')}
                    style={styles.likeAnimation}
                    autoPlay
                    speed={1.5}
                    loop
                  />
                </View>
              )}

              <Text
                style={{
                  fontSize: 15,
                  color: 'black',
                }}>
                {comment?.likeCount > 0 ? comment?.likeCount : '0'}
              </Text>

            </TouchableOpacity >

            {(userId === comment.createdBy || userId === comment?.user?._id) && (
              <TouchableOpacity
                testID="commentDeleteButton"
                onPress={() =>
                  setDeletePopUp({
                    state: true, commentId: comment._id, ...('replies' in comment ? {} : {
                      parentId: comment.parentCommentId
                    })
                  })
                }
                style={{ marginTop: 2 }}
              >
                <CommentDeleteIcon size={16} stroke={'#444444'} strokeWidth={2} />
              </TouchableOpacity>
            )
            }
            {
              'replies' in comment && (
                <TouchableOpacity style={{
                  alignItems: 'center', justifyContent: 'center',
                  height: 16,
                  width: 16,
                  marginTop: 2
                }} onPress={() => focusReply(index)}>
                  <ReplyIcon width={16} height={16} />
                </TouchableOpacity>
              )
            }
          </View >
          {
            'replies' in comment &&
            comment?.replies?.[0]?._id &&
            comment?.replies?.length > 0 && (
              <Text
                onPress={() => dispatch(toggleCommentReply(index))}
                style={{
                  color: colors.primaryOrange,
                  fontSize: 14,
                }}>
                {comment.showReplies ? 'Hide Replies' : 'Show Replies'}
              </Text>
            )
          }
        </View >
      </View >
    </View >
  );
}

const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 16,
    color: '#000',
  },
});

Comments.propTypes = {
  singleStoryId: PropTypes.object,
};

Comments.displayName = 'Comments';

export default memo(Comments);
