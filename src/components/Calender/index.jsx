import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import {Text, ActivityIndicator, Avatar, useTheme} from 'react-native-paper';
import moment from 'moment';
import {DefaultImage} from '../../core';
import {useDispatch, useSelector} from 'react-redux';
import {fetchCalendarData,SetIsFetchData} from '../../store/apps/notifications';
import {
  AnniversaryIcon,
  BirthdayIcon,
  CalenderEmptyState,
  DeathAnniversaryIcon,
} from '../../images';
import Toast from 'react-native-toast-message';
import Spinner from '../../common/Spinner';
import newTheme from '../../common/NewTheme';
import ButtonSpinner from '../../common/ButtonSpinner';
import NewTheme from '../../common/NewTheme';
import { useInfiniteQuery } from '@tanstack/react-query';

const {width, height} = Dimensions.get('window');
export default function Calendar({isFocused}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const linkedGroup = useSelector(state => state.userInfo.linkedGroup);
  const isComponentMountedCalender = useRef(true);
  const [calenderPage, setCalenderPage] = useState(1);
  const [calendarResp, setCalendarResp] = useState([]);
  const [isFetchingMoreCalenderData, setFetchingMoreCalenderData] =
    useState(false);
  const [lastFetchedCalenderLength, setLastFetchedCalenderLength] =
    useState(null);
  const [refreshing, setRefreshing] = useState(false);


  const fetchCalendar = async ({ pageParam = 1 }) => {
    const data = { groupId: linkedGroup, calenderPage: pageParam };
    const response = await dispatch(fetchCalendarData(data)).unwrap();
    if (response.length === 0) {
       dispatch(SetIsFetchData(true));
    }
    return response;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['calendarData', linkedGroup],
    queryFn: fetchCalendar,
    enabled: !!linkedGroup && isFocused,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 15 ? pages.length + 1 : undefined,
  });

  const calData = data?.pages.flat() || [];
  const isFetchData = useSelector(state => state?.fetchUserNotification?.isFetchData);

  const onRefresh = async () => {
    try{
      setRefreshing(true);
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
  const loadMoreCalenderNotifications = async () => {
    try {
      if (!isFetchingMoreCalenderData && lastFetchedCalenderLength === 15) {
        setFetchingMoreCalenderData(true);
        const data = {
          groupId: linkedGroup,
          calenderPage,
        };
        const res = await dispatch(fetchCalendarData(data)).unwrap();
        if (res) {
          // await preloadProfileImages(res);
          setCalendarResp([...calendarResp, ...res]);
          setLastFetchedCalenderLength(res.length);
          setCalenderPage(prevPage => prevPage + 1);
        }
      }
      setFetchingMoreCalenderData(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const preloadProfileImages = async calendarData => {
    const imageUrls = calendarData.reduce((urls, calendar) => {
      calendar.All.forEach(calendarAll => {
        calendarAll.result.sameday.forEach(sameday => {
          const profilepic = sameday.months.one.personalDetails?.profilepic;
          if (profilepic) {
            urls.push(profilepic);
          }
        });
      });
      return urls;
    }, []);

    const imagePromises = imageUrls.map(url =>
      Image.prefetch(url).then(() => {
        // Check if the component is still mounted
        if (!isComponentMountedCalender.current) {
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

  const calendarDate = date => {
    if (date !== '' && date !== undefined && date !== null) {
      return moment(date).format('MMM, Do');
    }
    return '';
  };

  const formattedSearchData = searchData => {
    searchData = searchData || [];
    return searchData.sort((a, b) => {
      const nameA = a?.months?.one?.personalDetails?.name?.toUpperCase();
      const nameB = b?.months?.one?.personalDetails?.name?.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  };

  const renderCalender = ({item: calendar, index}) => {
    return (
      <View key={index}>
        {calendar?.All?.length > 0 &&
          calendar?.All?.map(
            (calendarAll, index) =>
              calendarAll?.result?.sameday?.[0]?.months?.one?.MD_Flag !== 3 &&
              calendarAll?.result?.sameday?.[0]?.months?.one?.MD_Flag !== 2 && (
                <View key={index}>
                  <View style={{marginTop: 20}}>
                    {calendarAll?.result?.sameday?.[0]?.months?.one
                      ?.birthDetails?.dob && (
                      <Text
                        style={styles.eventDate}
                        accessible={true}
                        accessibilityLabel={calendarDate(
                          calendarAll.result.sameday[0].months.one.birthDetails
                            .dob,
                        )}>
                        {calendarDate(
                          calendarAll.result.sameday[0].months.one.birthDetails
                            .dob,
                        )}
                      </Text>
                    )}
                    {calendarAll?.result?.sameday?.[0]?.months?.one
                      ?.marriageDetails && (
                      <Text
                        style={styles.eventDate}
                        accessible={true}
                        accessibilityLabel={calendarDate(
                          calendarAll.result.sameday[0].months.one
                            .marriageDetails.marraigeDate,
                        )}>
                        {calendarDate(
                          calendarAll.result.sameday[0].months.one
                            .marriageDetails.marraigeDate,
                        )}
                      </Text>
                    )}
                    {calendarAll?.result?.sameday?.[0]?.months?.one
                      ?.birthDetails?.dod && (
                      <Text
                        style={styles.eventDate}
                        accessible={true}
                        accessibilityLabel={calendarDate(
                          calendarAll.result.sameday[0].months.one.birthDetails
                            .dod,
                        )}>
                        {calendarDate(
                          calendarAll.result.sameday[0].months.one.birthDetails
                            .dod,
                        )}
                      </Text>
                    )}
                  </View>
                  {calendarAll?.result?.sameday?.length > 0 && (
                    <View>
                      {formattedSearchData(calendarAll.result.sameday).map(
                        (call, indexTwo) => (
                          <View key={indexTwo}>
                            <View style={styles.calendarEventWrapper}>
                              <View style={styles.eventContent}>
                                <View style={styles.eventIcon}>
                                  {call?.months?.one?.type === 'Birthday' ? (
                                    <BirthdayIcon accessibilityLabel="birthday-icon" />
                                  ) : call?.months?.one?.type ===
                                    'Marriage Anniversary' ? (
                                    <AnniversaryIcon accessibilityLabel="anniversary-icon" />
                                  ) : (
                                    <DeathAnniversaryIcon accessibilityLabel="death-anniversary-icon" />
                                  )}
                                </View>
                                <View style={{flex: 1}}>
                                  {(call?.months?.one?.type === 'Birthday' ||
                                    call?.months?.one?.type ===
                                      'Death Anniversary') && (
                                    <Text
                                      style={{fontSize: 16}}
                                      accessible={true}
                                      accessibilityLabel={`${call.months.one.personalDetails.name}'s ${call.months.one.type}`}>
                                      {call.months.one.personalDetails.name}'s{' '}
                                      {call.months.one.type}
                                    </Text>
                                  )}
                                  {call?.months?.one?.type ===
                                    'Marriage Anniversary' && (
                                    <View
                                      accessible={true}
                                      accessibilityLabel={`${call.months.one.marr_name}'s ${call.months.one.type}`}>
                                      <Text style={{fontSize: 16}}>
                                        {call.months.one.marr_name}'s
                                      </Text>
                                      <Text style={{fontSize: 16}}>
                                        {call.months.one.type}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                              <View>
                                {call?.months?.one?.type ===
                                'Marriage Anniversary' ? (
                                  <View style={styles.profileImages}>
                                    {call?.months?.one?.personalDetails
                                      ?.profilepic?.length > 0 ? (
                                      <View
                                        style={{
                                          // marginRight: 10,
                                          position: 'relative',
                                          left: 25,
                                        }}>
                                        <Image
                                          style={styles.image}
                                          source={{
                                            uri: call.months.one.personalDetails
                                              .profilepic,
                                          }}
                                          resizeMode="cover"
                                        />
                                      </View>
                                    ) : (
                                      <View
                                        style={{
                                          marginRight: 10,
                                          position: 'relative',
                                          left: 25,
                                        }}>
                                        <DefaultImage
                                          gender={
                                            call?.months?.one?.personalDetails
                                              ?.gender
                                          }
                                          size={50}
                                          firstName={
                                            call?.months?.one?.personalDetails
                                              ?.name
                                          }
                                          lastName={
                                            call?.months?.one?.spousedata
                                              ?.personalDetails?.lastname
                                          }
                                        />
                                      </View>
                                    )}

                                    {call?.months?.one?.spousedata
                                      ?.personalDetails?.profilepic?.length >
                                    0 ? (
                                      <Image
                                        style={styles.image}
                                        source={{
                                          uri: call?.months?.one?.spousedata
                                            ?.personalDetails.profilepic,
                                        }}
                                        resizeMode="cover"
                                      />
                                    ) : (
                                      <View
                                        style={{
                                          marginRight: 10,
                                        }}>
                                        <DefaultImage
                                          gender={
                                            call?.months?.one?.spousedata
                                              ?.personalDetails?.gender
                                          }
                                          size={50}
                                          firstName={
                                            call?.months?.one?.spousedata
                                              ?.personalDetails?.name
                                          }
                                          lastName={
                                            call?.months?.one?.spousedata
                                              ?.personalDetails?.lastname
                                          }
                                        />
                                      </View>
                                    )}
                                  </View>
                                ) : (
                                  <View style={styles.profileImages}>
                                    {call?.months?.one?.personalDetails
                                      ?.profilepic?.length > 0 ? (
                                      <Image
                                        style={styles.image}
                                        source={{
                                          uri: call?.months?.one
                                            ?.personalDetails.profilepic,
                                        }}
                                        resizeMode="cover"
                                      />
                                    ) : (
                                      <View style={{marginRight: 10}}>
                                        <DefaultImage
                                          gender={
                                            call?.months?.one?.personalDetails
                                              ?.gender
                                          }
                                          size={50}
                                          firstName={
                                            call?.months?.one?.personalDetails
                                              ?.name
                                          }
                                          lastName={
                                            call?.months?.one?.personalDetails
                                              ?.lastname
                                          }
                                        />
                                      </View>
                                    )}
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        ),
                      )}
                    </View>
                  )}
                </View>
              ),
          )}
      </View>
    );
  };

  return calData?.length > 0 ? (
    <View
      style={{
        marginTop: 10,
      }}>
      <FlatList
        data={calData}
        renderItem={renderCalender}
        keyExtractor={(item, index) => `${item._id}${index}`}
        onEndReached={hasNextPage && !isFetchingNextPage && fetchNextPage}
        onEndReachedThreshold={0.4}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[NewTheme.colors.primaryOrange]}
            tintColor={NewTheme.colors.primaryOrange}
          />
        }
        contentContainerStyle={{
          paddingBottom: 150,
        }}
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
    <View style={styles.noEventsContainer}>
      {isFetchData && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: width - 10,
          }}>
          <CalenderEmptyState />
          <Text
            variant="bold"
            accessibilityLabel="calendar-no-event-text"
            style={{
              fontSize: 32,
              textAlign: 'center',
              marginTop: 20,
              color: theme.colors.pitchBlack,
            }}>
            No events
          </Text>
          <Text
            accessibilityLabel="calendar-no-event-subtext"
            style={{
              textAlign: 'center',
              width: '95%',
              fontWeight: 600,
              fontSize: 24,
              marginTop: 10,
            }}>
            Special dates such as birthdays, and anniversaries will show here.
          </Text>
        </View>
      )}
      {isLoading && <Spinner />}
    </View>
  );
}

const styles = {
  eventDate: {
    color: newTheme.colors.secondaryDarkBlue,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  calendarEventWrapper: {
    paddingBottom: 10,
    marginHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  eventIcon: {
    marginRight: 10,
    marginTop: 3,
  },
  profileImages: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noEventsContainer: {
    height: height,
    paddingTop: 15,
    height: height - 100,
    alignItems: 'center',
  },
  defaultImage: {
    width: 200,
    height: 200,
  },
};
