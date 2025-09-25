/* eslint-disable no-use-before-define */
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import CustomTextInput from '../../components/CustomTextInput';
import {Button, useTheme, Text} from 'react-native-paper';
import SearchIcon from '../../components/ImeusweSearch/SearchIcon';
import {useDispatch, useSelector} from 'react-redux';
import {getDeepSearch} from '../../store/apps/deepSearch';
import DefaultImage from '../../common/DefaultImage';
import Theme from '../../common/Theme';
import NewTheme from '../../common/NewTheme';
import EmptyStats from '../../components/ImeusweSearch/EmptyStats';
import {debounce} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import {sendSearchCancelInvitation} from '../../store/apps/searchCancelInvite';
import {sendSearchInvitation} from '../../store/apps/serachInvite';
import Toast from 'react-native-toast-message';
import {Invite, Cancel, InfocheckIcon} from '../../images';
import {CustomDialog} from '../../core';
import {InviteProfile} from '../../images';
import GlobalHeader from '../ProfileTab/GlobalHeader';
import {TabView, TabBar} from 'react-native-tab-view';
import ErrorBoundary from '../../common/ErrorBoundary';
import LottieView from 'lottie-react-native';
import {Track} from '../../../App';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FirstRoute = () => (
  <ErrorBoundary.Screen>
    <View style={{paddingHorizontal: 12}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={styles.textOne}>View the tree</Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textOne}>
          Share stories, audios, quotes & moments with your family
        </Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textOne}>
          Write collaborative stories with family members
        </Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 10,
          justifyContent: 'space-between',
        }}>
        <Text style={styles.textgray}>Edit family tree</Text>
        <View style={{flex: 1, width: 25, height: 24}} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textgray}>
          Add memories and lifestories to relatives
        </Text>
        <View style={{flex: 1, width: 25, height: 24}} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textgray}>Link members to the tree</Text>
        <View style={{flex: 1, width: 25, height: 24}} />
      </View>
    </View>
  </ErrorBoundary.Screen>
);

const SecondRoute = () => (
  <ErrorBoundary.Screen>
    <View style={{paddingHorizontal: 12}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={styles.textOne}>View the tree</Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textOne}>
          Share stories, audios, quotes & moments with your family
        </Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textOne}>
          Write collaborative stories with family members
        </Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textOne}>Edit family tree</Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textOne}>
          Add memories and lifestories to relatives
        </Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textOne}>Link members to the tree</Text>
        <InfocheckIcon style={styles.imageOne} />
      </View>
      {/* Add more Contributor content here */}
    </View>
  </ErrorBoundary.Screen>
);

const CustomSearchBar = ({
  label,
  clearable,
  style,
  customLabelStyle,
  inputHeight = 45,
  marginHorizontal = 20,
  ...props
}) => {
  const theme = useTheme();
  const ios = Platform.OS == 'ios';
  const navigation = useNavigation();
  const senderRole = 'owner';
  const senderId = useSelector(state => state?.userInfo?._id);
  const userData = useSelector(state => state?.userInfo);
  const [activeTab, setActiveTab] = useState('member');
  const name = useSelector(state => state?.userInfo?.personalDetails?.name);
  const surname = useSelector(
    state => state?.userInfo?.personalDetails?.lastname,
  );
  const ITEM_HEIGHT = 65;
  const getItemLayout = (data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });
  const senderFullname = `${name} ${surname}`;
  const SurName = useSelector(
    state => state?.userInfo?.personalDetails?.lastname,
  );
  const FamilyName = useSelector(
    state => state?.Tree?.AllFamilyTrees?.treeList?.[0]?.tree?.name,
  );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.ImuwSearchResults,
  );
  const groupId = useSelector(state => state?.userInfo?.linkedGroup?.[0]);
  const groupName = `${surname} family`;
  const invitedtype = 'non-tree';
  const flatListRef = useRef(null);
  const clickedItemIndex = useRef(null);
  const [isInviteResult, setInviteResult] = useState(null);
  const debouncedSearchRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const dispatch = useDispatch();
  const [deepSearchResults, setDeepSearchResults] = useState([]);
  const [activememberTab, setActivememberTab] = useState('member');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const treeData = useSelector(state => state?.Tree?.AllFamilyTrees?.isOwner);
  const [showDialog, setShowDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const {bottom} = useSafeAreaInsets();
  const debouncedSearch = useCallback(
    debounce(async query => {
      if (query.trim() === '') {
        setDeepSearchResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await dispatch(getDeepSearch({name: query})).unwrap();
        if (Array.isArray(response)) {
          setDeepSearchResults(response);
        } else {
          setDeepSearchResults([]);
        }
      } catch (error) {
        setDeepSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [dispatch],
  );

  const handleTextChange = text => {
    setFirstName(text);
    if (text.trim() === '') {
      debouncedSearch.cancel();
      setDeepSearchResults([]);
      playAnimation();
    } else {
      debouncedSearch(text);
    }
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
  const receverRole =
    activememberTab === 'contributor' ? 'Contributor' : 'User';
  const ReceverName = isInviteResult?.personalDetails?.name;
  const ReceverLname = isInviteResult?.personalDetails?.lastname;
  const rerenderSearch = async () => {
    const getSearch = await dispatch(
      getDeepSearch({
        name: firstName,
      }),
    );
    setDeepSearchResults(getSearch?.payload);
    if (clickedItemIndex.current !== null && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          animated: false,
          index: clickedItemIndex.current,
          viewOffset: 0,
          viewPosition: 0.5,
        });
      }, 0);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };
  const handleMemberTabPress = tab => {
    setActivememberTab(tab);
  };
  const handleInviteClick = async () => {
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
          text1: toastMessages?.['9001'],
        });
        rerenderSearch();
        setShowInviteDialog(false);
      });

    /* customer io and mixpanel event changes  start */
    const props = {
      search_user_name: firstName,
    };
    Track({
      cleverTapEvent: 'Invited_through_imusweUsers',
      mixpanelEvent: 'Invited_through_imusweUsers',
      userData,
      cleverTapProps: props,
      mixpanelProps: props,
    });
    /* clevertap and mixpanel events ---end****/
  };

  const cancelInvitation = result => {
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
          text1: toastMessages?.['9002'],
        });
        rerenderSearch();
      });
  };

  const animationRef = useRef();
  const playAnimation = () => {
    if (animationRef.current) {
      animationRef.current.reset();
      animationRef.current.play(0, 237);
    }
  };
  useEffect(() => {
    playAnimation();
  }, []);

  useEffect(() => {
    if (!deepSearchResults || deepSearchResults.length === 0) {
      playAnimation();
    }
  }, [deepSearchResults]);

  useEffect(() => {
    debouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch]);

  useEffect(() => {
    if (firstName.trim()) {
      debouncedSearch(firstName);
    } else {
      debouncedSearch.cancel();
      setDeepSearchResults([]);
    }
  }, [firstName, debouncedSearch]);

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'member', title: 'Member'},
    {key: 'contributor', title: 'Contributor'},
  ]);
  const renderScene = ({route}) => {
    switch (route?.key) {
      case 'member':
        return <FirstRoute />;
      case 'contributor':
        return <SecondRoute />;
      default:
        return null;
    }
  };

  const handleTabPress = tab => {
    const newIndex = routes.findIndex(route => route.key === tab);
    if (newIndex !== -1) {
      setIndex(newIndex);
      setActiveTab(routes[newIndex].key);
      setActivememberTab(tab);
    }
  };
  const onIndexChange = newIndex => {
    setIndex(newIndex);
    setActiveTab(routes[newIndex].key);
    setActivememberTab(routes[newIndex].key);
  };

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: 'white',
        borderRadius: 8,
        height: 40,
        marginTop: -20,
        borderWidth: 1.5,
      }}
      style={{
        backgroundColor: NewTheme.colors.grayBackColor,
        borderRadius: 8,
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
      onTabPress={({route}) => handleTabPress(route.key)}
      renderLabel={({route, focused, color}) => (
        <View style={{marginTop: -5}}>
          <Text
            style={{
              color: focused
                ? NewTheme.colors.secondaryDarkBlueRGB
                : NewTheme.colors.blackText,
              fontWeight: 700,
              fontSize: 16,
            }}>
            {route.title}
          </Text>
        </View>
      )}
    />
  );

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        onBack={goBack}
        marginTop={35}
        heading={'Search iMeUsWe Users'}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />
      <View style={[{marginHorizontal, marginTop: '5%'}, style]}>
        {/* Search Icon */}
        {!isFocused && !firstName && (
          <View style={styles.iconWrapper}>
            <SearchIcon width={24} height={24} />
          </View>
        )}

        {/* CustomTextInput for Search */}
        <CustomTextInput
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          label={'Search'}
          value={firstName}
          onChangeText={handleTextChange}
          clearable={clearable}
          style={{backgroundColor: 'white'}}
          inputHeight={inputHeight}
          customLabelStyle={{
            marginLeft: isFocused || firstName ? 0 : 32,
            ...customLabelStyle,
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      <View
        style={{
          flex: 1,
          paddingBottom: Platform.OS === 'ios' ? 50 : bottom || 20,
        }}>
        {!deepSearchResults || deepSearchResults.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: 30,
            }}>
            <LottieView
              ref={animationRef}
              source={require('../../animation/lottie/search.json')}
              loop={false}
              style={{width: 350, height: 350}}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                paddingRight: 30,
                paddingLeft: 30,
                fontWeight: 700,
                textAlign: 'center',
                marginTop: -20,
              }}>
              Oops! No results found. Try a different search!
            </Text>
          </View>
        ) : (
          <>
            <View
              style={{
                ...(Platform.OS === 'ios'
                  ? {paddingBottom: 0}
                  : {paddingBottom: 0}),
              }}>
              {/* Flatlist */}
              <KeyboardAvoidingView behavior="padding">
                <FlatList
                  ref={flatListRef}
                  data={deepSearchResults}
                  getItemLayout={getItemLayout}
                  bounces={false}
                  keyExtractor={(item, index) => `${item._id}${index}`}
                  renderItem={({item, index}) => (
                    <View
                      style={{
                        marginBottom: 8,
                        marginHorizontal,
                        borderRadius: 10,
                        borderColor: 'white',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingHorizontal: 12,
                          backgroundColor: 'white',
                          borderRadius: 10,
                          paddingVertical: 4,
                        }}
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
                              height={40}
                              width={40}
                            />
                          )}
                          <View style={styles.textContainer}>
                            <Text style={styles.nameText}>
                              {item?.personalDetails?.name &&
                              item?.personalDetails?.lastname
                                ? `${item.personalDetails.name} ${item.personalDetails.lastname}`.slice(
                                    0,
                                    17,
                                  )
                                : ''}
                              {`${item?.personalDetails?.name} ${item?.personalDetails?.lastname}`
                                .length > 17
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
                              flex: 4,
                              marginTop: '2%',
                              alignSelf: 'center',
                              alignItems: 'center',
                              marginRight: -10,
                            }}>
                            <View>
                              <TouchableOpacity
                                onPress={() => inviteClick(item, index)}>
                                <View
                                  style={{
                                    borderRadius: 8,
                                    backgroundColor:
                                      NewTheme.colors.primaryOrange,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '9%',
                                  }}
                                  accessibilityLabel="search-connect">
                                  <View style={{paddingRight: 5}}>
                                    <InviteProfile fill="#fff" />
                                  </View>

                                  <Text
                                    style={{
                                      color: NewTheme.colors.whiteText,
                                      fontWeight: 600,
                                      fontSize: 16,
                                      // margin: '7%',
                                    }}>
                                    Send
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                        {item?.inviteStatus === 'requested' && (
                          <View
                            style={{
                              alignSelf: 'center',
                              alignItems: 'center',
                            }}>
                            <TouchableOpacity
                              testID="show-Cancel"
                              onPress={() => cancelInvitation(item)}>
                              <Cancel style={{marginLeft: 10, marginTop: 1}} />
                              <Text style={{color: 'gray', marginRight: 10}}>
                                Cancel
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                />
              </KeyboardAvoidingView>
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
                title={`Are you sure you want to invite ${ReceverName} ${ReceverLname} to join the ${FamilyName}?`}
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
                  <View style={{height: 320}}>
                    <TabView
                      navigationState={{index, routes}}
                      renderScene={renderScene}
                      onIndexChange={onIndexChange}
                      renderTabBar={renderTabBar}
                    />
                  </View>
                }
              />
            )}
          </>
        )}
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: 10,
    left: 10,
    zIndex: 1,
  },
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
    fontSize: 16,
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
    // marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  // textContainer: {
  //   marginLeft: 25,
  // },
  nameText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    // paddingTop: 10,
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
  textOne: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: 'black',
  },
  imageOne: {
    width: 30,
    height: 30,
    flex: 1,
  },
  textgray: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#888888',
  },
});

export default CustomSearchBar;
