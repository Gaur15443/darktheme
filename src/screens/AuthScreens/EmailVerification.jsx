import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';

import { Text, useTheme, Modal as ModalPaper, Portal } from 'react-native-paper';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Otp } from '../../components';
import TermsAndPolicy from '../../components/Auth/TermsAndPolicy/index';
import MobilesNewIcon from '../../images/Icons/MobilesIcon/index';
import { CustomInput } from '../../components';
import Facebook from '../../components/Auth/SocialLogin/facebook/Facebook';
import Googlelogin from '../../components/Auth/SocialLogin/Google/Googlelogin';
import AppleLogin from '../../components/Auth/SocialLogin/Apple/AppleLogin';
import PencilIcon from '../../images/Icons/Pencil-Icon';

import { CustomButton } from '../../core';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { sendEmailOtp } from '../../store/apps/auth';
import { mixpanel } from '../../../App';
import useNativeBackHandler from './../../hooks/useBackHandler';
import CleverTap from 'clevertap-react-native';
import LoaderButton from '../../core/UICompoonent/LoaderButton';
import BackgroundCounter from '../../common/BackgroundCounter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardStickyView,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import useKeyboardHeight from '../../hooks/useKeyboardheight';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import FastImage from '@d11/react-native-fast-image';
import { desanitizeInput } from '../../utils/sanitizers';
function EmailVerification({ route }) {
  const digitCount = 4;

  useNativeBackHandler(backAction);

  const theme = useTheme();
  const styles = createStyles();
  const auth = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const keyboardShown = useKeyboardHeight();
  const progress = useSharedValue(0);
  const windowHeight = Dimensions.get('window').height;

  const [email, setEmail] = useState('');
  const [otpKeys, setOtpKeys] = useState('');
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const [otpReset, setOtpReset] = useState(false);
  const [counterStart, setCounterStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const inProcessRef = useRef(false);
  const [timer, setTimer] = useState(180);

  const animatedSocialStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - progress.value * 2),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    height:
      (Platform.OS === 'ios' ? windowHeight - 210 : windowHeight - 170) +
      progress.value * 57,
  }));

  const isSubmittingOtpRef = useRef(false);
  const interValIdRef = useRef(false);
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  useKeyboardHandler(
    {
      onMove: e => {
        'worklet';
        progress.value = e.progress;
      },
    },
    {
      onEnd: e => {
        'worklet';
        progress.value = e.progress;
      },
    },
    [],
  );

  useEffect(() => {
    setEmail(route.params?.email || '');
  }, []);

  useEffect(() => {
    if (timer === 0) {
      clearInterval(interValIdRef.current);
      setTimer(180);
      setCounterStart(false);
    }
  }, [timer]);

  useEffect(
    () => () => {
      clearInterval(interValIdRef.current);
    },
    [],
  );

  function backAction() {
    if (showSignupOptions) {
      setShowSignupOptions(false);
    } else {
      navigation.goBack();
    }
    return true;
  }

  async function confirmEmail(e) {
    try {
      setLoading(true);

      inProcessRef.current = true;
      isSubmittingOtpRef.current = true;

      if (!otpKeys.length || otpKeys.length !== digitCount) {
        throw new Error('Please fill a valid otp');
      }
      const data = {
        email,
        verificationCode: otpKeys,
      };

      await AsyncStorage.removeItem('reChecking');
      let error;
      await auth.verifyEmail(data, _e => {
        error = _e;
      });

      if (error) {
        throw error;
      }
      /* customer io and mixpanel event chagnes  start */

      const cleverTapProps = {
        Email: data?.email, // Phone (with the country code, starting with +)
      };

      CleverTap.recordEvent('Verify_Email', cleverTapProps);

      mixpanel.track('verifyEmail', {
        email: data?.email,
      });
      /* customer io and mixpanel event chagnes  end */
      // TODO: Add signup stage.
      await AsyncStorage.removeItem('Signup');

      CleverTap.recordEvent('Profile_Details_Visited', cleverTapProps);

      mixpanel.track('Profile_Details_Visited', {
        email: data?.email,
      });
      navigation.navigate('ProfileDetails');
    } catch (error) {
      if (userManagementToastsConfig?.otp?.errors?.[error?.message]) {
        setOtpReset(true);
        const interValId = setTimeout(() => {
          clearTimeout(interValId);
        }, 150);
        Toast.show({
          type: 'error',
          text1: userManagementToastsConfig?.otp?.errors?.[error?.message],
        });
        return;
      }
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    } finally {
      inProcessRef.current = false;
      isSubmittingOtpRef.current = false;
      setLoading(false);
    }
  }

  function timeSetOutOtp() {
    setCounterStart(true);
    const interValId = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    interValIdRef.current = interValId;
  }

  async function resendConfirmationCode() {
    try {
      const data = {
        email,
      };

      timeSetOutOtp();
      await dispatch(sendEmailOtp(data)).unwrap();
      setOtpReset(true);
    } catch (error) {
      if (userManagementToastsConfig?.otp?.errors?.[error?.message]) {
        Toast.show({
          type: 'error',
          text1: userManagementToastsConfig?.otp?.errors?.[error?.message],
        });
        return;
      }
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    }
  }

  return (
    <View style={{ flex: 1 }} accessibilityLabel="email-verification-page">

      <View style={styles.parent}>
        <FastImage
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/newLogo.png',
          }}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('LoginWithOtp');
          }}
          style={styles.mobileIconContainer}>
          <MobilesNewIcon style={styles.mobileIcon} />
          <Text style={styles.mobileIcontext}>Mobile</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.bottomContainer, animatedStyle]}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Enter verification code</Text>
          <View
            style={{
              backgroundColor: '#e6e6e6',
              padding: 10,
              height: 43,
              borderWidth: 0.9,
              borderColor: '#898989',
              borderRadius: 8,
              marginTop: 10,
            }}>
            <Text
              accessibilityLabel="Email verify"
              style={{
                color: 'black',
                fontWeight: 600,
                fontSize: 16,
              }}>
              {desanitizeInput(email)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingTop: 5,
            }}>
            <Text
              style={{
                color: '#E77237',
                letterSpacing: 0,
              }}
              onPress={() => {
                navigation.navigate('SignUp');
              }}>
              <PencilIcon /> Change email?
            </Text>
          </View>

          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              marginTop: 14,
              fontWeight: Platform.OS === 'ios' ? 600 : 700,
              color: 'black',
              letterSpacing: 0,
            }}>
            OTP has been sent to your email
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 10,
              letterSpacing: 0,
              fontWeight: Platform.OS === 'ios' ? 600 : 700,
            }}>
            (Check your spam or junk folder )
          </Text>

          <View style={styles.otpContainer}>
            <Otp
              digitCount={digitCount}
              onGetKeys={e => {
                setOtpKeys(e);
              }}
              otpReset={otpReset}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={styles.didnotOtp} suppressHighlighting>
                Didn't get the OTP?{' '}
              </Text>
              {counterStart > 0 ? (
                <Text style={{ fontWeight: 700, paddingTop: 5 }}>
                  <BackgroundCounter
                    start={true}
                    startTime={180}
                    onStop={() => setCounterStart(false)}
                    style={{ color: '#E77237' }}
                  />
                </Text>
              ) : (
                !counterStart && (
                  <Text
                    style={styles.resendButton}
                    disabled={isSubmittingOtpRef.current}
                    accessibilityLabel="resend-otp"
                    onPress={resendConfirmationCode}>
                    Resend OTP
                  </Text>
                )
              )}
            </View>

            <Animated.View
              style={[styles.socialContainer, animatedSocialStyle]}>
              <View style={styles.socialrow}>
                <View style={styles.line} />
                <Text style={styles.Ortext}> Or </Text>
                <View style={styles.line} />
              </View>

              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginLeft: '43%',
                    marginRight: '48%',
                    gap: Platform.OS === 'ios' ? 70 : 70,
                  }}>
                  <Facebook accessibilityLabel="facebookAuth" />

                  <Googlelogin />

                  {Platform.OS === 'ios' && (
                    <AppleLogin accessibilityLabel="appleAuth" />
                  )}
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
        <KeyboardStickyView
          offset={{
            opened: Platform.OS === 'ios' ? 70 : 40,
          }}>
          {loading ? (
            <LoaderButton
              gradientStyles={{ padding: 0, borderRadius: 70, marginBottom: 10 }}
              style={styles.LoaderButton}
              accessibilityLabel="submit-otp"
              className="confirm-OTP"
              label="We are validating the OTP"
              loading={loading}
              disabled={otpKeys?.length < digitCount}
            />
          ) : (
            <CustomButton
              style={styles.confirmButton}
              accessibilityLabel="submit-otp"
              onPress={confirmEmail}
              label={'Confirm'}
              loading={loading}
              disabled={otpKeys?.length < digitCount}
            />
          )}
        </KeyboardStickyView>
        <TermsAndPolicy
          screenType="LoginWithMobile"
          style={styles.termsAndPolicyStyle}
        />
      </Animated.View>
    </View>
  );
}

// Create Styles
function createStyles() {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const { bottom } = useSafeAreaInsets();

  return StyleSheet.create({
    parent: {
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },

    logo: {
      width: '100%',
      height: 230,
      resizeMode: 'cover',
    },

    mobileIconContainer: {
      // display: "flex",
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 45,
      right: 15,
      backgroundColor: 'white',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
      elevation: 10,
    },

    mobileIcon: {
      marginRight: 5,
    },

    mobileIcontext: {
      color: '#868e96',
      fontSize: 14,
      fontWeight: Platform.OS === 'ios' ? 400 : 600,
      textAlign: 'center',
    },

    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      backgroundColor: '#FEF9F1',
      paddingHorizontal: 25,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,
      elevation: 10,
    },
    topSection: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: Platform.OS === 'ios' ? 600 : 700,
      marginTop: 20,
      marginBottom: 8,
      color: 'black',
    },

    otpContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
    didnotOtp: {
      fontSize: 12,
      letterSpacing: 0,
      fontWeight: Platform.OS === 'ios' ? 600 : 800,
      textAlign: 'center',
      color: 'black',
      marginTop: 5,
    },

    confirmButton: {
      marginBottom: 10,
    },

    LoaderButton: {
      padding: 10,
      borderRadius: 70,
    },

    termsAndPolicyStyle: {
      paddingTop: -10,
      paddingBottom: Platform.OS === 'ios' ? 50 : bottom || 20,
    },

    resendButton: {
      color: '#E77237',
      fontWeight: 700,
      paddingTop: 5,
    },
    timerText: {
      fontSize: 14,
      fontWeight: '600',
    },

    socialContainer: {
      marginTop: 25,
      alignItems: 'center',
    },

    socialrow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '90%',
    },

    line: {
      height: 1.3,
      flex: 1,
      fontWeight: '500',
      backgroundColor: 'black',
    },

    Ortext: {
      marginHorizontal: 10,
      fontSize: 12,
      marginBottom: 5,
    },

    googleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '90%',
      marginTop: 4,
      marginLeft: -20,
    },
  });
}

export default EmailVerification;
