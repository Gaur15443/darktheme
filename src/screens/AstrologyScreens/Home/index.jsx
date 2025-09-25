import {
  Pressable,
  View,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  Linking,
  ImageBackground,
} from 'react-native';
import Share from 'react-native-share';
import React, {
  useEffect,
  memo,
  useState,
  useRef,
  Fragment,
  useCallback,
  useMemo,
} from 'react';
import {Button, Text, useTheme, Modal, Portal} from 'react-native-paper';
import GradientView from '../../../common/gradient-view';
import {useIsFocused} from '@react-navigation/native';
import AstroHoroscopeIcon from '../../../images/Icons/AstrologyBottomTabIcons/AstroHoroscopeIcon';
import HeartSolidIcon from '../../../images/Icons/HeartIcon/HeartSolidIcon';
import SuitCaseIcon from '../../../images/Icons/SuitCaseIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BellIcon from '../../../images/Icons/BellIcon';
import AstroPanchangIcon from '../../../images/Icons/AstrologyBottomTabIcons/AstroPanchangIcon';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useWallet} from '../../../context/WalletContext';
import {useSelector} from 'react-redux';
import {TouchableOpacity} from 'react-native';
import Wallet from '../../../components/Wallet';
import {useDispatch} from 'react-redux';
import {verifyMobileWallet} from '../../../store/apps/wallet';
import {getTopAstrologers} from '../../../store/apps/astrologersListing';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../../../constants/Screens';
import {storeLocation} from '../../../store/apps/wallet';

import {AboutIcon, AccountInstra, PrivacyIcon, ShareApp} from '../../../images';
import {AuthContextFunc} from '../../../context/AuthContext';
import {mixpanel, Track} from '../../../../App';
import HamburgerIcon from '../../../images/Icons/HamburgerIcon';
import DarkOrderIcon from '../../../images/Icons/OrderIcon/DarkOrderIcon';
import DarkLogoutIcon from '../../../images/Icons/LogoutIcon/DarkLogoutIcon';
import {
  defaultLocation,
  fetchUserLocation,
} from '../../../store/apps/userLocation';
import {
  getAstroBannerDetails,
  getAstroHomeData,
} from '../../../store/apps/astroHome';
import Slider from '../../../components/AstroHome/Slider';
import SparkleIcon from '../../../images/Icons/SparkleIcon';
import PanchangCard from '../../../components/AstroHome/PanchangCard';
import HomeReportCard from '../../../components/AstroHome/HomeReportCard';
import ErrorBoundary from '../../../common/ErrorBoundary';
import AstroReportsIcon from '../../../images/Icons/AstrologyBottomTabIcons/AstroReportsIcon';
import AstroConsultationAltIcon from '../../../images/Icons/AstrologyBottomTabIcons/AstroConsultationAltIcon';
import {DefaultImage} from '../../../core';
import AstroConfirmPush from '../../../components/AstroConfirmPush';
import PromotionalBanner from '../../../components/AstroHome/PromotionalBanner';
import {usePushNotification} from '../../../context/PushNotificationContext';
import {
  setRequestPermissionState,
  setShowedInHome,
} from '../../../store/apps/pushnotification';
import Toast from 'react-native-toast-message';
import HoroscopeCard from '../../../components/HoroscopeCard';
import MobileVerificationGuard from '../../../components/Wallet/MobileVerificationGuard';

const VedicCard = memo(({data}) => {
  return (
    <View
      style={{
        minHeight: 168,
        backgroundColor: '#2B2941',
        borderRadius: 8,
        borderColor: '#FFFFFF33',
        borderWidth: 1,
        padding: 12,
        gap: 8,
      }}>
      <Text
        // @ts-ignore
        variant="bold"
        style={{
          fontSize: 14,
          lineHeight: 16.45,
        }}>
        {data?.header}
      </Text>

      {data?.subHeader.map((item, itemIndex) => (
        <View
          key={itemIndex}
          style={{
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            paddingHorizontal: 12,
          }}>
          <SparkleIcon />
          <Text
            style={{
              fontSize: 14,
            }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
});

const TopAstrologers = memo(() => {
  const theme = useTheme();
  const topAstrologers = useSelector(
    state => state?.astrologersListing?.topAstrologers,
  );
  const navigation = useNavigation();

  return (
    <View
      style={{
        marginBlock: 10,
        height: 223,
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}>
      <GradientView
        contentStyle={{
          height: '100%',
          width: '100%',
          justifyContent: 'center',
        }}>
        <Text
          variant="bold"
          style={{marginTop: 8, fontSize: 22, paddingLeft: 14}}>
          Top Astrologers
        </Text>
        <ScrollView
          horizontal
          style={{height: 143, marginBlock: 20}}
          contentContainerStyle={{
            gap: 10,
            paddingLeft: 14,
          }}>
          {topAstrologers?.length > 0 &&
            topAstrologers.map(
              (
                {astrologername, profilepic, displayActualRate, userId},
                index,
              ) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    height: 143,
                    width: 100,
                    backgroundColor: '#FFFFFF0D',
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    borderWidth: 1,
                    borderColor: theme.colors.primary,
                  }}
                  onPress={() =>
                    navigation.navigate('AstroProfile', {astroId: userId})
                  }>
                  <Image
                    source={{
                      uri: profilepic,
                    }}
                    width={75}
                    height={75}
                    borderRadius={75 / 2}
                  />
                  <View style={{paddingHorizontal: 8}}>
                    <Text
                      variant="bold"
                      style={{
                        fontSize: 16,
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {astrologername}
                    </Text>
                    <Text style={{fontSize: 12, textAlign: 'center'}}>
                      {'\u20B9'}
                      {displayActualRate}/min
                    </Text>
                  </View>
                </TouchableOpacity>
              ),
            )}
        </ScrollView>
      </GradientView>
    </View>
  );
});

const SideBar = memo(({visible, setShowDrawer, setShowLogoutModal}) => {
  const email = useSelector(state => state.userInfo.email);
  const personalDetails = useSelector(state => state.userInfo.personalDetails);
  const mobileNo = useSelector(state => state.userInfo.mobileNo);
  const navigator = useNavigation();

  const styles = StyleSheet.create({
    drawerOverlay: {
      position: 'absolute',
      right: 0,
      top: 90,
      width: '85%',
      height: SCREEN_HEIGHT - 90,
      zIndex: 2,
    },
    topSection: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: 'rgba(19, 16, 43, 1)',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
  });

  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').width),
  ).current;

  const onShare = async () => {
    const fixedUrl = 'https://invite.imeuswe.in/';
    const firstLine =
      "Discover the joy of connecting with your family's rich history with iMeUsWe! This app lets you:";
    const secondLine =
      '1. Build Your Family Tree: Create a lasting legacy by preserving your family history for future generations.';
    const thirdLine =
      "2. Share Family Stories: Bring memories to life by sharing cherished stories with your family, ensuring they're never forgotten.";
    const fourthLine =
      '3. Access an Extensive Database: Gain a more complete picture of your family history by accessing a vast collection of historical records';
    const fifthLine =
      'Join the iMeUsWe community and start exploring your roots today! Download the app now and embark on a journey of discovery and connection with your loved ones';
    const sixthLine = `${fixedUrl}`;
    const options = {
      title: `${firstLine}`,
      message: `${firstLine}\n\n${secondLine}\n${thirdLine}\n${fourthLine}\n\n${fifthLine}\n\n${sixthLine}`,
      subject: `Join iMeUsWe`,
      url: fixedUrl,
      failOnCancel: false,
    };
    await Share.open(options);
  };
  const handleSocialMediaPress = url => {
    Linking.openURL(url);
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const items = [
    {
      icon: <PrivacyIcon />,
      text: 'Feedback',
      onPress: () => navigator.navigate('Feedback'),
    },
    {
      icon: <AboutIcon />,
      text: 'About iMeUsWe',
      onPress: () => navigator.navigate('AboutUs'),
    },
    {
      icon: <AccountInstra />,
      text: 'Follow us on Instagram',
      onPress: () =>
        handleSocialMediaPress('https://www.instagram.com/imeuswe/'),
    },
    {
      icon: <ShareApp />,
      text: 'Share the app',
      onPress: onShare,
    },
    {
      icon: <DarkOrderIcon />,
      text: 'Order History',
      onPress: () => navigator.navigate('AstroOrderHistory'),
    },
    {
      icon: <DarkLogoutIcon />,
      text: 'Logout',
      onPress: () => setShowLogoutModal(true),
    },
  ];

  return (
    <Fragment>
      {visible && (
        <View
          onTouchStart={() => setShowDrawer(false)}
          style={{
            position: 'absolute',
            top: 90,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />
      )}
      <Animated.View
        style={[styles.drawerOverlay, {transform: [{translateX: slideAnim}]}]}>
        <GradientView
          contentStyle={{
            height: '100%',
            width: '100%',
          }}>
          <View style={styles.topSection}>
            {personalDetails?.profilepic?.length > 0 ? (
              <Image
                source={{
                  uri: personalDetails?.profilepic,
                }}
                width={60}
                height={60}
                borderRadius={30}
              />
            ) : (
              <DefaultImage
                size={60}
                firstName={personalDetails?.name}
                lastName={personalDetails?.lastname}
                gender={personalDetails?.gender}
              />
            )}
            <View>
              <Text variant="bold">
                {personalDetails?.name} {personalDetails?.lastname}
              </Text>
              <Text style={{fontSize: 12}}>{email}</Text>
              {mobileNo && <Text style={{fontSize: 12}}>+{mobileNo}</Text>}
            </View>
          </View>
          <View style={{paddingHorizontal: 24}}>
            {items.map(item => (
              <TouchableOpacity
                key={item.text}
                onPress={item.onPress}
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.24)',
                }}>
                {item.icon}
                <Text variant="bold" style={{fontSize: 18}}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GradientView>
      </Animated.View>
    </Fragment>
  );
});

export default function Home() {
  const theme = useTheme();
  const pushContext = usePushNotification();
  const navigation = useNavigation();
  const {logout} = AuthContextFunc();
  const dispatch = useDispatch();
  const pageIsFocused = useIsFocused();
  const userData = useSelector(state => state.userInfo);

  const verificationData = useSelector(
    state => state.walletSlice.verificationData,
  );
  const showedInHome = useSelector(
    state => state.pushNotificationSlice.showedInHome,
  );
  const isPersonalisedHoroscopeEnabled = useSelector(
    state => state.astroFeature.isPersonalisedHoroscopeEnabled,
  );
  const verificationStatus = useSelector(
    state => state.walletSlice.verificationStatus,
  );

  const {fetchWalletData, freeCallAvailable} = useWallet();
  const userId = useSelector(state => state?.userInfo._id);
  const scrollRef = useRef(null);
  const topAstrologers = useSelector(
    state => state?.astrologersListing?.topAstrologers,
  );
  const personalDetails = useSelector(state => state.userInfo.personalDetails);
  const homeData = useSelector(state => state.astroHome?.data);
  const userLocation = useSelector(state => state.userLocation.data);
  const showedBanner = useSelector(state => state.astroHome.showedBanner);
  const bannerDetails = useSelector(state => state.astroHome.bannerDetails);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  const showRedDot = useSelector(state => state.redDot.showRedDot);
  const showRedDotLikeComment = useSelector(
    state => state.redDot.showRedDotLikeComment,
  );
  const shouldShowRedDot = useMemo(() => {
    const receiverIsPresent =
      showRedDotLikeComment?.notificationReceivers?.includes?.(userId) ?? false;

    return showRedDot || (showRedDotLikeComment.redDot && receiverIsPresent);
  }, [showRedDot, showRedDotLikeComment, userId]);

  const featureList = [
    {
      title: 'Consultation',
      icon: AstroConsultationAltIcon,
      onPress: () =>
        navigation.navigate('AstroBottomTabs', {screen: 'Consultation'}),
      isConsultation: true,
    },
    {
      title: 'Astrology\nReports',
      icon: AstroReportsIcon,
      onPress: () =>
        navigation.navigate('AstroBottomTabs', {screen: 'Reports'}),
    },
    {
      title: 'Horoscope',
      icon: AstroHoroscopeIcon,
      onPress: () =>
        navigation.navigate('AstroBottomTabs', {screen: 'Horoscope'}),
    },
    {
      title: 'Panchang',
      icon: AstroPanchangIcon,
      onPress: () =>
        navigation.navigate('AstroBottomTabs', {screen: 'Panchang'}),
    },
    {
      title: 'Match\nMaking',
      icon: () => <HeartSolidIcon fill="#fff" />,
      onPress: () => navigation.navigate('MatchMaking'),
    },
  ];

  useEffect(() => {
    return () => {
      setShowDrawer(false);
    };
  }, [pageIsFocused]);

  useEffect(() => {
    if (!(homeData?.[0]?.length > 0) && !(homeData?.[1]?.length > 0)) {
      setLoading(true);

      fetchHomeData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkPushPermission();
      if (!bannerDetails?._id) {
        dispatch(getAstroBannerDetails()).then(res => {
          setTimeout(() => {
            setShowBanner(true);
          }, 0);
        });
      }
    }, []),
  );

  useEffect(() => {
    if (!userId || !userLocation) return;

    const {region, country_name, country_code, region_code, city, postal, ip} =
      userLocation;

    if (region && country_name && country_code) {
      dispatch(
        storeLocation({
          userId,
          state: region,
          country: country_name,
          countryCode: country_code,
          regionCode: region_code,
          city,
          postal,
        }),
      )
        .unwrap()
        .then(res => console.log('✅ Location stored:', res))
        .catch(err => console.error('❌ Error storing location:', err));
    }
  }, [userId, userLocation, dispatch]);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (!userId) return;

  //     const checkWallet = async () => {
  //       try {
  //         const res = await fetchWalletData(userId);

  //         if (
  //           res?.message === 'WalletAlreadyExists' ||
  //           res?.message === 'Wallet created successfully'
  //         ) {
  //           return; // balances already updated in WalletContext
  //         }

  //         if (
  //           res?.message === 'Verification Required' ||
  //           res?.message === 'Mobile number not found'
  //         ) {
  //           navigation.navigate('AstrologyLoginWithMobile', {
  //             onVerified: async () => {
  //               await fetchWalletData(userId);
  //               navigation.navigate('AstroHome');
  //             },
  //             mobileNumber: res?.mobileNo?.toString() || null,
  //           });
  //         }
  //       } catch (err) {
  //         console.error('❌ Wallet fetch error:', err);
  //       }
  //     };

  //     checkWallet();
  //   }, [userId]),
  // );

  useFocusEffect(
    React.useCallback(() => {
      Track({
        cleverTapEvent: 'Astrology_Home',
        mixpanelEvent: 'Astrology_Home',
        userData,
      });
    }, [userId]),
  );

  const fetchHomeData = useCallback(async () => {
    try {
      let locationInfo = userLocation;

      if (!userLocation?.city) {
        locationInfo = await dispatch(fetchUserLocation()).unwrap();
      }

      const date = new Date();
      const formattedDate = date.toLocaleDateString('en-GB');

      const data = {
        date: formattedDate,
        location: {
          place: defaultLocation.country_name,
          latitude: defaultLocation.coordinates[0],
          longitude: defaultLocation.coordinates[1],
        },
      };
      dispatch(getTopAstrologers()).unwrap();

      // @ts-ignore
      return dispatch(getAstroHomeData(data)).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [userLocation, dispatch]);

  async function checkPushPermission() {
    const enabled = await pushContext.checkNotificationPermission();

    if (!enabled) {
      dispatch(setRequestPermissionState(true));
    } else {
      dispatch(setShowedInHome(true));
    }
  }
  const handleLogout = async () => {
    try {
      await logout();
      /* customer io and mixpanel event chagnes  start */
      Track({
        cleverTapEvent: 'logout',
        mixpanelEvent: 'logout',
        userData,
      });
      mixpanel.reset();
      /* customer io and mixpanel event chagnes  end */
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const insets = useSafeAreaInsets();
  return (
    <ErrorBoundary.Screen>
      <MobileVerificationGuard
        navigationTarget={'AstroHome'}
        redirectTo="AstroHome">
        {!showedInHome && pageIsFocused && (
          <AstroConfirmPush onClose={() => dispatch(setShowedInHome(true))} />
        )}
        {showBanner && showedInHome && !showedBanner && pageIsFocused && bannerDetails?.isHomePageBannerForReports && (
          <PromotionalBanner onClose={() => setShowBanner(false)} />
        )}
        <View
          style={{
            flex: 1,
          }}>
          {showLogoutModal && (
            <Portal>
              <Modal visible onDismiss={() => setShowLogoutModal(false)}>
                <View
                  style={{
                    padding: 10,
                    overflow: 'hidden',
                    borderRadius: 8,
                    height: 222,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <GradientView
                    contentStyle={{
                      padding: 10,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                      height: '100%',
                      width: '100%',
                    }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        borderRadius: 48,
                        backgroundColor: 'rgba(255, 79, 79, 1)',
                      }}>
                      <DarkLogoutIcon />
                    </View>
                    <Text
                      variant="bold"
                      style={{fontSize: 18, textAlign: 'center'}}>
                      Are you sure you want to logout?
                    </Text>
                    <View style={{flexDirection: 'row', gap: 10, padding: 10}}>
                      <Button
                        onPress={handleLogout}
                        textColor="#fff"
                        style={{
                          backgroundColor: 'rgba(255, 79, 79, 1)',
                          borderRadius: 8,
                          flex: 1,
                        }}>
                        Logout
                      </Button>
                      <Button
                        onPress={() => setShowLogoutModal(false)}
                        textColor="#fff"
                        mode="outlined"
                        style={{borderRadius: 8, flex: 1}}>
                        Cancel
                      </Button>
                    </View>
                  </GradientView>
                </View>
              </Modal>
            </Portal>
          )}
          <SideBar
            visible={showDrawer}
            setShowDrawer={setShowDrawer}
            setShowLogoutModal={setShowLogoutModal}
          />
          <GradientView
            variant="modal"
            colors={['#6944D3', '#000000']}
            style={{
              height: 184,
              borderBottomRightRadius: 24,
              borderBottomLeftRadius: 24,
            }}
            contentStyle={{
              height: '100%',
              gap: 16,
              paddingBottom: 24,
              paddingTop: insets.top + 4,
              borderBottomRightRadius: 24,
              borderBottomLeftRadius: 24,
              paddingHorizontal: 16,
              borderBottomWidth: 0.5,
              borderLeftWidth: 0.5,
              borderRightWidth: 0.5,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flex: 1,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: 6,
                    height: 32,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      height: 32,
                      width: 161,
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                    }}>
                    <Image
                      source={{
                        uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/astro-logo.png',
                      }}
                      style={{
                        height: '100%',
                        width: '100%',
                      }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Wallet
                  cleverTapEvent="Wallet_CTA_Homepage"
                  mixpanelEvent="Wallet_CTA_Homepage"
                />
                <Pressable
                  style={{
                    position: 'relative',
                  }}
                  onPress={() => navigation.navigate('AstroNotifications')}>
                  <BellIcon />
                  {shouldShowRedDot && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 3,
                        right: 6,
                        width: 6,
                        height: 6,
                        borderRadius: 5,
                        backgroundColor: 'red',
                      }}
                    />
                  )}
                </Pressable>
                <HamburgerIcon
                  drawerVisible={showDrawer}
                  onPress={() => setShowDrawer(prev => !prev)}
                />
              </View>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 24,
                  paddingBottom: 8,
                  fontWeight: 500,
                }}
                variant="bold">
                {/* @ts-ignore */}
                Hi {personalDetails?.name || ''},
              </Text>
              <Text
                style={{
                  fontSize: 14,
                }}>
                {homeData?.[0]?.description}
              </Text>
            </View>
          </GradientView>
          <View
            style={{
              paddingHorizontal: 10,
              flex: 1,
            }}>
            <ScrollView
              scrollEnabled={showDrawer ? false : true}
              style={{
                paddingBottom: 100,
                flex: 1,
                marginTop: 30,
              }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{marginBottom: 20}}>
                {featureList.map(({icon: Icon, title, onPress}) => (
                  <TouchableOpacity
                    key={title}
                    style={{
                      backgroundColor: theme.colors.background,
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: '#6944D3',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                      gap: 13,
                    }}
                    onPress={onPress}>
                    <Icon />
                    <Text style={{fontSize: 12, textAlign: 'center'}}>
                      {title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {isPersonalisedHoroscopeEnabled && (
                <>
                  <View style={{padding: 10}}></View>
                  <HoroscopeCard screen="Home" />
                  <View style={{padding: 10}}></View>
                </>
              )}
              {/* * Talk */}

              <GradientView
                style={{
                  height: 200,
                  width: '100%',
                  overflow: 'hidden',
                  marginBottom: 10,
                  borderRadius: 8,
                }}
                contentStyle={{
                  overflow: 'hidden',
                  borderRadius: 8,
                  flexDirection: 'row',
                  flex: 1,
                  height: 200,
                  width: '100%',
                }}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    paddingHorizontal: 10,
                    paddingBlock: 16,
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <Text style={{fontSize: 24}}>Looking for answers?</Text>
                    <Text style={{fontSize: 24}}>Let astrology guide you!</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Consultation')}
                    mode="contained"
                    style={{
                      borderRadius: 6,
                      width: 148,
                      height: 36,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: theme.colors.primary,
                    }}>
                    <Text
                      variant="bold"
                      style={{fontSize: 14, textAlign: 'center'}}>
                      Talk to Astrologers
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{alignItems: 'flex-end', justifyContent: 'center'}}>
                  <Image
                    style={{
                      width: 152 / 2,
                      height: 152,
                    }}
                    source={{
                      uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/astrology-wheel+1.png',
                    }}
                  />
                </View>
              </GradientView>
              <TopAstrologers />
              <Slider vedic={homeData?.[0]} />
              <ImageBackground
                style={{
                  width: '100%',
                  marginVertical: 10,
                  borderRadius: 8,
                  flex: 1,
                  height: 215,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                source={{
                  uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/hearts-bg.png',
                }}
                resizeMode="cover"
                imageStyle={{
                  width: SCREEN_WIDTH - 20,
                  height: 215,
                }}>
                <View
                  style={{
                    height: 48,
                    width: 48,
                    backgroundColor: '#fff',
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}>
                  {/* <Icon /> */}
                  <HeartSolidIcon />
                </View>
                <Text
                  // @ts-ignore
                  variant="bold"
                  style={{
                    fontSize: 18,
                    textAlign: 'center',
                    marginBottom: 11,
                  }}>
                  Explore Matchmaking
                </Text>
                <Text>Check your level of compatibility</Text>
                <Button
                  // @ts-ignore
                  onPress={() => navigation.navigate('MatchMaking')}
                  mode="contained"
                  theme={{colors: {primary: '#fff', onPrimary: '#000'}}}
                  style={{
                    borderRadius: 8,
                    width: '100%',
                    marginTop: 10,
                  }}
                  textColor="rgba(211, 68, 70, 1)">
                  {/* {data?.btn} */}
                  Try Matchmaking
                </Button>
              </ImageBackground>
              <HomeReportCard
                data={homeData?.[0]?.careerReportCard}
                navigationScreen="Reports"
                Icon={SuitCaseIcon}
                gradient={['#27C394', '#0E0E10']}
              />
              {homeData?.[0]?.vedicAstrology && (
                <VedicCard data={homeData?.[0]?.vedicAstrology} />
              )}
              <View style={{height: 10}} />
              <PanchangCard data={homeData?.[1]} />
              <View
                style={{
                  height: 100,
                }}
              />
            </ScrollView>
          </View>
        </View>
      </MobileVerificationGuard>
    </ErrorBoundary.Screen>
  );
}
