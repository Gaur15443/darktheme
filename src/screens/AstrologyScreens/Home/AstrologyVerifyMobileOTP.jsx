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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CustomButton } from '../../../core';
import { Otp } from '../../../components';
import TermsAndPolicy from '../../../components/Auth/TermsAndPolicy/index';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { resendOtpMobile } from '../../../store/apps/auth';
import { mixpanel } from '../../../../App';
import CleverTap from 'clevertap-react-native';
import EmailNewIcon from '../../../images/Icons/EmailNewIcon';
import PencilIcon from '../../../images/Icons/Pencil-Icon';
import LoaderButton from '../../../core/UICompoonent/LoaderButton';
import BackgroundCounter from '../../../common/BackgroundCounter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '../../../context/WalletContext';
import {
  KeyboardStickyView,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import FastImage from '@d11/react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';
import { BackArrowIcon } from '../../../images';

function AstrologyVerifyMobileOTP({ route }) {
  const digitCount = 4;
  const theme = useTheme();
  const auth = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const styles = useCreateStyles();
  const UserEmail = useSelector(state => state?.userInfo?.email);
  const iso = useRef('');
  const countryCode = useRef('');
  const { setIsVerified, fetchWalletData } = useWallet();
  const inProcessRef = useRef(false);
  const isSubmittingOtpRef = useRef(false);
  const interValIdRef = useRef(false);
  const [showPencilIcon, setShowPencilIcon] = useState(true);
  const [mobile, setMobile] = useState('');
  const [countryCodeNo, setCountryCodeNo] = useState('');
  const [otpKeys, setOtpKeys] = useState('');
  const [otpReset, setOtpReset] = useState(false);
  const [counterStart, setCounterStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const { onVerified } = route.params || {};

  const [isFlagVerified, setIsFlagVerified] = useState(false);
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
      (Platform.OS === 'ios' ? windowHeight - 210 : windowHeight - 200) +
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
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // Disable iOS swipe-back gesture
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', e => {
        // if (!isFlagVerified) {
        //   // Prevent navigation if not verified
        //   e.preventDefault();
        //   Alert.alert(
        //     'Verification Required',
        //     'Please verify your mobile number to proceed. You cannot go back until verification is complete.',
        //     [
        //       {
        //         text: 'OK',
        //         onPress: () => {
        //           // Stay on this page (do nothing, or redirect explicitly if needed)
        //         },
        //       },
        //     ],
        //     {cancelable: false},
        //   );
        // }
      });

      return unsubscribe;
    }, [navigation, isFlagVerified]),
  );

  function formatTime(numberOfSeconds) {
    const minutes = Math.floor(numberOfSeconds / 60);
    const remainingSeconds = numberOfSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  useEffect(() => {
    console.log('🔍 OTP Screen route params:', route.params);
  }, [route]);

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
        email: UserEmail,
      };

      await AsyncStorage.removeItem('reChecking');
      let error;
      await auth.verifyMobile(data, _e => {
        error = _e;
      });

      if (error) {
        throw error;
      }
      setIsFlagVerified(true);
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
      setIsVerified(true);

      if (userData?._id) {
        await fetchWalletData(userData._id);
      }
      // TODO: Add signup stage.
      await AsyncStorage.removeItem('Signup');

      if (onVerified) {
        console.log('onVerified callback found, executing...');
        onVerified();
      } else if (route.params?.navigationTarget) {
        console.log(
          'No onVerified, navigating to navigationTarget:',
          route.params.navigationTarget,
        );

        const target = route.params.navigationTarget;

        if (['AstroHome', 'Reports', 'Consultation'].includes(target)) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'AstroBottomTabs',
                params: { screen: target },
              },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: target }],
          });
        }
      }

      // } else {
      //   navigation.navigate('ProfileDetails');
      // }
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
        email: UserEmail,
        countryCode: countryCode.current,
      };
      setShowPencilIcon(false);
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

  const formatMobileNumber = (num = '') => {
    const numStr = num.toString().replace(/\D/g, '');

    if (!numStr) return '';

    // country codes are usually 1 to 3 digits — take first 2 or 3 for India
    const guessedCode =
      numStr.length > 10 ? numStr.slice(0, numStr.length - 10) : '';
    const localNumber = numStr.slice(-10); // last 10 digits as mobile number

    if (guessedCode) {
      return `+${guessedCode} ${localNumber}`;
    }

    return localNumber;
  };

  return (
    <View style={{ flex: 1 }} accessibilityLabel="presignup-page">
      <View style={styles.parent}>
        <FastImage
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/astrology-logo2.png',
          }}
          style={styles.logo}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconContainer}>
          <BackArrowIcon fill="#fff" />
        </TouchableOpacity>

        <LinearGradient
          colors={['#4B309F', '#0E0E10']} // Your gradient colors
          style={[styles.bottomContainer]}>
          <Animated.View style={[animatedStyle]}>
            <View style={styles.topSection}>
              <Text style={styles.title}>Enter verification code</Text>

              {/* <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
              }}>
              <Text style={{color: 'white'}}>Sent to +{mobile}</Text>
              <PencilIcon
                onPress={() => {
                  navigation.navigate('AstrologyLoginWithMobile');
                }}
                fill="white"
              />
            </View> */}

              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', marginRight: 6 }}>
                  Sent to {formatMobileNumber(mobile)}
                </Text>
                {showPencilIcon && (
                  <PencilIcon
                    onPress={() => {
                      navigation.navigate('AstrologyLoginWithMobile', {
                        navigationTarget:
                          route.params?.navigationTarget || 'AstroHome',
                      });
                    }}
                    fill="white"
                    style={{ marginLeft: -2 }}
                  />
                )}
              </View>

              <View style={styles.otpContainer}>
                <Otp
                  onClipboardPasted={otp => setOtpKeys(otp)}
                  digitCount={digitCount}
                  onGetKeys={e => {
                    setOtpKeys(e);
                  }}
                  otpReset={otpReset}
                  inputStyle={{
                    borderColor: 'white',
                    color: 'white',
                  }}
                  boxStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)', // translucent white
                    borderRadius: 10,
                    borderWidth: 0.1,
                    borderColor: '#E0E0E0', // soft gray-white border (adjust as needed)
                    elevation: 4,
                  }}
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
                        style={{ color: 'white' }}
                      />
                    </Text>
                  ) : (
                    !counterStart && (
                      <Text
                        style={styles.resendButton}
                        disabled={isSubmittingOtpRef.current}
                        accessibilityLabel="resend-otp"
                        onPress={() => setShowResendCTC(true)}>
                        <Text style={styles.resendButtonText}>Resend OTP</Text>
                      </Text>
                    )
                  )}
                </Text>
              </View>
            </View>

            {/*  Confirm and Loaderbutton */}
            <View style={{ paddingHorizontal: 15 }}>
              <KeyboardStickyView
                offset={{
                  opened: Platform.OS === 'ios' ? 50 : 40,
                }}>
                {loading ? (
                  <LoaderButton
                    gradientColor={['#FFFFFF', 'rgba(255,255,255,0.5)']}
                    gradientStyles={{
                      padding: 0,
                      borderRadius: 70,
                      marginBottom: 10,
                      opacity: 1,
                    }}
                    style={styles.LoaderButton}
                    accessibilityLabel="submit-otp"
                    className="confirm-OTP"
                    label="We are validating the OTP"
                    color="#6944D3"
                    spinnerColor="#6944D3"
                    loading={loading}
                    // disabled={otpKeys?.length < digitCount}
                    disabled={otpKeys.replace(/\s/g, '').length !== digitCount}
                  />
                ) : (
                  <CustomButton
                    // style={styles.confirmButton}
                    style={
                      otpKeys.replace(/\s/g, '').length === digitCount
                        ? styles.confirmButtonEnable
                        : styles.confirmButton
                    }
                    accessibilityLabel="submit-otp"
                    onPress={confirmMobile}
                    label={'Confirm'}
                    loading={loading}
                    color={'#6944D3'}
                    // disabled={otpKeys?.length < digitCount}
                    disabled={otpKeys.replace(/\s/g, '').length !== digitCount}
                  />
                )}
                <TermsAndPolicy
                  screenType="LoginWithMobile"
                  style={styles.termsAndPolicyStyle}
                  linkStyle={{
                    color: '#6944D3',
                    fontSize: Platform.OS === 'ios' ? 12 : 9,
                  }}
                  textStyle={{
                    color: 'white',
                    fontSize: Platform.OS === 'ios' ? 12 : 9,
                  }}
                />
              </KeyboardStickyView>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>

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
              backgroundColor: '#78728f',
              borderRadius: 8,
              marginHorizontal: 12,
            }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                textAlign: 'center',
                marginVertical: 9,
                color: '#fff',
              }}>
              Didn’t get the OTP?
            </Text>

            <View
              style={{
                backgroundColor: '#958fa6',
                marginHorizontal: 7,
                borderRadius: 8,
                padding: 10,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  marginBottom: 7,
                  color: '#ffff',
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
                    borderBottomColor: '#ffff',
                    paddingBottom: 1.5,
                  }}>
                  <Text
                    style={{
                      color: '#ffff',
                      fontWeight: '700',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendCTCButton}
                onPress={resendMobileOTP}>
                <Text style={{ color: '#ffff', fontWeight: '700' }}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

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
        height: 280,
        resizeMode: 'cover',
      },

      // Style for the icon
      iconContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 45,
        left: 5,
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
        // height: Platform.OS === 'ios' ? windowHeight - 190 : windowHeight - 180,
        backgroundColor: '#FEF9F1',
        paddingHorizontal: Platform.OS === 'ios' ? 0 : 25,
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
        paddingHorizontal: Platform.OS === 'ios' ? 25 : 0,
      },
      title: {
        color: 'white',
        fontSize: 16,
        fontWeight: Platform.OS === 'ios' ? 600 : 800,
        marginTop: 20,
        marginBottom: 8,
      },
      otpContainer: {
        alignItems: 'flex-start', // aligns child (Otp) to the left
        justifyContent: 'center', // optional: vertical alignment
        paddingHorizontal: 10,
        marginTop: 15,
        marginBottom: 15,
      },
      didnotOtp: {
        color: 'white',
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
        backgroundColor: 'white',
        opacity: 0.6,
      },
      CustomButton: {
        marginBottom: 10,
        backgroundColor: 'white',
      },
      confirmButtonEnable: {
        marginBottom: 10,
        backgroundColor: 'white',
      },
      LoaderButton: {
        padding: 10,
        borderRadius: 70,
      },

      labelStyle: {
        color: '#6944D3', // Purple text
        fontSize: 16,
        fontWeight: '600',
      },
      buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      confirmButtonLoading: {
        backgroundColor: 'white',
        opacity: 1,
      },
      confirmButtonBase: {
        marginBottom: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
      },

      termsAndPolicyStyle: {
        // flex: 1,
        // flexDirection: 'row',
        paddingTop: -10,
        paddingBottom: Platform.OS === 'ios' ? 50 : bottom || 10,
      },

      resendButton: {
        marginLeft: 10,
        color: 'white',
      },
      resendButtonText: {
        color: '#8220D8',
      },
      timerText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'pink',
      },
      // Resend CTC
      resendInfoText: {
        fontSize: 10.5,
        marginBottom: 3,
        fontWeight: '500',
        color: '#ffff',
      },
      resendCTCButton: {
        backgroundColor: '#8321d9',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
      },
    });
  }
}

export default AstrologyVerifyMobileOTP;