import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, ProgressBar, Divider } from 'react-native-paper';
import { CustomDialog, DefaultImage } from '../../../core';
import PollsCheckBox from './PollsCheckBox';
import Animated, { FadeInDown, runOnJS } from 'react-native-reanimated';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../../hooks/useSocket';
import theme from '../../../common/NewTheme';
import {
  HorizontalThreeDots,
  PollDeleteIcon,
  StorieEmptyState,
  UpVoteIcon,
  DownVoteIcon,
} from '../../../images';
import { deletePoll } from '../../../store/apps/createCommunity';
import SmallBottomSheet from '../../../common/SmallBottomSheet';
import { Track } from '../../../../App';
import Toast from 'react-native-toast-message';
import { timePassed } from '../../../utils/format';
const { width } = Dimensions.get('window');
import FastImage from '@d11/react-native-fast-image';
import GlobalHeader from '../../ProfileTab/GlobalHeader';
import { useNavigation } from '@react-navigation/native';
import NewTheme from '../../../common/NewTheme';
import Spinner from '../../../common/Spinner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getPoll } from '../../../store/apps/createPoll';
import Axios from '../../../plugin/Axios';
import {
  Pressable as GesturePressable,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

const ViewSinglePoll = ({ route }) => {
  const [pollResults, setPollResults] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [pollNotFound, setPollNotFound] = useState(false);

  const [memberStatus, setMemberStatus] = useState('ACTIVE');
  const [memberRole, setMemberRole] = useState('Admin');
  const [showTreeDots, setShowTreeDots] = useState(true);

  const index = 0;
  const bottomSheetRef = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [pollDetails, setPollDetails] = useState({});
  const [communityDetails, setCommunityDetails] = useState({});
  const [ownerDetails, setOwnerDetails] = useState({});
  const userId = useSelector(state => state?.userInfo?._id);
  const userData = useSelector(state => state?.userInfo);
  const socket = useSocket();
  const newUpdatedPollData = useSelector(
    state => state?.pollsUpdatedData?.pollsData[pollDetails?.pollID],
  );
  const [pollVoteData, setPollVote] = useState(null);
  const [userVoted, setuserVoted] = useState(false);

  const options = [
    {
      icon: PollDeleteIcon,
      text: 'Delete Poll',
      onPress: () => {
        showDeleteDialog();
      },
    },
  ];

  // Effect to handle real-time poll updates
  useEffect(() => {
    if (newUpdatedPollData && newUpdatedPollData.length > 0) {
      // Check if the update is for the current poll
      const isCurrentPoll = newUpdatedPollData.some(
        option => option.pollId === pollDetails?.pollID,
      );
      if (isCurrentPoll) {
        // Update poll results with new data
        const updatedPollResults = newUpdatedPollData.map(option => ({
          ...option,
          optionPercentage: option.optionPercentage,
          optionCount: option.optionCount,
        }));
        setPollResults(updatedPollResults);
      }
    }
  }, [newUpdatedPollData]);

  // Fetch Poll Data
  const FetchPollData = async pollID => {
    try {
      const res = await dispatch(getPoll(pollID)).unwrap();
      const pollData = res?.data;
      const loggedInMemberData = res?.loggedInMemberData;
      if (pollData) {
        setPollResults(pollData?.pollOptions || []);
        setSelectedOptions(pollData?.selectedOptions || []);
        setPollDetails({
          pollID: pollData?._id,
          allowMultipleOptions: pollData?.allowMultipleOptions,
          title: pollData?.title,
          createdAt: pollData.createdAt,
          pollUserId: pollData?.userId,
        });
        setPollVote(pollData);

        setOwnerDetails({
          name: pollData?.owner?.personalDetails?.name,
          profilepic: pollData?.owner?.personalDetails?.profilepic,
          lastname: pollData?.owner?.personalDetails?.lastname,
          gender: pollData?.owner?.personalDetails?.gender,
        });
        setCommunityDetails(pollData?.communityData);
        setMemberStatus(loggedInMemberData?.memberStatus);
        setMemberRole(loggedInMemberData?.memberRole);

        setPollNotFound(false);
      } else {
        setPollNotFound(true);
      }
    } catch (error) {
      setPollNotFound(true);
    }
  };

  useEffect(() => {
    if (route?.params?._id) {
      setLoading(true);

      FetchPollData(route?.params?._id)
        .then(() => {
          setLoading(false);
        })
        .catch(error => {
          // Handle any errors from either fetch operation
          Toast.show({
            type: 'error',
            text1: error,
          });
          setLoading(false);
        });
    }
  }, [route?.params?._id]);

  const handleRadioOptionSelect = optionId => {
    if (memberStatus !== 'ACTIVE') return; // Disable interaction if memberStatus is not active

    let updatedResults = [...pollResults];
    let newSelectedOptions = [...selectedOptions];

    // Check if the user is selecting the already selected option
    const previousOptionId = selectedOptions[0];
    if (previousOptionId === optionId) {
      // If the same option is selected again, deselect it
      updatedResults = updatedResults.map(option =>
        option._id === optionId
          ? { ...option, optionCount: option.optionCount - 1 }
          : option,
      );
      newSelectedOptions = []; // Clear selected options since it's deselected
    } else {
      if (previousOptionId) {
        // Decrement the count of the previously selected option
        updatedResults = updatedResults.map(option =>
          option._id === previousOptionId
            ? { ...option, optionCount: option.optionCount - 1 }
            : option,
        );
      }

      // Increment the count of the newly selected option
      updatedResults = updatedResults.map(option =>
        option._id === optionId
          ? { ...option, optionCount: option.optionCount + 1 }
          : option,
      );

      // Update the selected options to only include the new selection
      newSelectedOptions = [optionId];
    }

    // Recalculate the percentage for each option
    const totalVotes = updatedResults.reduce(
      (acc, option) => acc + option.optionCount,
      0,
    );

    const updatedPollResults = updatedResults.map(option => ({
      ...option,
      optionPercentage:
        totalVotes > 0 ? (option.optionCount / totalVotes) * 100 : 0,
    }));

    setPollResults(updatedPollResults);
    setSelectedOptions(newSelectedOptions);

    // Emit the vote submission via socket
    const updateData = {
      pollID: pollDetails?.pollID,
      userId,
      selectedOptions: newSelectedOptions,
      allowMultipleOptions: pollDetails?.allowMultipleOptions,
    };

    socket.polls?.emit(
      'submit_poll',
      pollDetails?.pollID,
      userId,
      updateData.selectedOptions,
      pollDetails?.allowMultipleOptions,
    );
  };

  const handleCheckBoxOptionSelect = optionId => {
    if (memberStatus !== 'ACTIVE') return; // Disable interaction if memberStatus is not active

    let updatedResults = [...pollResults];
    let newSelectedOptions = [...selectedOptions];

    if (newSelectedOptions.includes(optionId)) {
      // If the option is already selected, decrement the count and remove it from selected options
      updatedResults = updatedResults.map(option =>
        option._id === optionId
          ? { ...option, optionCount: option.optionCount - 1 }
          : option,
      );
      newSelectedOptions = newSelectedOptions.filter(id => id !== optionId);
    } else {
      // If the option is not selected, increment the count and add it to selected options
      updatedResults = updatedResults.map(option =>
        option._id === optionId
          ? { ...option, optionCount: option.optionCount + 1 }
          : option,
      );
      newSelectedOptions = [...newSelectedOptions, optionId];
    }

    // Recalculate the percentage for each option
    const totalVotes = updatedResults.reduce(
      (acc, option) => acc + option.optionCount,
      0,
    );

    const updatedPollResults = updatedResults.map(option => ({
      ...option,
      optionPercentage:
        totalVotes > 0 ? (option.optionCount / totalVotes) * 100 : 0,
    }));

    setPollResults(updatedPollResults);
    setSelectedOptions(newSelectedOptions);
    // Emit the vote submission via socket
    const updateData = {
      pollID: pollDetails?.pollID,
      userId,
      selectedOptions: newSelectedOptions,
      allowMultipleOptions: pollDetails?.allowMultipleOptions,
    };
    socket.polls?.emit(
      'submit_poll',
      pollDetails?.pollID,
      userId,
      updateData.selectedOptions,
      pollDetails?.allowMultipleOptions,
    );
  };

  const showDeleteDialog = () => setDeleteDialogVisible(true);
  const hideDeleteDialog = () => setDeleteDialogVisible(false);
  // Delete the Poll
  const onDelete = async () => {
    try {
      const response = await dispatch(deletePoll(pollDetails?.pollID)).unwrap();

      /* customer io and mixpanel event changes  start */
      const props = {
        community_name: communityDetails?.communityName,
        title: pollDetails?.title,
      };
      Track({
        cleverTapEvent: 'poll_deleted',
        mixpanelEvent: 'poll_deleted',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      /* clevertap and mixpanel events ---end****/
      if (response?.success) {
        try {
          route.params.onGoBack({
            random: Math.random(),
            _id: route?.params?._id, // Update or pass new parameters
          });
          navigation.goBack();
        } catch (err) { }
        setIsDeleted(true);
      }
    } catch (error) { }
  };

  const UserInfo = memo(({ profilepic, gender, name, lastname }) => {
    return (
      <View style={styles.userInfoContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}>
          <View>
            {profilepic ? (
              <FastImage
                style={styles.profileImage}
                source={{
                  uri: profilepic,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
                accessibilityLabel={`${name} ${lastname}'s profile picture`}
              />
            ) : (
              <View
                style={{ marginRight: 4 }}
                accessibilityLabel={`Default profile image for ${name} ${lastname}`}>
                <DefaultImage
                  gender={gender}
                  size={30}
                  firstName={name}
                  lastName={lastname?.trim()}
                />
              </View>
            )}
          </View>
          <View
            style={{
              justifyContent: 'flex-start',
              flex: 1,
              flexWrap: 'wrap',
              marginRight: 25,
            }}>
            <Text
              style={styles.communityName}
              variant="bold"
              accessibilityLabel={`Community: ${communityDetails?.communityName}`}>
              {communityDetails?.communityName}
            </Text>
            <View
              style={{
                width: '85%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <Text
                variant="bold"
                style={styles.userInfoText}
                accessibilityLabel={`${name} ${lastname}`}>
                {`${name} ${lastname}`.length > 25
                  ? `${name} ${lastname}`.substring(0, 25) + '...'
                  : `${name} ${lastname}`}
              </Text>
              <Text
                style={styles.date}
                accessibilityLabel={`Posted ${timePassed(pollDetails?.createdAt)}`}>
                {timePassed(pollDetails?.createdAt)}
              </Text>
            </View>
          </View>
        </View>
        {pollDetails?.pollUserId === userId && showTreeDots && (
          <TouchableOpacity
            accessibilityLabel="More Options"
            style={{ height: 20, justifyContent: 'center' }}
            onPress={showBottomSheet}>
            <HorizontalThreeDots />
          </TouchableOpacity>
        )}
      </View>
    );
  });

  const goBack = () => {
    if (route.params?.onGoBack && userVoted) {
      route.params.onGoBack({
        pollId: route?.params?._id,
        ...pollVoteData,
      });
    }
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault();

      if (route.params?.onGoBack && userVoted) {
        route.params.onGoBack({
          pollId: route?.params?._id,
          ...pollVoteData,
        });
      }

      navigation.dispatch(e.data.action);
    });

    return unsubscribe;
  }, [navigation, route, userVoted, pollVoteData]);

  if (isDeleted) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index + 100)
          .damping(20)
          .duration(500)
          .springify()}
        style={styles.container}
        key={pollDetails?.pollID}>
        <GlobalHeader
          onBack={goBack}
          backgroundColor={NewTheme.colors.backgroundCreamy}
        />
        <Text
          variant="bold"
          style={{ fontSize: 20, marginBottom: 10 }}
          accessibilityLabel="Poll Deleted Text">
          Poll Deleted
        </Text>
        <Text
          style={{ fontSize: 12 }}
          accessibilityLabel="This poll was removed by moderator or owner">
          This poll was removed by moderator or owner
        </Text>
      </Animated.View>
    );
  }

  const showBottomSheet = () => {
    bottomSheetRef.current?.open();
  };

  const handleUpvotePoll = async () => {
    const { userVote, pollUpvoteCount, pollDownvoteCount } = pollVoteData || {};
    let updatedVotes = { ...pollVoteData };

    switch (userVote) {
      case 'upvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: null,
          pollUpvoteCount: pollUpvoteCount - 1,
        };
        break;

      case 'downvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: 'upvote',
          pollUpvoteCount: pollUpvoteCount + 1,
          pollDownvoteCount: pollDownvoteCount - 1,
        };
        break;

      default: // null or anything else
        updatedVotes = {
          ...updatedVotes,
          userVote: 'upvote',
          pollUpvoteCount: pollUpvoteCount + 1,
        };
    }
    setuserVoted(true);
    setPollVote(updatedVotes);

    try {
      const pollVoteCountData = await Axios.post(
        `/upvote/poll/${route?.params?._id}`,
      );
      setuserVoted(true);
      setPollVote(pollVoteCountData?.data?.response);
    } catch (error) { }
  };

  const lastTap = useRef(null);

  const handleDoubleTap = () => {
    handleUpvotePoll();
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

  const handleDownvotePoll = async () => {
    const { userVote, pollUpvoteCount, pollDownvoteCount } = pollVoteData || {};
    let updatedVotes = { ...pollVoteData };

    switch (userVote) {
      case 'downvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: null,
          pollDownvoteCount: pollDownvoteCount - 1,
        };
        break;

      case 'upvote':
        updatedVotes = {
          ...updatedVotes,
          userVote: 'downvote',
          pollUpvoteCount: pollUpvoteCount - 1,
          pollDownvoteCount: pollDownvoteCount + 1,
        };
        break;

      default: // null or anything else
        updatedVotes = {
          ...updatedVotes,
          userVote: 'downvote',
          pollDownvoteCount: pollDownvoteCount + 1,
        };
    }
    setuserVoted(true);
    setPollVote(updatedVotes);

    try {
      const pollVoteCountData = await Axios.post(
        `/downvote/poll/${route?.params?._id}`,
      );
      setuserVoted(true);
      setPollVote(pollVoteCountData?.data?.response);
    } catch (error) { }
  };

  return (
    <>
      <GlobalHeader
        onBack={goBack}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />

      {isLoading ? ( // Only show loader while loading
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          accessibilityLabel="Loading-spinner">
          <Spinner />
        </View>
      ) : pollNotFound ? (
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
        <View style={styles.container}>
          <View style={styles.pollHeader}>
            <>
              <UserInfo
                profilepic={communityDetails?.logoUrl}
                gender={ownerDetails?.gender}
                name={ownerDetails?.name}
                lastname={ownerDetails?.lastname}
              />
            </>
          </View>
          <GestureDetector
            gesture={Gesture.Tap()
              .maxDuration(250)
              .numberOfTaps(2)
              .onEnd((event, success) => {
                if (success) {
                  runOnJS(handleUpvotePoll)(); // your double-tap action
                }
              })}>
            <View>
              <Text
                variant="bold"
                style={styles.question}
                accessibilityLabel={`Poll title: ${pollDetails?.title}`}>
                {pollDetails?.title}
              </Text>
              <Text
                style={styles.selectInstruction}
                accessibilityLabel={
                  pollDetails?.allowMultipleOptions
                    ? 'Select one or more options'
                    : 'Select one option'
                }>
                {!pollDetails?.allowMultipleOptions
                  ? 'Select one'
                  : 'Select one or more'}
              </Text>
            </View>
          </GestureDetector>

          {/* Poll Results */}
          {pollResults.map(option => (
            <View key={option?._id} style={styles.optionContainer}>
              <TouchableOpacity
                disabled={memberStatus !== 'ACTIVE'}
                accessibilityLabel={`Select option: ${option?.option}`}
                onPress={() =>
                  pollDetails?.allowMultipleOptions
                    ? handleCheckBoxOptionSelect(option?._id)
                    : handleRadioOptionSelect(option?._id)
                }>
                <View style={styles.optionRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      marginRight: 10,
                    }}>
                    <PollsCheckBox
                      key={option?._id}
                      onPress={() =>
                        pollDetails?.allowMultipleOptions
                          ? handleCheckBoxOptionSelect(option?._id)
                          : handleRadioOptionSelect(option?._id)
                      }
                      selected={selectedOptions.includes(option?._id)}
                      disabled={memberStatus !== 'ACTIVE'}
                    />

                    <Text
                      style={styles.optionText}
                      accessibilityLabel={`Option text: ${option?.option}`}>
                      {option?.option}
                    </Text>
                  </View>
                  <Text
                    style={styles.votesText}
                    accessibilityLabel={`Votes for ${option?.option}: ${option?.optionCount}`}>
                    {`${option?.optionCount} ${option?.optionCount === 1 ? 'vote' : 'votes'} ${Math.round(option?.optionPercentage)}%`}
                  </Text>
                </View>
                <ProgressBar
                  progress={option?.optionPercentage / 100}
                  color={theme.colors.primaryOrange}
                  accessibilityLabel={`Progress bar for ${option?.option}`}
                />
              </TouchableOpacity>
            </View>
          ))}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              // borderWidth: 1,
              borderRadius: 20,
              paddingVertical: 5,
              paddingHorizontal: 18,
              justifyContent: 'center',
              backgroundColor: 'white',
              alignSelf: 'flex-start',
              // boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.70)',
              marginTop: 10,
              // width: '100'
              borderWidth: 1.3,
              borderColor: '#dbdbdb',
            }}>
            <TouchableOpacity
              style={{ marginLeft: -5 }}
              onPress={() => handleUpvotePoll()}>
              <UpVoteIcon isUpvoted={pollVoteData?.userVote === 'upvote'} />
            </TouchableOpacity>
            <Text
              style={{
                paddingHorizontal: 8,
                // marginTop: -3,
                color:
                  pollVoteData?.userVote === 'upvote' ? '#078500' : 'black',
                fontSize: 14,
              }}
              variant="bold">
              {pollVoteData?.pollUpvoteCount}
            </Text>
            <View
              style={{
                backgroundColor: 'lightgrey',
                height: 18,
                width: 1.5,
              }}></View>
            <TouchableOpacity
              style={{ marginLeft: 6 }}
              onPress={() => handleDownvotePoll()}>
              <DownVoteIcon
                isDownvoted={pollVoteData?.userVote === 'downvote'}
              />
            </TouchableOpacity>
            <Text
              style={{
                marginLeft: 6,
                color:
                  pollVoteData?.userVote === 'downvote' ? '#c00000' : 'black',
                fontSize: 14,
              }}
              variant="bold">
              {pollVoteData?.pollDownvoteCount}
            </Text>
          </View>
          {/* <Divider bold style={{marginTop: 30}} /> */}
          <CustomDialog
            visible={isDeleteDialogVisible}
            onClose={hideDeleteDialog}
            title="Are you sure you want to delete this poll"
            confirmLabel="Delete"
            onConfirm={() => {
              hideDeleteDialog();
              onDelete();
            }}
            onCancel={hideDeleteDialog}
          />

          <SmallBottomSheet
            ref={bottomSheetRef}
            options={options}
            enableCrossIcon={false}
            snapPoints={['15%']}
            customOptionStyle={{ color: 'black', fontSize: 18 }}
            optionVariant="bold"
            contentHeight={300}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: NewTheme.colors.backgroundCreamy,
    flex: 1,
    marginBottom: 15,
  },
  communityName: {
    color: NewTheme.colors.primaryOrange,
    fontSize: 14,
  },
  date: {
    fontSize: 10,
    marginLeft: 10,
  },
  question: {
    marginVertical: 8,
    fontSize: 18,
  },
  selectInstruction: {
    color: theme.colors.secondaryLightBlue,
    marginBottom: 12,
    fontSize: 12,
  },
  optionContainer: {
    marginVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    justifyContent: 'space-between',
    width: '100%',
  },
  userInfoText: {
    fontSize: 12,
  },
  pollHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  votesText: {
    fontSize: 12,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
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

export default React.memo(ViewSinglePoll);