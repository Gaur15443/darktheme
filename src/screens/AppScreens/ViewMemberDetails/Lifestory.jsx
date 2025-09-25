// LifestoryTabContent.js
import React, {useState, useEffect, useCallback} from 'react';
import HTMLView from 'react-native-htmlview';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import Spinner from '../../../common/Spinner';
import {CustomButton, MediaContainer} from '../../../core';
import {Card, useTheme, ActivityIndicator, Text} from 'react-native-paper';
import Animated, {FadeInDown} from 'react-native-reanimated';
import EmptyLifestory from '../../../images/Icons/EmptyLifestory';
import {useDispatch, useSelector} from 'react-redux';
import {getUserInfo} from '../../../store/apps/userInfo';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {formatLinkText, formatTagsText} from '../../../utils/format';
import {
  fetchChaptersData,
  fetchOneChapterData,
  clearData,
  setResetFetchAll,
} from '../../../store/apps/viewChapter';
import NewTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';
import PullToRefresh from '../../../common/PullToRefresh';
import {desanitizeInput} from '../../../utils/sanitizers';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
const {width, height} = Dimensions.get('window');

const Lifestory = props => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {bottom} = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [autopopulateData, setAutopopulateData] = useState(null);
  const userId = props.id;
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );
  // const basicInfo = useSelector(
  //   state => state?.fetchUserProfile?.data?.myProfile,
  // );
  const userPermission = props.permission;
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const treeId = props.treeId;
  const allchapters = useSelector(state => state?.apiViewChapter?.fetchAll);
  const isDataFetched = useSelector(
    state => state.apiViewChapter.isDataFetched,
  );

  const fetchData = async () => {
    // if (isDataFetched && allchapters?.length > 0) return; // Prevent unnecessary API calls
    setLoading(true);
    try {
      if (userId || treeId) {
        let cloneOwner = null;
        if (basicInfo?.isClone) {
          cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
            ?.linkId?.[0];
        }
        if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
          cloneOwner = basicInfo?._id;
        }

        await dispatch(
          fetchChaptersData({
            userId: userId,
            treeId: treeId,
            clinkowner: cloneOwner,
          }),
        ).unwrap();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (!allchapters[userId]) {
  //   fetchData();
  //   }
  // }, []);
  // }, [isDataFetched, allchapters]);

  useFocusEffect(
    useCallback(() => {
      if (!allchapters[userId]) {
        fetchData();
      }
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(setResetFetchAll(userId));
    fetchData();
    setRefreshing(false);
  };

  const GotoAddChapter = () => {
    navigation.navigate('AddChapter', {
      id: props.id,
      memberTreeId: props.treeId,
    });
  };
  const GotoViewChapter = async (chapterid, autopopulate, data) => {
    try {
      if (chapterid && !autopopulate) {
        await dispatch(fetchOneChapterData(chapterid))
          .unwrap()
          .then(() => {
            navigation.navigate('ViewChapter', {
              id: props.id,
              memberTreeId: props.treeId,
              userPermission: userPermission,
            });
          });
      } else {
        AsyncStorage.setItem('AutopupulateData', JSON.stringify(data));
        let autopopulateDataAll =
          await AsyncStorage.getItem('AutopupulateData');
        var dataObject = JSON.parse(autopopulateDataAll);
        setAutopopulateData(dataObject);
        const flag =
          dataObject?.dobMediaIds?.length > 0 ||
          dataObject?.dodMediaIds?.length > 0 ||
          dataObject?.docMediaIds?.length > 0 ||
          dataObject?.domMediaIds?.length > 0 ||
          dataObject?.dowMediaIds?.length > 0;
        navigation.navigate('ViewAutoChapter', {
          id: props.id,
          AutoChapterData: dataObject,
          userPermission: userPermission,
          memberTreeId: props.treeId,
          flag: flag,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    try {
      const fetchDetails = async () => {
        await dispatch(fetchUserProfile(userId)).unwrap();
      };
      fetchDetails();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [userId]);

  const convertToYear = (d, flag) => {
    if (d !== '' && d !== undefined && d !== null) {
      if (flag) {
        if (flag === 1) {
          return moment(d).format('DD MMM YYYY');
        } else if (flag === 2) {
          return moment(d).format('MMM YYYY');
        } else if (flag === 3) {
          return moment(d).format('YYYY');
        }
      } else {
        return moment(d).format('DD MMM YYYY');
      }
    } else {
      return '';
    }
  };

  const renderItem = ({item, index}) => (
    <Animated.View
      key={index}
      entering={FadeInDown.delay(index + 100)
        .damping(20)
        .duration(500)
        .springify()}>
      <View style={[styles.row, {paddingTop: 5}]}>
        <View style={styles.column1}>
          <Text
            style={{
              color: NewTheme.colors.secondaryDarkBlue,
              fontWeight: 'bold',
              paddingTop: '10px',
            }}
            accessibilityLabel={`${item._id}-${index}`}>
            {item._id}
          </Text>
        </View>
        {item.months.map((item1, index) => (
          <View style={{flexDirection: 'row'}} key={index}>
            <View style={{flex: 1}}>
              {/* Before element */}
              <View
                style={[
                  styles.tlDotBefore,
                  {borderColor: theme.colors.lightGrey},
                  {backgroundColor: theme.colors.lightGrey},
                ]}
              />
              <View style={{marginTop: 0}}>
                <View style={styles.tlDot}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: NewTheme.colors.secondaryDarkBlue,
                      },
                    ]}>
                    <Text
                      style={{color: theme.colors.onSecondary}}
                      accessibilityLabel={`${item1.month}-${index}`}>
                      {item1.month}
                    </Text>
                  </View>
                </View>
              </View>
              {/* After element */}
              <View style={styles.tlDotAfter} />
            </View>
            <View style={{flex: 5}}>
              {item1.events.map((item2, index) => (
                <TouchableOpacity
                  onPress={() =>
                    GotoViewChapter(item2._id, item2.autopopulate, item2)
                  }
                  key={index}
                  testID="viewSinglechapter">
                  <View
                    style={[
                      styles.card,
                      {marginBottom: 10},
                      {marginRight: 2},
                      {paddingBottom: 10},
                      {backgroundColor: theme.colors.onSecondary},
                    ]}>
                    {item2?.contents?.[0]?.elements?.filter(
                      element => element.mediaUrl,
                    ).length > 0 && (
                      <MediaContainer
                        accessibilityLabel={`${item2._id}-${index}`}
                        customPress={() =>
                          GotoViewChapter(item2._id, item2.autopopulate, item2)
                        }
                        postMedia={item2?.contents?.[0]?.elements}
                        preventPlay={true}
                      />
                    )}
                    {(
                      item2.dobMediaIds ||
                      item2.dodMediaIds ||
                      item2?.docMediaIds ||
                      item2?.domMediaIds ||
                      item2?.dowMediaIds
                    )?.filter(element => element.mediaUrl).length > 0 && (
                      <MediaContainer
                        customPress={() =>
                          GotoViewChapter(item2._id, item2.autopopulate, item2)
                        }
                        postMedia={
                          item2.dobMediaIds
                            ? item2.dobMediaIds
                            : item2.dodMediaIds
                              ? item2.dodMediaIds
                              : item2?.docMediaIds
                                ? item2?.docMediaIds
                                : item2?.domMediaIds
                                  ? item2?.domMediaIds
                                  : item2?.dowMediaIds
                                    ? item2?.dowMediaIds
                                    : null
                        }
                        preventPlay={true}
                      />
                    )}

                    {item2.EventTitle && (
                      <Card.Title
                        title={item2.EventTitle}
                        titleStyle={{
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: 16,
                        }}
                        accessibilityLabel={`${item2.EventTitle}-${index}`}
                      />
                    )}
                    {item2.title && (
                      <Card.Title
                        title={item2.title}
                        titleStyle={{
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: 16,
                        }}
                        accessibilityLabel={`${item2.title}-${index}`}
                      />
                    )}

                    <Card.Content>
                      <Text
                        variant="bodyMedium"
                        style={{
                          color: theme.colors.infoContentColor,
                        }}
                        accessibilityLabel={`${item2.eventDate}-${index}`}>
                        {convertToYear(
                          item2.eventDate,
                          item2.CD_Flag ||
                            item2.BD_Flag ||
                            item2.DD_Flag ||
                            item2.FD_Flag ||
                            item2.TD_Flag ||
                            item2.MD_Flag,
                        )}
                      </Text>

                      {item2?.location?.formatted_address && (
                        <Text
                          variant="bodyMedium"
                          style={{
                            color: theme.colors.infoContentColor,
                          }}
                          accessibilityLabel={`${item2?.location?.formatted_address}-${index}`}>
                          {item2?.location?.formatted_address ?? ''}
                        </Text>
                      )}
                      {typeof item2?.location === 'string' && (
                        <Text
                          variant="bodyMedium"
                          style={{
                            color: theme.colors.infoContentColor,
                          }}
                          accessibilityLabel={`${item2?.location}-${index}`}>
                          {item2?.location}
                        </Text>
                      )}
                      {item2?.description && !item2.autopopulate ? (
                        <HTMLView
                          value={`<p>${formatLinkText(formatTagsText(item2?.description)).slice(0, 80)}</p>`}
                          stylesheet={htmlStyles}
                          accessibilityLabel={`description-${index}`}
                        />
                      ) : (
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#000',
                            fontWeight: '400',
                          }}
                          accessibilityLabel={`description-${index}`}>
                          {desanitizeInput(item2.description)}
                        </Text>
                      )}

                      {!item2.autopopulate &&
                        item2?.description?.length > 80 && (
                          <Text
                            style={{
                              color: theme.colors.primary,
                              paddingTop: 0,
                              fontWeight: 'bold',
                            }}
                            accessibilityLabel={`ReadMore-${index}`}>
                            Read more
                          </Text>
                        )}
                    </Card.Content>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
  if (!userId) {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          alignSelf: 'center',
          marginTop: 30,
          backgroundColor: NewTheme.colors.backgroundCreamy,
        }}>
        <Spinner />
      </View>
    );
  }

  return (
    <ErrorBoundary.Screen>
      <>
        <View
          style={[
            styles.container,
            {
              marginHorizontal: 4,
              paddingBottom: bottom + (Platform.OS === 'android' ? 138 : 90),
              flex: 1,
            },
          ]}>
          <View style={[styles.row, {paddingTop: 0}]}>
            <View style={styles.column12}>
              {userPermission && (
                <CustomButton
                  testID="addChapterBtn"
                  accessibilityLabel="addChapterBtn"
                  className="addChapterBtn"
                  label={'Add New Chapter'}
                  onPress={() => GotoAddChapter()}
                />
              )}
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              {/* <Text>Loading</Text> */}
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : allchapters[userId]?.length > 0 ? (
            <View>
              <FlatList
                key={refreshing}
                data={allchapters[userId]}
                keyExtractor={(item, index) => `${item._id}-${index}`}
                renderItem={renderItem}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]} // Loader colors for Android (cycling)
                    tintColor={theme.colors.primary} // Loader color for iOS
                  />
                }
              />
            </View>
          ) : (
            <View style={{paddingTop: '15px'}}>
              <View
                style={{
                  desplay: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <EmptyLifestory />
              </View>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 10,
                }}>
                <Text
                  style={{fontWeight: 'bold', fontSize: 18, color: 'black'}}>
                  Craft a lifestory
                </Text>
              </View>
            </View>
          )}
        </View>
      </>
    </ErrorBoundary.Screen>
  );
};
const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
});

export default Lifestory;

const styles = StyleSheet.create({
  row1: {
    width: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  card: {
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },

  tlDotAfter: {
    display: 'none',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40%',
  },

  tlDotBefore: {
    content: '',
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    width: 32,
    height: 100,
    bottom: -15,
    left: 50,
    transform: [{translateX: -50}],
  },
  tlDotAfetr: {
    content: '',
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    width: 32,
    height: 100,
    bottom: -15,
    left: 50,
    transform: [{translateX: -50}],
  },
  tlDotAfter: {
    display: 'none',
  },

  tlDotAfter: {
    width: 20,
    height: 20,
    top: 25,
    bottom: -15,
    borderRightWidth: 20,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 0,
  },
  tlDot: {
    position: 'relative',
  },

  tlItem: {
    borderRadius: 3,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tlItemChild: {
    padding: 10,
  },
  tlItemLastChildDotAfter: {
    display: 'none',
  },

  tlDotAfter: {},
  tlDotBefore: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    width: 2,
    height: '100%',
    bottom: -15,
    left: 68,
    top: 0,
    transform: [{translateX: -50}],
  },

  avatar: {
    position: 'relative',
    lineHeight: 20,
    padding: 0,
    fontWeight: '700',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    boxShadow: '0 5px 10px 0 rgba(50, 50, 50, 0.15)',
    width: 40,
    height: 40,
    borderRadius: 5,
  },
  column4: {
    flex: 1,
    margin: 4,
  },
  column2: {
    flex: 1,
    marginRight: 10,
  },

  column12: {
    marginTop: 0,
    border: 0,
  },

  container: {
    // marginBottom: '70%',
  },
});
