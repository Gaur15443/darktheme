import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  CommonActions,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {createSelector} from '@reduxjs/toolkit';

import Axios from '../../../../plugin/Axios';
import Toast from 'react-native-toast-message';
import PrivateCommunityPopup from '../../CommunityComponents/PrivateCommunityPopup';
import {
  EmptyIndivisualComunity,
  CreatePollIcon,
  DiscussionIcon,
  IIconSuggestedInvite,
  ShareViaIcon,
  BackArrowIcon,
} from '../../../../images';
import RenderDiscussion from '../../DiscussionComponent/RenderDiscussion';
import CommunityHeader from './CommunityHeader'; // Adjust the path as necessary
import {BlurView} from '@react-native-community/blur';
import {ActivityIndicator} from 'react-native-paper';
import ShowPolls from '../../PollsComponent/ShowPolls';
import {cancelCommmunityJoinRequest} from '../../../../store/apps/createCommunity';
import theme from '../../../../common/NewTheme';
import Spinner from '../../../../common/Spinner';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SmallBottomSheet from '../../../../common/SmallBottomSheet';
import {Track} from '../../../../../App';
import EditIconDiscussion from '../../../../images/Icons/EditIconDiscussion';
import DeleteIconDiscussion from '../../../../images/Icons/DeleteIconDiscussion';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import {
  useGetAllCommunityPosts,
  useGetCommunityDetails,
} from '../../../../store/apps/communitiesApi';
import {getCommunityDetails} from '../../../../store/apps/getCommunityDetails';
import {useQueryClient} from '@tanstack/react-query';
import {updateCommuityJoinStatusCache} from '../../CommunityUtils/updateCommuityJoinStatusCache';
import NotificationBottomSheet from './NotificationBottomSheet';
import {Text} from 'react-native-paper';

// Memoized selector to prevent unnecessary re-renders
const selectCommunityDetails = createSelector(
  [state => state?.getCommunityDetails?.communityDetails],
  communityDetails => communityDetails || {},
);

const selectCommunityIdFromRedux = createSelector(
  [selectCommunityDetails],
  communityDetails => communityDetails?.data?.communityIdFromRedux,
);

const CommunityDetails = ({route}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  // const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(null);
  const [disscussionCreationDate, setDisscussionCreationDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [titleHeight, setTitleHeight] = useState(null);
  const pageIsFocused = useIsFocused();
  const userData = useSelector(state => state?.userInfo);

  // Need Community Id From Redux Store In Case It's Not Available - Fixed with memoized selector
  const communityDetails = useSelector(selectCommunityDetails);
  const communityIdFromRedux = useSelector(selectCommunityIdFromRedux);

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );
  const bottomSheetRefPost = useRef(null);
  const bottomSheetRef = useRef(null);
  const discussionThreeDotsBottomSheetRef = useRef(null);
  const communityNotificationBottomSheetRef = useRef(null);
  const [dataFromSingleDiscussion, setDataFromSingleDiscussion] =
    useState(null);
  const [openConfirmPopupDeleteDiscussion, seOpenConfirmPopupDeleteDiscussion] =
    useState(false);
  const [discussionId, setDiscussionId] = useState(null);
  const [descriptionHeight, setDescriptionHeight] = useState(null);
  const [communityId, setCommunityId] = useState(
    route?.params?.item?._id || communityIdFromRedux,
  );

  const [paddingTop, setPaddingTop] = useState(null);

  const scrollY = new Animated.Value(0);
  const tempLogo = route?.params?.item?.uploadedImage;
  const comingFromSearch = route?.params?.search || false;

  useFocusEffect(
    useCallback(() => {
      const markAllNotificationsRead = async () => {
        // Only call API if communityId is available
        const currentCommunityId =
          communityId || route?.params?.item?._id || communityIdFromRedux;
        if (!currentCommunityId) {
          console.warn('markAllNotificationsRead: No communityId available');
          return;
        }

        try {
          await Axios.put('/allNotificationsRead', {
            communityId: currentCommunityId,
          });
        } catch (error) {
          console.error('markAllNotificationsRead error:', error);
        }
      };

      markAllNotificationsRead();
    }, [communityId, route?.params?.item?._id, communityIdFromRedux]),
  );

  const {data, refetch} = useGetCommunityDetails(
    communityId || communityIdFromRedux,
  );
  const {
    data: {
      _id,
      communityDescription,
      logoUrl,
      privacyType,
      communityName,
      membersCount,
      memberProfiles,
      category,
    } = {},
    loggedInMemberData,
  } = data || {};
  const [requestStatus, setRequestStatus] = useState(
    loggedInMemberData?.memberStatus === 'REQUESTED' ? 'Requested' : 'Join',
  );

  const {
    data: allPosts,
    isLoading,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllCommunityPosts('community', communityId || communityIdFromRedux);

  const posts = allPosts?.pages?.flatMap(page => page.data) || [];
  const [communityPosts, setCommunityPosts] = useState(posts);
  const [dataFromSinglePoll, setDataFromSinglePoll] = useState(null);

  useEffect(() => {
    if (posts?.length > 0) setCommunityPosts(posts);
  }, [allPosts]);

  const options = [
    {
      icon: IIconSuggestedInvite,
      text: 'Community Details',
      onPress: () => {
        navigation.navigate('EditCommunity');
      },
    },
    {
      icon: ShareViaIcon,
      text: 'Invite Members',
      onPress: () => {
        navigation.navigate('CommunityInviteScreen');
      },
    },
    // Add more options as needed
  ];
  const optionsPost = [
    {
      icon: DiscussionIcon,
      text: 'Start a Discussion',
      onPress: () => {},
    },
    {
      icon: CreatePollIcon,
      text: 'Create a Poll',
      onPress: () => {},
    },
    // Add more options as needed
  ];

  const discussionThreeDotOptions = [
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

  // Calculate padding only when descriptionHeight is available
  const calculatePaddingTop = () => {
    if (descriptionHeight === null) return 0; // Wait until height is calculated

    const basePadding =
      loggedInMemberData?.memberStatus === 'ACTIVE' ? 170 : 170;
    const platformPadding = Platform.OS === 'android' ? top : 30;
    const finalPadding =
      basePadding + platformPadding + descriptionHeight + titleHeight - 30;

    setPaddingTop(finalPadding);
  };

  const openModelBottom = id => {
    setDiscussionId(id);
    discussionThreeDotsBottomSheetRef.current?.open();
  };

  const {top} = useSafeAreaInsets();

  const handleOpenBottomSheet = () => {
    bottomSheetRefPost.current?.open();
  };

  const onClickOpenBottomSheet = () => {
    bottomSheetRef.current?.open();
  };

  const onClickOpenNotificationBottomSheet = () => {
    communityNotificationBottomSheetRef.current?.open();
  };

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {useNativeDriver: false},
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 1], // Adjust scale values as needed
    extrapolate: 'clamp',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchPosts();
      await refetch();
    } catch (err) {
    } finally {
      setRefreshing(false);
    }
  };

  const getDiscussionById = async _id => {
    if (!_id) {
      return;
    }
    const data = await Axios.get(`getDiscussionById/${_id}`);
    if (data) {
      return data?.data?.data;
    }
  };

  const editDiscussion = async () => {
    if (!discussionId) {
      return;
    }
    const discussionData = await getDiscussionById(discussionId);
    if (discussionData) {
      navigation.navigate('CreateCommunityPosts', {
        discussionData: discussionData,
        action: 'Edit',
        screen: 'community',
        location: 'communityFeeds',
        onGoBack: data => {
          setDataFromSingleDiscussion(data);
        },
      });
    }
  };

  const handleJoinCommunity = async requestStatus => {
    if (requestStatus === 'Join') {
      const apiUrl = `/userCommunityJoinRequest/${communityId}`;
      const res = await Axios.put(apiUrl);
      if (res.status === 200) {
        if (privacyType === 'Private') {
          setRequestStatus('Requested');
          updateCommuityJoinStatusCache(queryClient, communityId, 'REQUESTED');
          Toast.show({
            type: 'success',
            text1: toastMessages?.['5002'],
          });
        } else {
          Toast.show({
            type: 'success',
            text1: toastMessages?.['5003'],
          });
          // Refetch Posts and Community Details
          refetch();
          refetchPosts();
          updateCommuityJoinStatusCache(queryClient, communityId, 'ACTIVE');
          /* customer io and mixpanel event changes  start */
          const props = {
            community_name: communityName,
            type: privacyType,
            category: category?.categoryName,
          };
          Track({
            cleverTapEvent: 'community_joined',
            mixpanelEvent: 'community_joined',
            userData,
            cleverTapProps: props,
            mixpanelProps: props,
          });
          /*  Clevertap and mixpanel events  ---end */
        }
      }
    }
    if (requestStatus === 'Requested') {
      const result = await dispatch(
        cancelCommmunityJoinRequest(communityId),
      ).unwrap();
      if (result?.success) {
        // Refetch Posts and Community Details
        refetch();
        refetchPosts();
        updateCommuityJoinStatusCache(queryClient, communityId, 'INACTIVE');
        setRequestStatus('Join');
      }
    }
  };

  const deleteDiscussion = async id => {
    try {
      const response = await Axios.delete(`discussion/${id}`);
      if (response?.data?.success) {
        handleRemoveDiscussion(id);
      }
    } catch (error) {}
  };

  // Remove Deleted Discussion From list
  const handleRemoveDiscussion = discussionId => {
    setCommunityPosts(prevPosts =>
      prevPosts.map(post => {
        if (post?.postType === 'CD' && post.discussion?._id === discussionId) {
          // Add an additional key to mark it as deleted
          return {...post, isDeleted: true};
        }
        return post;
      }),
    );
  };

  const handleRemovePoll = pollId => {
    setCommunityPosts(prevPosts =>
      prevPosts.map(post => {
        if (post?.postType === 'CP' && post.poll?._id === pollId) {
          // Add an additional key to mark it as deleted
          return {...post, isDeleted: true};
        }
        return post;
      }),
    );
  };

  const goBack = () => {
    if (comingFromSearch) {
      navigation.goBack();
    } else {
      if (route?.params?.fromInsideDiscussion) {
        navigation.goBack();
      } else {
        route?.params?.onGoBack?.({updated: Math.random()});
        // navigation.navigate('BottomTabs', {screen: 'CommunitiesScreenTab'});
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'BottomTabs',
                params: {screen: 'CommunitiesScreenTab'},
              },
            ],
          }),
        );
      }
    }
  };

  // Fetch Community Details
  const fetchCommunityDetails = async () => {
    try {
      await dispatch(getCommunityDetails(communityId || communityIdFromRedux));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    }
  };

  //  All UseEffects
  useFocusEffect(
    useCallback(() => {
      let timeoutId;

      if (communityId) {
        //Fetch Community Data for Redux so that it is available for community internl screens
        fetchCommunityDetails();
        if (route?.params?.item?.fromScreen === 'createCommunity') {
          // Delay to fetch initially added members
          timeoutId = setTimeout(() => {
            refetch();
            refetchPosts();
          }, 1000);
        } else {
          refetch();
          refetchPosts();
        }
      }

      // Cleanup to avoid memory leaks
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [communityId, route?.params?.item?.fromScreen]),
  );

  // update discussion Vote fields
  useEffect(() => {
    if (dataFromSingleDiscussion) {
      const updateCommunityPostDiscussionFields = (
        discussionId,
        updatedFields,
      ) => {
        setCommunityPosts(prevPosts =>
          prevPosts.map(post => {
            if (
              post?.postType === 'CD' &&
              post.discussion?._id === discussionId
            ) {
              return {
                ...post,
                discussion: {
                  ...post.discussion,
                  ...updatedFields,
                },
              };
            }
            return post;
          }),
        );
      };

      updateCommunityPostDiscussionFields(
        dataFromSingleDiscussion.discussionId,
        {
          userVote: dataFromSingleDiscussion.userVote,
          discussionUpvoteCount: dataFromSingleDiscussion.discussionUpvoteCount,
          discussionDownvoteCount:
            dataFromSingleDiscussion.discussionDownvoteCount,
        },
      );
    }
  }, [dataFromSingleDiscussion]);

  // update poll vote fields
  useEffect(() => {
    if (dataFromSinglePoll) {
      const updateCommunityPollFields = (pollId, updatedFields) => {
        setCommunityPosts(prevPosts =>
          prevPosts.map(poll => {
            if (poll?.postType === 'CP' && poll.poll?._id === pollId) {
              return {
                ...poll,
                poll: {
                  ...poll.poll,
                  ...updatedFields, // ✅ update only specific keys inside discussion
                },
              };
            }
            return poll;
          }),
        );
      };

      updateCommunityPollFields(dataFromSinglePoll.pollId, {
        userVote: dataFromSinglePoll.userVote,
        pollUpvoteCount: dataFromSinglePoll.pollUpvoteCount,
        pollDownvoteCount: dataFromSinglePoll.pollDownvoteCount,
      });
    }
  }, [dataFromSinglePoll]);

  useEffect(() => {
    if (descriptionHeight !== null) {
      calculatePaddingTop();
    }
  }, [descriptionHeight]);

  useEffect(() => {
    if (loggedInMemberData?.memberStatus) {
      setRequestStatus(
        loggedInMemberData?.memberStatus === 'REQUESTED' ? 'Requested' : 'Join',
      );
    }
  }, [loggedInMemberData]);

  useEffect(() => {
    const listener = scrollY.addListener(({value}) => {
      setScrolled(value > 50); // Adjust threshold as needed
    });
    return () => scrollY.removeListener(listener);
  }, [scrollY]);

  useEffect(() => {
    if (dataFromSingleDiscussion?.random && dataFromSingleDiscussion?._id) {
      // Remove using discussion id
      handleRemoveDiscussion(dataFromSingleDiscussion?._id);
    }
  }, [dataFromSingleDiscussion]);

  useEffect(() => {
    if (dataFromSinglePoll?.random && dataFromSinglePoll?._id) {
      // Remove using discussion id
      handleRemovePoll(dataFromSinglePoll?._id);
    }
  }, [dataFromSinglePoll]);

  // Update Discussion Without Refresh
  useEffect(() => {
    if (
      dataFromSingleDiscussion?.newUpdated &&
      dataFromSingleDiscussion?.newDiscussionData
    ) {
      // Transformation function
      function transformData(data) {
        return {
          communityDetail: {
            _id: data.communityDetails._id,
            communityName: data.communityDetails.communityName,
            logoUrl: data.communityDetails.logoUrl,
          },
          discussion: {
            __v: data.communityDetails.__v,
            _id: data._id,
            createdAt: data.createdAt,
            discussionlikes: data.discussionlikes || [],
            mediaDetails: data.mediaDetails,
            mediaIds: data.mediaDetails.map(media => media._id),
            owner: {
              _id: data.owner._id,
              personalDetails: data.owner.personalDetails,
            },
            shortDescription: data.shortDescription,
            title: data.title,
            updatedAt: data.updatedAt,
          },
          postType: 'CD',
        };
      }

      const transformedData = transformData(
        dataFromSingleDiscussion?.newDiscussionData,
      );
      setCommunityPosts(prevPosts =>
        prevPosts.map(post => {
          if (
            post.postType === 'CD' &&
            post.discussion._id === transformedData.discussion._id
          ) {
            // Update the specific post with the transformed data
            return transformedData;
          }
          return post;
        }),
      );
    }

    if (
      dataFromSingleDiscussion?.thumbnailUrl &&
      dataFromSingleDiscussion?.createdAt
    ) {
      setUrl(dataFromSingleDiscussion?.thumbnailUrl);
      setDisscussionCreationDate(dataFromSingleDiscussion?.createdAt);
    }
  }, [dataFromSingleDiscussion]);

  const renderItem = ({item, index}) => (
    <View style={styles.itemContainer}>
      {index === 0 &&
        privacyType === 'Private' &&
        loggedInMemberData?.memberStatus !== 'ACTIVE' && (
          <PrivateCommunityPopup />
        )}

      {privacyType === 'Private' &&
        loggedInMemberData?.memberStatus !== 'ACTIVE' && (
          <>
            <BlurView
              blurType="light"
              blurAmount={4}
              reducedTransparencyFallbackColor="white"
              style={styles.blur}
              accessibilityLabel="Content-blurred"
            />
          </>
        )}
      <View
        style={
          index === 0 &&
          loggedInMemberData?.memberStatus !== 'ACTIVE' && {paddingTop: 20}
        }>
        {item?.postType === 'CD' && (
          <RenderDiscussion
            item={item}
            index={index}
            memberStatus={loggedInMemberData?.memberStatus}
            screen={'community'}
            onThreeDotPressed={openModelBottom}
            setDataFromSingleDiscussion={setDataFromSingleDiscussion}
            thumbnailUrl={
              item?.discussion?.createdAt ===
                dataFromSingleDiscussion?.createdAt &&
              dataFromSingleDiscussion?.thumbnailUrl
                ? url
                : null
            }
          />
        )}
        {item.postType === 'CP' && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ViewSinglePoll', {
                _id: item?.poll?._id,
                onGoBack: data => {
                  setDataFromSinglePoll(data);
                },
              })
            }>
            <ShowPolls
              index={index}
              item={item}
              memberRole={loggedInMemberData?.memberRole}
              memberStatus={loggedInMemberData?.memberStatus}
              showTopPostedBy={false}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = ({item, index}) => (
    <View style={styles.itemContainer}>
      {privacyType === 'Private' &&
        loggedInMemberData?.memberStatus !== 'ACTIVE' && (
          <PrivateCommunityPopup />
        )}

      {privacyType === 'Private' &&
        loggedInMemberData?.memberStatus !== 'ACTIVE' && (
          <>
            <BlurView
              blurType="light"
              blurAmount={5}
              reducedTransparencyFallbackColor="white"
              style={styles.blur}
            />
          </>
        )}
      <View style={{paddingTop: 100}} accessibilityLabel="No-posts-available">
        <EmptyIndivisualComunity />
      </View>
    </View>
  );
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        style={styles.loadingIndicator}
        accessibilityLabel="Loading-more-posts"
      />
    );
  };

  const getDynamicHeaderMaxHeight = length => {
    if (length < 100) return 280;
    if (length < 200) return 310;
    if (length < 300) return 340;
    return 460;
  };

  const length = communityDescription?.length || 0;

  const HEADER_MAX_HEIGHT = getDynamicHeaderMaxHeight(length);
  const HEADER_MIN_HEIGHT = 20;

  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [10, 0], // starts lower, moves up
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [90, 100],
    outputRange: [0, 1], // fades in
    extrapolate: 'clamp',
  });

  const titleOpacityDescription = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 1.3],
    outputRange: [1, 0], // fades in
    extrapolate: 'clamp',
  });

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: loading
            ? theme.colors.backgroundCreamy
            : theme.colors.backgroundCreamy,
        }}>
        <View style={{flex: 1, backgroundColor: theme.colors.backgroundCreamy}}>
          <View style={StyleSheet.absoluteFill}>
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
            ) : (
              // Show header and list only after loading is complete
              <>
                <Animated.View
                  style={[
                    stylesAnimation.header,
                    {
                      transform: [{translateY: headerTranslateY}],
                      opacity: titleOpacityDescription,
                      zIndex: 1,
                    },
                  ]}
                  accessibilityLabel="Community-header">
                  <Animated.Image
                    style={[
                      stylesAnimation.headerBackground,
                      {
                        opacity: imageOpacity,
                        transform: [{translateY: imageTranslateY}],
                        top: insets.top,
                      },
                    ]}
                  />
                  <CommunityHeader
                    communityId={communityId}
                    logoUrl={tempLogo?.path || logoUrl}
                    communityName={communityName}
                    membersCount={membersCount}
                    category={category?.categoryName}
                    communityDescription={communityDescription}
                    goBack={goBack}
                    handleJoinCommunity={handleJoinCommunity}
                    requestStatus={requestStatus}
                    loggedInMemberData={loggedInMemberData}
                    onClickOpenBottomSheet={onClickOpenBottomSheet}
                    onClickOpenNotificationBottomSheet={
                      onClickOpenNotificationBottomSheet
                    }
                    scrolled={scrolled}
                    avatars={memberProfiles}
                    animatedHeaderHeight={headerHeight}
                    handleOpenBottomSheet={handleOpenBottomSheet}
                    privacyType={privacyType}
                    setDescriptionHeight={setDescriptionHeight}
                    setTitleHeight={setTitleHeight}
                  />
                </Animated.View>
                <View
                  style={{
                    justifyContent: 'center',
                    flex: 1,
                    paddingTop: Platform.OS === 'ios' ? 20 : 0,
                  }}
                  pointerEvents={
                    privacyType === 'Private' &&
                    loggedInMemberData?.memberStatus !== 'ACTIVE'
                      ? 'none'
                      : 'auto'
                  }
                  accessibilityLabel="Community-post-list">
                  {paddingTop !== null && (
                    <FlatList
                      data={communityPosts}
                      scrollEnabled={
                        privacyType === 'Public' ||
                        loggedInMemberData?.memberStatus === 'ACTIVE'
                      }
                      renderItem={renderItem}
                      keyExtractor={item => {
                        if (item?.postType === 'CD') {
                          return `${item.discussion._id}-${item.discussion.discussionUpvoteCount}`;
                        }
                        if (item?.postType === 'CP') {
                          return `${item?.poll?._id}-${item?.poll?.pollUpvoteCount}`;
                        }
                      }}
                      contentContainerStyle={{
                        paddingTop,
                        paddingBottom: 50,
                      }} // Adjust padding to match header height
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                          tintColor={theme.colors.primaryOrange}
                          colors={[theme.colors.primaryOrange]}
                          progressViewOffset={paddingTop}
                        />
                      }
                      onScroll={handleScroll}
                      scrollEventThrottle={16}
                      ListEmptyComponent={renderEmptyState}
                      onEndReached={
                        hasNextPage && !isFetchingNextPage && fetchNextPage
                      }
                      ListFooterComponent={renderFooter}
                      onEndReachedThreshold={0.5}
                      bounces={communityPosts?.length > 0 ? true : false}
                      accessibilityLabel="Community-posts-flatlist"
                    />
                  )}
                </View>
                <Animated.View
                  style={[
                    stylesAnimation.headerBackground,
                    {
                      transform: [{translateY: titleTranslateY}],
                      opacity: titleOpacity,
                    },
                  ]}>
                  <Animated.Image
                    style={[
                      stylesAnimation.topBar,
                      {
                        transform: [{translateY: titleTranslateY}],
                      },
                    ]}
                    source={{
                      uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityHeaderBackground.png',
                    }}
                  />
                  <View style={styles.stickyHeader}>
                    <TouchableOpacity
                      style={styles.headerIcon}
                      onPress={goBack}
                      accessibilityLabel="Go-back"
                      accessibilityRole="button">
                      <BackArrowIcon />
                    </TouchableOpacity>
                    <Text
                      variant="bold"
                      style={styles.communityNameSticky}
                      accessibilityLabel={`Community_name-${communityName}`}>
                      {communityName}
                    </Text>
                  </View>
                </Animated.View>
              </>
            )}

            {openConfirmPopupDeleteDiscussion && (
              <Confirm
                title="Are you sure you want to delete this discussion"
                subTitle=""
                discardCtaText="Cancel"
                continueCtaText="Delete"
                onContinue={() => {
                  seOpenConfirmPopupDeleteDiscussion(false);
                  if (discussionId) {
                    deleteDiscussion(discussionId);
                  }
                }}
                onDiscard={() => {
                  seOpenConfirmPopupDeleteDiscussion(false);
                }}
                accessibilityLabel="confirm-popup-basic-fact"
                onCrossClick={() => seOpenConfirmPopupDeleteDiscussion(false)}
              />
            )}

            <SmallBottomSheet
              ref={bottomSheetRefPost}
              options={optionsPost}
              customOptionStyle={{color: 'black', fontSize: 18}}
              customTitleStyle={{color: 'black', fontSize: 22}}
              titleVariant={'bold'}
              contentHeight={300}
              containerStyle={{height: 170}}
              disableSnapPoint={true}
              enableDynamicSizingProp={false}
            />

            <SmallBottomSheet
              ref={bottomSheetRef}
              options={options}
              enableCrossIcon={false}
              contentHeight={300}
              optionVariant={'bold'}
              containerStyle={{height: 170}}
              disableSnapPoint={true}
              enableDynamicSizingProp={false}
              customOptionStyle={{
                fontSize: 18,
                color: 'black',
              }}
            />

            {/* Discussion Delete and Edit Options */}
            <SmallBottomSheet
              ref={discussionThreeDotsBottomSheetRef}
              options={discussionThreeDotOptions}
              customOptionStyle={{fontSize: 18, color: 'black'}}
              optionVariant="bold"
              enableCrossIcon={false}
              containerStyle={{height: 170}}
              disableSnapPoint={true}
              enableDynamicSizingProp={false}
              contentHeight={300}
            />

            <NotificationBottomSheet
              ref={communityNotificationBottomSheetRef}
              customOptionStyle={{fontSize: 18, color: 'black'}}
              optionVariant="bold"
              enableCrossIcon={false}
              containerStyle={{height: 500}}
              disableSnapPoint={true}
              enableDynamicSizingProp={false}
              contentHeight={500}
              communityId={communityId}
              preferenceValue={loggedInMemberData?.notificationPreference}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const stylesAnimation = StyleSheet.create({
  saveArea: {
    flex: 1,
    backgroundColor: '#eff3fb',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#402583',
    backgroundColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 1,
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    resizeMode: 'cover',
    paddingTop: 30,
  },
  topBar: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    resizeMode: 'cover',
  },
  title: {
    color: 'white',
    fontSize: 20,
  },
  avatar: {
    height: 54,
    width: 54,
    resizeMode: 'contain',
    borderRadius: 54 / 2,
  },
  fullNameText: {
    fontSize: 16,
    marginLeft: 24,
  },
});

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: theme.colors.backgroundCreamy,
    // elevation: 7,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.22,
    // shadowRadius: 2.22,
  },

  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundCreamy,
    height: 'auto',
  },

  blur: {
    zIndex: 1,
    width: '100%',
    height: '100%',
    borderColor: 'black',
    position: 'absolute',
    opacity: 1,
    bottom: 0,
    left: 0,
    top: 0,
    right: 0,
  },
  contentContainer: {
    flex: 1,
    // padding: 20,
    paddingLeft: 13,
    paddingRight: 13,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '500',
  },
  closeButton: {
    padding: 5,
    flexDirection: 'row',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'black',
  },
  rowContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 20,
    paddingLeft: '9%',
    paddingTop: '2%',
  },
  rowText: {
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 10,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  stickyHeader: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerIcon: {
    marginTop: 15,
  },
  communityNameSticky: {
    fontSize: 18,
    flex: 1,
    color: 'black',
    marginTop: 6,
  },
});

export default CommunityDetails;
