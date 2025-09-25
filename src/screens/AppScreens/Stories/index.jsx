/* eslint-disable no-use-before-define */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllStories,
  resetViewStories,
  resetAllPages,
  resetEmptyFilterStack,
  fetchStoryLikes,
  setStoryFilters,
} from '../../../store/apps/story';
import { setCurrentVideoInstance } from '../../../store/apps/mediaSlice';
import { getUserInfo } from '../../../store/apps/userInfo';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { timePassed } from '../../../utils/format';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {
  DefaultImage,
  StoriesHeader,
  CollabProfileView,
} from '../../../components';
import {
  TopQuoteIcon,
  BottomQuoteIcon,
  StorieEmptyState,
  DraftEmptyState,
  PostEmptyState,
  LikeButton,
  CommentButton,
} from '../../../images';
import Filters from '../../../components/stories/Filters';
import { VideoThumbnail } from '../../../core';

import { Constants, Theme } from '../../../common';

import { Text, useTheme } from 'react-native-paper';
import Spinner from '../../../common/Spinner';
import MyPostsEmptyState from './../../../images/Icons/MyPostsEmptyState';
import { colors } from '../../../common/NewTheme';
import { CustomButton } from '../../../core';
import ButtonSpinner from './../../../common/ButtonSpinner';
import Share from 'react-native-share';
import ShareIcon from '../../../images/Icons/ShareIcon';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FastImage from '@d11/react-native-fast-image';
import getFilterData from '../../../store/apps/home';
import CreateStoryFloatingIcon from '../../../images/Icons/CreateStoryFloatingIcon';
import ArrowUpIcon from '../../../images/Icons/ArrowUpIcon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Stories({ route }) {
  const { width } = Dimensions.get('window') || 200;
  const dispatch = useDispatch();
  const scrollViewRef = useRef();

  const [isEmpty, setIsEmpty] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const iconPosition = useRef(new Animated.Value(0)).current;

  const payloadFilter = useRef([]);
  const categoryFilter = useRef([]);
  const navigation = useNavigation();
  const userId = useSelector(state => state.userInfo._id);
  const lastPublishedMedia = useSelector(
    state => state.story.lastPublishedMedia,
  );
  // let groupIdss = useSelector(state => state.userInfo.linkedGroup);
  const allPublishedStories = useSelector(
    state => state.story.allPublishedStory,
  );
  const storyFilters = useSelector(state => state?.story?.storyFilters);
  const allCachedStories = useSelector(state => state.story.allStories)
  const theme = useTheme();
  const AllFilterDataStory = useSelector(
    state => state?.home?.getSelectedFilterData,
  );
  const allFilterRef = useRef(AllFilterDataStory);
  const allStoryPage = useSelector(
    state => state.story.feedPages.allPublishedStoryPage,
  );
  const [categoriesTitle, setCategoriesTitle] = useState([
    { checked: true, title: 'Stories' },
    { checked: true, title: 'Moments' },
    { checked: true, title: 'Audios' },
    { checked: true, title: 'Quotes' },
  ]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [toggleDrawer, setToggleDrawer] = useState(false);

  const { familyName } = route?.params || {};
  const { userIdDetail } = route?.params || {};
  const groupIdss = useSelector(state => state?.Tree?.groupId);
  const floatingButtonOpacity = useRef(new Animated.Value(1)).current;
  function resetCategories() {
    setCategoriesTitle([
      { checked: true, title: 'Stories' },
      { checked: true, title: 'Moments' },
      { checked: true, title: 'Audios' },
      { checked: true, title: 'Quotes' },
    ]);
  }

  useMemo(() => {
    if (route?.params?.posted) {
      resetCategories();
    }
    return;
  }, [route]);

  useEffect(() => {
    if ((loading, refreshing)) {
      setShowScrollToTop(false);
      setAnimationValue(0);
    }
  }, [loading, refreshing]);

  useEffect(() => {
    allFilterRef.current = AllFilterDataStory;
  }, [AllFilterDataStory]);

  const isDraftSelected = useMemo(() => {
    if (storyFilters === 'drafts') {
      setCategoriesTitle([
        { checked: true, title: 'Stories' },
        { checked: false, title: 'Moments' },
        { checked: false, title: 'Audios' },
        { checked: false, title: 'Quotes' },
      ]);
    }
    else {
      resetCategories();
    }
    // return storyFilters === 'drafts';
  }, [storyFilters]);

  // const isDraftSelected = useMemo(
  //   () => storyFilters === 'drafts',
  //   [storyFilters]
  // );

  // useEffect(() => {
  //   if (isDraftSelected) {
  //     setCategoriesTitle([
  //       { checked: true,  title: 'Stories' },
  //       { checked: false, title: 'Moments' },
  //       { checked: false, title: 'Audios' },
  //       { checked: false, title: 'Quotes' },
  //     ]);
  //   } else {
  //     resetCategories();
  //   }
  // }, [isDraftSelected, resetCategories]);

  function setAnimationValue(toValue) {
    // use opacity instead of scale
    Animated.timing(iconPosition, {
      toValue: Math.floor(toValue),
      duration: 0,
      useNativeDriver: true,
    }).start();
  }

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToOffset({ animated: true, offset: 0 });
      setAnimationValue(0);
      iconPosition.stopAnimation();
    }
  };

  const animatedStyle = {
    opacity: iconPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  const onRefresh = async (isPullDown = false) => {
    try {
      dispatch(resetAllPages());
      dispatch(resetEmptyFilterStack());
      if (!isPullDown) {
        dispatch(resetViewStories());
      }
      setIsEmpty(false);
      setRefreshing(true);
      if (!isPullDown) {
        setLoading(true);
      }
      let userinfoData = null;
      //only call userinfo when group id is not available because for story group id is payload
      if (![groupIdss]) {
        userinfoData = await dispatch(getUserInfo()).unwrap();
      }
      // const payloadGroupId = userinfoData?.data?.linkedGroup
      //   ? userinfoData?.data?.linkedGroup
      //   : groupId;
      const payloadGroupId = [groupIdss];
      const currentFilter = allFilterRef.current;
      const isSelected =
        currentFilter &&
        separateCategoriesAndFilters()?.categories?.length === 4;
      const payload = {
        pageNo: 1,
        groupId: payloadGroupId,
        ...separateCategoriesAndFilters(),
        // filters: groupIdss,
        isEveryoneSelected: isSelected,
      };
      if (!payload?.filters?.[0]?.length) {
        return;
      }
      // if(allCachedStories[groupIdss]?.[storyFilters]?.length > 0){
      //   return;
      // }
      // else{
      setLoading(true);
      const result = await dispatch(fetchAllStories(payload)).unwrap();
      setIsEmpty(Boolean(!result?.data?.length));
      // }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allCachedStories[groupIdss]?.[storyFilters]?.length > 0) {
      return;
    }
    onRefresh(true);
  }, [groupIdss, storyFilters, allCachedStories[groupIdss]?.[storyFilters]]);

  async function getNextPage() {
    try {
      if (isEmpty || loading || refreshing) {
        return;
      }
      setLoadingMore(true);
      const page = allStoryPage + 1;
      const data = {
        groupId: [groupIdss],
        pageNo: page,
        ...separateCategoriesAndFilters(),
        isEveryoneSelected: false,
      };
      const result = await dispatch(fetchAllStories(data)).unwrap();
      setIsEmpty(Boolean(!result?.data?.length));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoadingMore(false);
    }
  }

  const renderStories = ({ item: story, index }) => {
    const isLastItem = index === allPublishedStories.length - 1;
    return (
      <ErrorBoundary>
        <ReAnimated.View
          entering={FadeInDown.delay(index + 100)
            .damping(20)
            .duration(500)
            .springify()}
          style={styles.cardStyle}>
          {story?.contents?.[0]?.elements?.length > 0 && (
            <>
              {story?.contents[0]?.elements[0]?.type === 'Audio' &&
                story?.categoryId?.[0]?.categoryName === 'Audios' && (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('ViewStory', {
                        SingleStoryId: story,
                      })
                    }>
                    <FastImage
                      source={require('../../../images/waves.png')}
                      style={{
                        width: '100%',
                        height: 200,
                        resizeMode: 'contain',
                      }}
                      accessibilityLabel="audio wave image"
                    />
                  </Pressable>
                )}
              {story?.contents?.[0]?.elements?.[0]?.type === 'Video' &&
                story?.categoryId?.[0]?.categoryName !== 'Moment' ? (
                <View
                  style={{
                    borderRadius: 10,
                    height: 200,
                    overflow: 'hidden',
                    justifyContent: 'center',
                  }}>
                  <VideoThumbnail
                    thumbnailUrl={
                      story?.contents?.[0].elements?.[0]?.thumbnailUrl
                    }
                    src={story?.contents?.[0].elements?.[0]?.mediaUrl}
                    preventPlay={false}
                    imuwMediaStyle={{ width: '100%', height: '100%' }}
                    imuwThumbStyle={{
                      borderRadius: 6,
                      width: '100%',
                      height: '100%',
                    }}
                    renderLocalThumbnailIos={true}
                  />
                </View>
              ) : (
                <>
                  {story?.categoryId?.[0]?.categoryName === 'Moment' && (
                    <>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 5,
                          position: 'relative',
                        }}
                        accessibilityLabel="storiesImage"
                        onPress={() =>
                          navigation.navigate('ViewStory', {
                            SingleStoryId: story,
                          })
                        }>
                        {story?.contents?.[0]?.elements
                          ?.slice(0, 9)
                          ?.map((image, momentIndex) => (
                            <>
                              {image?.type === 'Image' ? (
                                <FastImage
                                  accessibilityLabel={`post ${index} media ${momentIndex + 1}`}
                                  key={image?._id}
                                  style={[
                                    styles.picStyle,
                                    {
                                      height:
                                        story?.contents?.[0]?.elements
                                          ?.length === 1
                                          ? 200
                                          : story?.contents?.[0]?.elements
                                            ?.length > 2
                                            ? width / 3 - 9
                                            : width / 2 - 11,
                                      width:
                                        story?.contents?.[0]?.elements
                                          ?.length === 1
                                          ? '100%'
                                          : story?.contents?.[0]?.elements
                                            ?.length > 2
                                            ? width / 3 - 9
                                            : width / 2 - 11,
                                    },
                                  ]}
                                  source={{
                                    uri: image?.mediaUrl || '',
                                  }}
                                />
                              ) : (
                                <View
                                  accessibilityLabel={`post ${index} media ${momentIndex + 1}`}
                                  key={image?._id}
                                  style={[
                                    styles.picStyle,
                                    {
                                      borderRadius: 10,
                                      height:
                                        story?.contents?.[0]?.elements
                                          ?.length === 1
                                          ? 200
                                          : story?.contents?.[0]?.elements
                                            ?.length > 2
                                            ? width / 3 - 9
                                            : width / 2 - 11,
                                      width:
                                        story?.contents?.[0]?.elements
                                          ?.length === 1
                                          ? '100%'
                                          : story?.contents?.[0]?.elements
                                            ?.length > 2
                                            ? width / 3 - 9
                                            : width / 2 - 11,
                                    },
                                  ]}>
                                  <VideoThumbnail
                                    customPress={(
                                      media = story?.contents?.[0]?.elements,
                                    ) => {
                                      if (media?.length > 1) {
                                        navigation.navigate('ViewStory', {
                                          SingleStoryId: story,
                                        });
                                      }
                                    }}
                                    thumbnailUrl={image?.thumbnailUrl || ''}
                                    src={image?.mediaUrl}
                                    preventPlay={
                                      story?.contents?.[0]?.elements?.length > 1
                                    }
                                    imuwMediaStyle={{
                                      width: '100%',
                                      height: '100%',
                                    }}
                                    imuwThumbStyle={{
                                      borderRadius: 6,
                                      width: '100%',
                                      height: '100%',
                                    }}
                                    renderLocalThumbnailIos={true}
                                  />
                                </View>
                              )}
                            </>
                          ))}
                        {story?.contents?.[0]?.elements?.length > 9 && (
                          <View
                            style={{
                              width: width / 3 - 9,
                              height: width / 3 - 9,
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              borderRadius: 10,
                            }}>
                            <Text style={{ color: '#FFFFFF' }}>See more</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {story?.categoryId?.[0]?.categoryName !== 'Moment' &&
                    story?.categoryId?.[0]?.categoryName !== 'Quotes' &&
                    story?.categoryId?.[0]?.categoryName !== 'Audios' && (
                      <TouchableOpacity
                        accessibilityLabel={`post ${index} media 1`}
                        onPress={() =>
                          navigation.navigate('ViewStory', {
                            SingleStoryId: story,
                          })
                        }>
                        <FastImage
                          style={[
                            styles.picStyle,
                            {
                              width: width - 16,
                              aspectRatio: story.aspectRatio || 1,
                            },
                          ]}
                          source={{
                            uri:
                              story?.contents?.[0]?.elements?.[0]?.mediaUrl ||
                              '',
                          }}
                        />
                      </TouchableOpacity>
                    )}
                </>
              )}
            </>
          )}
          <TouchableOpacity
            style={{ position: 'relative' }}
            accessibilityLabel="storiesTitle"
            onPress={() =>
              navigation.navigate('ViewStory', {
                SingleStoryId: story,
              })
            }>
            {story?.categoryId?.[0]?.categoryName === 'Quotes' && (
              <>
                <View style={{ position: 'absolute', top: 5, left: 5 }}>
                  <TopQuoteIcon
                    accessibilityLabel="top quote icon"
                    height={'80'}
                    width={'80'}
                  />
                </View>
                <View style={{ position: 'absolute', bottom: 5, right: 5 }}>
                  <BottomQuoteIcon
                    accessibilityLabel="bottom quote icon"
                    height={'80'}
                    width={'80'}
                  />
                </View>
              </>
            )}
            <View
              style={{ paddingHorizontal: 13, paddingBlock: 0, paddingTop: 2 }}>
              <Text
                variant='bold'
                style={[
                  styles.description,
                  {
                    fontWeight:
                      story?.categoryId?.[0]?.categoryName === 'Quotes'
                        ? '500'
                        : 'bold',
                  },
                ]}
                accessibilityLabel={story?.storiesTitle}>
                {story?.storiesTitle}
              </Text>
            </View>

            {story?.categoryId?.[0]?.categoryName === 'Quotes' && (
              <View style={{ padding: 13 }}>
                <Text
                  accessibilityLabel="story description"
                  style={[
                    styles.description,
                    {
                      fontSize: 24,
                    },
                  ]}>
                  {story?.contents?.[0]?.templateContent}
                </Text>
              </View>
            )}

            <View style={styles.profilePicContainer}>
              <>
                {story?.collaboratingMembers?.length > 0 ? (
                  <>
                    {typeof story?.createdBy?.personalDetails?.profilepic ===
                      'string' &&
                      story?.createdBy?.personalDetails?.profilepic?.length >
                      0 ? (
                      <FastImage
                        accessibilityLabel={`story ${index + 1} author profile pic`}
                        style={styles.imageStyle}
                        source={{
                          uri:
                            story?.createdBy?.personalDetails?.profilepic || '',
                        }}
                      />
                    ) : (
                      <DefaultImage
                        accessibilityLabel={`story ${index + 1} author profile pic`}
                        fontWeight={700}
                        fontSize={10}
                        borderRadius={10}
                        height={20}
                        width={20}
                        firstName={story?.createdBy?.personalDetails?.name}
                        lastName={story?.createdBy?.personalDetails?.lastname}
                        gender={story?.createdBy?.personalDetails?.gender}
                      />
                    )}
                    <View style={{ transform: [{ translateX: -15 }] }}>
                      <CollabProfileView storyData={story} imgSize={20} imgFontSize={10} fontSize={18} />
                    </View>
                  </>
                ) : (
                  <>
                    {typeof story?.createdBy?.personalDetails?.profilepic ===
                      'string' &&
                      story?.createdBy?.personalDetails?.profilepic?.length >
                      0 ? (
                      <FastImage
                        accessibilityLabel={`story ${index + 1} author profile pic`}
                        style={styles.imageStyle}
                        source={{
                          uri:
                            story?.createdBy?.personalDetails?.profilepic || '',
                        }}
                      />
                    ) : (
                      <DefaultImage
                        accessibilityLabel={`story ${index + 1} author profile pic`}
                        fontWeight={700}
                        fontSize={10}
                        borderRadius={10}
                        height={20}
                        width={20}
                        firstName={story?.createdBy?.personalDetails?.name}
                        lastName={story?.createdBy?.personalDetails?.lastname}
                        gender={story?.createdBy?.personalDetails?.gender}
                      />
                    )}
                  </>
                )}
              </>
              {story?.collaboratingMembers?.length < 1 && (
                <Text
                  variant='bold'
                  style={styles.personName}
                  accessibilityLabel={`${story?.createdBy?.personalDetails?.name}`}>
                  {story?.createdBy?.personalDetails?.name}{' '}
                  {story?.createdBy?.personalDetails?.lastname}
                </Text>
              )}
            </View>
            {story.status === 'Published' && (
              <View style={styles.postBottomContent}>
                <LikeAndCommentDisplay story={story} userId={userId} />
                <Text
                  variant="bold"
                  style={{
                    color: colors.primaryOrange,
                    fontSize: 12,
                  }}>
                  {timePassed(story.publishedAt)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ReAnimated.View>
        <></>
      </ErrorBoundary>
    );
  };

  // let [draftImg, setDraftImg] = useState(false);
  // let [savedImg, setSavedImg] = useState(false);
  // let [postImg, setPostImg] = useState(false);
  // let [myPostsImg, setMyPostImg] = useState(false);

  function handleCloseFilters() {
    setOpenFilter(false);
  }

  // function handleApplyFilters(data, fromCreateStory = false) {
  //   setSelectedFilter(data?.[0] || null);
  //   setMyPostImg(() => data?.[0] === 'My_posts');
  //   payloadFilter.current = data;
  //   if (data.length === 1 && data[0] === 'Drafts') {
  //     setDraftImg(true);
  //   } else {
  //     setDraftImg(false);
  //   }

  //   if (data.length === 1 && data[0] === 'Saved') {
  //     setSavedImg(true);
  //   } else {
  //     setSavedImg(false);
  //   }

  //   let regex = /[a-zA-Z].*\d|\d.*[a-zA-Z]/;
  //   let isPresent = data.some(str => regex.test(str));
  //   if (isPresent) {
  //     setPostImg(true);
  //   } else {
  //     setPostImg(false);
  //   }
  //   handleCategoryPress(undefined, fromCreateStory);
  //   // onRefresh();
  // }

  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset } = nativeEvent;
    const isScrolledToTop = contentOffset.y <= 250;

    // resets video instance
    dispatch(setCurrentVideoInstance('reset'));

    if (isScrolledToTop) {
      setAnimationValue(0);
    } else {
      setAnimationValue(1);
    }

    setShowScrollToTop(() => !isScrolledToTop);
  };

  function handleCategoryPress(title, fromCreateStory = false) {
    dispatch(setStoryFilters("allPosts"));
    const updatedCategoriesTitle = categoriesTitle?.map?.(item => {
      if (item?.title === title) {
        return {
          ...item,
          checked: !item?.checked,
        };
      } else {
        return item;
      }
    });
    // Check if all categories are unchecked
    const allUnchecked = updatedCategoriesTitle?.every?.(
      item => !item?.checked,
    );
    // If all categories are unchecked, keep the current category checked
    if (allUnchecked) {
      const currentCategory = updatedCategoriesTitle?.find?.(
        item => item?.title === title,
      );
      currentCategory.checked = true;
      return Toast.show({
        type: 'success',
        text1: 'Cannot deselect all categories',
      });
    }
    categoryFilter.current = {
      ...{
        categories: updatedCategoriesTitle
          ?.filter?.(item => item?.checked)
          ?.map?.(item => item?.title),
      },
    };
    if (fromCreateStory) {
      categoryFilter.current.categories = [
        'Stories',
        'Moments',
        'Audios',
        'Quotes',
      ];
    }
    onRefresh();
    if (!fromCreateStory) {
      setCategoriesTitle(updatedCategoriesTitle);
    } else {
      resetCategories();
    }
  }

  // function separateCategoriesAndFilters() {
  //   let categoryPayload = null;
  //   if (categoryFilter?.current?.categories) {
  //     const { categories } = categoryFilter.current;
  //     categoryPayload = categories;
  //   }
  //   const finalCategories = categoryPayload || [];
  //   return {
  //     categories: finalCategories,
  //     filters: [groupIdss],
  //   };
  // }

  function separateCategoriesAndFilters() {
    let categoryPayload = null;
    if (categoryFilter?.current?.categories) {
      const { categories } = categoryFilter.current;
      categoryPayload = categories;
    }
    const finalCategories = categoryPayload || [];
    if (storyFilters === 'saved') {
      return {
        categories: finalCategories,
        filters: [groupIdss, 'Saved'],
      };
    } else if (storyFilters === 'drafts') {
      return {
        categories: finalCategories,
        filters: [groupIdss, 'Drafts'],
      };
    }
    else {
      return {
        categories: finalCategories,
        filters: [groupIdss],
      };
    }
  }


  const handleNavigateToCreateStory = () => {
    navigation.navigate('SelectedCategory');
  };

  const floatingButtonStyle = {
    opacity: floatingButtonOpacity,
  };

  return (
    <ErrorBoundary.Screen>
      <StoriesHeader
        onClickFilter={() => setOpenFilter(true)}
        setToggleDrawer={setToggleDrawer}
        toggleDrawer={toggleDrawer}
        showLogo={true}
        familyName={familyName}
        userIdDetail={userIdDetail}
        groupId={groupIdss}
        onClose={handleCloseFilters}
        onClickTab={tabNumber =>
          navigation.navigate('CreateStory', { currentTabValue: tabNumber })
        }
      />
      <SafeAreaView
        style={{
          position: 'relative',
          backgroundColor: Theme.light.background,
        }}>
        {/* <Filters
          onApply={handleApplyFilters}
          open={openFilter}
          onClose={handleCloseFilters}
          route={route}
          setToggleDrawer={setToggleDrawer}
        /> */}
        <View style={styles.categoriesContainer}>
          {categoriesTitle.map((categoryName, index) => (
            <CustomButton
              accessibilityLabel={`${categoryName.title}-category-button`}
              customDisabledStyles={{ opacity: 0.5 }}
              onPress={() => handleCategoryPress(categoryName.title)}
              key={index}
              style={{
                ...styles.category,
                ...(categoryName.checked ? styles.addShadow : {}),
              }}
              label={categoryName.title}
              backgroundColor={
                categoryName.checked
                  ? colors.primaryOrange
                  : colors.whiteTextRGB
              }
              color={
                categoryName.checked ? colors.whiteText : colors.primaryOrange
              }
              disabled={
                loading ||
                refreshing ||
                loadingMore ||
                (isDraftSelected && categoryName.title !== 'Stories')
              }
            />
          ))}
        </View>
        {allCachedStories[groupIdss]?.[storyFilters]?.length > 0 && !loading && (
          <View
            style={{
              height: '100%',
            }}>
            <FlatList
              ref={scrollViewRef}
              style={{
                paddingBottom: 250,
              }}
              data={allCachedStories[groupIdss]?.[storyFilters]}
              renderItem={e => renderStories(e)}
              keyExtractor={(item, index) => `${item._id}${index}`}
              onEndReached={getNextPage}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => onRefresh(true)}
                  tintColor={colors.primaryOrange}
                  colors={[colors.primaryOrange]}
                />
              }
              ListFooterComponent={
                <>
                  {loadingMore &&
                    !isEmpty &&
                    allCachedStories[groupIdss]?.[storyFilters]?.length > 5 && (
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingBottom: 200,
                        }}>
                        <ButtonSpinner />
                        <Text style={{ textAlign: 'center' }}>Loading...</Text>
                      </View>
                    )}
                  {isEmpty && !loadingMore && !loading && !refreshing && (
                    <View
                      style={{
                        marginBottom: 100,
                      }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 24,
                          color: 'black',
                          textAlign: 'center',
                          paddingTop: 12,
                        }}>
                        You're up to date
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          paddingBottom: 140,
                          color: 'black',
                          marginBottom: 50,
                          textAlign: 'center',
                          paddingTop: 12,
                        }}>
                        Check back later for more updates
                      </Text>
                    </View>
                  )}
                </>
              }
            />
          </View>
        )}

        {!refreshing && storyFilters === 'drafts' && allCachedStories[groupIdss]?.[storyFilters]?.length === 0 && (
          <View style={styles.containerImg}>
            <DraftEmptyState />
            <Text
              style={{
                fontWeight: 'bold',
                marginLeft: 10,
                marginRight: 10,
                justifyContent: 'center',
                textAlign: 'center',
                alignItems: 'center',
                fontSize: 28,
              }}>
              {' '}
              No drafts here
            </Text>
            <Text
              style={{
                textAlign: 'center',
                width: '95%',
                fontWeight: 600,
                fontSize: 24,
                marginTop: 10,
              }}>
              {' '}
              Want to start one?
            </Text>
          </View>
        )}
        {!refreshing && storyFilters === 'saved' && allCachedStories[groupIdss]?.[storyFilters]?.length === 0 && (
          <View style={styles.containerImg}>
            <View style={{ paddingTop: 15 }}>
              <PostEmptyState />
            </View>
            <Text
              style={{
                fontWeight: 700,
                fontSize: 32,
                textAlign: 'center',
                marginTop: 20,
                color: theme.colors.pitchBlack,
              }}>
              Nothing saved here
            </Text>
            <Text
              style={{
                textAlign: 'center',
                width: '95%',
                fontWeight: 600,
                fontSize: 24,
                marginTop: 10,
              }}>
              When you save a story, moment, audio or a quote, it will appear
              here.
            </Text>
          </View>
        )}
        {/* My posts empty state */}
        {!refreshing &&
          // (postImg) &&
          // myPostsImg &&
          storyFilters === 'myPosts' &&
          allCachedStories[groupIdss]?.[storyFilters]?.length === 0 && (
            <View style={styles.containerImg}>
              <MyPostsEmptyState />
              <Text
                variant="headlineLarge"
                style={{
                  textAlign: 'center',
                  marginTop: 20,
                }}>
                You haven’t shared anything yet
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  width: '95%',
                  fontWeight: 600,
                  fontSize: 24,
                  marginTop: 10,
                }}>
                Your canvas is empty but your unique experiences are waiting to
                be shared!
              </Text>
            </View>
          )}
        {/* Default empty state */}
        {!refreshing &&
          // (postImg || (!draftImg)) &&
          // !myPostsImg &&
          storyFilters === 'allPosts' &&
          allCachedStories[groupIdss]?.[storyFilters]?.length === 0 && (
            <View style={styles.containerImg}>
              <StorieEmptyState />
              <Text
                style={{
                  fontWeight: 700,
                  fontSize: 32,
                  textAlign: 'center',
                  marginTop: 20,
                  color: theme.colors.pitchBlack,
                }}>
                No results match the selected filter{' '}
              </Text>
            </View>
          )}
        {loading && (
          <View style={styles.loadingContainer}>
            <Spinner />
          </View>
        )}
      </SafeAreaView>

      {!(loading || refreshing) && (
        <Animated.View
          style={[styles.floatingButtonContainer, floatingButtonStyle,
          { backgroundColor: showScrollToTop ? 'transparent' : colors.primaryOrange }]}>
          <TouchableOpacity
            accessibilityLabel="Create Story"
            onPress={handleNavigateToCreateStory}
            style={styles.floatingButton}>
            <CreateStoryFloatingIcon />
          </TouchableOpacity>
        </Animated.View>
      )}

      {showScrollToTop && !(loading || refreshing) && (
        <Animated.View
          style={[floatingButtonStyle,
            {
              position: 'absolute',
              bottom: 90,
              right: 10,
              backgroundColor: theme.colors.primary,
              borderRadius: 25,
              width: 50,
              height: 50,
              zIndex: 99,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            { backgroundColor: showScrollToTop ? 'transparent' : colors.primaryOrange },
            animatedStyle,
          ]}>
          <Pressable onPress={scrollToTop}>
            <ArrowUpIcon name="arrow-up" color={'#fff'} size={25} />
          </Pressable>
        </Animated.View>
      )}
    </ErrorBoundary.Screen>
  );
}

function LikeAndCommentDisplay({ story, userId, ...props }) {
  const hasLiked = useMemo(() => {
    if (story?.storylikes?.includes?.(userId)) {
      return true;
    }
    return false;
  }, [story]);

  const dispatch = useDispatch();

  const [tempLike, setTempLike] = useState(null);

  const handleToggleLike = async () => {
    try {
      setTempLike(!hasLiked);
      await dispatch(fetchStoryLikes(story._id)).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setTempLike(null);
    }
  };

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

  return (
    <View {...props} style={styles.likeAndCommentContainer}>
      <TouchableOpacity
        accessibilityLabel="toggleStoryLike"
        onPress={event => {
          event.stopPropagation();
          handleToggleLike(story._id);
        }}
        style={styles.likeAndComment}>
        {!tempLike ? (
          <LikeButton
            size={18}
            isLiked={tempLike === null ? hasLiked : tempLike}
          />
        ) : (
          <View style={{ width: 18, height: 18 }}>
            <LottieView
              source={require('../../../animation/lottie/like_story.json')}
              style={styles.likeAnimation}
              autoPlay
              speed={1.5}
              loop
            />
          </View>
        )}
        <Text>{story?.storylikes?.length}</Text>
      </TouchableOpacity>
      <View style={styles.likeAndComment}>
        <CommentButton size={18} accessibilityLabel="add comment icon" />
        <Text>{story.commentsCount}</Text>
      </View>
      {/* <TouchableOpacity onPress={() => onShare(story)}>
        <ShareIcon />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 150,
    borderRadius: 30,
    right: 10,
    zIndex: 99,
  },
  floatingButton: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postBottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  likeAndCommentContainer: {
    gap: 8,
    flexDirection: 'row',
  },
  likeAndComment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
  },
  likeAnimation: {
    width: 24,
    height: 24,
    top: -2,
    left: -4,
    position: 'absolute',
  },
  containerImg: {
    justifyContent: 'center',
    alignItems: 'center',
    // height: '80%',
  },
  loadingStyle: {
    fontWeight: 'bold',
    fontSize: 50,
  },
  cardStyle: {
    paddingHorizontal: 0,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    margin: 8.5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  imageStyle: {
    height: 20,
    width: 20,
    borderRadius: 50,
    paddingHorizontal: 0,
  },
  picStyle: {
    borderRadius: 10,
    paddingHorizontal: 0,
  },
  personName: {
    color: Theme.light.pitchBlack,
    fontSize: 18,
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
    fontWeight: 'bold',
  },
  description: {
    paddingHorizontal: 0,
    color: Theme.light.pitchBlack,
    fontWeight: 'bold',
    fontSize: 18,
  },
  profilePicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBlock: 9,
    borderRadius: '50%',
    gap: 5,
  },
  categoriesContainer: {
    width: '100%',
    flexDirection: 'row',
    margin: 0,
    gap: 10,
    padding: 10,
    marginTop: 15,
  },
  category: {
    flexGrow: 1,
    marginBottom: 0,
    padding: 6,
    borderRadius: 6,
  },
  addShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2.5,
    elevation: 8,
  },
});
