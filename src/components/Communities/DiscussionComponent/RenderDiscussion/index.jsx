/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { DefaultImage, VideoThumbnail } from '../../../../core';
import { useNavigation } from '@react-navigation/native';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from 'react-native-paper';
import moment from 'moment';
import {
  DocumentFileIcon,
  UpVoteIcon,
  DownVoteIcon,
} from '../../../../images/index';
import ThreeDotsIcon from '../../../../images/Icons/ThreeDotsIcon';
import { useSelector } from 'react-redux';
import {
  formatLinkText,
  formatTagsText,
  timePassed,
} from '../../../../utils/format';
import Spinner from '../../../../common/Spinner';
import HTMLView from 'react-native-htmlview';
import Axios from '../../../../plugin/Axios';
import FastImage from '@d11/react-native-fast-image';

// import {DocumentFileIcon, PhoneIcon} from '../../../../images/index';
const { width } = Dimensions.get('window');
const RenderDiscussion = ({
  item,
  viewSingleDiscussion,
  index,
  screen = 'home',
  memberStatus,
  showTreeDots = true,
  thumbnailUrl,
  setDataFromSingleDiscussion,
  onThreeDotPressed = () => { },
}) => {
  const navigation = useNavigation();
  const {_id: userId, userRoles} = useSelector(state => state?.userInfo);
  const userData = useSelector(state => state?.userInfo);
  const [discussionVotes, setDiscussionVotes] = useState(item?.discussion);

  const goToCommunity = item => {
    navigation.navigate('CommunityDetails', {
      item: item.communityDetail,
      fromInsideDiscussion: Math.random(),
    });
  };

  const clickonDiscussion = () => {
    navigation.navigate('ViewSingleDiscussion', {
      _id: item?.discussion?._id,
      screen: screen,
      onGoBack: data => {
        setDataFromSingleDiscussion(data);
      },
    });
  };
  const { gender, lastname, name, profilepic } =
    item?.discussion.owner?.personalDetails;

  const { title, shortDescription, createdAt, owner } = item?.discussion;
  const { _id, communityName, logoUrl } = item?.communityDetail;

  const maxLength = 200;
  const showReadMore = shortDescription.length > maxLength;
  const displayedText = showReadMore
    ? shortDescription.substring(0, maxLength) + '...'
    : shortDescription;

  if (item?.isDeleted) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index + 100)
          .damping(20)
          .duration(500)
          .springify()}
        style={styles.container}
        key={_id}>
        <Text
          variant="bold"
          style={{ fontSize: 20, marginBottom: 10 }}
          accessibilityLabel="Poll Deleted Text">
          Discussion Deleted
        </Text>
        <Text
          style={{ fontSize: 12 }}
          accessibilityLabel="This poll was removed by moderator or owner">
          This discusison was removed by moderator or owner
        </Text>
      </Animated.View>
    );
  }

  const handleUpvoteDiscussion = async () => {
    const { userVote, discussionUpvoteCount, discussionDownvoteCount } =
      discussionVotes || {};
    let updatedVotes = { ...discussionVotes };

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
      const VoteData = await Axios.post(
        `/upvote/discussion/${item?.discussion?._id}`,
        {
          communityId: item?.communityDetail?._id,
        },
      );

      setDiscussionVotes(VoteData?.data?.response);
    } catch (error) { }
  };

  const handleDownvoteDiscussion = async () => {
    const { userVote, discussionUpvoteCount, discussionDownvoteCount } =
      discussionVotes || {};
    let updatedVotes = { ...discussionVotes };

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
      const VoteData = await Axios.post(
        `/downvote/discussion/${item?.discussion?._id}`,
        {
          communityId: item?.communityDetail?._id,
        },
      );

      setDiscussionVotes(VoteData?.data?.response);
    } catch (error) { }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index + 100)
        .damping(20)
        .duration(500)
        .springify()}
      style={styles.main}
      key={_id}>
      <TouchableOpacity style={styles.shadow} onPress={clickonDiscussion}>
        {/* <ThreeDotsIcon /> */}
        {item?.discussion?.mediaDetails?.length > 0 && (
          <View
            style={{
              width: '100%',
              height: 200,
              paddingHorizontal: 16,
              paddingTop: 16,
            }}>
            {item?.discussion?.mediaDetails[0]?.urlType === 'Image' && (
              <Image
                style={styles.imageContainer}
                source={{ uri: item?.discussion?.mediaDetails[0]?.mediaUrl }}
              />
            )}

            {item?.discussion?.mediaDetails[0]?.urlType === 'Video' && (
              <View
                style={{ width: '100%', height: '100%', position: 'relative' }}>
                <VideoThumbnail
                  thumbnailUrl={
                    thumbnailUrl
                      ? thumbnailUrl
                      : item?.discussion?.mediaDetails[0]?.thumbnailUrl
                  }
                  src={item?.discussion?.mediaDetails[0]?.mediaUrl}
                  preventPlay={false}
                  imuwMediaStyle={{ width: '100%', height: '100%' }}
                  imuwThumbStyle={{
                    borderRadius: 8,
                    width: '100%',
                    height: '100%',
                  }}
                />
              </View>
            )}

            {item?.discussion?.mediaDetails[0]?.urlType !== 'Image' &&
              item?.discussion?.mediaDetails[0]?.urlType !== 'Video' && (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                  <FastImage
                    source={{
                      uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/bgimgdocumen.png',
                    }} // Ensure this path is correct
                    style={{
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    resizeMode="cover">
                    <View
                      style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <DocumentFileIcon />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          textAlign: 'center',
                        }}>
                        {item?.discussion?.mediaDetails[0]?.fileName}
                      </Text>
                    </View>
                  </FastImage>
                </View>
              )}
          </View>
        )}
        <View
          style={{
            padding: 16,
            paddingTop:
              item?.discussion?.mediaDetails[0]?.urlType === 'Image' ? 35 : 20,
          }}>
          <View
            style={{
              width: width - 50,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              hitSlop={{
                top: 10,
                left: 10,
                right: 10,
                bottom: 10,
              }}
              disabled={
                owner?.userRoles?.includes('COM')
                  ? userRoles?.includes('COM')
                    ? false
                    : true
                  : false
              }
              onPress={() => goToCommunity(item)}>
              <Text
                style={[
                  { color: '#FF725E', fontSize: 12 },
                  screen !== 'home' && { width: width - 100 },
                ]}>
                {communityName}
              </Text>
            </TouchableOpacity>
            {item?.discussion.owner?._id === userId &&
              screen !== 'home' &&
              memberStatus === 'ACTIVE' ? (
              <TouchableOpacity
                onPress={() => {
                  onThreeDotPressed(item?.discussion?._id);
                }}
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                style={{
                  width: 50,
                  alignItems: 'flex-end',
                  height: 15,
                  justifyContent: 'center',
                }}>
                {showTreeDots && item?.discussion.owner?._id === userId && (
                  <ThreeDotsIcon />
                )}
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  width: 50,
                  alignItems: 'flex-end',
                  height: 15,
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              />
            )}
          </View>
          <View style={{ paddingTop: 10 }}>
            <Text variant="bold" style={{ fontSize: 18, fontWeight: '600' }}>
              {title.length > 70 ? `${title.substring(0, 70)}...` : title}
            </Text>

            <HTMLView
              value={`<p>${formatLinkText(formatTagsText(displayedText))} ${showReadMore ? '<span> Read More</span>' : ''}
                </p>`}
              stylesheet={htmlStyles}
            />
          </View>
          {/* Owner Details */}
          <View style={styles.nameTextMain}>
            {item?.discussion?.owner?.personalDetails?.profilepic ? (
              <Image
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: 25,
                  resizeMode: 'cover',
                }}
                source={{
                  uri: item?.discussion?.owner?.personalDetails?.profilepic,
                }}
                accessibilityLabel="User profile picture"
              />
            ) : (
              <View
                style={{ marginRight: 4 }}
                accessibilityLabel="Default user profile picture">
                <DefaultImage
                  gender={item?.discussion?.owner?.personalDetails?.gender}
                  size={24}
                  firstName={item?.discussion?.owner?.personalDetails?.name}
                  lastName={item?.discussion?.owner?.personalDetails?.lastname}
                />
              </View>
            )}
            <Text
              variant="bold"
              style={{ fontSize: 16, paddingLeft: 3, color: 'black' }}
              accessibilityLabel={`Posted by ${item?.discussion?.owner?.personalDetails?.name} ${item?.discussion?.owner?.personalDetails?.lastname}`}>
              {item?.discussion?.owner?.personalDetails?.name}
              <Text> </Text>
              {item?.discussion?.owner?.personalDetails?.lastname}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
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
                // boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.70)',
                borderWidth: 1.3,
                borderColor: '#dbdbdb',
              }}>
              <TouchableOpacity
                accessibilityLabel="toggleLike"
                onPress={() => handleUpvoteDiscussion()}>
                <UpVoteIcon
                  isUpvoted={discussionVotes?.userVote === 'upvote'}
                />
              </TouchableOpacity>

              <Text
                style={{
                  paddingHorizontal: 8,
                  color:
                    discussionVotes?.userVote === 'upvote'
                      ? '#078500'
                      : 'black',
                  fontSize: 14,
                }}
                variant="bold">
                {discussionVotes?.discussionUpvoteCount}
              </Text>
              <View
                style={{
                  backgroundColor: 'lightgrey',
                  height: 18,
                  width: 1.5,
                }}></View>
              <TouchableOpacity
                accessibilityLabel="toggleLike"
                style={{ marginLeft: 6 }}
                onPress={() => handleDownvoteDiscussion()}>
                <DownVoteIcon
                  isDownvoted={discussionVotes?.userVote === 'downvote'}
                />
              </TouchableOpacity>
              <Text
                style={{
                  paddingHorizontal: 8,
                  color:
                    discussionVotes?.userVote === 'downvote'
                      ? '#c00000'
                      : 'black',
                  fontSize: 14,
                }}
                variant="bold">
                {discussionVotes?.discussionDownvoteCount}
              </Text>
            </View>
            <Text
              style={{
                flex: 1,
                color: '#777777',
                fontSize: 10,
                textAlign: 'right',
              }}>
              {timePassed(createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  main: {
    width: width - 20,
    paddingBottom: 15,
    borderRadius: 8,
  },
  container: {
    padding: 16,
    width: width - 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.22,
    // shadowRadius: 2.22,
    // elevation: 3,
    marginBottom: 15,
    borderWidth: 1.3,
    borderColor: '#dbdbdb',
  },
  shadow: {
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.22,
    // shadowRadius: 2.22,
    // elevation: 3,
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.3,
    borderColor: '#dbdbdb',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  profilePic: {
    width: 24,
    height: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginRight: 4,
    justifyContent: 'center',
  },
  nameTextMain: {
    padding: 10,
    paddingLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
    paddingTop: 10,
  },
  span: {
    color: '#E77237',
  },
});

export default RenderDiscussion;
