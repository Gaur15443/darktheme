import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../../core';
import { Otp } from '../../components';
import TermsAndPolicy from '../../components/Auth/TermsAndPolicy/index';

import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { resendOtpMobile } from '../../store/apps/auth';
import { mixpanel } from '../../../App';
import CleverTap from 'clevertap-react-native';
import EmailNewIcon from '../../images/Icons/EmailNewIcon';
import PencilIcon from '../../images/Icons/Pencil-Icon';
import LoaderButton from '../../core/UICompoonent/LoaderButton';
import BackgroundCounter from '../../common/BackgroundCounter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardStickyView,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import FastImage from '@d11/react-native-fast-image';

function VerifyMobileOTP({ route }) {
  const digitCount = 4;
  const theme = useTheme();
  const auth = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const styles = useCreateStyles();
  const iso = useRef('');
  const countryCode = useRef('');

  const inProcessRef = useRef(false);
  const isSubmittingOtpRef = useRef(false);
  const interValIdRef = useRef(false);

  const [mobile, setMobile] = useState('');
  const [countryCodeNo, setCountryCodeNo] = useState('');
  const [otpKeys, setOtpKeys] = useState('');
  const [otpReset, setOtpReset] = useState(false);
  const [counterStart, setCounterStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(180);
  const [clipboardPastedOtp, setClipboardPastedOtp] = useState('');
  const [showResendCTC, setShowResendCTC] = useState(false);

  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );
  const userData = useSelector(state => state?.userInfo);
  const mobileNumber = useSelector(state => state.authSlice.mobileNumber);
  const countryCodeStore = useSelector(state => state.authSlice.countryCode);
  const windowHeight = Dimensions.get('window').height;
  const progress = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    height:
      (Platform.OS === 'ios' ? windowHeight - 210 : windowHeight - 170) +
      progress.value * 57,
  }));

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
    if (route.params?.mobileNo) {
      setMobile(route.params?.mobileNo);
    }
    if (route.params?.countryCode) {
      setCountryCodeNo(route.params?.countryCode);
    }
  }, [route.params]);

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

  async function confirmMobile(e) {
    try {
      setLoading(true);

      inProcessRef.current = true;
      isSubmittingOtpRef.current = true;

      if (!otpKeys.length || otpKeys.length !== digitCount) {
        throw new Error('Please fill a valid otp');
      }

      const data = {
        mobileNo: Number(mobile),
        otp: otpKeys,
      };

      await AsyncStorage.removeItem('reChecking');
      let error;
      await auth.verifyMobile(data, _e => {
        error = _e;
      });

      /* customer io and mixpanel event chagnes  start */
      const phoneNo = data?.mobileNo ? '+' + data?.mobileNo : '';
      const cleverTapProps = {
        Identity: userData?._id,
        Phone: phoneNo, // Phone (with the country code, starting with +)
      };

      CleverTap.recordEvent('Verify_Mobile', cleverTapProps);
      mixpanel.track('Verify_Mobile', {
        user_id: userData?._id,
        phone: phoneNo,
      });
      /* customer io and mixpanel event chagnes  end */

      if (error) {
        throw error;
      }

      // TODO: Add signup stage.
      await AsyncStorage.removeItem('Signup');

      if (route.params.reDirecttoHome) {
        navigation.navigate('Home');
      } else {
        /* customer io and mixpanel event chagnes  start */
        const phoneNo = data?.mobileNo ? '+' + data?.mobileNo : '';
        const cleverTapProps = {
          Identity: userData?._id,
          Phone: phoneNo, // Phone (with the country code, starting with +)
        };

        CleverTap.recordEvent('Profile_Details_Visited', cleverTapProps);
        mixpanel.track('Profile_Details_Visited', {
          user_id: userData?._id,
          phone: phoneNo,
        });
        /* customer io and mixpanel event chagnes  end */
        navigation.navigate('ProfileDetails');
      }
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

  async function resendMobileOTP() {
    try {
      setShowResendCTC(false);
      const data = {
        mobileNo: Number(mobile),
      };

      timeSetOutOtp();
      await dispatch(resendOtpMobile(data)).unwrap();
      setOtpReset(true);
      /* customer io and mixpanel event chagnes  start */
      const phoneNo = data?.mobileNo ? '+' + data?.mobileNo : '';
      const cleverTapProps = {
        Identity: userData?._id,
        Phone: phoneNo, // Phone (with the country code, starting with +)
      };

      CleverTap.recordEvent('Resend_Mobile_OTP', cleverTapProps);
      mixpanel.track('Resend_Mobile_OTP', {
        user_id: userData?._id,
        phone: phoneNo,
      });
      /* customer io and mixpanel event chagnes  end */
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

  const formatMobileNumber = num => {
    if (!num) return '';

    const numStr = num.toString().replace(/\D/g, '');
    const cleanCountryCode =
      countryCodeStore?.toString().replace(/\D/g, '') || '';

    if (cleanCountryCode && numStr.startsWith(cleanCountryCode)) {
      const localNumber = numStr.substring(cleanCountryCode.length);
      return `${cleanCountryCode} ${localNumber}`;
    }

    if (cleanCountryCode) {
      return `${cleanCountryCode} ${numStr}`;
    }

    return numStr;
  };

  return (
    <View style={{ flex: 1 }} accessibilityLabel="presignup-page">
      <View style={styles.parent}>
        <FastImage
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/newLogo.png',
          }}
          style={styles.logo}
        />

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SignUp');
          }}
          style={styles.iconContainer}>
          <EmailNewIcon style={styles.emailIcon} />
          <Text style={styles.emailText}>Email</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.bottomContainer, animatedStyle]}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Enter verification code</Text>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            }}>
            <Text style={{ color: 'black' }}>
              Sent to +{formatMobileNumber(mobileNumber)}
            </Text>
            <PencilIcon
              onPress={() => {
                navigation.navigate('LoginWithOtp');
              }}
            />
          </View>

          <View style={styles.otpContainer}>
            <Otp
              onClipboardPasted={otp => setOtpKeys(otp)}
              digitCount={digitCount}
              onGetKeys={e => {
                setOtpKeys(e);
              }}
              otpReset={otpReset}
            />
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text style={styles.didnotOtp} suppressHighlighting>
              Didn't get the OTP?{' '}
            </Text>
            <Text>
              {counterStart > 0 ? (
                <Text style={{ color: '#E77237', fontWeight: 600 }}>
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
                    onPress={() => setShowResendCTC(true)}>
                    Resend OTP
                  </Text>
                )
              )}
            </Text>
          </View>
          <Text style={styles.infoText}>
            It may take up to a minute for your OTP to reach you
          </Text>
        </View>

        {/*  Confirm and Loaderbutton */}
        <View>
          <KeyboardStickyView
            offset={{
              opened: Platform.OS === 'ios' ? 70 : 40,
            }}>
            {loading ? (
              <LoaderButton
                gradientStyles={{
                  padding: 0,
                  borderRadius: 70,
                  marginBottom: 10,
                }}
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
                onPress={confirmMobile}
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
        </View>
      </Animated.View>

      {/* Resend CTC */}
      {showResendCTC && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              marginHorizontal: 12,
            }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                textAlign: 'center',
                marginVertical: 9,
                color: '#000000',
              }}>
              Didn’t get the OTP?
            </Text>

            <View
              style={{
                backgroundColor: '#fcebe3',
                marginHorizontal: 7,
                borderRadius: 8,
                padding: 10,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  marginBottom: 7,
                  color: '#000000',
                }}>
                How you’ll receive your OTP ?
              </Text>

              <Text style={styles.resendInfoText}>
                📩 Mobile numbers with Indian country code (+91) will receive
                the OTP via SMS.
              </Text>

              <Text style={styles.resendInfoText}>
                💬 Mobile numbers with other country codes will receive the OTP
                via WhatsApp.
              </Text>

              <Text style={styles.resendInfoText}>
                Please ensure your number is correct and reachable on the
                respective platform.
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 8,
                gap: 20,
              }}>
              <TouchableOpacity onPress={() => setShowResendCTC(false)}>
                <View
                  style={{
                    borderBottomWidth: 0.9,
                    borderBottomColor: '#454545',
                    paddingBottom: 1.5,
                  }}>
                  <Text
                    style={{
                      color: '#454545',
                      fontWeight: '700',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendCTCButton}
                onPress={resendMobileOTP}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// Create Styles
function useCreateStyles() {
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

    // Style for the icon
    iconContainer: {
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
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 10,
    },

    emailIcon: {
      marginRight: 5,
    },

    emailText: {
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
      color: 'black',
      fontSize: 16,
      fontWeight: Platform.OS === 'ios' ? 600 : 800,
      marginTop: 20,
      marginBottom: 8,
    },
    otpContainer: {
      marginTop: 15,
      marginBottom: 15,
    },
    didnotOtp: {
      color: 'black',
      fontSize: 12,
      letterSpacing: 0,
      fontWeight: Platform.OS === 'ios' ? 600 : 800,
    },
    infoText: {
      fontSize: 10,
      color: '#75747a',
      fontWeight: 600,
      marginTop: 2,
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
    // Resend CTC
    resendInfoText: {
      fontSize: 10.5,
      marginBottom: 3,
      fontWeight: '500',
      color: '#000000',
    },
    resendCTCButton: {
      backgroundColor: '#E26A35',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 6,
    },
  });
}

export default VerifyMobileOTP;
