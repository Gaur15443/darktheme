// LifestoryTabContent.js
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import HTMLView from 'react-native-htmlview';

import {CustomButton, MediaContainer} from '../../core';
import {Card, useTheme, Text} from 'react-native-paper';
import Animated, {FadeInDown} from 'react-native-reanimated';
import EmptyLifestory from '../../images/Icons/EmptyLifestory';
import {useDispatch, useSelector} from 'react-redux';
import {getUserInfo} from '../../store/apps/userInfo';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {formatLinkText, formatTagsText} from '../../utils/format';
import {useFocusEffect} from '@react-navigation/native';

import {
  fetchChaptersData,
  fetchOneChapterData,
} from '../../store/apps/viewChapter';
const LifestoryTabContent = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const GotoAddChapter = () => {
    navigation.navigate('AddChapter');
  };
  const GotoViewChapter = async (chapterid, autopopulate) => {
    try {
      if (chapterid && !autopopulate) {
        await dispatch(fetchOneChapterData(chapterid))
          .unwrap()
          .then(() => {
            navigation.navigate('ViewChapter');
          });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

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
      marginBottom: 550,
    },
  });
  const userInfo = useSelector(state => state?.userInfo);
  const userId = useSelector(state => state?.userInfo._id);
  const treeId = useSelector(state => state?.userInfo.treeIdin?.[0]);
  // const basicInfo = useSelector(
  //   state => state?.fetchUserProfile?.data?.myProfile,
  // );
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  const allchapters = useSelector(state => state?.apiViewChapter?.fetchAll);

  useEffect(() => {
    try {
      const fetchInfoData = async () => {
        await dispatch(getUserInfo()).unwrap();
      };

      fetchInfoData();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          if (userId || treeId) {
            let cloneOwner = null;
            if (basicInfo?.isClone) {
              cloneOwner = basicInfo?.cLink?.find(
                link => link?.treeId === treeId,
              )?.linkId?.[0];
            }
            if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
              cloneOwner = basicInfo?._id;
            }
            dispatch(
              fetchChaptersData({
                userId: userId,
                treeId: treeId,
                clinkowner: cloneOwner,
              }),
            );
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      };
      fetchData();
    }, []),
  );

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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={[styles.row, {paddingTop: 0}]}>
          <View style={styles.column12}>
            <CustomButton
              testID="addChapterBtn"
              className="addChapterBtn"
              label={'Add New Chapter'}
              accessibilityLabel="addChapterBtn"
              onPress={() => GotoAddChapter()}
            />
          </View>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            {/* <Text>Loading</Text> */}
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : allchapters[userId]?.length > 0 ? (
          <View>
            {allchapters[userId]?.map((item, index) => (
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
                        color: theme.colors.pinkAmaranth,
                        fontWeight: 'bold',
                        paddingTop: '10px',
                      }}>
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
                                {backgroundColor: theme.colors.pinkAmaranth},
                              ]}>
                              <Text style={{color: theme.colors.onSecondary}}>
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
                              GotoViewChapter(item2._id, item2.autopopulate)
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
                                  customPress={() =>
                                    GotoViewChapter(
                                      item2._id,
                                      item2.autopopulate,
                                    )
                                  }
                                  postMedia={item2?.contents?.[0]?.elements}
                                  preventPlay={true}
                                />
                              )}

                              {item2.EventTitle && (
                                <Card.Title
                                  title={item2.EventTitle}
                                  style={{fontWeight: 'bold'}}
                                />
                              )}
                              {item2.title && (
                                <Card.Title
                                  title={item2.title}
                                  style={{fontWeight: 'bold'}}
                                />
                              )}

                              <Card.Content>
                                <Text
                                  variant="bodyMedium"
                                  style={{
                                    color: theme.colors.infoContentColor,
                                  }}>
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
                                    }}>
                                    {item2?.location?.formatted_address ?? ''}
                                  </Text>
                                )}
                                {typeof item2?.location === 'string' && (
                                  <Text
                                    variant="bodyMedium"
                                    style={{
                                      color: theme.colors.infoContentColor,
                                    }}>
                                    {item2?.location}
                                  </Text>
                                )}
                                {item2?.description && !item2.autopopulate ? (
                                  <HTMLView
                                    value={`<p>${formatLinkText(formatTagsText(item2?.description)).slice(0, 80)}</p>`}
                                    stylesheet={htmlStyles}
                                  />
                                ) : (
                                  <Text style={{color: 'black'}}>
                                    {item2.description}
                                  </Text>
                                )}

                                {!item2.autopopulate &&
                                  item2?.description?.length > 80 && (
                                    <Text
                                      style={{
                                        color: theme.colors.primary,
                                        paddingTop: 0,
                                        fontWeight: 'bold',
                                      }}>
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
            ))}
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
              <Text style={{fontWeight: 'bold', fontSize: 18, color: 'black'}}>
                Craft a lifestory
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 14,
    color: '#000',
  },
});
export default LifestoryTabContent;
