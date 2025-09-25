import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import {markNotificationAsViewedApi} from '../../store/apps/notifications';

import {
  getTree,
  getTreeDetailsByGroupId,
  listFamilyTrees,
  resetTreeItem,
  setFamilyName,
  setGroupId,
  setTreeinviteValue,
  setTreeItemFromPrivateTree,
} from '../../store/apps/tree';
import {updateFamilyType} from '../../store/apps/familyType';
import {fetchUserNotification} from '../../store/apps/notifications';
import {setRedDot, setRedDotAfterLikeComment} from '../../store/apps/redDot';

import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import Axios from '../../plugin/Axios';
import {DefaultImage} from '../../core';
import {ActivityIndicator, Avatar, useTheme, Text} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import InviteSheetModal from '../invites';
import NotificationsEmptyState from '../../images/Icons/NotificationsEmptyState';
import {useFocusEffect} from '@react-navigation/native';
import Spinner from '../../common/Spinner';
import {getCommunityDetails} from '../../store/apps/getCommunityDetails';
import ButtonSpinner from '../../common/ButtonSpinner';
import NewTheme from '../../common/NewTheme';
import {useInfiniteQuery} from '@tanstack/react-query';
import {setStoredKundliObject} from '../../store/apps/astroKundali';
import {setAstroLinkingParams} from '../../store/apps/astroLinking';
import {fetchOneStory} from '../../store/apps/story';
import {set} from 'lodash';
const {width, height} = Dimensions.get('window');

export default function Notifications({isFocused}) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const theme = useTheme();

  // Track if the component is mounted
  const isComponentMounted = useRef(true);
  const [isFetchingMoreNotifications, setFetchingMoreNotifications] =
    useState(false);
  useState(null);
  const [readStatus, setReadStatus] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const notifications = useSelector(
    state => state?.fetchUserNotification?.notifications,
  );
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({pageParam = 1}) => getNotification(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length === 20 ? allPages.length + 1 : undefined;
    },
  });
  // const allNotifications = data?.pages.flatMap(page => page) || [];
  const allNotifications = data?.pages?.flatMap(page => page || []) || [];

  useEffect(() => {
    initializeReadStatus();
  }, [allNotifications]);

  const initializeReadStatus = () => {
    setReadStatus(prevState => {
      const updatedReadStatus = {...prevState};
      let hasChanges = false;

      allNotifications.forEach(notification => {
        if (!(notification?._id in updatedReadStatus)) {
          updatedReadStatus[notification?._id] = notification?.read_at !== null;
          hasChanges = true;
        }
      });

      return hasChanges ? updatedReadStatus : prevState;
    });
  };

  // Function To Show Red Dot If Has Any Unread Notifications
  const showRedDotIfNewNotifications = data => {
    const hasUnreadNotification = data?.some(item => item.read_at === null);
    if (hasUnreadNotification) {
      dispatch(setRedDot(true));
    } else {
      dispatch(setRedDot(false));
      dispatch(setRedDotAfterLikeComment(false));
    }
  };

  const onRefresh = async () => {
    try {
      refetch();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getNotification = async page => {
    const data = await dispatch(fetchUserNotification(page)).unwrap();
    // Check if there's new data
    if (data.length > 0) {
      showRedDotIfNewNotifications(data);
      return data;
    }
  };

  // Function to preload images with unique keys
  const preloadNotificationImages = async notifications => {
    const imageUrls = notifications
      .map(notification => notification?.user?.personalDetails?.profilepic)
      .filter(url => url);

    const imagePromises = imageUrls.map(url =>
      Image.prefetch(url).then(() => {
        // Check if the component is still mounted
        if (!isComponentMounted.current) {
          return;
        }
      }),
    );

    try {
      await Promise.all(imagePromises);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  // To Mark Notifications As Read
  async function selectNotification(id) {
    try {
      const viewNotificationData = {notificationId: id};
      await dispatch(
        markNotificationAsViewedApi(viewNotificationData),
      ).unwrap();
      await dispatch(setRedDot(false));

      // Update read status in state
      setReadStatus(prevState => ({
        ...prevState,
        [id]: true,
      }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  // To Show Notification Age From Current Time
  function notificationTimestamp(time) {
    if (time !== '' && time) {
      const result = moment(time).fromNow();
      return result;
    }
    return '';
  }

  // Go to Story
  const gotoContent = async notification => {
    if (
      notification?.details?.Story_id === undefined ||
      notification?.details?.Story_id === null
    ) {
      return;
    }
    const response = await dispatch(
      fetchOneStory(notification?.details?.Story_id),
    ).unwrap();
    const findPu = response?.familyGroupId?.find(_group => {
      return _group?.groupType?.groupType1 === 'PU';
    });
    if (findPu) {
      dispatch(setGroupId(null));
      dispatch(setFamilyName(null));
      const res = await dispatch(getTreeDetailsByGroupId(findPu?._id)).unwrap();
      dispatch(setGroupId(findPu?._id));
      dispatch(setFamilyName(res?.[0]?.tree?.[0]?.name));
      navigation.navigate('ViewStory', {
        SingleStoryId: {
          _id: notification.details.Story_id,
          visible: notification?.details?.visibility !== false,
          categoryId: [
            {_id: '606ee362e66b6884b2ddccf6', categoryName: 'Category'},
          ],
        },
      });
    }
  };

  let imuwTree = [];
  const treeArray = useSelector(state => state?.Tree?.AllFamilyTrees?.treeList);
  const isOwner = useSelector(state => state?.Tree?.AllFamilyTrees?.isOwner);

  if (isOwner) {
    const familyArr = treeArray.filter(e => e.user.role !== 'owner');
    imuwTree = familyArr;
  } else {
    imuwTree = treeArray;
  }

  const findArrayByTreeId = (treeId, senderTreeId) => {
    for (let i = 0; i < treeArray.length; i++) {
      const currentArray = treeArray[i];
      if (
        currentArray?.tree?.id === treeId ||
        currentArray?.tree?.id === senderTreeId
      ) {
        return currentArray;
      }
    }
    return null;
  };
  const fetchListPrivateTree = async () => {
    await dispatch(listFamilyTrees()).unwrap();
  };
  useEffect(() => {
    fetchListPrivateTree();
  }, []);

  // Redirect User to tree and View profile info page
  const GotoDirectory = async notification => {
    try {
      if (notification?.details?.routeName === 'report') {
        dispatch(setStoredKundliObject({_id: notification?.details?.kundliId}));
        if (notification?.details?.isGenerated?.toString?.() === 'true') {
          navigation.navigate('AstroViewReports', {
            reportId: notification?.details?.reportId,
            kundliId: notification?.details?.kundliId,
            reportName: notification?.details?.typeOfReport,
            nameOfPerson: notification?.details?.nameOfPerson || '',
          });
          return;
        }
        dispatch(
          setAstroLinkingParams({
            path: 'Reports',
            params: notification?.details,
          }),
        );
        navigation.navigate('AstroBottomTabs', {
          screen: 'Reports',
        });
      } else if (notification?.details?.routeName === 'horoscope') {
        navigation.navigate('AstroBottomTabs', {
          screen: 'Horoscope',
        });
      } else if (
        notification?.details?.notificationType &&
        (notification?.details?.notificationType === 'groupRequest' ||
          notification?.details?.notificationType === 'treeRequest')
      ) {
        navigation.navigate('InviteSheetModal', {
          inviteNotifications: [],
        });
      } else if (
        notification?.details?.notificationName === 'NewMember' ||
        notification?.details?.notificationName === 'LinkMember' ||
        notification?.details?.notificationType === 'treeCollabration'
      ) {
        let foundArray = await findArrayByTreeId(
          notification?.details?.treeId,
          notification?.details?.senderTreeId,
        );

        dispatch(resetTreeItem());
        await dispatch(setTreeItemFromPrivateTree(foundArray));
        await dispatch(updateFamilyType(foundArray?.user?.role));

        navigation.navigate('TreeScreen', {
          family: foundArray?.tree?.name,
          currentTreeDetails: foundArray,
        });
      }

      if (
        notification?.details?.Story_id !== undefined &&
        notification?.details?.Story_id !== null
      ) {
        gotoContent(notification);
      }

      if (notification?.details?.notificationType === 'walletRechargeFailed') {
        navigation.navigate('WalletHistory');
      }

      if (notification?.details?.notificationType === 'walletRechargeSuccess') {
        navigation.navigate('AstroBottomTabs', {screen: 'Consultation'});
      }

      // Redirect To Community Details
      if (
        notification?.details?.Community_id !== undefined &&
        notification?.details?.Community_id !== null &&
        (notification?.details?.notificationType === 'joinPublicCommunity' ||
          notification?.details?.notificationType === 'createCommunity' ||
          notification?.details?.notificationType ===
            'acceptedJoiningRequest' ||
          notification?.details?.notificationType === 'inviteUser')
      ) {
        navigation.navigate('CommunityDetails', {
          item: {_id: notification?.details?.Community_id},
        });
      }
      // Redirect to Requests page
      if (
        notification?.details?.Community_id !== undefined &&
        notification?.details?.Community_id !== null &&
        notification?.details?.notificationType === 'joinPrivateCommunity'
      ) {
        await dispatch(
          getCommunityDetails(notification?.details?.Community_id),
        );
        navigation.navigate('CommunityJoiningRequests');
      }
      if (
        notification?.details?.Discussion_id !== undefined &&
        notification?.details?.Discussion_id !== null &&
        (notification?.details?.notificationType === 'discussionUpvoted' ||
          notification?.details?.notificationType === 'discussionDownvoted' ||
          notification?.details?.notificationType === 'discussionCreation')
      ) {
        navigation.navigate('ViewSingleDiscussion', {
          _id: notification?.details?.Discussion_id,
        });
      }
      // Redirect to Comment
      if (
        notification?.details?.Discussion_id !== undefined &&
        notification?.details?.Discussion_id !== null &&
        (notification?.details?.notificationType === 'commentedOnDiscussion' ||
          notification?.details?.notificationType === 'commentUpvoted' ||
          notification?.details?.notificationType === 'commentDownvoted' ||
          notification?.details?.notificationType === 'replyOnComment')
      ) {
        if (notification?.details?.notificationType === 'replyOnComment') {
          navigation.navigate('ViewSingleDiscussion', {
            _id: notification?.details?.Discussion_id,
            type: 'reply',
            mainCommentId: notification?.details?.mainParentCommentId,
            replyId: notification?.details?.Comment_id,
          });
        } else if (
          notification?.details?.notificationType === 'commentedOnDiscussion'
        ) {
          navigation.navigate('ViewSingleDiscussion', {
            _id: notification?.details?.Discussion_id,
            type: 'mainComment',
            mainCommentId: notification?.details?.Comment_id,
          });
        }
        if (
          (notification?.details?.notificationType === 'commentUpvoted' ||
            notification?.details?.notificationType === 'commentDownvoted') &&
          notification?.details?.mainParentCommentId
        ) {
          navigation.navigate('ViewSingleDiscussion', {
            _id: notification?.details?.Discussion_id,
            type: 'reply',
            mainCommentId: notification?.details?.mainParentCommentId,
            replyId: notification?.details?.Comment_id,
          });
        } else if (
          notification?.details?.notificationType === 'commentUpvoted' ||
          notification?.details?.notificationType === 'commentDownvoted'
        ) {
          navigation.navigate('ViewSingleDiscussion', {
            _id: notification?.details?.Discussion_id,
            type: 'mainComment',
            mainCommentId: notification?.details?.Comment_id,
          });
        }
      }
      if (
        notification?.details?.Poll_id !== undefined &&
        notification?.details?.Poll_id !== null &&
        notification?.details?.notificationType === 'pollCreation'
      ) {
        navigation.navigate('ViewSinglePoll', {
          _id: notification?.details?.Poll_id,
        });
      }
      if (
        notification?.details?.Story_id !== undefined &&
        notification?.details?.Story_id !== null
      ) {
        gotoContent(notification);
      }
      if (
        notification?.details?.notificationCategory === 'notifyMe' &&
        notification?.details?.astrologerId
      ) {
        navigation.navigate('AstroProfile', {
          astroId: notification?.details?.astrologerId?.astrologerId,
        });
      }
      if (notification.details.notificationType === 'consultationEndForUser') {
        navigation.navigate('WalletHistory', {
          index:
            notification?.details?.consultationType?.toLowerCase?.() === 'call'
              ? 2
              : 1,
        });
      }
    } catch (__error) {
      Toast.show({
        type: 'error',
        text1: __error?.message ?? 'Something went wrong',
      });
    }
  };

  const renderNotifications = ({item: notification, notificationIndex}) => {
    if (notification?.details?.muted === true) return null;
    const notificationTextCheck = [
      'pollCreation',
      'discussionCreation',
      'commentUpvoted',
      'commentDownvoted',
      'discussionUpvoted',
      'discussionDownvoted',
    ];
    return (
      <TouchableOpacity
        testID="select-notification"
        key={notification?._id}
        onPress={() => {
          selectNotification(notification?._id);

          GotoDirectory(notification);
        }}
        style={{
          backgroundColor: readStatus[notification?._id]
            ? 'transparent'
            : theme.colors.surfaceVariant,
          borderRadius: 8,
          paddingHorizontal: 11,
          paddingVertical: 7,
          flexDirection: 'row',
          marginVertical: 5,
          marginHorizontal: 5,
          alignItems: 'center',
          ...(readStatus[notification._id] || !theme.isDarkTheme
            ? {}
            : {
                borderColor: '#FFFFFF33',
                borderWidth: 1,
              }),
        }}>
        <View style={{marginRight: 34, flex: 1, flexDirection: 'row'}}>
          {notification?.details?.eventType === 'Marriage Anniversary' ? (
            <>
              {notification?.spouseDetails?.personalDetails?.profilepic &&
              typeof notification?.spouseDetails?.personalDetails
                ?.profilepic === 'string' ? (
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  source={{
                    uri: notification?.spouseDetails?.personalDetails
                      ?.profilepic,
                  }}
                />
              ) : (
                <DefaultImage
                  firstName={notification?.spouseDetails?.personalDetails?.name}
                  lastName={
                    notification?.spouseDetails?.personalDetails?.lastname
                  }
                  gender={notification?.spouseDetails?.personalDetails?.gender}
                  size={40}
                />
              )}
              {notification?.user?.personalDetails?.profilepic &&
              typeof notification?.user?.personalDetails?.profilepic ===
                'string' ? (
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: -14,
                  }}
                  source={{
                    uri: notification?.user?.personalDetails?.profilepic,
                  }}
                />
              ) : (
                <DefaultImage
                  firstName={notification?.user?.personalDetails?.name}
                  lastName={notification?.user?.personalDetails?.lastname}
                  gender={notification?.user?.personalDetails?.gender}
                  size={40}
                  style={{marginLeft: -14}}
                />
              )}
            </>
          ) : notification?.user?.personalDetails?.profilepic &&
            typeof notification?.user?.personalDetails?.profilepic ===
              'string' ? (
            <Image
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              source={{
                uri: notification?.user?.personalDetails?.profilepic,
              }}
            />
          ) : (
            <View style={{marginRight: 4}}>
              <DefaultImage
                gender={notification?.user?.personalDetails?.gender}
                size={40}
                firstName={notification?.user?.personalDetails?.name}
                lastName={notification?.user?.personalDetails?.lastname}
              />
            </View>
          )}
        </View>
        {/* Notification content */}
        <View style={{flex: 6}}>
          {!notificationTextCheck.includes(
            notification?.details?.notificationType,
          ) ? (
            <Text
              accessible={true}
              accessibilityLabel={notification?.content}
              style={{
                fontSize: 16,
                lineHeight: 18.8,
                color: theme.colors.text,
                ...(!readStatus[notification?._id]
                  ? {
                      fontFamily: 'PublicSans Bold',
                    }
                  : {}),
              }}>
              {notification?.content}
            </Text>
          ) : (
            <Text
              accessible={true}
              accessibilityLabel={notification?.content}
              style={{
                fontSize: 16,
                lineHeight: 18.8,
                color: theme.colors.text,
              }}>
              {notification?.content
                ?.split(/(\*\*.*?\*\*)/g)
                .map((part, index) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <Text
                        key={index}
                        style={{
                          ...(!readStatus[notification?._id]
                            ? {
                                fontWeight: 'bold',
                              }
                            : {}),
                        }}>
                        {part.slice(2, -2)}
                      </Text>
                    );
                  } else {
                    return <Text key={index}>{part}</Text>;
                  }
                })}
            </Text>
          )}
          <Text
            accessible={true}
            accessibilityLabel={notificationTimestamp(notification?.createdAt)}
            style={{
              color: theme.colors.text,
              fontSize: 14,
              lineHeight: 16.45,
              fontWeight: 600,
              marginTop: 2,
            }}>
            {notificationTimestamp(notification?.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <>
      {allNotifications?.length > 0 ? (
        <View
          style={{
            marginTop: 10,
          }}>
          <FlatList
            data={allNotifications}
            renderItem={renderNotifications}
            keyExtractor={(item, index) => `${item?._id}${index}`}
            onEndReached={hasNextPage && !isFetchingNextPage && fetchNextPage}
            bounces={Platform.OS === 'ios'}
            contentContainerStyle={{paddingBottom: 150}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            ListFooterComponent={() => {
              if (isFetchingNextPage) {
                return (
                  <View style={{alignItems: 'center', paddingVertical: 20}}>
                    <ButtonSpinner />
                  </View>
                );
              } else {
                return null;
              }
            }}
          />
        </View>
      ) : (
        isLoading === false && (
          <View
            style={{
              alignItems: 'center',
              height,
            }}>
            <NotificationsEmptyState />
            <Text
              variant="bold"
              accessibilityLabel="no-notification-title-text"
              style={{
                fontSize: 32,
                color: theme.colors.text,
              }}>
              No notifications
            </Text>
            <Text
              accessibilityLabel="no-notifications-sub-text"
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: theme.colors.text,
              }}>
              Stay tuned for updates
            </Text>
          </View>
        )
      )}
      {isLoading && <Spinner />}
    </>
  );
}
