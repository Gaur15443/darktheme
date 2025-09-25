import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import NewTheme from '../../../common/NewTheme';
import {ActivityIndicator, Card, useTheme, Text} from 'react-native-paper';
import {CustomButton, GlobalStyle} from '../../../core';
import Theme from '../../../common/Theme';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchInviteCount,
  getUserSurname,
  removeSpouseList,
  resetTreeItem,
  setTreeItemFromPrivateTree,
  listFamilyTrees,
  setCountInvite,
  setGroupId,
  setFamilyName,
  setTreeId,
} from '../../../store/apps/tree';
import {setStoryFilters} from '../../../store/apps/story';
import TreeIcon from '../../../../src/images/treeIcon.png';
import MemberIcon from '../../../../src/images/memberIcon.png';
import StatsIcon from '../../../../src/images/statsIcon.png';
import {getFamilyStats} from '../../../store/apps/familyStats';
import InviteArrowIcon from '../../../images/Icons/InviteArrowIcon';
import {getGroupData} from '../../../store/apps/memberDirectorySlice';
import CreateNewTree from '../../../common/createNewTree';
import Toast from 'react-native-toast-message';
import _ from 'lodash';
import {Track} from '../../../../App';
import Spinner from '../../../common/Spinner';
import TreeCard from '../../../components/TreeCard';
import Header from '../../../common/Header';
import {IIconCarousel} from '../../../components';
import {IIcon} from '../../../images';
import ErrorBoundary from '../../../common/ErrorBoundary';
import PullToRefresh from '../../../common/PullToRefresh';
import FamilyWallIcon from '../../../images/FamilywallIcon.png';
import Axios from '../../../plugin/Axios';

const Tree = ({route}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const handleMembersTab = treeItem => {
    navigation.navigate('Members', {currentTreeDetails: treeItem});
  };
  const theme = useTheme();
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);
  const [inviteNotifications, setInviteNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmBtnLoading, setConfirmBtnLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [isOpenCreateTreePopup, setIsOpenCreateTreePopup] = useState(false);
  const [isTree, setIsTree] = useState(false);
  const [isNewTreeCreated, setIsNewTreeCreated] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('member');
  const [isIIconCarouselVisible, setIIconCarouselVisible] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const fetchCountInvite = useSelector(state => state?.Tree?.fetchInvite);
  const imageStyles = {width: 35, height: 43, objectFit: 'cover'};
  const faimulyWallStyles = {width: 58, height: 43, objectFit: 'cover'};
  const [groupName, setGroupName] = useState(null);
  const userData = useSelector(state => state?.userInfo);
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Trees,
  );

  const GotoTree = async treeItem => {
    try {
      dispatch(resetTreeItem());
      dispatch(setTreeItemFromPrivateTree(treeItem));
      navigation.navigate('TreeScreen', {
        family: treeItem?.tree?.name,
        currentTreeDetails: treeItem,
        role: treeItem?.user?.role,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const handleFamilyStats = async item => {
    navigation.navigate('BottomSheetModal', {
      item: item,
    });
  };

  let familyList = [];
  const privateTree = useSelector(
    state => state.getprivateTreeList.AllFamilyTrees,
  );

  const inviteValue = useSelector(state => state.Tree.inviteValue);
  if (privateTree) {
    const ownerRecord = privateTree?.treeList?.filter(
      record => record.user && record.user.role === 'owner',
    );

    const contributorRecords = privateTree?.treeList?.filter(
      record => record.user && record.user.role === 'Contributor',
    );

    const memberRecords = privateTree?.treeList?.filter(
      record => record.user && record.user.role === 'User',
    );
    familyList = ownerRecord?.concat(contributorRecords, memberRecords);
  }

  const OpenInvite = () => {
    navigation.navigate('InviteSheetModal', {
      inviteNotifications: inviteNotifications,
    });
  };

  const openTreeIICon = () => {
    setIIconCarouselVisible(true);
  };

  const totalImages = 3;

  // Effect to check if all images are loaded
  useEffect(() => {
    if (loadedImagesCount === totalImages) {
      setLoading(false);
    }
  }, [loadedImagesCount, totalImages]);

  async function getInviteCount() {
    try {
      setLoading(true);
      const res = await dispatch(fetchInviteCount()).unwrap();
      dispatch(setCountInvite(res));
      setInviteCount(res?.InviteCount);
      setInviteNotifications(res?.notifications);
      setLoading(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    }
  }
  function shrinkDisplayFamilyName(userFamilyName) {
    try {
      // -> first convert to lower case for bertter identification
      const modifiableName = userFamilyName?.toLowerCase?.();
      if (modifiableName?.includes?.('family')) {
        const nameArray = modifiableName.split(' ');
        const removeFamilyWord = _.startCase(
          nameArray.slice(0, nameArray.length - 1).join(' '),
        );
        // -> if name exceeds more than 11 characters
        if (removeFamilyWord.length > 11) {
          return removeFamilyWord.slice(0, 11) + '...' + ' ' + 'Family';
        }
      }
      // -> else just return exising name
      return _.startCase(modifiableName);
    } catch (error) {}
  }

  const getContainerStyle = role => {
    const roleStyles = {
      owner: styles.ownerRole,
      Contributor: styles.contributorRole,
      User: styles.memberRole,
    };
    return roleStyles[role] || styles.memberRole;
  };

  const getPaddingStyle = role => {
    const paddingStyles = {
      owner: styles.ownerRelationship,
      Contributor: styles.contributorRelationship,
      User: styles.memberRelationship,
    };
    return paddingStyles[role] || styles.memberRelationship;
  };

  const fetchData = async () => {
    try {
      setApiLoading(true);
      const responseFromUserGroup = await Promise.all([
        getInviteCount(),
        dispatch(getGroupData()),
        dispatch(listFamilyTrees()),
      ]);
      const responseData = responseFromUserGroup[1]?.payload;
      const ownerData = responseData?.find(
        item => item?.ownerId?._id?._id === userInfo?._id,
      );
      setGroupName(ownerData?.groupName);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setApiLoading(false);
    }
  };

  const isCloseGender = () => {
    setIsOpenCreateTreePopup(false);
  };

  useEffect(() => {
    fetchData();
    try {
      dispatch(removeSpouseList());
      /* customer io and mixpanel event changes  start */
      Track({
        cleverTapEvent: 'tree',
        mixpanelEvent: 'treeLandingPage',
        userData,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
    /* customer io and mixpanel event chagnes  end */
  }, []);

  useEffect(() => {
    if (inviteValue) {
      OpenInvite();
    }
  }, [inviteValue]);

  const userInfo = useSelector(state => state.userInfo);
  const MakeNewTree = async userFamilyName => {
    try {
      dispatch(getUserSurname(userFamilyName)).then(async () => {
        setTimeout(async () => {
          setIsNewTreeCreated(true);
          await dispatch(listFamilyTrees());
        }, 2000);
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    try {
      if (isNewTreeCreated) {
        const ownerRecord = privateTree?.treeList?.filter(
          record => record.user && record.user.role === 'owner',
        );
        familyList = ownerRecord;
        setConfirmBtnLoading(false);
        setIsOpenCreateTreePopup(false);
        setIsTree(false);
        if (familyList) {
          GotoTree(familyList[0]);
          Toast.show({
            type: 'success',
            text1: toastMessages?.['3001'],
          });
          setIsNewTreeCreated(false);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [privateTree]);

  const CancelSelect = () => {
    setIsOpenCreateTreePopup(false);
    setConfirmBtnLoading(false);
  };

  useEffect(() => {
    if (route?.params?.iscreateTree === true) {
      setIsTree(true);
    }
  }, [route?.params]);

  useEffect(() => {
    if (!fetchCountInvite || Object.keys(fetchCountInvite).length === 0) {
      fetchData();
    }
  }, [fetchCountInvite]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const responseFromUserGroup = await Promise.all([
        getInviteCount(),
        dispatch(getGroupData()),
        dispatch(listFamilyTrees()),
      ]);
      const responseData = responseFromUserGroup[1]?.payload;
      const ownerData = responseData?.find(
        item => item?.ownerId?._id?._id === userInfo?._id,
      );
      setGroupName(ownerData?.groupName);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ErrorBoundary.Screen>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: NewTheme.colors.backgroundCreamy,
        }}>
        <Header />
        <View
          style={{
            paddingTop: Platform.OS === 'ios' ? '18%' : '14%',
            paddingRight: Platform.OS === 'ios' ? '5%' : '5%',
          }}>
          <TouchableOpacity onPress={openTreeIICon} testID="open-tree-iicon">
            <IIcon size={30} />
          </TouchableOpacity>
        </View>
      </View>
      <PullToRefresh
        bgColor={NewTheme.colors.backgroundCreamy}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}>
        <ScrollView
          contentContainerStyle={{
            backgroundColor: NewTheme.colors.backgroundCreamy,
            minHeight: Dimensions.get('window').height,
            flex: 1,
          }}>
          <GlobalStyle>
            <View>
              <Card
                onPress={OpenInvite}
                id="invites"
                style={[styles.cardContainer]}
                elevation={2}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    border: '1px solid black',
                  }}>
                  <Text
                    style={{
                      // marginRight: 10,
                      fontSize: 20,
                      color: '#E77237',
                      padding: 10,
                      fontWeight: '700',
                      paddingLeft: '6%',
                    }}>
                    Invites
                  </Text>
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={NewTheme.colors.primaryOrange}
                    />
                  ) : inviteCount !== 0 ? (
                    <View style={styles.inviteCount}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 14,
                          fontWeight: 400,
                        }}>
                        {inviteCount >= 9 ? '9+' : inviteCount}
                      </Text>
                    </View>
                  ) : (
                    <View style={{justifyContent: 'center', marginRight: '4%'}}>
                      <InviteArrowIcon />
                    </View>
                  )}
                </View>
              </Card>
            </View>
            <View>
              {isRefreshing || apiLoading ? (
                <Spinner />
              ) : (
                <View
                  style={{
                    marginBottom: '90%',
                    flex: 1,
                  }}>
                  {privateTree.length !== 0 && !privateTree?.isOwner && (
                    <Card style={[styles.card]}>
                      <TreeCard top={1} />
                      <View
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}>
                        <TouchableOpacity
                          testID="owner-card"
                          style={[styles.cardtext, {paddingRight: 0}]}>
                          <Text style={styles.inviteText}>{groupName}</Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={[
                                styles.OwnerOne,
                                {
                                  padding: 4,
                                  color: '#E77237',
                                  fontWeight: 700,
                                  borderRadius: 5,
                                  borderColor: 'rgba(231, 114, 55, 1)',
                                },
                              ]}>
                              Owner
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <View
                          style={{
                            justifyContent: 'start',
                            alignItems: 'start',
                          }}>
                          <View>
                            <CustomButton
                              testID="create-tree"
                              label={'Create Tree'}
                              style={styles.buttonOne}
                              onPress={() => {
                                setIsOpenCreateTreePopup(true);
                              }}
                            />
                          </View>
                          {isOpenCreateTreePopup && (
                            <CreateNewTree
                              isOpen={isOpenCreateTreePopup}
                              MakeNewTree={MakeNewTree}
                              CancelSelect={CancelSelect}
                              confirmBtnLoading={confirmBtnLoading}
                              setConfirmBtnLoading={setConfirmBtnLoading}
                              isCloseGender={isCloseGender}
                            />
                          )}
                        </View>
                      </View>
                    </Card>
                  )}
                  {privateTree &&
                    familyList?.length > 0 &&
                    familyList.map((treeItem, index) => (
                      <View key={index}>
                        <Card style={styles.card} elevation={5}>
                          <View>
                            <TreeCard top={1} />
                          </View>
                          <TouchableOpacity
                            key={treeItem.tree.name}
                            accessibilityLabel="tree-card"
                            onPress={() => GotoTree(treeItem)}
                            style={styles.cardtext}>
                            <Text style={styles.inviteText}>
                              {treeItem.tree.name.includes('Family')
                                ? shrinkDisplayFamilyName(treeItem.tree.name)
                                : `${shrinkDisplayFamilyName(treeItem.tree.name)} Family`}
                            </Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                gap: 5,
                              }}>
                              <View
                                style={getContainerStyle(treeItem.user.role)}>
                                <Text
                                  style={{
                                    padding: 4,
                                    color: '#E77237',
                                    fontWeight: 700,
                                  }}>
                                  {treeItem.user.role === 'owner'
                                    ? 'Owner'
                                    : treeItem.user.role === 'User'
                                      ? 'Member'
                                      : treeItem.user.role}
                                </Text>
                              </View>
                              <View
                                style={{
                                  backgroundColor: '#DFEBFF',
                                  borderRadius: 4,
                                  alignContent: 'center',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderWidth: 2,
                                  borderColor: 'rgba(3, 89, 151, 1)',
                                }}>
                                <Text
                                  style={[
                                    {
                                      fontWeight: 700,
                                      borderRadius: 4,
                                      paddingHorizontal: 4,
                                    },
                                    getPaddingStyle(treeItem.user.role),
                                  ]}>
                                  {/* {treeItem.members?.count || 0} Relatives  */}
                                  {treeItem.members?.count === 1
                                    ? `${treeItem.members.count} Relative`
                                    : `${treeItem.members?.count || 0} Relatives`}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-around',
                            }}>
                            <TouchableWithoutFeedback
                              onPress={() => {
                                if (treeItem) {
                                  GotoTree(treeItem);
                                }
                              }}>
                              <View>
                                <Image
                                  source={TreeIcon}
                                  style={imageStyles}
                                  resizeMode="contain"
                                />
                              </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback
                              onPress={() => {
                                if (treeItem) {
                                  handleMembersTab(treeItem);
                                }
                              }}>
                              <View>
                                <Image
                                  source={MemberIcon}
                                  style={{
                                    width: 45,
                                    height: 43,
                                    objectFit: 'cover',
                                  }}
                                  resizeMode="contain"
                                />
                              </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback
                              onPress={() => {
                                if (treeItem) {
                                  dispatch(setGroupId([]));
                                  dispatch(setFamilyName(''));
                                  dispatch(setTreeId([]));
                                  const homePersonId =
                                    privateTree?.treeList?.find(
                                      item => item.tree.id === treeItem.tree.id,
                                    )?.user?.homePerson?.[0]?.homePerson;

                                  if (!homePersonId) {
                                    console.error('HomePersonId is missing');
                                    return;
                                  }

                                  Axios.get(
                                    `/getGroupIdByTreeAndUser/${treeItem.tree.id}/${homePersonId}`,
                                  )
                                    .then(response => {
                                      const groupIdss = response.data.groupId;
                                      dispatch(
                                        setGroupId(response?.data?.groupId),
                                      );
                                      const familyName =
                                        shrinkDisplayFamilyName(
                                          treeItem.tree.name,
                                        );
                                      dispatch(setFamilyName(familyName));
                                      dispatch(setTreeId(treeItem));
                                      dispatch(setStoryFilters('allPosts'));
                                      navigation.navigate('Stories', {
                                        // userIdDetail: homePersonId,
                                        // groupIdss: Array.isArray(groupIdss) ? groupIdss : [String(groupIdss)],
                                      });
                                    })
                                    .catch(error => {
                                      Toast.show({
                                        type: 'error',
                                        text1: error.message,
                                      });
                                    });
                                }
                              }}>
                              <View>
                                <Image
                                  source={FamilyWallIcon}
                                  style={faimulyWallStyles}
                                  resizeMode="contain"
                                />
                              </View>
                            </TouchableWithoutFeedback>

                            <TouchableWithoutFeedback
                              onPress={() => {
                                if (treeItem) {
                                  handleFamilyStats(treeItem);
                                }
                              }}>
                              <View>
                                <Image
                                  source={StatsIcon}
                                  style={imageStyles}
                                  resizeMode="contain"
                                />
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </Card>
                      </View>
                    ))}
                </View>
              )}
              {isTree && (
                <CreateNewTree
                  isOpen={isTree}
                  MakeNewTree={MakeNewTree}
                  CancelSelect={() => setIsTree(false)}
                  confirmBtnLoading={confirmBtnLoading}
                  setConfirmBtnLoading={setConfirmBtnLoading}
                  isCloseGender={isCloseGender}
                />
              )}
            </View>
          </GlobalStyle>
        </ScrollView>

        {isIIconCarouselVisible && (
          <IIconCarousel
            isVisible={isIIconCarouselVisible}
            onClose={() => setIIconCarouselVisible(false)}
          />
        )}
      </PullToRefresh>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  image: {
    width: 100,
    height: 55,
  },
  heading: {
    fontSize: 26,
    fontWeight: Theme.fonts.weight.bold,
    marginRight: 10,
    color: Theme.dark.shadow,
    padding: 10,
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 7, // For Android shadow
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3.61,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.61,
    elevation: 4,
    marginTop: 20,
    margin: 4,
    padding: 6,
    fontSize: Theme.fonts.size.heading.sm,
    borderWidth: 0,
    borderRadius: 8,
    backgroundColor: Theme.light.onBackground,
  },
  cardtext: {
    fontWeight: 400,
    padding: 24,
    fontSize: '1rem',
  },
  shadowContainer: {
    shadowColor: 'red',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3.61,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.61,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: Theme.light.onBackground,
    height: 160,
    marginHorizontal: 5,
  },
  buttonOne: {
    backgroundColor: 'rgba(235, 139, 90, 1)',
    marginLeft: 24,
    alignSelf: 'flex-start',
  },
  inviteText: {
    textTransform: 'capitalize',
    fontSize: Theme.fonts.size.heading.sm,
    color: 'rgba(3, 89, 151, 1)',
    fontWeight: 'bold',
    marginTop: -8,
    marginBottom: 10,
  },
  memberCount: {
    display: 'inline',
    marginTop: -25,
  },

  ownerRelationship: {
    color: 'rgba(3, 89, 151, 1)',
    borderRadius: 4,
  },
  memberRelationship: {
    color: 'rgba(3, 89, 151, 1)',
    borderRadius: 4,
  },
  contributorRelationship: {
    color: 'rgba(3, 89, 151, 1)',
    borderRadius: 4,
  },

  ownerRole: {
    backgroundColor: 'rgba(255, 234, 202, 1)',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(231, 114, 55, 1)',
  },

  contributorRole: {
    backgroundColor: 'rgba(255, 234, 202, 1)',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(231, 114, 55, 1)',
  },
  OwnerOne: {
    backgroundColor: 'rgba(255, 234, 202, 1)',
    borderWidth: 2,
    borderRadius: 4,
  },
  memberRole: {
    backgroundColor: 'rgba(255, 234, 202, 1)',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(231, 114, 55, 1)',
  },
  Owner: {
    textTransform: 'capitalize',
    fontSize: 17,
    color: 'rgba(231, 114, 55, 1)',
    fontWeight: 'bold',
  },

  container: {
    width: 70,
    height: 70,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: Theme.dark.shadow,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  inviteCount: {
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: 'red',
    width: 30,
    height: 30,
    borderRadius: 50,
  },
});

export default Tree;
