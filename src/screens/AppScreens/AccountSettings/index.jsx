// import * as React from 'react';
import React, {useEffect, useState} from 'react';
import {
  Divider,
  List,
  Dialog,
  Portal,
  useTheme,
  Text,
  Avatar,
} from 'react-native-paper';
import Share from 'react-native-share';
import {CustomDialog, GlobalStyle} from '../../../core';
import {useSelector, useDispatch} from 'react-redux';
import {
  checkIsConsentAvailable,
  showPrivacyOptionsForm,
} from '../../../components/ads/gdprAdsConsent';
import Toast from 'react-native-toast-message';

import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {GlobalHeader} from '../../../components';
import {AuthContextFunc} from '../../../context/AuthContext';
import {
  LogoutIcon,
  RightIcon,
  ProfileSettings,
  HelpUsIcon,
  FaqIcon,
  FeedbaIcon,
  DigitalIcon,
  PrivacyIcon,
  AboutIcon,
  ChangeGDPRIcon,
  DnaIcon,
  AccountInstra,
  ShareApp,
  NewsIcon,
  OrderIcon,
} from '../../../images';
import {Track} from '../../../../App';
import {mixpanel} from '../../../../App';
import {Theme} from '../../../common';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DefaultImage} from '../../../core';
import {CloseIcon} from '../../../images/Icons/ModalIcon';
import {getUserInfo} from '../../../store/apps/userInfo';
import ButtonSpinner from '../../../common/ButtonSpinner';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {desanitizeInput} from '../../../utils/sanitizers';

const AccountSettings = ({route}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {logout} = AuthContextFunc();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDigitalHeirsDialog, setShowDigitalHeirsDialog] = useState(false);
  const [showNewsDialog, setShowNewsDialog] = useState(false);
  const [isConsentAvailable, setIsConsentAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const dispatch = useDispatch();
  const userData = useSelector(state => state?.userInfo);
  const {top} = useSafeAreaInsets();
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

  const [appVersion, setAppVersion] = useState('');
  const [refresh, setRefresh] = useState(false);
  const userInfo = useSelector(state => state?.userInfo);
  const email = useSelector(state => state?.userInfo.email);
  const name = userInfo?.personalDetails?.name || '';
  const middleName = userInfo?.personalDetails?.middlename || '';
  const lastName = userInfo?.personalDetails?.lastname || '';

  const fullName = `${name}${middleName ? ` ${middleName}` : ''} ${lastName}`;

  const truncatedFullName =
    fullName.length > 23 ? `${fullName.slice(0, 23)}...` : fullName;

  const GotoFeedback = async () => {
    navigation.navigate('Feedback');
  };

  const GotoProfileSettings = () => {
    navigation.navigate('ProfileSettings', {refresh: refresh});
  };

  const GotoFeedbackSurvey = () => {
    navigation.navigate('FeedbackSurvey');
  };

  const GotoFaq = () => {
    navigation.navigate('Faq');
  };

  const GotoNews = () => {
    navigation.navigate('News');
  };

  const GotoAboutUs = () => {
    navigation.navigate('AboutUs');
  };

  const GoToPrivacy = () => {
    navigation.navigate('Privacy');
  };

  const GoToDna = () => {
    navigation.navigate('AccountDna');
  };

  const GoToOrder = () => {
    navigation.navigate('MyOrder');
  };

  const handleSocialMediaPress = url => {
    Linking.openURL(url);
  };

  const onShare = async () => {
    const fixedUrl = 'https://imeuswe.app/';
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
      failOnCancel: false,
    };
    await Share.open(options);
  };

  function handleBack() {
    navigation.goBack();
  }

  // GDPR Consent
  useEffect(() => {
    checkIsConsentAvailable().then(isAvailable => {
      setIsConsentAvailable(isAvailable);
    });
  }, []);

  useEffect(() => {
    setRefresh(!refresh);
  }, [route?.params?.refresh]);
  useEffect(() => {
    setAppVersion(DeviceInfo.getVersion());
  }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const fetchData = async () => {
  //       try {
  //         const getUserDetails = async () => {
  //           setLoading(true);
  //           await dispatch(getUserInfo()).unwrap();
  //           setLoading(false);
  //         };
  //         getUserDetails();
  //       } catch (error) {
  //         Toast.show({
  //           type: 'error',
  //           text1: error.message,
  //         });
  //       }
  //     };
  //     fetchData();
  //   }, []),
  // );

  const handlePress = () => {
    setIsPressed(!isPressed);
    GoToDna();
  };

  const handlePressImprove = () => {
    setIsPressed(!isPressed);
    GotoFeedbackSurvey();
  };

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        onBack={handleBack}
        heading={'Account Settings'}
        backgroundColor={Theme.light.background}
        fontSize={20}
      />
      <View
        style={{paddingBottom: top}}
        accessibilityLabel="account-settings-page">
        <ScrollView showsVerticalScrollIndicator={false}>
          <GlobalStyle>
            <View style={{marginBottom: 100, paddingTop: 20}}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}>
                <View>
                  {loading ? (
                    <ButtonSpinner />
                  ) : (
                    <>
                      {userInfo?.personalDetails?.profilepic ? (
                        <Avatar.Image
                          size={45}
                          source={{uri: userInfo?.personalDetails?.profilepic}}
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
                  <Text style={styles.headerText}>
                    {desanitizeInput(truncatedFullName)}
                  </Text>
                  <Text style={{color: 'black', marginLeft: 16}}>
                    {desanitizeInput(email)}
                  </Text>
                </View>
              </View>

              <View style={{paddingTop: 20}}>
                <List.Section>
                  <TouchableOpacity
                    onPress={handlePress}
                    style={{
                      marginBottom: 12,
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                    <List.Item
                      titleStyle={{
                        fontWeight: '600',
                        paddingLeft: 3,
                      }}
                      title="iMeUsWe DNA"
                      style={styles.additionalContentDna}
                      left={() => <DnaIcon />}
                      right={() => <RightIcon />}
                      onPress={() => GoToDna()}
                      accessibilityLabel="imeuswe-dna"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePressImprove}
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                    <List.Item
                      titleStyle={{fontWeight: '600'}}
                      title="Help us improve the app"
                      style={styles.additionalContent}
                      left={() => <HelpUsIcon />}
                      right={() => <RightIcon />}
                      onPress={() => GotoFeedbackSurvey()}
                      accessibilityLabel="help-us-improve-app"
                    />
                  </TouchableOpacity>
                  <List.Subheader
                    style={{fontWeight: '700', fontSize: 18, color: '#035997'}}>
                    Settings
                  </List.Subheader>
                  <List.Item
                    titleStyle={{paddingLeft: 1}}
                    title="Profile Settings"
                    left={() => <ProfileSettings />}
                    right={() => <RightIcon />}
                    onPress={() => GotoProfileSettings()}
                    accessibilityLabel="ProfileSettings"
                    style={{paddingRight: 23, paddingLeft: 18, marginTop: 10}}
                  />
                  <Divider />
                  {/* GDPR Consent */}
                  {(isConsentAvailable || isConsentAvailable === 1) && (
                    <>
                      <List.Item
                        titleStyle={{paddingLeft: 1}}
                        title="GDPR Settings"
                        left={() => <ChangeGDPRIcon />}
                        right={() => <RightIcon />}
                        onPress={() => showPrivacyOptionsForm()}
                        accessibilityLabel="gdpr-settings"
                        style={{
                          paddingLeft: 18,
                          paddingRight: 23,
                          fontWeight: 600,
                        }}
                      />
                      <Divider />
                    </>
                  )}
                  <Divider />
                  <List.Subheader
                    style={{fontWeight: '700', fontSize: 18, color: '#035997'}}>
                    Support
                  </List.Subheader>
                  <List.Item
                    titleStyle={{marginLeft: 1.3}}
                    title="FAQs"
                    left={() => <FaqIcon />}
                    right={() => <RightIcon />}
                    onPress={() => GotoFaq()}
                    accessibilityLabel="FAQs"
                    style={{paddingRight: 23, paddingLeft: 16, fontWeight: 600}}
                  />
                  <Divider />
                  <List.Item
                    titleStyle={{marginLeft: 0.6}}
                    title="Get Help"
                    left={() => <FeedbaIcon />}
                    right={() => <RightIcon />}
                    onPress={() => GotoFeedback()}
                    accessibilityLabel="GiveFeedbackToiMeUsWe"
                    style={{paddingRight: 23, paddingLeft: 18, fontWeight: 600}}
                  />
                  <Divider />
                  <List.Subheader
                    style={{fontWeight: '700', fontSize: 18, color: '#035997'}}>
                    General
                  </List.Subheader>
                  <List.Item
                    titleStyle={{marginLeft: 2}}
                    title="My Orders"
                    left={() => <OrderIcon />}
                    right={() => <RightIcon />}
                    accessibilityLabel="Orders"
                    onPress={() => GoToOrder()}
                    style={{
                      paddingLeft: 18,
                      paddingRight: 23,
                      fontWeight: 600,
                    }}
                  />
                  <Divider />
                  <List.Item
                    titleStyle={{marginLeft: 3}}
                    title="News"
                    left={() => <NewsIcon />}
                    right={() => <RightIcon />}
                    style={{
                      paddingLeft: 18,
                      paddingRight: 23,
                      fontWeight: 600,
                    }}
                    accessibilityLabel="News"
                    onPress={() => GotoNews()}
                  />
                  <Divider />
                  <List.Item
                    titleStyle={{marginLeft: 1}}
                    title="Digital Legacy Heirs"
                    left={() => <DigitalIcon />}
                    right={() => <RightIcon />}
                    accessibilityLabel="DigitalLegacyHeirs"
                    onPress={() => setShowDigitalHeirsDialog(true)}
                    style={{
                      paddingLeft: 18,
                      paddingRight: 23,
                      fontWeight: 600,
                    }}
                  />
                  <Divider />
                  <List.Item
                    titleStyle={{marginLeft: 2}}
                    title="Privacy Policy"
                    left={() => <PrivacyIcon />}
                    right={() => <RightIcon />}
                    onPress={() => GoToPrivacy()}
                    accessibilityLabel="PrivacyPolicy"
                    style={{paddingRight: 24, paddingLeft: 18, fontWeight: 600}}
                  />
                  <Divider />
                  <List.Item
                    titleStyle={{marginLeft: 1}}
                    title="About iMeUsWe"
                    left={() => <AboutIcon />}
                    right={() => <RightIcon />}
                    onPress={() => GotoAboutUs()}
                    accessibilityLabel="AboutiMeUsWe"
                    style={{paddingRight: 24, paddingLeft: 18, fontWeight: 600}}
                  />
                  <Divider />
                  <List.Item
                    title="Follow us on Instagram"
                    left={() => <AccountInstra />}
                    // right={() => <RightIcon />}
                    onPress={() =>
                      handleSocialMediaPress(
                        'https://www.instagram.com/imeuswe/',
                      )
                    }
                    accessibilityLabel="InstraiMeUsWe"
                    style={{paddingRight: 24, paddingLeft: 18, fontWeight: 600}}
                  />

                  <Divider />
                  <List.Item
                    titleStyle={{marginLeft: 4}}
                    title="Share the app"
                    left={() => <ShareApp />}
                    // right={() => <RightIcon />}
                    onPress={() => onShare()}
                    accessibilityLabel="ShareApp"
                    style={{paddingRight: 24, paddingLeft: 18, fontWeight: 600}}
                  />
                  <Divider />
                  <List.Item
                    // titleStyle={{marginLeft: -15}}
                    accessibilityLabel="showlogoutpopupbutton"
                    onPress={() => setShowLogoutDialog(true)}
                    style={{
                      paddingRight: 22,
                      paddingLeft: 18,
                      fontWeight: 600,
                    }}
                    title="Logout"
                    left={() => <LogoutIcon />}
                  />
                  <Divider />
                </List.Section>
              </View>
              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version {appVersion}</Text>
              </View>
              {/* Popup For Logout */}
              <CustomDialog
                visible={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                title="Are you sure you want to logout?"
                confirmLabel="Logout"
                //message="Are you sure you want to logout?"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutDialog(false)}
                confirmStyle={{textTransform: null, fontSize: 18}}
                cancelStyle={{textTransform: null, fontSize: 18}}
              />

              {showDigitalHeirsDialog && (
                <Portal>
                  <Dialog
                    visible={showDigitalHeirsDialog}
                    onDismiss={() => setShowDigitalHeirsDialog(false)}
                    style={{
                      backgroundColor: theme.colors.onWhite100,
                      marginHorizontal: 50,
                      borderRadius: 8,
                    }}>
                    <TouchableOpacity
                      accessibilityLabel="close-digital-legacy-dialog-"
                      onPress={() => setShowDigitalHeirsDialog(false)}
                      style={styles.closeButton}>
                      <CloseIcon />
                    </TouchableOpacity>
                    <Dialog.Title style={styles.title}>
                      Digital Legacy Heirs
                    </Dialog.Title>
                    <Dialog.Content>
                      <Text style={styles.message}>Feature coming soon!</Text>
                    </Dialog.Content>
                  </Dialog>
                </Portal>
              )}

              {showNewsDialog && (
                <Portal>
                  <Dialog
                    visible={showNewsDialog}
                    onDismiss={() => setShowNewsDialog(false)}
                    style={{
                      backgroundColor: theme.colors.onWhite100,
                      marginHorizontal: 50,
                      borderRadius: 8,
                    }}>
                    <TouchableOpacity
                      accessibilityLabel="close-news-dialog-"
                      onPress={() => setShowNewsDialog(false)}
                      style={styles.closeButton}>
                      <CloseIcon />
                    </TouchableOpacity>
                    <Dialog.Title style={styles.title}>News</Dialog.Title>
                    <Dialog.Content>
                      <Text style={styles.message}>Feature coming soon!</Text>
                    </Dialog.Content>
                  </Dialog>
                </Portal>
              )}
            </View>
          </GlobalStyle>
        </ScrollView>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  additionalContent: {
    borderWidth: 1,
    borderColor: '#CDCED2',
    borderRadius: 10,
    color: 'red',
    padding: 12,
    fontWeight: '600',
    paddingLeft: 14.3,
  },
  additionalContentDna: {
    borderWidth: 1,
    borderColor: '#CDCED2',
    borderRadius: 10,
    color: 'red',
    padding: 12,
    fontWeight: '600',
    paddingLeft: 17,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  versionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontWeight: '600',
    color: '#8A9A9D',
  },
  closeButton: {
    position: 'absolute',
    top: -35,
    right: -6,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 9,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  headerText: {
    color: 'black',
    fontSize: 20,
    marginLeft: 16,
    fontWeight: 'bold',
  },
});

export default AccountSettings;
