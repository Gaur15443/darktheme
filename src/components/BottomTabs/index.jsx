/* eslint-disable react/no-unstable-nested-components */
import {
  View,
  Text,
  Pressable,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Svg, {Path} from 'react-native-svg';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {Tree, Profile, CommunitiesScreen} from '../../screens';
import {
  useNavigationState,
  useNavigation,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';
import {Theme} from '../../common';
import {IIconCarousel, styles} from '../../components';
import {IIcon, ImuwLogo} from '../../images';
import {useWindowDimensions} from 'react-native';

import Home from './../../screens/AppScreens/Home/index';
import {useSelector, useDispatch} from 'react-redux';
// const {width, height} = Dimensions.get('window');
import LottieView from 'lottie-react-native';
import CustomHamburger from '../Communities/CommunityComponents/DrawerCustomHeader/CustomHamburger';
import {PaperProvider} from 'react-native-paper';
import AstroBottomTabs from './astrologyTabs';
import AstrologyIcon from '../../images/Icons/AstrologyBottomTabIcons/AstrologyIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Track} from '../../../App';
import {setAstroLinking} from '../../store/apps/astroLinking';
import {
  setAstroFeatureEnabled,
  setPersonalisedHoroscopeEnabled,
  setConsultationEnabled,
} from '../../store/apps/astroFeatureSlice';

const Tab = createBottomTabNavigator();

const isAstroData = [
  'Reports',
  'Horoscope',
  'AstroHome',
  // 'MatchMaking',
  'Panchang',
  'Consultation',
  // 'AstroOrderHistory',
  // 'WalletHistory',
];

const astroStackScreens = ['MatchMaking', 'AstroOrderHistory', 'WalletHistory'];

const colors = {
  active: '#3473DC',
  inactive: '#989898',
};

const iconDecrement = 6;

function BottomTabs() {
  const dispatch = useDispatch();
  const {width, height} = useWindowDimensions();

  const {bottom} = useSafeAreaInsets();
  const [isIIconCarouselVisible, setIIconCarouselVisible] = useState(false);
  const deepLinkingPath = useSelector(state => state.astroLinking.path);
  const deepLinkingParams = useSelector(state => state.astroLinking.params);
  const showRedDot = useSelector(state => state?.redDot?.showRedDot);
  const userInfo = useSelector(state => state.userInfo);
  const showRedDotLikeComment = useSelector(
    state => state?.redDot?.showRedDotLikeComment,
  );
  const isAstroFeatureEnabled = useSelector(
    state => state.astroFeature.isAstroFeatureEnabled,
  );

  const receiverIsPresent = useSelector(state =>
    state?.redDot?.showRedDotLikeComment?.notificationReceivers?.includes?.(
      userInfo._id,
    ),
  );
  const astroReleaseController = useSelector(
    state => state?.userManagementToasts.userManagementToastsConfig,
  );

  useEffect(() => {
    const controllerObject = astroReleaseController?.FEATURE_ASTROLOGY;
    const shouldEnable =
      controllerObject?.ALL_USERS ||
      (controllerObject?.INTERNAL_USERS &&
        controllerObject?.INTERNAL_USERS_EMAIL?.includes?.(userInfo?.email)) ||
      (controllerObject?.INTERNAL_USERS &&
        controllerObject?.INTERNAL_USERS_MOBILE_NO?.includes?.(
          userInfo?.mobileNo,
        ));

    const shouldEnablePersonalisedHoroscope =
      controllerObject?.ALL_USERS_PERSONLISED_HOROSCOPE ||
      (controllerObject?.INTERNAL_PERSONLISED_HOROSCOPE &&
        controllerObject?.INTERNAL_USERS_EMAIL?.includes?.(userInfo?.email)) ||
      (controllerObject?.INTERNAL_PERSONLISED_HOROSCOPE &&
        controllerObject?.INTERNAL_USERS_MOBILE_NO?.includes?.(
          userInfo?.mobileNo,
        ));
    const shouldEnableConsultation =
      controllerObject?.ALL_USERS_CONSULTATION ||
      (controllerObject?.INTERNAL_CONSULTATION &&
        controllerObject?.INTERNAL_USERS_EMAIL?.includes?.(userInfo?.email)) ||
      (controllerObject?.INTERNAL_CONSULTATION &&
        controllerObject?.INTERNAL_USERS_MOBILE_NO?.includes?.(
          userInfo?.mobileNo,
        ));

    dispatch(setAstroFeatureEnabled(shouldEnable));
    dispatch(
      setPersonalisedHoroscopeEnabled(shouldEnablePersonalisedHoroscope),
    );
    dispatch(setConsultationEnabled(shouldEnableConsultation));
  }, [astroReleaseController, userInfo, dispatch]);

  const navigation = useNavigation();
  const gotoWhatsOn = () => {
    navigation.navigate('WhatsOnBell');
  };

  const openTreeIICon = () => {
    setIIconCarouselVisible(true);
  };

  //...Animation
  const homeAnimationRef = useRef(null);
  const treeAnimationRef = useRef(null);
  const storiesAnimationRef = useRef(null);
  const communitiesAnimationRef = useRef(null);
  const profileAnimationRef = useRef(null);
  const bellAnimationRef = useRef(null);

  const navigationState = useNavigationState(state => state);
  const [focusedTab, setFocusedTab] = useState(0);
  const [animationPlayCount, setAnimationPlayCount] = useState(0);
  const [focusedOtherTab, setFocusedOtherTab] = useState(0);

  useEffect(() => {
    try {
      console.log('deepLinkingPath', deepLinkingPath);
      if (deepLinkingPath) {
        if (deepLinkingParams && deepLinkingPath === 'AstroViewReports') {
          navigation.navigate(deepLinkingPath, {...deepLinkingParams});
          dispatch(setAstroLinking(null));
          return;
        } else {
          if (isAstroData?.includes?.(deepLinkingPath)) {
            navigation.navigate('AstroBottomTabs', {screen: deepLinkingPath});
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 2,
                routes: [
                  {
                    name: 'BottomTabs',
                    params: {screen: 'Home'},
                  },
                  {
                    name: 'AstroBottomTabs',
                    params: {screen: 'AstroHome'},
                  },
                  {
                    name: deepLinkingPath,
                  },
                ],
              }),
            );
          }
        }
        dispatch(setAstroLinking(null));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    }
  }, [deepLinkingPath, deepLinkingParams]);

  useEffect(() => {
    const focusedRoute = navigationState.routes[navigationState.index];
    setFocusedTab(focusedRoute?.state?.index);
  }, [navigationState, focusedTab]);

  const onAnimationFinish = useCallback(() => {
    setFocusedTab(0); // Reset the focused tab when the animation finishes
  }, []);
  const onAnimationOtherFinish = useCallback(() => {
    setFocusedOtherTab(1); // Reset the focused tab when the animation finishes
  }, []);

  useEffect(() => {
    // Play the animation for the initial screen tab
    switch (focusedTab) {
      case 0:
        homeAnimationRef.current?.play?.();
        break;
      case 1:
        treeAnimationRef.current?.play?.();
        break;
      case 2:
        communitiesAnimationRef.current?.play();
        // whatsonAnimationRef.current?.play?.(10, 40);
        break;
      case 3:
        profileAnimationRef.current?.play?.();
        break;
      default:
        break;
    }

    if (focusedTab) {
      setDrawerVisible(false);
    }

    let timer;
    // Play Animation After First Visit
    if (shouldShowRedDot()) {
      timer = setTimeout(() => {
        bellAnimationRef.current?.play();
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
      setAnimationPlayCount(0);
    };
  }, [focusedTab]);

  const shouldShowRedDot = () => {
    return showRedDot || (showRedDotLikeComment.redDot && receiverIsPresent);
  };

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        if (shouldShowRedDot()) {
          // Play the animation from frame 42 to 220 when there's a notification
          bellAnimationRef.current?.play();
        }
      }, 1000);
    }, [showRedDot, showRedDotLikeComment?.redDot, receiverIsPresent]),
  );

  const handleAnimationFinish = useCallback(() => {
    // Increment the play count
    setAnimationPlayCount(prevCount => {
      if (prevCount < 2) {
        bellAnimationRef.current?.play();
      }
      return prevCount + 1;
    });
  }, []);

  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };
  return (
    <>
      <Tab.Navigator
        initialRouteName={'Home'}
        screenListeners={({route}) => {
          if (route.name === 'Home') {
            setFocusedTab(route.name === undefined ? 0 : 0);
          }
          if (route.name === 'CommunitiesScreenTab') {
            setFocusedTab(route.name === undefined ? 0 : 2);
          }
        }}
        sceneContainerStyle={{backgroundColor: Theme.light.background}}
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            // backgroundColor: '#333',
            borderTopWidth: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            height: Platform.OS === 'ios' ? 80 : 60 + bottom,
            // paddingBottom: 5,
            paddingTop: 15,
          },
          headerTitleAlign: 'center',
          tabBarActiveTintColor: colors.active,
          tabBarInactiveTintColor: colors.inactive,
          tabBarPressColor: 'transparent',
        }}>
        <Tab.Screen
          name="Home"
          // component={CommunitiesScreen}
          options={{
            headerTitle: '',
            headerShown: true,
            headerLeft: () => (
              <View style={{marginLeft: 12, paddingBottom: 10, marginTop: 10}}>
                <Image
                  source={{
                    uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/White.png',
                  }}
                  style={{width: 133, height: 30}}
                />
              </View>
            ),
            headerRight: () => (
              <View style={styles.homeHeaderRightContainer}>
                <Pressable onPress={gotoWhatsOn} accessibilityLabel="What's on">
                  <View style={styles.bellIconContainer}>
                    <LottieView
                      ref={bellAnimationRef}
                      source={require('../../animation/lottie/BottomBar/Bell4.json')}
                      loop={false} // No looping
                      onAnimationFinish={handleAnimationFinish}
                      style={{height: 35, width: 30}}
                    />
                    {shouldShowRedDot() && (
                      <View style={styles.redDotBellIcon} />
                    )}
                  </View>
                </Pressable>
                <View
                  style={{
                    height: 40,
                    width: 20,
                    paddingTop: 12,
                    alignItems: 'center',
                    marginRight: 20,
                  }}>
                  <CustomHamburger
                    onPress={toggleDrawer}
                    drawerVisible={drawerVisible}
                    backgroundColor="white"
                  />
                </View>
              </View>
            ),
            tabBarIcon: ({color}) => (
              <View style={[styles.linkContainer, {position: 'relative'}]}>
                {focusedTab == 0 ? (
                  <>
                    <View>
                      <LottieView
                        key={focusedTab}
                        ref={homeAnimationRef}
                        source={require('../../animation/lottie/BottomBar/home_thick.json')}
                        autoPlay
                        loop={focusedTab === 'Home'}
                        speed={1.5}
                        onAnimationFinish={onAnimationFinish}
                        style={{height: 34, width: 34}}
                      />
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: '#E77237',
                          fontWeight: '900',
                          fontSize: Math.min(width, height) * 0.03,
                          textAlign: 'center',
                        }}>
                        Home
                      </Text>
                      {shouldShowRedDot() && (
                        <View style={styles.redDotNonActive} />
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <View>
                      <LottieView
                        ref={homeAnimationRef}
                        source={require('../../animation/lottie/BottomBar/home_thick.json')}
                        // autoPlay
                        loop={false}
                        speed={-1.5}
                        style={{height: 30, width: 30}}
                      />
                      <Text
                        style={{
                          color: '#AAAAAA',
                          fontWeight: 'bold',
                          fontSize: Math.min(width, height) * 0.03,
                          textAlign: 'center',
                        }}>
                        Home
                      </Text>
                      {shouldShowRedDot() && (
                        <View style={styles.redDotSmall} />
                      )}
                    </View>
                  </>
                )}
              </View>
            ),
            headerStyle: {
              backgroundColor: '#2892FF',
            },
            headerShadowVisible: false,
          }}>
          {() => (
            <Home toggleDrawer={toggleDrawer} drawerVisible={drawerVisible} />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Trees"
          component={Tree}
          options={{
            headerTitle: '',
            headerShown: false,
            headerShadowVisible: false,
            headerLeft: () => (
              <View style={{marginLeft: 12, marginTop: 12}}>
                <ImuwLogo />
              </View>
            ),
            headerRight: () => (
              <View style={{paddingRight: 15}}>
                <Pressable onPress={openTreeIICon} testID="open-tree-iicon">
                  <IIcon size={30} />
                </Pressable>
              </View>
            ),
            tabBarIcon: ({color}) => (
              <View style={[styles.linkContainer]}>
                {focusedTab == 1 ? (
                  <>
                    <LottieView
                      key={focusedTab}
                      ref={treeAnimationRef}
                      source={require('../../animation/lottie/BottomBar/tree_thick.json')}
                      autoPlay
                      loop={focusedTab === 'tree'}
                      speed={2}
                      onAnimationFinish={onAnimationOtherFinish}
                      style={{height: 34, width: 34}}
                    />
                    <Text
                      style={{
                        fontWeight: '900',
                        color: '#E77237',
                        fontSize: Math.min(width, height) * 0.03,
                        textAlign: 'center',
                      }}>
                      Trees
                    </Text>
                  </>
                ) : (
                  <>
                    <LottieView
                      ref={treeAnimationRef}
                      source={require('../../animation/lottie/BottomBar/tree_thick.json')}
                      // autoPlay
                      loop={false}
                      speed={-2}
                      style={{height: 30, width: 30}}
                    />
                    <Text
                      style={{
                        color: '#AAAAAA',
                        fontWeight: 'bold',
                        fontSize: Math.min(width, height) * 0.03,
                        textAlign: 'center',
                      }}>
                      Trees
                    </Text>
                  </>
                )}
              </View>
            ),
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />

        <Tab.Screen
          name="CommunitiesScreenTab"
          component={CommunitiesScreen}
          options={{
            headerShown: false,

            tabBarIcon: ({color}) => (
              <View style={styles.linkContainer}>
                {focusedTab == 2 ? (
                  <>
                    <View style={styles.animationContainer}>
                      <LottieView
                        key={focusedTab}
                        ref={communitiesAnimationRef}
                        source={require('../../animation/lottie/BottomBar/communities.json')}
                        autoPlay
                        loop={focusedTab === 'Stories'}
                        speed={1.5}
                        onAnimationFinish={onAnimationOtherFinish}
                        style={{height: 30, width: 30}}
                      />
                    </View>
                    <Text
                      style={{
                        fontWeight: '900',
                        color: '#E77237',
                        fontSize: Math.min(width, height) * 0.03,
                        textAlign: 'center',
                      }}>
                      Communities
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.animationContainer}>
                      <View
                        style={{
                          paddingTop: 4,
                          alignSelf: 'center',
                        }}>
                        <LottieView
                          ref={communitiesAnimationRef}
                          source={require('../../animation/lottie/BottomBar/communities.json')}
                          loop={false}
                          speed={-1.5}
                          style={{height: 26, width: 26}}
                        />
                      </View>
                    </View>
                    <Text
                      style={{
                        color: '#AAAAAA',
                        fontWeight: 'bold',
                        fontSize: Math.min(width, height) * 0.03,
                        textAlign: 'center',
                      }}>
                      Communities
                    </Text>
                  </>
                )}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            // headerTitle: 'Create Chapter',
            // headerShown: true,
            // headerLeft: () => (
            //   <Pressable onPress={handleBackPress}>
            //     <BackIcon style={{ marginLeft: 10 }} />
            //   </Pressable>
            // ),
            tabBarIcon: ({color}) => (
              <View style={styles.linkContainer}>
                {focusedTab == 3 ? (
                  <>
                    <LottieView
                      key={focusedTab}
                      ref={profileAnimationRef}
                      source={require('../../animation/lottie/BottomBar/profile_thick.json')}
                      autoPlay
                      loop={focusedTab === 'Stories'}
                      speed={1.5}
                      onAnimationFinish={onAnimationOtherFinish}
                      style={{height: 32, width: 32}}
                    />
                    <Text
                      style={{
                        fontWeight: '900',
                        color: '#E77237',
                        fontSize: Math.min(width, height) * 0.03,
                        textAlign: 'center',
                      }}>
                      Profile
                    </Text>
                  </>
                ) : (
                  <>
                    <LottieView
                      ref={profileAnimationRef}
                      source={require('../../animation/lottie/BottomBar/profile_thick.json')}
                      {...(focusedTab != 3 ? {autoPlay: true} : null)}
                      loop={false}
                      speed={-1.5}
                      style={{height: 28, width: 28}}
                    />
                    <Text
                      style={{
                        color: '#AAAAAA',
                        fontWeight: 'bold',
                        fontSize: Math.min(width, height) * 0.03,
                        textAlign: 'center',
                      }}>
                      Profile
                    </Text>
                  </>
                )}
              </View>
            ),
          }}
        />

        {isAstroFeatureEnabled && (
          <Tab.Screen
            name="AstroBottomTabs"
            component={AstroBottomTabs}
            options={{
              headerShown: false,
              tabBarIcon: ({color, focused}) => (
                <View
                  style={[
                    styles.linkContainer,
                    {
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}>
                  <View
                    style={{
                      backgroundColor: '#6944D3',
                      paddingBlock: 4,
                      paddingHorizontal: 12,
                      borderTopLeftRadius: 8,
                      borderBottomLeftRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'flex-end',
                      gap: 5,
                      width: '86%',
                      height: 42,
                      marginBottom: bottom > 0 ? 6 : 10,
                    }}>
                    <AstrologyIcon
                      width={61 - iconDecrement}
                      height={44 - iconDecrement}
                    />
                  </View>
                  <Text style={{display: 'none'}}>test</Text>
                </View>
              ),
              tabBarButton: props => (
                <Pressable
                  {...props}
                  onPress={() => {
                    Track({
                      cleverTapEvent: 'Switch_Astrology',
                      mixpanelEvent: 'Switch_Astrology',
                      userData: userInfo,
                    });
                    navigation.navigate('AstroBottomTabs');
                  }}>
                  {props.children}
                </Pressable>
              ),
            }}
          />
        )}
      </Tab.Navigator>
      {isIIconCarouselVisible && (
        <IIconCarousel
          isVisible={isIIconCarouselVisible}
          onClose={() => setIIconCarouselVisible(false)}
        />
      )}
    </>
  );
}

export default memo(BottomTabs);
