import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import {GlobalStyle} from '../../../core';
import Theme from '../../../common/Theme';
import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import {useDispatch, useSelector} from 'react-redux';
import DefaultImage from '../../../common/DefaultImage';
import VoterIcon from '../../../assets/images/publicSearch/VoterIcon.jsx';
import RationIcon from '../../../assets/images/publicSearch/RationIcon.jsx';
import FarmerIcon from '../../../assets/images/publicSearch/FarmerIcon.jsx';
import otherImage from '../../../assets/images/publicSearch/other.png';
import {
  getPublicDataPlural,
  getListPublicData,
} from '../../../store/apps/listPublicData';
import {getDeepSearch} from '../../../store/apps/deepSearch';
import {
  ActivityIndicator,
  ProgressBar,
  Text,
  useTheme,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
const {width} = Dimensions.get('window');
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {Invite, Cancel, InfocheckIcon} from '../../../images';
import {CustomDialog} from '../../../core';
import {sendSearchInvitation} from '../../../store/apps/serachInvite';
import {sendSearchCancelInvitation} from '../../../store/apps/searchCancelInvite';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import NewTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary/index.jsx';

const ImuwSearchResults = ({route}) => {
  const ios = Platform.OS == 'ios';
  const {top} = useSafeAreaInsets();
  const dispatch = useDispatch();
  const publicDataResults = useSelector(
    state => state.getListPublicData?.getListPublicData,
  );
  const theme = useTheme();

  const navigator = useNavigation();
  const [totalCount, setTotalCount] = useState(0);
  const [propCategoryName, setPropCategoryName] = useState('');
  const [count, setCount] = useState(1);
  const [isCategoryArray, setCategoryArray] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('records');
  const [activememberTab, setActivememberTab] = useState('member');
  const [hasMoreData, setHasMoreData] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [data, setData] = useState({
    othersArray: [],
    voterListArr: [],
    pmKisanArray: [],
    rationCardArray: [],
    birthAndDeathArray: [],
    indianLandArray: [],
    freedomFighterArray: [],
    migrationArray: [],
    judicialArray: [],
    otherCategoryCount: 0,
    otherIdsArray: [],
  });
  const {fname, lname} = route.params;
  const [progress, setProgress] = useState(0);
  const [isSearchData, setSearchData] = useState([]);
  const [isInviteResult, setInviteResult] = useState(null);
  //   const [publicDataResults, setPublicDataResults] = useState([]);
  const {
    voterListArr,
    othersArray,
    pmKisanArray,
    rationCardArray,
    birthAndDeathArray,
    indianLandArray,
    freedomFighterArray,
    migrationArray,
    judicialArray,
    otherCategoryCount,
    otherIdsArray,
  } = data;
  const navigation = useNavigation();
  const treeData = useSelector(state => state?.Tree?.AllFamilyTrees?.isOwner);
  const SurName = useSelector(
    state => state?.userInfo?.personalDetails?.lastname,
  );
  const senderRole = 'owner';
  const senderId = useSelector(state => state?.userInfo?._id);
  const name = useSelector(state => state?.userInfo?.personalDetails?.name);
  const surname = useSelector(
    state => state?.userInfo?.personalDetails?.lastname,
  );
  const senderFullname = `${name} ${surname}`;
  const groupId = useSelector(state => state?.userInfo?.linkedGroup?.[0]);
  const groupName = `${surname} family`;
  const invitedtype = 'non-tree';
  const flatListRef = useRef(null);
  const clickedItemIndex = useRef(null);
  const ITEM_HEIGHT = 65;
  const getItemLayout = (data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });
  useEffect(() => {
    async function fetchDataNow() {
      setProgress(0);
      setLoading(true);
      setProgress(0.2);
      try {
        if (fname && lname) {
          const data = await dispatch(
            getListPublicData({
              firstname: fname,
              lastname: lname,
            }),
          );
        }
        setProgress(0.8);
        const getSearchData = await dispatch(
          getDeepSearch({
            name: fname,
            lastname: lname,
          }),
        );
        setProgress(1);
        // setPublicDataResults(getSearchData.payload);
        setSearchData(getSearchData?.payload);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      } finally {
        setLoading(false);
        setProgress(0);
      }
    }
    fetchDataNow();
  }, []);

  const routeToPluralPage = async value => {
    setCount(0);
    const categoryName = value[0]?.category;
    let categoryArray = [];
    if (categoryName !== 'Others') {
      categoryArray.push(value[0]?._id[0]);
    } else {
      categoryArray = otherIdsArray;
    }
    setCategoryArray(categoryArray);
    setPropCategoryName(categoryName);
    try {
      const data = {
        firstname: fname?.toUpperCase(),
        lastname: lname?.toUpperCase(),
        catagory: categoryArray,
        pageNum: count,
        pageSize: 20,
      };
      navigator.navigate('ImeuswePublicSearch', {
        pluraData: [],
        propCategoryName: categoryName,
        fname: fname,
        lname: lname,
        isCategoryArray: categoryArray,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    if (Array.isArray(publicDataResults) && publicDataResults?.length > 0) {
      const sumOfCount = publicDataResults?.reduce(
        (sum, item) => sum + item?.count,
        0,
      );
      setTotalCount(sumOfCount);
      const categoryDictionary = publicDataResults.reduce((acc, item) => {
        acc[item.category] = acc[item?.category] || [];
        acc[item.category].push(item);
        return acc;
      }, {});

      const othersCategoryArray = categoryDictionary?.Others || [];
      const othersCategoryCount = othersCategoryArray.reduce(
        (sum, item) => sum + item.count,
        0,
      );
      const othersIdsArray = othersCategoryArray.map(item => item?._id[0]);
      setData({
        ...data,
        othersArray: categoryDictionary.Others || [],
        pmKisanArray: categoryDictionary.Farmer || [],
        voterListArr: categoryDictionary['Voter List'] || [],
        rationCardArray: categoryDictionary['Ration Card'] || [],
        birthAndDeathArray:
          categoryDictionary['Birth / Death / Marriage'] || [],
        indianLandArray: categoryDictionary['Land Registration'] || [],
        freedomFighterArray: categoryDictionary['Martyr/Freedom Fighter'] || [],
        migrationArray: categoryDictionary.Migration || [],
        judicialArray: categoryDictionary.Judicial || [],
        otherCategoryCount: othersCategoryCount,
        otherIdsArray: othersIdsArray,
      });
    }
  }, [publicDataResults]);

  const handleTabPress = tab => {
    setActiveTab(tab);
  };

  const createTree = () => {
    navigation.navigate('Trees', {iscreateTree: true});
  };
  const inviteClick = (result, index) => {
    setShowDialog(true);
    setShowInviteDialog(true);
    setInviteResult(result);
    clickedItemIndex.current = index;
  };
  const handleMemberTabPress = tab => {
    setActivememberTab(tab);
  };
  const receverRole =
    activememberTab === 'contributor' ? 'Contributor' : 'User';
  const ReceverName = isInviteResult?.personalDetails?.name;
  const ReceverLname = isInviteResult?.personalDetails?.lastname;
  const rerenderSearch = async () => {
    const getSearch = await dispatch(
      getDeepSearch({
        name: fname,
        lastname: lname,
      }),
    );
    setSearchData(getSearch?.payload);
    if (clickedItemIndex.current !== null && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          animated: false, // Set animated to false to avoid scrolling animation
          index: clickedItemIndex.current,
          viewOffset: 0, // Set viewOffset to 0 to ensure the item is fully visible
          viewPosition: 0.5, // Set viewPosition to 0.5 to center the item vertically
        });
      }, 0);
    }
  };

  const handleInviteClick = async () => {
    try {
      const recieverId = isInviteResult._id;
      await dispatch(
        sendSearchInvitation({
          groupId,
          groupName,
          invitedtype,
          receverRole,
          recieverId,
          senderFullname,
          senderId,
          senderRole,
        }),
      )
        .unwrap()
        .then(response => {
          Toast.show({
            type: 'success',
            text1: 'Invite sent successfully!',
          });
          rerenderSearch();
          setShowInviteDialog(false);
        });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const cancelInvitation = result => {
    try {
      const receiverId = result._id;
      dispatch(
        sendSearchCancelInvitation({
          receiverId,
        }),
      )
        .unwrap()
        .then(response => {
          Toast.show({
            type: 'success',
            text1: 'Invite has been cancelled',
          });
          rerenderSearch();
        });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const FirstRoute = () => (
    <ErrorBoundary.Screen>
      <View style={{flex: 1}}>
        {!isSearchData || isSearchData.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: '50%',
            }}>
            <Image
              source={{
                uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/userSearchEmpty.png',
              }}
              style={styles.emptyImages}
              resizeMode="contain"
            />
            <Text style={styles.errorText}>
              Oops! Sorry but we didn’t find anything relevant to your search.
            </Text>
          </View>
        ) : (
          <>
            <View
              style={{
                ...(Platform.OS === 'ios'
                  ? {paddingBottom: 100}
                  : {paddingBottom: 90}),
              }}>
              {/* Flatlist */}
              <FlatList
                ref={flatListRef}
                data={isSearchData}
                getItemLayout={getItemLayout}
                bounces={false}
                keyExtractor={(item, index) => `${item._id}${index}`}
                renderItem={({item, index}) => (
                  <View>
                    {index === 0 && (
                      <View>
                        <Text style={styles.infoText}>
                          Check out if one of your relatives is already on
                          iMeUsWe!
                        </Text>
                      </View>
                    )}
                    <View
                      style={{flexDirection: 'row', paddingHorizontal: 12}}
                      key={item._id}>
                      <View testID={item._id} style={styles.resultContainer}>
                        {item?.personalDetails?.profilepic?.length ? (
                          <Image
                            source={{uri: item?.personalDetails?.profilepic}}
                            style={styles.avatar}
                          />
                        ) : (
                          <DefaultImage
                            gender={item?.personalDetails?.gender}
                            firstName={item?.personalDetails?.name}
                            lastName={item?.personalDetails?.lastname}
                            height={50}
                            width={50}
                          />
                        )}
                        <View style={styles.textContainer}>
                          <Text style={styles.nameText}>
                            {item?.personalDetails?.name &&
                            item?.personalDetails?.lastname
                              ? `${item.personalDetails.name} ${item.personalDetails.lastname}`.slice(
                                  0,
                                  20,
                                )
                              : ''}
                            {`${item?.personalDetails?.name} ${item?.personalDetails?.lastname}`
                              .length > 20
                              ? '...'
                              : ''}
                          </Text>
                          {item?.inviteStatus === 'yes' && (
                            <Text style={styles.familyText}>
                              Already part of your family tree
                            </Text>
                          )}
                        </View>
                      </View>

                      {item?.inviteStatus === 'no' && (
                        <View
                          style={{
                            flex: 2,
                            marginTop: 15,
                            alignSelf: 'center',
                            alignItems: 'center',
                          }}>
                          <TouchableOpacity
                            testID="show-popup"
                            onPress={() => inviteClick(item, index)}>
                            <Invite style={{marginLeft: 3}} />
                            <Text style={{color: 'gray'}}>Send</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {item?.inviteStatus === 'requested' && (
                        <View
                          style={{
                            flex: 2,
                            alignSelf: 'center',
                            alignItems: 'center',
                          }}>
                          <TouchableOpacity
                            testID="show-Cancel"
                            onPress={() => cancelInvitation(item)}>
                            <Cancel style={{marginLeft: 8, marginTop: 15}} />
                            <Text style={{color: 'gray'}}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              />
            </View>
            {treeData === false && showDialog && (
              <CustomDialog
                visible={showDialog}
                InviteCta={true}
                onClose={() => setShowDialog(false)}
                title="You have not created a tree yet."
                confirmLabel="Create Tree"
                message="Please create a tree invite your family members."
                onConfirm={createTree}
                onCancel={() => setShowDialog(false)}
                titleStyle={{paddingHorizontal: 0, lineHeight: 20}}
                messageStyle={{marginVertical: -10}}
                confirmStyle={{textTransform: null, fontSize: 16}}
                cancelStyle={{textTransform: null, fontSize: 16}}
                dialogStyle={{marginHorizontal: 18}}
              />
            )}
            {treeData === true && showInviteDialog && (
              <CustomDialog
                visible={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
                title={`Are you sure you want to invite ${ReceverName} ${ReceverLname} to join the ${SurName} Family?`}
                confirmLabel="Invite"
                message="Select a role to assign to this person"
                onConfirm={handleInviteClick}
                onCancel={() => setShowInviteDialog(false)}
                titleStyle={{paddingHorizontal: 0, lineHeight: 20}}
                messageStyle={{marginVertical: -10}}
                confirmStyle={{textTransform: null, fontSize: 16}}
                cancelStyle={{textTransform: null, fontSize: 16}}
                dialogStyle={{marginHorizontal: 18}}
                customBody={
                  <View>
                    <View
                      style={{
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.5,
                        shadowRadius: 6,
                        elevation: 5,
                        borderRadius: 8,
                      }}>
                      <View style={styles.tab}>
                        <TouchableOpacity
                          testID="member-tab"
                          onPress={() => handleMemberTabPress('member')}
                          style={{
                            width: '50%',
                            paddingHorizontal: 10,
                            paddingVertical: 10,
                            borderWidth: 1,
                            borderColor:
                              activememberTab === 'member'
                                ? '#3473DC'
                                : 'transparent',
                            backgroundColor:
                              activememberTab === 'member'
                                ? 'white'
                                : 'transparent',
                            borderRadius: 10,
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 16,
                              color:
                                activememberTab === 'member'
                                  ? '#3473DC'
                                  : 'black',
                              fontWeight: 'bold',
                            }}>
                            Member
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          testID="contributor-tab"
                          onPress={() => handleMemberTabPress('contributor')}
                          style={{
                            width: '50%',
                            paddingHorizontal: 10,
                            paddingVertical: 10,
                            borderWidth: 1,
                            borderColor:
                              activememberTab === 'contributor'
                                ? '#3473DC'
                                : 'transparent',
                            backgroundColor:
                              activememberTab === 'contributor'
                                ? 'white'
                                : 'transparent',
                            borderRadius: 10,
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 16,
                              color:
                                activememberTab === 'contributor'
                                  ? '#3473DC'
                                  : 'black',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                            }}>
                            Contributor
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {activememberTab === 'member' ? (
                      <View style={styles.tabWrapper}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>View the tree</Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>
                            Share stories, audios, quotes & moments with your
                            family
                          </Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>
                            Write collaborative stories with family members
                          </Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.text1}>Edit family tree</Text>
                          <View style={{flex: 1, width: 25, height: 24}} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.text1}>
                            Add memories and lifestories to relatives
                          </Text>
                          <View style={{flex: 1, width: 25, height: 24}} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.text1}>
                            Link members to the tree
                          </Text>
                          <View style={{flex: 1, width: 25, height: 24}} />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.tabWrapper}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>View the tree</Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>
                            Share stories, audios, quotes & moments with your
                            family
                          </Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>
                            Write collaborative stories with family members
                          </Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>
                            Edit family tree
                          </Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>
                            Add memories and lifestories to relatives
                          </Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.textinvite}>
                            Link members to the tree
                          </Text>
                          <InfocheckIcon style={styles.imageTick} />
                        </View>
                      </View>
                    )}
                  </View>
                }
              />
            )}
          </>
        )}
      </View>
    </ErrorBoundary.Screen>
  );

  const SecondRoute = () => (
    <ErrorBoundary.Screen>
      <GlobalStyle>
        <SafeAreaView>
          <View>
            {isLoading ? (
              <View style={styles.centerWindowItem}>
                <Text style={styles.smallFtStyle}>Searching through</Text>
                <Text style={styles.bigFtStyle}>1.5 Billion Records</Text>
                <View style={styles.spinner}>
                  <ProgressBar
                    style={{
                      width: width - 50,
                      height: 30,
                      borderRadius: 200,
                    }}
                    progress={progress}
                    color={'#3473DC'}
                  />
                </View>
              </View>
            ) : (
              <View>
                {!publicDataResults || publicDataResults.length === 0 ? (
                  <View
                    style={{
                      alignItems: 'center',
                      alignSelf: 'center',
                      marginTop: '50%',
                    }}>
                    <Image
                      source={{
                        uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/recordSearchEmpty.png',
                      }}
                      style={styles.emptyImages}
                      resizeMode="contain"
                    />
                    <Text style={styles.errorText}>
                      Oops! Sorry but we didn’t find anything relevant to your
                      search.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.recordText}>
                      {totalCount === 1
                        ? `${totalCount} Record Found`
                        : `${totalCount} Records Found`}
                    </Text>

                    <View>
                      {/* VOTER LIST */}
                      {voterListArr.length > 0 && (
                        <TouchableOpacity
                          testID="voter-list"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(voterListArr)}>
                          <VoterIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {voterListArr[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {voterListArr[0].count === 1
                                ? `${voterListArr[0].count} Record`
                                : `${voterListArr[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* PM KISHAN */}
                      {pmKisanArray.length > 0 && (
                        <TouchableOpacity
                          testID="pm-kisan"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(pmKisanArray)}>
                          <FarmerIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {pmKisanArray[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {pmKisanArray[0].count === 1
                                ? `${pmKisanArray[0].count} Record`
                                : `${pmKisanArray[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* rationCardArray */}

                      {rationCardArray.length > 0 && (
                        <TouchableOpacity
                          testID="ration-cards"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(rationCardArray)}>
                          <RationIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {rationCardArray[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {rationCardArray[0].count === 1
                                ? `${rationCardArray[0].count} Record`
                                : `${rationCardArray[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      {/* birth And Death */}
                      {birthAndDeathArray.length > 0 && (
                        <TouchableOpacity
                          testID="birthAndDeath"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(birthAndDeathArray)}>
                          <RationIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {birthAndDeathArray[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {birthAndDeathArray[0].count === 1
                                ? `${birthAndDeathArray[0].count} Record`
                                : `${birthAndDeathArray[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* indian Land */}
                      {indianLandArray.length > 0 && (
                        <TouchableOpacity
                          testID="indianLand"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(indianLandArray)}>
                          <RationIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {indianLandArray[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {indianLandArray[0].count === 1
                                ? `${indianLandArray[0].count} Record`
                                : `${indianLandArray[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      {/* Migration */}
                      {migrationArray.length > 0 && (
                        <TouchableOpacity
                          testID="migration"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(migrationArray)}>
                          <RationIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {migrationArray[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {migrationArray[0].count === 1
                                ? `${migrationArray[0].count} Record`
                                : `${migrationArray[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      {/* freedom Fighter */}
                      {freedomFighterArray.length > 0 && (
                        <TouchableOpacity
                          testID="freedomFighter"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() =>
                            routeToPluralPage(freedomFighterArray)
                          }>
                          <RationIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {freedomFighterArray[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {freedomFighterArray[0].count === 1
                                ? `${freedomFighterArray[0].count} Record`
                                : `${freedomFighterArray[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* judicial */}
                      {judicialArray.length > 0 && (
                        <TouchableOpacity
                          testID="judicial"
                          accessibilityLabel="header voter and ration card"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(judicialArray)}>
                          <RationIcon />
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {judicialArray[0].category}
                            </Text>
                            <Text style={styles.countList}>
                              {judicialArray[0].count === 1
                                ? `${judicialArray[0].count} Record`
                                : `${judicialArray[0].count} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* OTHERS */}
                      {othersArray.length > 0 && (
                        <TouchableOpacity
                          testID="others"
                          accessibilityLabel="voter card"
                          activeOpacity={1}
                          style={styles.itemContainer}
                          onPress={() => routeToPluralPage(othersArray)}>
                          <Image
                            source={otherImage}
                            style={styles.logoImage}
                            resizeMode="cover"
                          />
                          {/* <OtherIcon/> */}
                          <View style={styles.textContainer}>
                            <Text style={styles.titleList}>
                              {othersArray[0].category}
                            </Text>
                            <Text
                              style={styles.countList}
                              accessibilityLabel="Dynamic Records">
                              {otherCategoryCount === 1
                                ? `${otherCategoryCount} Record`
                                : `${otherCategoryCount} Records`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        </SafeAreaView>
      </GlobalStyle>
    </ErrorBoundary.Screen>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const routes = [
    {key: 'first', title: 'iMeUsWe Users'},
    {key: 'second', title: 'iMeUsWe Records'},
  ];

  const [index, setIndex] = React.useState(1);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: 'white',
        borderRadius: 12,
        height: 40,
        marginTop: -20,
        borderWidth: 1.5,
        borderColor: theme.colors.outline,
      }}
      style={{
        backgroundColor: theme.colors.unSelectedTabBackgr,
        borderRadius: 8,
        marginHorizontal: 12,
        height: 40,
        shadowColor: '#000',
        marginVertical: 10,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
      }}
      renderLabel={({route, focused, color}) => (
        <View style={{marginTop: -5}}>
          <Text
            style={{
              color: focused
                ? Theme.light.primary
                : theme.colors.infoContentColor,
              fontWeight: 700,
              fontSize: 15,
            }}>
            {route.title}
          </Text>
        </View>
      )}
    />
  );
  return (
    <ErrorBoundary.Screen>
      <View
        style={{
          paddingTop: ios ? top : top + 10,
        }}>
        {/* header items parent */}
        <View
          style={{
            height: 70,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
          {/* backbuton */}
          <TouchableOpacity
            style={{position: 'absolute', left: 10}}
            testID="search-close"
            activeOpacity={1}
            accessibilityLabel="Back-Arrow"
            onPress={() => navigator.goBack()}>
            <BackArrowIcon />
          </TouchableOpacity>
          {/* backbuton */}

          {/* imuw image */}
          <View>
            <Image
              source={require('../../../assets/images/OnlyLogo.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          {/* imuw image */}
        </View>
        {/* header items parent */}
      </View>
      <GlobalStyle>
        <SafeAreaView>
          <View style={styles.container}>
            <View style={styles.modalContainer}>
              <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
                style={{width: width}}
              />
            </View>
          </View>
        </SafeAreaView>
      </GlobalStyle>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    paddingVertical: 20,
  },
  image: {
    width: 100,
    height: 41,
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  emptyImages: {
    width: 200,
    height: 200,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  modalContainer: {
    paddingBottom: 30,
    paddingLeft: 15,
    paddingRight: 15,
  },

  text: {
    fontSize: 28,
    fontWeight: '600',
    color: Theme.light.shadow,
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: Theme.dark.shadow,
    backgroundColor: Theme.light.outlineVariant,
    width: '100%',
    height: '30px',
    borderRadius: 10,
    marginTop: 20,
  },

  errorText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    textAlign: 'center',
    // marginTop: 10,
    color: Theme.light.shadow,
  },
  recordText: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: Theme.light.shadow,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 20,
    color: Theme.light.shadow,
    fontWeight: '600',
  },
  emailText: {
    color: Theme.light.shadow,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 15,
    flexDirection: 'row',
    flex: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 25,
  },
  nameText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    paddingTop: 10,
  },
  familyText: {
    color: Theme.light.onSurfaceVariant,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 24,
  },
  centerWindowItem: {
    marginTop: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallFtStyle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: Theme.light.shadow,
  },
  bigFtStyle: {
    marginTop: 10,
    fontSize: 30,
    lineHeight: 30,
    fontWeight: '700',
    color: Theme.light.shadow,
  },
  spinner: {
    marginTop: 10,
  },
  box: {
    padding: 20,
  },
  textContainer: {
    marginLeft: 20,
  },
  titleList: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.light.shadow,
  },
  countList: {
    fontSize: 14,
    color: NewTheme.colors.secondaryDarkBlue,
  },
  tabWrapper: {
    marginTop: 10,
    paddingHorizontal: 10,
    gap: 6,
    color: 'black',
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: Theme.dark.shadow,
    backgroundColor: Theme.light.outlineVariant,
    width: '100%',
    borderRadius: 10,
  },
  imageTick: {
    flex: 1,
  },
  textinvite: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  text1: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    color: '#888888',
  },
});

export default ImuwSearchResults;
