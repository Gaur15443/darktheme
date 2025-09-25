import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Dimensions,
  Animated,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {LeftArrow, PlusIcon, RecentFeedsIcon} from '../../../../images';
import SearchIcon from '../../../../images/Icons/SearchIcon';
import {DrawerItem} from '@react-navigation/drawer';
import {Text} from 'react-native-paper';
import RenderAllCommunities from '../RenderAllCommunities';
import NewTheme from '../../../../common/NewTheme';
import {useQueryClient} from '@tanstack/react-query';
import {ScrollView} from 'react-native-gesture-handler';
import ButtonSpinner from '../../../../common/ButtonSpinner';
import {
  useGetJoinedCommunities,
  useGetOwnedCommunities,
} from '../../../../store/apps/communitiesApi';

const {width} = Dimensions.get('window');

const Drawer = ({slideAnim, closeDrawer, setRefresh}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [viewAllCommunities, setViewAllCommunities] = useState(false);
  const [viewJoinedCommunities, setViewJoinedCommunities] = useState(false);
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useGetOwnedCommunities();
  const queryClient = useQueryClient();
  const {
    data: joinedCommunitiesData,
    fetchNextPage: fetchMoreJoined,
    hasNextPage: hasMoreJoined,
    isFetchingNextPage: isFetchingMoreJoined,
  } = useGetJoinedCommunities();

  useFocusEffect(
  useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['userJoinedCommunities'],
    });
   }, [])
  )

  // Flatten all pages into a single list
  const allUserCommunities = data?.pages?.flatMap(page => page.data) || [];
  const allJoinedCommunities =
    joinedCommunitiesData?.pages?.flatMap(page => page.data) || [];
  const drawerScreens = [
    {
      label: 'Recent Feeds',
      route: 'CommunityHomeScreen',
      icon: RecentFeedsIcon,
    },
    {
      label: 'Search Communities',
      route: 'CommunitySearchScreen',
      icon: SearchIcon,
    },
  ];

  const gotoScreen = item => {
    if (item?.label === 'Search Communities') {
      navigation.navigate('CommunitySearchScreen');
    } else if (item.label === 'Create Community') {
      navigation.navigate('CreateCommunity');
    } else {
    }
    // clearStatesOnClose();
    closeDrawer();
  };

  const closeDrawerAndClear = () => {
    // clearStatesOnClose();
    closeDrawer();
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View
        style={{
          // flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // height: '100%',
        }}>
        <ButtonSpinner />
      </View>
    );
  };

  const renderFooterJoined = () => {
    if (!isFetchingMoreJoined) return null;
    return (
      <View
        style={{
          // flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // height: '100%',
        }}>
        <ButtonSpinner />
      </View>
    );
  };

  return (
    <Animated.View
      style={[styles.drawerOverlay, {transform: [{translateX: slideAnim}]}]}>
      {/* Drawer Menu */}

      <View style={styles.container} accessibilityLabel="Drawer container">
        <ScrollView nestedScrollEnabled>
          {!viewAllCommunities && !viewJoinedCommunities ? (
            <>
              {drawerScreens.map((item, index) => (
                <>
                  <DrawerItem
                    key={index}
                    icon={() => <item.icon color={'black'} />}
                    label={item.label}
                    onPress={() => gotoScreen(item)}
                    style={styles.drawerItem}
                    labelStyle={styles.labelStyle}
                    accessibilityLabel={`${item.label}`}
                  />
                </>
              ))}
              {/* Divider */}
              <View style={styles.divider} accessibilityLabel="Divider"></View>
              <View
                style={styles.communityContainer}
                accessibilityLabel="Communities container">
                <Text
                  variant="bold"
                  style={styles.communityTitle}
                  accessibilityLabel="Your Communities title">
                  Your Communities
                </Text>

                {allUserCommunities?.length > 5 && (
                  <TouchableOpacity
                    hitSlop={{top: 20, bottom: 20, left: 30, right: 30}}
                    onPress={() => setViewAllCommunities(true)}>
                    <Text
                      variant="bold"
                      style={{
                        fontSize: 9,
                        color: NewTheme.colors.primaryOrange,
                      }}>
                      View all
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Create Community Button */}
              <TouchableOpacity
                onPress={() => gotoScreen({label: 'Create Community'})}
                hitSlop={{top: 10, bottom: 10, left: 0, right: 0}}
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 10,
                  marginBottom: 10,
                  alignItems: 'center',
                  height: 22,
                  gap: 5,
                }}>
                <PlusIcon size={20} />
                <Text
                  variant="bold"
                  style={{
                    color: NewTheme.colors.primaryOrange,
                    fontSize: 14,
                  }}>
                  Create a Community
                </Text>
              </TouchableOpacity>
              {/* Communities List */}
              <View accessibilityLabel="List of user communities">
                <FlatList
                  data={allUserCommunities?.slice(0, 5)}
                  keyExtractor={item => item._id}
                  contentContainerStyle={styles.FlatListContainerStyle}
                  accessibilityLabel="all Communities flat list"
                  renderItem={item => (
                    <RenderAllCommunities
                      item={item.item}
                      closeDrawer={closeDrawerAndClear}
                      setRefresh={setRefresh}
                    />
                  )}
                />
              </View>

              {/* Joined Communities */}
              <View style={styles.divider} accessibilityLabel="Divider"></View>

              <View
                style={styles.communityContainer}
                accessibilityLabel="Communities container">
                <Text
                  variant="bold"
                  style={styles.communityTitle}
                  accessibilityLabel="Your Communities title">
                  Joined Communities
                </Text>

                {allJoinedCommunities?.length > 5 && (
                  <TouchableOpacity
                    hitSlop={{top: 20, bottom: 20, left: 30, right: 30}}
                    onPress={() => setViewJoinedCommunities(true)}>
                    <Text
                      variant="bold"
                      style={{
                        fontSize: 9,
                        color: NewTheme.colors.primaryOrange,
                      }}>
                      View all
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                data={allJoinedCommunities?.slice(0, 5)}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.FlatListJoinedContainerStyle}
                accessibilityLabel="all Communities flat list"
                renderItem={({item, index}) => (
                  <>
                    <RenderAllCommunities
                      item={item}
                      closeDrawer={closeDrawerAndClear}
                      setRefresh={setRefresh}
                      screen="drawer"
                    />
                    {index === 4 && (
                      <View
                        style={[styles.divider, {marginHorizontal: -5}]}
                        accessibilityLabel="Divider"></View>
                    )}
                  </>
                )}
              />
            </>
          ) : (
            <View>
              <View>
                <TouchableOpacity
                  style={{
                    paddingLeft: 20,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                  onPress={() => {
                    setViewJoinedCommunities(false);
                    setViewAllCommunities(false);
                  }}>
                  <LeftArrow />
                  <Text
                    variant="bold"
                    style={styles.communityTitle}
                    accessibilityLabel="Your Communities title">
                    {viewAllCommunities
                      ? 'Your Communities'
                      : 'Joined Communities'}
                  </Text>
                </TouchableOpacity>
                <View accessibilityLabel="List of user communities">
                  <FlatList
                    data={
                      viewAllCommunities
                        ? allUserCommunities
                        : allJoinedCommunities
                    }
                    keyExtractor={item => item._id}
                    ListFooterComponent={
                      viewAllCommunities ? renderFooter : renderFooterJoined
                    }
                    contentContainerStyle={
                      styles.FullScreenFlatListContainerStyle
                    }
                    onEndReached={
                      viewAllCommunities
                        ? hasNextPage && !isFetchingNextPage && fetchNextPage
                        : hasMoreJoined &&
                          !isFetchingMoreJoined &&
                          fetchMoreJoined
                    }
                    accessibilityLabel="all Communities flat list"
                    renderItem={item => (
                      <RenderAllCommunities
                        item={item.item}
                        closeDrawer={closeDrawerAndClear}
                        setRefresh={setRefresh}
                        screen="drawer"
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '75%',
    height: '100%',
    backgroundColor: '#FFF8F0',
    zIndex: 2,
  },

  container: {
    backgroundColor: NewTheme.colors.backgroundCreamy,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    height: Dimensions.get('screen').height,
    paddingTop: 10,
  },
  header: {
    padding: 20,
    backgroundColor: NewTheme.colors.backgroundCreamy,
  },
  drawerItem: {
    marginHorizontal: 5,
    backgroundColor: 'white',
    // height: 40,
    borderRadius: 8,
    borderWidth: 1.3,
    borderColor: '#dbdbdb',
    justifyContent: 'center',
    // marginBottom: -5,
  },
  labelStyle: {
    fontSize: 18,
    fontFamily: 'PublicSans Bold',
    color: 'black',
    marginLeft: -20,
    lineHeight: 22,
  },
  communityContainer: {
    padding: 10,
    width: '100%',
    paddingRight: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  communityTitle: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 19.6,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  communityTextContainer: {
    marginLeft: 10,
  },
  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  communityMembers: {
    fontSize: 14,
    color: 'gray',
  },
  divider: {
    borderBottomWidth: 1,
    margin: 10,
    borderBlockColor: '#E2D1C8',
  },
  FlatListContainerStyle: {
    paddingHorizontal: 10,
  },
  FlatListJoinedContainerStyle: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'android' ? 230 : 400,
  },
  FullScreenFlatListContainerStyle: {
    paddingHorizontal: 10,

    paddingBottom: Platform.OS === 'android' ? 250 : 300,
  },
});

export default Drawer;
