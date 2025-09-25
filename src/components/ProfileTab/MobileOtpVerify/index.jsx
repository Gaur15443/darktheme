// MobileOTPverification.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import PencilIcon from '../../../images/Icons/Pencil-Icon';
import { Button, useTheme } from 'react-native-paper';
import { resendOtpMobile } from '../../../store/apps/auth';
import { CloseIcon } from '../../../images';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { mixpanel } from '../../../../App';
import CleverTap from 'clevertap-react-native';
import Otp from '../../Otp';
import LoaderButton from '../../../core/UICompoonent/LoaderButton';
import { CustomButton } from '../../../core';
import BackgroundCounter from '../../../common/BackgroundCounter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import parsePhoneNumber from 'libphonenumber-js';
import FastImage from '@d11/react-native-fast-image';

const MobileOTPverification = () => {
  const digitCount = 4;
  const theme = useTheme();
  const auth = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const styles = useCreateStyles();

  const iso = useRef('');
  const countryCode = useRef('');
  const { bottom } = useSafeAreaInsets();

  const [mobile, setMobile] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [countryCodeNo, setCountryCodeNo] = useState('');
  const [otpKeys, setOtpKeys] = useState('');
  const [otpReset, setOtpReset] = useState(false);
  const [counterStart, setCounterStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const inProcessRef = useRef(false);
  const [timer, setTimer] = useState(180);

  const isSubmittingOtpRef = useRef(false);
  const interValIdRef = useRef(false);

  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const mobileNoUser = useSelector(state => state?.userInfo.mobileNo);
  const userId = useSelector(state => state?.userInfo._id);
  const userData = useSelector(state => state?.userInfo);
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );

  const getUserDetails = async (params = null) => {
    await dispatch(fetchUserProfile(params || userId)).unwrap();
    setIsIndicatorLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      try {
        if (!basicInfo) {
          if (userId) {
            getUserDetails(userId);
          }
        }
      } catch (error) { }
    }, [basicInfo, userId]),
  );

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
      setButtonClicked(true);

      inProcessRef.current = true;
      isSubmittingOtpRef.current = true;

      if (!otpKeys.length || otpKeys.length !== digitCount) {
        throw new Error('Please fill a valid otp');
      }

      const data = {
        mobileNo: Number(mobileNoUser),
        otp: otpKeys,
      };

      await AsyncStorage.removeItem('reChecking');
      let error;
      await auth.verifyMobile(data, _e => {
        error = _e;
      });

      if (error) {
        throw error;
      }
      /* customer io and mixpanel event chagnes  start */

      /* customer io and mixpanel event chagnes  end */
      // TODO: Add signup stage.
      await AsyncStorage.removeItem('Signup');

      navigation.navigate('BasicFact', { id: userId });
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
      setButtonClicked(false);
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
      const data = {
        mobileNo: Number(mobileNoUser),
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

  const phoneInfo = parsePhoneNumber(
    `${basicInfo.mobileNo}`.startsWith('+')
      ? basicInfo.mobileNo
      : `+${basicInfo.mobileNo}`,
    basicInfo?.countryISO || '',
  );

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
            navigation.navigate('BasicFact', { id: userId });
          }}
          style={styles.mobileIconContainer}>
          <CloseIcon />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Enter verification code</Text>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            }}>
            <Text
              style={{ color: 'black', fontWeight: 400 }}
              accessibilityLabel={`${basicInfo?.mobileNo}-Mobile`}>
              Sent to +{phoneInfo.countryCallingCode} {phoneInfo.nationalNumber}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            <Otp
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
                    onPress={resendMobileOTP}>
                    Resend OTP
                  </Text>
                )
              )}
            </Text>
          </View>
        </View>

        {buttonClicked ? (
          <LoaderButton
            gradientStyles={{
              padding: 0,
              borderRadius: 70,
              marginBottom: bottom || 20,
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
      </View>
    </View>
  );
};

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
    mobileIconContainer: {
      // display: "flex",
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 45,
      right: 15,

      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 5,
    },

    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      height: Platform.OS === 'ios' ? windowHeight - 210 : windowHeight - 170,
      width: '100%',
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      backgroundColor: '#fff',
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
    confirmButton: {
      marginBottom: Platform.OS === 'ios' ? 25 : bottom || 20,
    },

    LoaderButton: {
      padding: 10,
      borderRadius: 70,
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
  });
}

export default MobileOTPverification;
