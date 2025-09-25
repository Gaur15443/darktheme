import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
  Dimensions,
  RefreshControl,
  Animated,
} from 'react-native';
import {Text, ActivityIndicator} from 'react-native-paper';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';

import {useDispatch, useSelector} from 'react-redux';
import {CommunityHomeEmptyState, PlusIcon, UpArrow} from '../../../../images';
import HorizontalCardList from '../../CommunityComponents/HorizontalCardList';
import {ScrollView} from 'react-native-gesture-handler';
import {searchAndFilterCommunities} from '../../../../store/apps/createCommunity';
import theme from '../../../../common/NewTheme';
import {getAllCommunityPosts} from '../../../../store/apps/getAllCommunityPosts';
import RenderDiscussion from '../../DiscussionComponent/RenderDiscussion';
import ShowPolls from '../../PollsComponent/ShowPolls';
import Spinner from '../../../../common/Spinner';
import Toast from 'react-native-toast-message';
import CommunityIntroPopup from '../../CommunityComponents/CommunityIntroPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DrawerCustomHeader from '../../CommunityComponents/DrawerCustomHeader';
import GlobalHeader from '../../../ProfileTab/GlobalHeader';
import Drawer from '../../CommunityComponents/DrawerMenu/Drawer';
import {Track} from '../../../../../App';
import {useQueryClient} from '@tanstack/react-query';
import {useGetAllCommunityPosts} from '../../../../store/apps/communitiesApi';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

const CommunityHomeScreen = ({updated, route, userVoted}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [lastRandom, setLastRandom] = useState(null);

  const queryClient = useQueryClient();
  const [randomNo, setRandomNo] = useState(0);

  const {
    data: allPosts,
    isLoading,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllCommunityPosts('home', null, randomNo);

  const posts = allPosts?.pages?.flatMap(page => page.data) || [];
  const [communityPosts, setCommunityPosts] = useState(posts);

  const [popularCommunities, setPopularCommunities] = useState([]);
  const [url, setUrl] = useState(null);
  const [disscussionCreationDate, setDisscussionCreationDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataFromSingleDiscussion, setDataFromSingleDiscussion] =
    useState(null);
  const [refresh, setRefresh] = useState(null);
  const flatlistRef = useRef(null);
  const [showGoToTopButton, setShowGoToTopButton] = useState(false);
  const [introPopup, setIntroPopup] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const userData = useSelector(state => state?.userInfo);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const [showEmptyState, setShowEmptyState] = useState(false);
  const insets = useSafeAreaInsets();
  const [dataFromSinglePoll, setDataFromSinglePoll] = useState(null);

  useEffect(() => {
    if (communityPosts.length === 0 && !isLoading) {
      const timer = setTimeout(() => setShowEmptyState(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowEmptyState(false);
    }
  }, [communityPosts, isLoading]);

  useEffect(() => {
    if (posts?.length > 0) setCommunityPosts(posts);
  }, [allPosts]);

  // Function to fetch more posts with a new random number
  const fetchMorePosts = () => {
    const newRandom = generateRandom();
    setRandomNo(newRandom); // Update state so next fetch uses new randomNo
    fetchNextPage();
  };

  useEffect(() => {
    if (drawerVisible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide in to the visible screen
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [drawerVisible]);

  const startTimeRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      // On focus
      startTimeRef.current = Date.now();

      return () => {
        // On unfocus
        const endTime = Date.now();
        const durationSeconds = Math.round(
          (endTime - startTimeRef.current) / 1000,
        );

        let readableDuration = '';

        if (durationSeconds >= 3600) {
          const hours = Math.floor(durationSeconds / 3600);
          readableDuration = `${hours}h`;
        } else if (durationSeconds >= 60) {
          const minutes = Math.floor(durationSeconds / 60);
          readableDuration = `${minutes}m`;
        } else {
          readableDuration = `${durationSeconds}s`;
        }

        const props = {
          duration: readableDuration,
        };

        // Combined CleverTap + Mixpanel event with duration
        Track({
          cleverTapEvent: 'Communities_Tab_Visited',
          mixpanelEvent: 'Communities_Tab_Visited',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });
      };
    }, []),
  );

  useEffect(() => {
    // Trigger only once when component mounts (not unfocus)
    setRandomNo(generateRandom());
    checkAndSetPopup();
  }, []);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };
  const closeDrawer = () => {
    setDrawerVisible(false);
  };
  const rightElementPress = () => {
    navigation.navigate('CommunitySearchScreen');

    setDrawerVisible(false);
  };

  const generateRandom = () => {
    let random;
    do {
      random = Math.floor(Math.random() * 4);
    } while (random === lastRandom);
    setLastRandom(random);
    return random;
  };

  const fetchCommunities = async (filterType, page, first) => {
    try {
      const payload = {
        page: page,
        filterOn: filterType,
      };
      const response = await dispatch(searchAndFilterCommunities(payload));
      if (response?.payload?.data?.length > 0) {
        if (first && filterType === 'popular') {
          setPopularCommunities(response.payload.data);
        }
      } else {
        return response.payload.data;
      }
      return response.payload.data;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    }
  };

  // Remove Deleted Discussion From list
  useEffect(() => {
    if (dataFromSingleDiscussion) {
      const handleRemoveCommunity = discussionId => {
        setCommunityPosts(prevPosts =>
          prevPosts.map(post => {
            if (
              post?.postType === 'CD' &&
              post.discussion?._id === discussionId
            ) {
              // Add an additional key to mark it as deleted
              return {...post, isDeleted: true};
            }
            return post;
          }),
        );
      };
      handleRemoveCommunity(dataFromSingleDiscussion?._id);
    }
  }, [dataFromSingleDiscussion]);

  useEffect(() => {
    if (dataFromSinglePoll) {
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
      handleRemovePoll(dataFromSinglePoll?._id);
    }
  }, [dataFromSinglePoll]);

  //update discussion Vote fields
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
                  ...updatedFields, // ✅ update only specific keys inside discussion
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

  //update poll vote fields
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

  // Update Discussion
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
  }, [
    dataFromSingleDiscussion?.newUpdated,
    dataFromSingleDiscussion?.thumbnailUrl,
  ]);

  // Fetch Data Initially
  const fetchData = async () => {
    try {
      await Promise.all([fetchCommunities('popular', 1, true)]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // To Close Drawer When We change Tabs
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setDrawerVisible(false);
      };
    }, []),
  );

  const goToCommunitySearch = () => {
    navigation.navigate('CommunitySearchScreen');
  };

  const goToCreateCommunityPosts = () => {
    navigation.navigate('CreateCommunityPosts', {
      fromScreen: 'communityHome',
      onGoBack: data => setRefresh(data),
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const randomNo = generateRandom();
    setRandomNo(randomNo);
    try {
      await Promise.all([
        queryClient.invalidateQueries([
          'communityAllPosts',
          'home',
          null,
          randomNo,
        ]),
      ]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const checkAndSetPopup = async () => {
    try {
      // await AsyncStorage.removeItem('hasSeenCommunityIntro'); // Remove for testing

      const hasSeenPopup = await AsyncStorage.getItem('hasSeenCommunityIntro');
      if (!hasSeenPopup && communityPosts?.length === 0) {
        setIntroPopup(true);
        await AsyncStorage.setItem('hasSeenCommunityIntro', 'true');
      }
    } catch (error) {
      console.error('Error checking or saving popup flag:', error);
    }
  };

  const handleScroll = event => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowGoToTopButton(offsetY > 200);
  };

  const scrollToTop = () => {
    flatlistRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  const renderEmptyState = () => (
    <ScrollView
      contentContainerStyle={styles.emptyStateContainer}
      accessibilityLabel="Empty-state-view">
      <View style={styles.emptyStateIcon}>
        <CommunityHomeEmptyState />

        {/* Explore Communities Button */}
        <TouchableOpacity
          // style={{overflow: 'hidden'}}
          style={styles.exploreBtn}
          onPress={goToCommunitySearch}
          accessibilityLabel="Explore-Communities-button">
          <View>
            <Text
              style={styles.buttonTitle}
              accessibilityLabel="Explore-Communities-text">
              Explore Communities
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={{
          minHeight: 170,
          marginHorizontal: -20,
        }}
        accessibilityLabel="Popular-communities-horizontal-card-list">
        <HorizontalCardList
          initialData={popularCommunities}
          fetchMoreData={fetchCommunities}
          paginationLimit={10}
        />
      </View>
    </ScrollView>
  );

  const renderItem = ({item, index}) => {
    if (!item) return null;
    return (
      <>
        {index === 0 && (
          <Text
            variant="bold"
            style={{
              marginHorizontal: 10,
              marginBottom: 10,
              fontSize: 16,
              color: 'black',
            }}>
            Recent Feeds
          </Text>
        )}

        {item?.postType === 'CM' && (
          <View
            style={{marginHorizontal: -10}}
            accessibilityLabel="Horizontal-card-list-view">
            <HorizontalCardList
              initialData={item?.data}
              fetchMoreData={fetchCommunities}
              paginationLimit={10}
              filterType={item?.filterOn}
            />
          </View>
        )}

        <View
          style={styles.postsContainer}
          accessibilityLabel="Community posts container">
          {item?.postType === 'CD' && (
            <RenderDiscussion
              item={item}
              index={index}
              memberRole={'Member'}
              memberStatus={'ACTIVE'}
              showTreeDots={false}
              setDataFromSingleDiscussion={setDataFromSingleDiscussion}
              screen="home"
              thumbnailUrl={
                item?.discussion?.createdAt ===
                  dataFromSingleDiscussion?.createdAt &&
                dataFromSingleDiscussion?.thumbnailUrl
                  ? url
                  : null
              }
            />
          )}

          {item?.postType === 'CP' && (
            // <View><Text>dsf</Text></View>
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
                memberStatus={'ACTIVE'}
                memberRole={'Member'}
                showTreeDots={false}
                showTopPostedBy={false}
              />
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        style={styles.loadingIndicator}
        accessibilityLabel="Loading more posts"
      />
    );
  };
  const CustomFAB = ({onPress}) => {
    return (
      <TouchableOpacity
        style={
          showGoToTopButton
            ? [styles.fab, {bottom: insets.bottom + 110}]
            : [styles.goToTopfab, {bottom: insets.bottom + 50}]
        }
        onPress={onPress}
        accessibilityLabel={'Plus Button'}
        activeOpacity={1}>
        <PlusIcon color="white" opacity={0.8} size={30} />
      </TouchableOpacity>
    );
  };

  const GoToTop = ({onPress}) => {
    return (
      <TouchableOpacity
        style={[styles.goToTopfab, {bottom: insets.bottom + 50}]}
        onPress={onPress}
        activeOpacity={1}>
        <UpArrow opacity={0.8} />
      </TouchableOpacity>
    );
  };

  const pageIsFocused = useIsFocused();

  return (
    <>
      {introPopup && communityPosts?.length === 0 && !isLoading && (
        <CommunityIntroPopup
          visible={introPopup}
          onClose={() => setIntroPopup(false)}
        />
      )}
      <View>
        <DrawerCustomHeader
          heading={'Communities'}
          toggleDrawer={toggleDrawer}
          drawerVisible={drawerVisible}
          onPressAction={rightElementPress}
        />
      </View>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.backgroundCreamy,
        }}
        accessibilityLabel="community home page">
        {isLoading ? ( // Only show loader while loading
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            accessibilityLabel="Loading spinner">
            <Spinner />
          </View>
        ) : (
          <>
            {/* Drawer */}
            {drawerVisible && (
              <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={toggleDrawer}
              />
            )}
            <Drawer
              slideAnim={slideAnim}
              closeDrawer={closeDrawer}
              setRefresh={setRefresh}
            />
            <View
              accessibilityLabel="Community posts list"
              style={{
                justifyContent: 'center',
                flex: 1,
                width: width,
              }}>
              <FlatList
                ref={flatlistRef}
                data={communityPosts}
                renderItem={renderItem}
                // keyExtractor={(item, index) => index.toString()}
                keyExtractor={item => {
                  if (item?.postType === 'CD') {
                    return `${item.discussion._id}-${item.discussion.discussionUpvoteCount}`;
                  }
                  if (item?.postType === 'CP') {
                    return `${item?.poll?._id}-${item?.poll?.pollUpvoteCount}`;
                  }
                }}
                ListEmptyComponent={showEmptyState && renderEmptyState}
                onEndReached={
                  hasNextPage && !isFetchingNextPage && fetchMorePosts
                }
                ListFooterComponent={renderFooter}
                contentContainerStyle={
                  communityPosts.length > 0
                    ? {paddingBottom: 100, paddingTop: 10}
                    : {}
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme.colors.primaryOrange}
                    colors={[theme.colors.primaryOrange]}
                  />
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={{width: '100%'}}
                accessibilityLabel="Community posts flat list"
              />
            </View>
          </>
        )}
      </SafeAreaView>
      <CustomFAB onPress={goToCreateCommunityPosts} />
      {showGoToTopButton && <GoToTop onPress={scrollToTop} />}
    </>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    width: width,
    flex: 1,
    backgroundColor: theme.colors.backgroundCreamy,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
  },
  postsContainer: {
    backgroundColor: theme.colors.backgroundCreamy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  exploreBtn: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.colors.primaryOrange,
    marginTop: 30,
    backgroundColor: 'white',
  },
  buttonTitle: {
    fontSize: 18,
    color: theme.colors.primaryOrange,
    lineHeight: 23.5,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  fab: {
    position: 'absolute',
    width: 50,
    height: 50,
    margin: 16,
    right: 8,
    // bottom: 140,
    backgroundColor: theme.colors.primaryOrange,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  goToTopfab: {
    position: 'absolute',
    width: 50,
    height: 50,
    margin: 16,
    right: 8,
    bottom: height / 10,
    backgroundColor: theme.colors.primaryOrange,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    zIndex: 1,
  },
});
export default CommunityHomeScreen;
