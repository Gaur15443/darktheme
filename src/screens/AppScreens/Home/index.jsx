import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { Card, Divider, Text, useTheme, Avatar } from 'react-native-paper';
import {
  Search,
  FeedbackMsg,
  PrivacyIcon,
  AboutIcon,
  AccountInstra,
  ShareApp,
  LogoutIcon,
} from '../../../images';
import {
  ImeuwCount,
  ImeuwFirst,
  ImeusCarousel,
  ImuwStory,
  Secondtime,
  ImuwDna,
  ImuwSearch,
} from '../../../components';
import { useDispatch, useSelector } from 'react-redux';
import {
  getQuote,
  getAllstory,
  getTestimonial,
  // updateTimeZone,
} from '../../../store/apps/home';
import Toast from 'react-native-toast-message';
import { getUserInfo } from '../../../store/apps/userInfo';
import InviteModal from '../../../components/invite-popup';
import { useNavigation, useRoute } from '@react-navigation/native';
import NewTheme from '../../../common/NewTheme';
import { PushNotificationContext } from '../../../context/PushNotificationContext';
import { useFocusEffect } from '@react-navigation/native';
import { setHomeTooltipSeen, listFamilyTrees } from '../../../store/apps/tree';
import { mixpanel } from '../../../../App';
import AdaptiveBanner from '../../../components/ads/AdaptiveBanner';
import Spinner from '../../../common/Spinner';
import { Help } from '../../../components';
import { useIsFocused } from '@react-navigation/native';
import CleverTap from 'clevertap-react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';
import { Drawer } from 'react-native-paper';
import { CustomDialog, DefaultImage } from '../../../core';
import ButtonSpinner from '../../../common/ButtonSpinner';
import Share from 'react-native-share';
import TutorialVideos from '../../../components/Admin_Faq/TutorialVideos';
import FunFactCard from '../../../components/FunFactCard';
import * as Sentry from '@sentry/react-native';
import FastImage from '@d11/react-native-fast-image';
import { AuthContextFunc } from '../../../context/AuthContext';
import { Track } from '../../../../App';
import { desanitizeInput } from '../../../utils/sanitizers';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = ({ toggleDrawer, drawerVisible }) => {
  const [isHelpDialogVisible, setHelpDialogVisible] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { logout } = AuthContextFunc();
  const dispatch = useDispatch();
  const quotation = useSelector(state => state?.home?.quotes?.quotationName);
  const homePageToolTipSeen = useSelector(state => state.Tree.homeTooltipSeen);
  const pageIsFocused = useIsFocused();

  const userFirstname = useSelector(
    state => state?.userInfo?.personalDetails?.name,
  );
  const checkList = useSelector(state => state?.Tree?.AllFamilyTrees?.treeList);
  const checkOwner = useSelector(state => state?.Tree.AllFamilyTrees?.isOwner);
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const inviteContent = "You're invited to our event!";

  const handleCloseModal = () => setShowModal(false);
  // const [changeVal, setChangeVal] = useState([]);
  const userId = useSelector(state => state.userInfo._id);
  const navigation = useNavigation();

  // For Push Notification Routing When App is in Kill State
  const { setIsHomeVisible } = useContext(PushNotificationContext);
  useEffect(() => {
    // Set home screen visibility when the component mounts
    setIsHomeVisible(true);
  }, []);

  const [loading, setLoading] = useState(false);
  const [searchloading, setSearchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // For Consent Form
  const userInfo = useSelector(state => state.userInfo);
  const isUserTreeExist = useSelector(state => state?.userInfo?.treeIdin);
  const getShopifyflag = useSelector(state => state?.home?.counts?.shopifyFlag);
  const latestStories = useSelector(state => state?.home?.data?.latestStories);

  const handleLogout = async () => {
    try {
      await logout();
      /* customer io and mixpanel event chagnes  start */
      Track({
        cleverTapEvent: 'logout',
        mixpanelEvent: 'logout',
        userInfo,
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

  useFocusEffect(
    React.useCallback(() => {
      if (userInfo?._id && pageIsFocused) {
        try {
          const phoneNo = userInfo?.mobileNo ? '+' + userInfo?.mobileNo : '';
          const cleverTapProps = {
            Name: `${userInfo?.personalDetails?.name} ${userInfo?.personalDetails?.lastname}`, // String
            Identity: userInfo?._id, // String or number
            Email: userInfo?.email, // Phone (with the country code, starting with +)
            Phone: phoneNo,
            Firstname: userInfo?.personalDetails?.name,
            Lastname: userInfo?.personalDetails?.lastname,
            Gender: userInfo?.personalDetails?.gender,
          };
          CleverTap.profileSet(cleverTapProps);
          CleverTap.setDebugLevel(3);
          //CleverTap.profileSet(cleverTapProps);
          // CleverTap.onUserLogin(cleverTapProps);
          CleverTap.recordEvent('home', cleverTapProps);

          mixpanel.identify(userInfo?._id);
          mixpanel.getPeople().set({
            $user_id: userInfo?._id,
            $email: userInfo?.email,
            $phone: phoneNo,
            $name:
              userInfo?.personalDetails?.name +
              ' ' +
              userInfo?.personalDetails?.lastname,
          });

          mixpanel.track('homePage', {
            user_id: userInfo?._id,
            email: userInfo?.email,
            phone: phoneNo,
            userFirstname: userInfo?.personalDetails?.name,
            userLastname: userInfo?.personalDetails?.lastname,
            gender: userInfo?.personalDetails?.gender,
          });
          Sentry.setUser({
            id: userInfo?._id,
            email: userInfo?.email,
            phone: phoneNo,
          });

        } catch (error) {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      }
    }, [userInfo?._id]),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await dispatch(listFamilyTrees()).unwrap();
        await Promise.all([
          dispatch(getQuote()).unwrap(),
          dispatch(getAllstory()).unwrap(),
          dispatch(getTestimonial()).unwrap(),
        ]);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: error?.message,
        });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    try {
      if (!homePageToolTipSeen) {
        dispatch(setHomeTooltipSeen(true));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    }
  }, [homePageToolTipSeen]);
  useEffect(() => {
    try {
      if (!userId) {
        async () => {
          await dispatch(getUserInfo()).unwrap();
        };
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    }
  }, []);

  const handleInputFocus = () => {
    navigation.navigate('ImeusweSearch');
  };
  const GotoFeedback = () => {
    setLoading(true);
    navigation.navigate('Feedback', { comingFrom: 'Home' });
    setLoading(false);
  };

  const closeHelpDialog = () => {
    setHelpDialogVisible(false);
  };

  // Bottom Bar Should set to Initial Route
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      // Check if the comingFrom parameter is 'SignUpPage' || 'Home'
      if (route.params?.comingFrom === 'SignUpPage' || 'Home') {
        // Reset bottom bar to initial route
        navigation.navigate('BottomTabs', { screen: 'Home' });
      }

      // Optional: Cleanup function if needed
      return () => {
        // Cleanup code here if necessary
      };
    }, [route.params?.comingFrom, navigation]), // Dependencies include route params and navigation
  );
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  // const deviceInfoData = userInfo?.deviceInfo;
  //   useLocationWithRateLimiting(deviceInfoData);

  const email = useSelector(state => state?.userInfo.email);
  const name = userInfo?.personalDetails?.name || '';
  const middleName = userInfo?.personalDetails?.middlename || '';
  const lastName = userInfo?.personalDetails?.lastname || '';

  const fullName = `${name}${middleName ? ` ${middleName}` : ''} ${lastName}`;
  const mobileNo = userInfo?.mobileNo;
  const country_code = userInfo?.countryCode;

  const truncatedFullName =
    fullName.length > 23 ? `${fullName.slice(0, 23)}...` : fullName;

  const GotoAboutUs = () => {
    navigation.navigate('AboutUs');
  };
  const handleSocialMediaPress = url => {
    Linking.openURL(url);
  };

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

  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').width),
  ).current; // Start off-screen

  useEffect(() => {
    if (drawerVisible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide in to the visible screen
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [drawerVisible]);

  const filteredStories = latestStories.filter(
    item =>
      item.storyCreatedBy?._id !== '63e0f5b03ad569001b685e78' &&
      item.storyCreatedBy?._id !== '63c1338989c1ee001ba797f3',
  );

  return (
    <ErrorBoundary.Screen>
      <View>
        {isLoading || loading || searchloading ? (
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
        ) : (
          <SafeAreaView>
            {drawerVisible && (
              <TouchableOpacity style={styles.overlay} onPress={toggleDrawer} />
            )}
            <Animated.View
              style={[
                styles.drawerOverlay,
                { transform: [{ translateX: slideAnim }] },
              ]}>
              {/* <Drawer.Section> */}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  backgroundColor: NewTheme.colors.secondaryLightBlue,
                  paddingTop: 12,
                  paddingBottom: 12,
                }}>
                <View>
                  {loading ? (
                    <ButtonSpinner />
                  ) : (
                    <>
                      {userInfo?.personalDetails?.profilepic ? (
                        <Avatar.Image
                          size={45}
                          source={{ uri: userInfo?.personalDetails?.profilepic }}
                          style={{
                            borderWidth: 3,
                            borderColor: 'rgb(41, 221, 69)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      ) : (
                        <DefaultImage
                          size={64}
                          firstName={userInfo?.personalDetails?.name}
                          lastName={userInfo?.personalDetails?.lastname}
                          gender={userInfo?.personalDetails?.gender}
                        />
                      )}
                    </>
                  )}
                </View>
                <View>
                  <Text style={styles.headerText}>{truncatedFullName}</Text>
                  <Text
                    style={{ color: NewTheme.colors.whiteText, marginLeft: 16 }}>
                    {email}
                  </Text>
                  {mobileNo && (
                    <Text
                      style={{
                        color: NewTheme.colors.whiteText,
                        marginLeft: 16,
                      }}>
                      +{country_code}
                      {mobileNo}
                    </Text>
                  )}
                </View>
              </View>
              <Drawer.Item
                label="Feedback"
                icon={PrivacyIcon}
                onPress={() => GotoFeedback()}
                style={{ borderRadius: 0 }}
              />
              <Divider style={{ marginHorizontal: 12 }} />
              <Drawer.Item
                label="About iMeUsWe"
                icon={AboutIcon}
                onPress={() => GotoAboutUs()}
                style={{ borderRadius: 0 }}
              />
              <Divider style={{ marginHorizontal: 12 }} />
              <Drawer.Item
                label="Follow us on Instagram"
                icon={AccountInstra}
                onPress={() =>
                  handleSocialMediaPress('https://www.instagram.com/imeuswe/')
                }
                style={{ borderRadius: 0 }}
              />
              <Divider style={{ marginHorizontal: 12 }} />
              <Drawer.Item
                label="Share the app"
                icon={ShareApp}
                onPress={() => onShare()}
                style={{ borderRadius: 0 }}
              />
              <Divider style={{ marginHorizontal: 12 }} />
              <Drawer.Item
                label="Logout"
                icon={LogoutIcon}
                onPress={() => setShowLogoutDialog(true)}
                style={{ borderRadius: 0 }}
              />
              <Divider style={{ marginHorizontal: 12 }} />
              {/* </Drawer.Section> */}
            </Animated.View>

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <View
                style={{
                  backgroundColor: NewTheme.colors.secondaryLightBlue,
                  position: 'absolute',
                  top: -500,
                  height: 600,
                  borderWidth: 1,
                  width: '100%',
                }}></View>
              <View
                style={{
                  flex: 1,
                  paddingBottom: 12,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                }}>
                <FastImage
                  source={{
                    uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Header.png',
                  }}
                  style={styles.imageBackground}
                  resizeMode="stretch">
                  <View style={{ marginTop: 48 }}>
                    <View style={{ padding: 12, width: '50%' }}>
                      <Text style={{ textTransform: 'capitalize' }}>
                        {userFirstname?.length < 15 && (
                          <Text
                            style={{
                              fontWeight: '700',
                              color: NewTheme.colors.whiteText,
                              fontSize: 20,
                            }}>
                            Hi {desanitizeInput(userFirstname)},
                          </Text>
                        )}

                        {userFirstname?.length >= 15 && (
                          <Text
                            style={{
                              fontWeight: '700',
                              color: NewTheme.colors.whiteText,
                              fontSize: 20,
                            }}>
                            Hi {userFirstname?.substring(0, 15)}...,
                          </Text>
                        )}
                      </Text>
                    </View>
                    <View style={{ padding: 12, width: '65%' }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: NewTheme.colors.whiteText,
                        }}>
                        "{quotation}"
                      </Text>
                    </View>
                  </View>
                </FastImage>
              </View>
              {/* <GlobalStyle> */}
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingTop: 12,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                }}>
                {getShopifyflag && (
                  <View>
                    <ImuwDna />
                  </View>
                )}
              </View>

              {/* Family Tree */}

              <View style={{ backgroundColor: NewTheme.colors.backgroundCreamy }}>
                <Text style={styles.nameTitleTree}>Family Trees</Text>
              </View>

              <View
                style={{
                  paddingBottom: 12,
                  paddingLeft: 9,
                  paddingRight: 12,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                }}>
                {isLoading ? (
                  <View />
                ) : (
                  <>
                    {checkList?.length > 0 && !checkOwner && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        <View
                          style={{
                            padding: 2,
                            flexDirection: 'row',
                          }}>
                          <View>
                            <ImeuwFirst />
                          </View>
                          <View>
                            <Secondtime />
                          </View>
                        </View>
                      </ScrollView>
                    )}
                    {checkList?.length === 0 && (
                      <View>
                        <View>
                          <ImeuwFirst />
                        </View>
                      </View>
                    )}
                    {checkList?.length > 0 && checkOwner && (
                      <View>
                        <Secondtime />
                      </View>
                    )}
                  </>
                )}
              </View>
              {/* FunFactCard */}
              <View style={{ backgroundColor: NewTheme.colors.backgroundCreamy }}>
                <FunFactCard />
              </View>

              {/* StoryCard */}
              {Array.isArray(isUserTreeExist) &&
                isUserTreeExist.length > 0 &&
                filteredStories.length > 0 && (
                  <View
                    style={{ backgroundColor: NewTheme.colors.backgroundCreamy }}>
                    <Text style={styles.nameTitle}>Family Wall</Text>

                    <View
                      style={{
                        backgroundColor: NewTheme.colors.backgroundCreamy,
                        paddingRight: 12,
                        paddingLeft: 9,
                      }}>
                      <View>
                        <ImuwStory />
                      </View>
                    </View>
                  </View>
                )}

              {/* Large Banner AD */}
              <View
                style={{
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingTop: 42,
                }}>
                <AdaptiveBanner />
              </View>

              {/* Discover Your Family */}
              <View style={{ backgroundColor: NewTheme.colors.backgroundCreamy }}>
                <Text style={styles.nameTitle}>iMeUsWe Records</Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 12,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                }}>
                <View
                  style={{ backgroundColor: NewTheme.colors.backgroundCreamy }}>
                  <Card
                    style={{
                      backgroundColor: NewTheme.colors.whiteText,
                      marginBottom: 12,
                    }}>
                    <View style={{ borderRadius: 10, overflow: 'hidden' }}>
                      <ImageBackground
                        source={{
                          uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/historic.png',
                        }}>
                        <Text
                          style={{
                            fontWeight: 700,
                            fontSize: 21,
                            textAlign: 'center',
                            color: NewTheme.colors.secondaryDarkBlue,
                            paddingHorizontal: 24,
                            paddingVertical: 18,
                          }}>
                          Historic records dating back 400 years
                        </Text>
                        <View style={{ paddingBottom: 12 }}>
                          <ImeuwCount />
                        </View>
                        <View style={{ margin: 12 }}>
                          <TouchableOpacity
                            accessibilityLabel="searchbtn"
                            onPress={handleInputFocus}
                            disabled={searchloading}
                            style={{
                              borderWidth: 2,
                              zIndex: 2,
                              borderColor: NewTheme.colors.primaryOrange,
                              borderRadius: 8,
                              paddingVertical: 15,
                              flexDirection: 'row',
                              gap: 10,
                              alignItems: 'center',
                              backgroundColor: NewTheme.colors.whiteText,
                            }}>
                            {searchloading ? (
                              <ActivityIndicator
                                size="small"
                                color="theme.colors.blackText"
                              />
                            ) : (
                              <>
                                <View style={{ marginLeft: 15 }}>
                                  <Search />
                                </View>
                                <Text
                                  style={{
                                    color: theme.colors.darkOrange,
                                    fontWeight: 600,
                                    fontSize: 17,
                                  }}>
                                  Discover your Family
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </ImageBackground>
                    </View>
                  </Card>
                </View>
              </View>

              {/* Imeuswe Users */}
              <View style={{ backgroundColor: NewTheme.colors.backgroundCreamy }}>
                <Text style={styles.nameTitle}>iMeUsWe Users</Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 12,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                }}>
                <ImuwSearch />
              </View>

              <View
                style={{
                  paddingHorizontal: -5,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                }}>
                <TutorialVideos fromHome={true} />
              </View>

              {/* Carousel */}
              <View style={{ backgroundColor: NewTheme.colors.backgroundCreamy }}>
                <Text style={styles.nameTitle}>Testimonials</Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 12,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                }}>
                <ImeusCarousel />
              </View>

              {/* Feedback  */}

              <View
                style={{
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                  paddingBottom: 100,
                  paddingHorizontal: 12,
                  paddingTop: 36,
                }}>
                <View
                  style={{
                    shadowColor: NewTheme.colors.darkText,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 1,
                    borderRadius: 8,
                  }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    accessibilityLabel="sharefeedbackbtn"
                    onPress={() => GotoFeedback()}
                    style={styles.feedbackButton}>
                    <View style={styles.feedView}>
                      <View style={styles.feedMsg}>
                        <FeedbackMsg />
                      </View>
                      <Text style={styles.feedbackTitle}>
                        Share your valuable feedback
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <InviteModal
                visible={showModal}
                onClose={handleCloseModal}
                content={inviteContent}
                inviteEvent={'invite_tree_member'}
              />
              {/* </GlobalStyle> */}
              <View />
            </ScrollView>
            {/* Interstitial AD */}
            {/* {isSignedUp && <InterstitialAdComponent />} */}
            {isHelpDialogVisible && (
              <Help isVisible={isHelpDialogVisible} onClose={closeHelpDialog} />
            )}
          </SafeAreaView>
        )}
      </View>
      <CustomDialog
        visible={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Are you sure you want to logout?"
        confirmLabel="Logout"
        //message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
        confirmStyle={{ textTransform: null, fontSize: 18 }}
        cancelStyle={{ textTransform: null, fontSize: 18 }}
      />
    </ErrorBoundary.Screen>
  );
};
const styles = StyleSheet.create({
  content: {
    backgroundColor: NewTheme.colors.whiteText,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    color: NewTheme.colors.blackText,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: NewTheme.colors.blackText,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
    color: NewTheme.colors.blackText,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonText: {
    color: NewTheme.colors.whiteText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackButton: {
    backgroundColor: NewTheme.colors.primaryOrange,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  feedbackTitle: {
    color: NewTheme.colors.whiteText,
    fontWeight: '700',
    fontSize: 18,
  },
  feedMsg: {
    marginRight: 12,
    marginTop: 6,
  },
  feedView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  nameTitle: {
    fontWeight: '700',
    fontSize: 22,
    color: NewTheme.colors.secondaryDarkBlue,
    paddingVertical: 12,
    marginTop: 20,
    paddingHorizontal: 12,
  },
  nameTitleTree: {
    fontWeight: '700',
    fontSize: 22,
    color: NewTheme.colors.secondaryDarkBlue,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  imageBackground: {
    flex: 1,
    height: 270,
    overflow: 'hidden',
  },
  drawerOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '90%',
    height: '100%',
    backgroundColor: '#FFF8F0',
    zIndex: 2,
  },
  headerText: {
    color: NewTheme.colors.whiteText,
    fontSize: 18,
    marginLeft: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    zIndex: 1,
  },
});

export default Home;