import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {useState, useRef, useEffect} from 'react';
import {Button, Text, useTheme} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import * as KeyChain from 'react-native-keychain';
import {CustomButton} from '../../../core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../../hooks/useAuth';
import {getUserInfo} from '../../../store/apps/userInfo';
import {resetPassword} from '../../../store/apps/auth/index';
import CleverTap from 'clevertap-react-native';
import {sendEmailOtp} from '../../../store/apps/auth';
import Otp from '../../Otp';
import {CloseIcon} from '../../../images';
import LoaderButton from '../../../core/UICompoonent/LoaderButton';
import BackgroundCounter from '../../../common/BackgroundCounter';

function EmailOTPReverify() {
  const digitCount = 4;
  const styles = useCreateStyles();
  const auth = useAuth();
  const navigation = useNavigation();
  const {top} = useSafeAreaInsets();
  const {bottom} = useSafeAreaInsets();
  const theme = useTheme();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [otpKeys, setOtpKeys] = useState('');
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const [otpReset, setOtpReset] = useState(false);
  const [counterStart, setCounterStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const inProcessRef = useRef(false);
  const [timer, setTimer] = useState(180);
  const [buttonClicked, setButtonClicked] = useState(false);

  const isSubmittingOtpRef = useRef(false);
  const interValIdRef = useRef(false);

  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const emailuser = useSelector(state => state?.userInfo.email);
  const userId = useSelector(state => state?.userInfo._id);

  function formatTime(numberOfSeconds) {
    const minutes = Math.floor(numberOfSeconds / 60);
    const remainingSeconds = numberOfSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

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

  async function confirmEmail(e) {
    try {
      setLoading(true);
      setButtonClicked(true);

      inProcessRef.current = true;
      isSubmittingOtpRef.current = true;

      if (!otpKeys.length || otpKeys.length !== digitCount) {
        throw new Error('Please fill a valid otp');
      }
      const data = {
        email: emailuser,
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

      const cleverTapProps = {
        Email: data?.email, // Phone (with the country code, starting with +)
      };

      CleverTap.recordEvent('verify_email', cleverTapProps);

      /* customer io and mixpanel event chagnes  end */
      // TODO: Add signup stage.
      await AsyncStorage.removeItem('Signup');

      navigation.navigate('BasicFact', {id: userId});
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

  async function resendConfirmationCode() {
    try {
      const data = {
        email: emailuser,
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
    <View style={{flex: 1}} accessibilityLabel="presignup-page">

      <View style={styles.parent}>
        <Image
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/wallpaper.png',
          }}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('BasicFact', {id: userId});
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
            <Text style={{color: 'black'}}>Sent to {emailuser} </Text>
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
                <Text style={{color: '#E77237', fontWeight: 600}}>
                  <BackgroundCounter
                    start={true}
                    startTime={180}
                    onStop={() => setCounterStart(false)}
                    style={{color: '#E77237'}}
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
            onPress={confirmEmail}
            label={'Confirm'}
            loading={loading}
            disabled={otpKeys?.length < digitCount}
          />
        )}
      </View>
    </View>
  );
}

// Create Styles
function useCreateStyles() {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const {bottom} = useSafeAreaInsets();

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
      fontSize: 16,
      fontWeight: Platform.OS === 'ios' ? 600 : 800,
      marginTop: 20,
      marginBottom: 15,
      letterSpacing: 0,
      color: 'black',
    },

    input: {
      marginBottom: 10,
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
      letterSpacing: 0,
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

    confirmButton: {
      marginBottom: Platform.OS === 'ios' ? 25 : bottom || 20,
    },

    LoaderButton: {
      padding: 10,
      borderRadius: 70,
    },
  });
}
export default EmailOTPReverify;
