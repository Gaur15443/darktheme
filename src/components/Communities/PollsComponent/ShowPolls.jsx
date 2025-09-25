import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { CustomDialog, DefaultImage } from '../../../core';
import PollsCheckBox from './PollsCheckBox';
import Animated, { FadeInDown } from 'react-native-reanimated';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../../hooks/useSocket';
import theme from '../../../common/NewTheme';
import { HorizontalThreeDots, PollDeleteIcon } from '../../../images';
import { deletePoll } from '../../../store/apps/createCommunity';
import SmallBottomSheet from '../../../common/SmallBottomSheet';
import { Track } from '../../../../App';
import Toast from 'react-native-toast-message';
import { timePassed } from '../../../utils/format';
const { width } = Dimensions.get('window');
import FastImage from '@d11/react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UpVoteIcon, DownVoteIcon } from '../../../images';
import Axios from '../../../plugin/Axios';
import { getPoll } from '../../../store/apps/createPoll';

const ShowPolls = ({
  item,
  index,
  memberStatus,
  showTopPostedBy = false,
  memberRole,
  showTreeDots = true,
}) => {
  const [pollResults, setPollResults] = useState(item?.poll?.pollOptions);
  const [selectedOptions, setSelectedOptions] = useState(
    item?.poll?.selectedOptions,
  );
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollData, setPollData] = useState(item?.poll);
  const [pollVoteCount, setPollVoteCount] = useState(item?.poll);
  const navigation = useNavigation();
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const { _id, logoUrl, communityName } = item?.communityDetail;
  const {
    _id: pollID,
    allowMultipleOptions,
    title,
    createdAt,
    userId: pollUserId,
  } = item?.poll;
  const { name, profilepic, lastname, gender } =
    item?.poll?.owner?.personalDetails;
  const {_id: userId, userRoles} = useSelector(state => state?.userInfo);
  const userData = useSelector(state => state?.userInfo);
  const socket = useSocket();
  const newUpdatedPollData = useSelector(
    state => state?.pollsUpdatedData?.pollsData[pollID],
  );

  const options = [
    {
      icon: PollDeleteIcon,
      text: 'Delete Poll',
      onPress: () => {
        showDeleteDialog();
      },
    },
  ];
  const goToCommunity = item => {
    navigation.navigate('CommunityDetails', {
      item: item?.communityDetail,
      fromInsideDiscussion: Math.random(),
    });
  };
  // Effect to handle real-time poll updates
  useEffect(() => {
    if (newUpdatedPollData && newUpdatedPollData.length > 0) {
      // Check if the update is for the current poll
      const isCurrentPoll = newUpdatedPollData.some(
        option => option.pollId === pollID,
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
      pollID: pollID,
      userId,
      selectedOptions: newSelectedOptions,
      allowMultipleOptions,
    };
    socket.polls?.emit(
      'submit_poll',
      pollID,
      userId,
      updateData.selectedOptions,
      allowMultipleOptions,
    );
  };

  // const handleCheckBoxOptionSelect = optionId => {
  //   if (memberStatus !== 'ACTIVE') return; // Disable interaction if memberStatus is not active

  //   let updatedResults = [...pollResults];
  //   let newSelectedOptions = [...selectedOptions];
  //   // let newSelectedOptions =  [...new Set(selectedOptions)];

  //   // console.log('newSelectedOptions ------ >'+JSON.stringify(pollResults))

  //   if (newSelectedOptions.includes(optionId)) {
  //     // If the option is already selected, decrement the count and remove it from selected options
  //     updatedResults = updatedResults.map(option =>
  //       option._id === optionId
  //         ? {...option, optionCount: option.optionCount - 1}
  //         : option,
  //     );
  //     newSelectedOptions = newSelectedOptions.filter(id => id !== optionId);
  //   } else {
  //     // If the option is not selected, increment the count and add it to selected options
  //     updatedResults = pollResults.map(option =>
  //       option._id === optionId
  //         ? {...option, optionCount: option.optionCount + 1}
  //         : option,
  //     );
  //     // console.log('updatedResults ------->'+JSON.stringify(updatedResults))
  //     newSelectedOptions = [...newSelectedOptions, optionId];
  //   }

  //   // Recalculate the percentage for each option
  //   const totalVotes = updatedResults.reduce(
  //     (acc, option) => acc + option.optionCount,
  //     0,
  //   );

  //   const updatedPollResults = updatedResults.map(option => ({
  //     ...option,
  //     optionPercentage:
  //       totalVotes > 0 ? (option.optionCount / totalVotes) * 100 : 0,
  //   }));

  //   setPollResults(updatedPollResults);
  //   setSelectedOptions(newSelectedOptions);
  //   // Emit the vote submission via socket
  //   const updateData = {
  //     pollID: pollID,
  //     userId,
  //     selectedOptions: newSelectedOptions,
  //     allowMultipleOptions,
  //   };

  //   socket.polls?.emit(
  //     'submit_poll',
  //     pollID,
  //     userId,
  //     updateData.selectedOptions,
  //     allowMultipleOptions,
  //   );
  // };

  // const handleNewCheckBoxOptionSelect = (optionId) => {
  //   if (memberStatus !== 'ACTIVE') return;

  //   let updatedResults = [];
  //   let newSelectedOptions = [];
  //   let optionCountKey = selectedOptions.length;
  //   // console.log('optionCountKey ------->'+JSON.stringify(optionCountKey))

  //   if (selectedOptions.includes(optionId)) {
  //     // If the option is already selected, decrement the count and remove it from selected options
  //     updatedResults = pollResults.map(option =>
  //       option._id === optionId
  //         ? {...option, optionCount: optionCountKey}
  //         : option,
  //     );
  //     newSelectedOptions = selectedOptions.filter(id => id !== optionId);
  //   }

  //   if(selectedOptions.includes(optionId) === false){
  //      // If the option is not selected, increment the count and add it to selected options
  //      updatedResults = pollResults.map(option =>
  //       option._id === optionId
  //         ? {...option, optionCount: optionCountKey}
  //         : option,
  //     );
  //     // console.log('updatedResults ------->'+JSON.stringify(updatedResults))
  //     newSelectedOptions = [...newSelectedOptions, optionId];
  //   }

  //   // Recalculate the percentage for each option
  //   const totalVotes = updatedResults.reduce(
  //     (acc, option) => acc + option.optionCount,
  //     0,
  //   );

  //   const updatedPollResults = updatedResults.map(option => ({
  //     ...option,
  //     optionPercentage:
  //       totalVotes > 0 ? (option.optionCount / totalVotes) * 100 : 0,
  //   }));

  //   setPollResults(updatedPollResults);
  //   setSelectedOptions(newSelectedOptions);
  //   // Emit the vote submission via socket
  //   const updateData = {
  //     pollID: pollID,
  //     userId,
  //     selectedOptions: newSelectedOptions,
  //     allowMultipleOptions,
  //   };

  //   console.log('updatedPollResults --------- >'+JSON.stringify(updatedPollResults))

  //   socket.polls?.emit(
  //     'submit_poll',
  //     pollID,
  //     userId,
  //     updateData.selectedOptions,
  //     allowMultipleOptions,
  //   );
  // };

  const debouncedHandleCheckBoxOptionSelect = useRef();
  const debouncedHandleRadioOptionSelect = useRef();

  // Define the handler
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
      pollID: pollID,
      userId,
      selectedOptions: newSelectedOptions,
      allowMultipleOptions,
    };

    socket.polls?.emit(
      'submit_poll',
      pollID,
      userId,
      updateData.selectedOptions,
      allowMultipleOptions,
    );
  };

  useEffect(() => {
    debouncedHandleCheckBoxOptionSelect.current = debounce(
      handleCheckBoxOptionSelect,
      5,
    ); // 300ms debounce delay
    debouncedHandleRadioOptionSelect.current = debounce(
      handleRadioOptionSelect,
      5,
    ); // 300ms debounce delay
  }, [pollResults, selectedOptions]); // Re-create the debounced function if these dependencies change

  // Handler to call the debounced function
  const onCheckBoxChange = optionId => {
    debouncedHandleCheckBoxOptionSelect.current(optionId);
  };

  const onRadioChange = optionId => {
    debouncedHandleRadioOptionSelect.current(optionId);
  };

  const showDeleteDialog = () => setDeleteDialogVisible(true);
  const hideDeleteDialog = () => setDeleteDialogVisible(false);
  const hideBottomSheet = () => setBottomSheetOpen(false);
  // Delete the Poll
  const onDelete = async () => {
    try {
      const response = await dispatch(deletePoll(pollID));

      /* customer io and mixpanel event changes  start */
      const props = {
        community_name: communityName,
        title: title,
      };
      Track({
        cleverTapEvent: 'poll_deleted',
        mixpanelEvent: 'poll_deleted',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      /* clevertap and mixpanel events ---end****/

      if (response?.payload?.success) {
        setIsDeleted(true);
        // Handle success, like updating the UI or state
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    }
  };

  const UserInfo = memo(({ profilepic, gender, name, lastname }) => {
    return (
      <View style={styles.userInfoContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                  size={24}
                  firstName={name}
                  lastName={lastname}
                />
              </View>
            )}
          </View>
          <Text
            variant="bold"
            style={styles.userInfoText}
            numberOfLines={1}
            accessibilityLabel={`${name} ${lastname}`}>
            {`${name} ${lastname}`.length > 25
              ? `${name} ${lastname}`.substring(0, 25) + '...'
              : `${name} ${lastname}`}
          </Text>
        </View>
        {/* <Text
          style={styles.date}
          accessibilityLabel={`Posted ${timePassed(createdAt)}`}>
          {timePassed(createdAt)}
        </Text> */}
      </View>
    );
  });

  const PollVoteView = () => {
    return (
      <View style={styles.userInfoContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            // borderWidth: 1,
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
            style={{ marginLeft: -5 }}
            onPress={() => handleUpvotePoll()}>
            <UpVoteIcon isUpvoted={pollVoteCount?.userVote === 'upvote'} />
          </TouchableOpacity>
          <Text
            style={{
              paddingHorizontal: 10,
              marginTop: -3,
              color: pollVoteCount?.userVote === 'upvote' ? '#078500' : 'black',
              fontSize: 14,
            }}
            variant="bold">
            {pollVoteCount?.pollUpvoteCount}
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
              isDownvoted={pollVoteCount?.userVote === 'downvote'}
            />
          </TouchableOpacity>
          <Text
            style={{
              paddingHorizontal: 8,
              marginTop: -3,
              color:
                pollVoteCount?.userVote === 'downvote' ? '#c00000' : 'black',
              fontSize: 14,
            }}
            variant="bold">
            {pollVoteCount?.pollDownvoteCount}
          </Text>
        </View>
        <Text
          style={styles.date}
          accessibilityLabel={`Posted ${timePassed(createdAt)}`}>
          {timePassed(createdAt)}
        </Text>
      </View>
    );
  };

  if (isDeleted || item?.isDeleted) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index + 100)
          .damping(20)
          .duration(500)
          .springify()}
        style={styles.container}
        key={pollID}>
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
    const { userVote, pollUpvoteCount, pollDownvoteCount } = pollVoteCount || {};
    let updatedVotes = { ...pollVoteCount };

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

    setPollVoteCount(updatedVotes);

    try {
      const pollVoteData = await Axios.post(`/upvote/poll/${pollData?._id}`);
      setPollVoteCount(pollVoteData?.data?.response);
    } catch (error) { }
  };

  const handleDownvotePoll = async () => {
    const { userVote, pollUpvoteCount, pollDownvoteCount } = pollVoteCount || {};
    let updatedVotes = { ...pollVoteCount };

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

    setPollVoteCount(updatedVotes);

    try {
      const pollVoteData = await Axios.post(`/downvote/poll/${pollData?._id}`);
      setPollVoteCount(pollVoteData?.data?.response);
    } catch (error) { }
  };

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(index + 100)
          .damping(20)
          .duration(500)
          .springify()}
        style={styles.container}
        key={pollID}>
        <View style={styles.pollHeader}>
          <>
            {!showTopPostedBy ? (
              <TouchableOpacity
                hitSlop={{
                  top: 10,
                  left: 10,
                  right: 10,
                  bottom: 10,
                }}
                disabled={
                  item?.poll?.owner?.userRoles?.includes('COM')
                    ? userRoles?.includes('COM')
                      ? false
                      : true
                    : false
                }
                onPress={() => goToCommunity(item)}>
                <Text
                  style={styles.communityName}
                  accessibilityLabel={`Community: ${communityName}`}>
                  {communityName}
                </Text>
              </TouchableOpacity>
            ) : (
              <UserInfo
                profilepic={profilepic}
                gender={gender}
                name={name}
                lastname={lastname}
              />
            )}
            {pollUserId === userId && showTreeDots && (
              <TouchableOpacity
                accessibilityLabel="More Options"
                style={{ height: 20, justifyContent: 'center' }}
                onPress={showBottomSheet}>
                <HorizontalThreeDots />
              </TouchableOpacity>
            )}
          </>
        </View>
        <Text
          variant="bold"
          style={styles.question}
          accessibilityLabel={`Poll title: ${title}`}>
          {title}
        </Text>
        <Text
          style={styles.selectInstruction}
          accessibilityLabel={
            allowMultipleOptions
              ? 'Select one or more options'
              : 'Select one option'
          }>
          {!allowMultipleOptions ? 'Select one' : 'Select one or more'}
        </Text>

        {/* Poll Results */}
        {pollResults.map(option => (
          <View key={option?._id} style={styles.optionContainer}>
            <TouchableOpacity
              disabled={memberStatus !== 'ACTIVE'}
              accessibilityLabel={`Select option: ${option?.option}`}
              onPress={() =>
                allowMultipleOptions
                  ? onCheckBoxChange(option?._id)
                  : onRadioChange(option?._id)
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
                      allowMultipleOptions
                        ? onCheckBoxChange(option?._id)
                        : onRadioChange(option?._id)
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
                progress={Math.round(option?.optionPercentage) / 100}
                color={theme.colors.primaryOrange}
                accessibilityLabel={`Progress bar for ${option?.option}`}
              />
            </TouchableOpacity>
          </View>
        ))}
        {!showTopPostedBy && (
          <UserInfo
            profilepic={profilepic}
            gender={gender}
            name={name}
            lastname={lastname}
          />
        )}
        {!showTopPostedBy && (
          <PollVoteView
            profilepic={profilepic}
            gender={gender}
            name={name}
            lastname={lastname}
          />
        )}
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
        {/* <SmallBottomSheet
          isVisible={isBottomSheetOpen}
          options={options}
          onClose={hideBottomSheet}
        /> */}

        <SmallBottomSheet
          ref={bottomSheetRef}
          options={options}
          enableCrossIcon={false}
          snapPoints={['15%']}
          customOptionStyle={{ color: 'black', fontSize: 18 }}
          optionVariant="bold"
          containerStyle={{ paddingTop: 0, paddingBottom: insets.bottom }}
          contentHeight={300}
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
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
    borderColor: '#dbdbdb',
    borderWidth: 1.3,
  },
  communityName: {
    color: theme.colors.primaryOrange,
    fontSize: 12,
  },
  date: {
    fontSize: 10,
    marginLeft: -15,
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
    marginTop: 10,
    height: 25,
    justifyContent: 'space-between',
    width: '100%',
  },
  userInfoText: {
    marginLeft: 5,
    fontSize: 14,
    textAlignVertical: 'center',
  },
  pollHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  votesText: {
    fontSize: 12,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(ShowPolls);
