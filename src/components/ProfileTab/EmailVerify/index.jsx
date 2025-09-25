import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {useState, useRef, state, useEffect, useCallback} from 'react';
import {Text, useTheme} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import * as KeyChain from 'react-native-keychain';
import {CustomButton} from '../../../core';
import {CustomInput} from '../../../components';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {resetPassword} from '../../../store/apps/auth/index';
import {passwordValidator} from './../../../utils/validators';
import {sendEmailOtp} from '../../../store/apps/auth';
import {BackArrowIcon, CloseIcon} from '../../../images';

function EmailReVerify() {
  const styles = useCreateStyles();
  const navigation = useNavigation();
  const {top} = useSafeAreaInsets();
  const theme = useTheme();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showPasswordValidations, setShowPasswordValidations] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    hasLetter: false,
    hasNumber: false,
    hasMinChar: false,
  });

  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const email = useSelector(state => state?.userInfo.email);
  const userId = useSelector(state => state?.userInfo._id);
  const emailVerified = useSelector(state => state?.userInfo.emailVerified);
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
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
      } catch (error) {}
    }, [basicInfo, userId]),
  );

  const getToken = async () => {
    const accessToken = await KeyChain.getGenericPassword({
      username: 'imuwAccessToken',
    });

    return accessToken.password;
  };

  const handleChangePwd = async () => {
    try {
      setSubmitting(true);
      const accessToken = await getToken();
      const passdata = {
        accessToken,
        password: formik?.values?.password,
      };

      await dispatch(resetPassword(passdata)).unwrap();

      await resendConfirmationCode();
      navigation.navigate('EmailOTPReverify');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error fetching:',
      });
    } finally {
      setSubmitting(false);
      setShowPasswordValidations(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: yup.object().shape({
      password: yup
        .string()
        .test(
          'password',
          'Password field should accept minimum 8 char including at least 1 number and at least 1 alphabet',
          passwordValidator,
        )
        .required('This field is required'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords do not match')
        .required('This field is required'),
    }),
  });

  function checkPasswordValidations(val) {
    const hasLetter = /[A-Za-z]+/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasMinChar = val && val.length >= 8;

    setPasswordValidations({
      hasLetter,
      hasNumber,
      hasMinChar,
    });
  }

  async function resendConfirmationCode() {
    try {
      const data = {
        email: email,
      };

      const res = await dispatch(sendEmailOtp(data)).unwrap();
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
          style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Enter your Email</Text>

          <View>
            <CustomInput
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="signup-email"
              mode="outlined"
              name="email"
              label="Email ID"
              style={styles.input}
              clearable
              required
              value={basicInfo?.email}
              disabled={emailVerified !== true}
              contentStyle={{backgroundColor: '#e6e6e6'}}
              rightContentStyles={{backgroundColor: '#F9F9F9'}}
              inputContainerStyle={{paddingRight: 0}}
            />

            <CustomInput
              autoCapitalize="none"
              accessibilityLabel="signup-password"
              autoComplete="off"
              name="password"
              label="Enter Password"
              value={formik.values.password}
              error={formik.touched.password && Boolean(formik.errors.password)}
              onBlur={text => formik.handleBlur('password')(text)}
              onChangeText={text => {
                formik.handleChange('password')(text);
                setShowPasswordValidations(true);
                checkPasswordValidations(text);
              }}
              style={styles.input}
              secureTextEntry={!showPassword}
              clearable
              required
              right={
                <Icon
                  onPress={() => setShowPassword(prev => !prev)}
                  name={showPassword ? 'eye' : 'eye-slash'}
                />
              }
            />

            {showPasswordValidations && (
              <View style={{marginBottom: 12}}>
                <Text style={{fontSize: 10, fontWeight: 700, letterSpacing: 0}}>
                  Password must include at least{' '}
                  <Text
                    style={{
                      color: !passwordValidations.hasLetter ? 'red' : 'green',
                      fontSize: 9.2,
                    }}>
                    1 letter,{' '}
                  </Text>
                  <Text
                    style={{
                      color: !passwordValidations.hasNumber ? 'red' : 'green',
                      fontSize: 9.2,
                    }}>
                    1 number{' '}
                  </Text>
                  <Text
                    style={{
                      color: !passwordValidations.hasMinChar ? 'red' : 'green',
                      fontSize: 9.2,
                    }}>
                    & 8 characters
                  </Text>
                </Text>
              </View>
            )}
            <CustomInput
              mode="outlined"
              autoCapitalize="none"
              accessibilityLabel="signup-confirm-password"
              autoComplete="off"
              name="password"
              label="Confirm Password"
              value={formik.values.confirmPassword}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              errorText={formik.errors.confirmPassword}
              onBlur={formik.handleBlur('confirmPassword')}
              onChangeText={text => {
                formik.handleChange('confirmPassword')(text);
                checkPasswordValidations(text);
              }}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              required
              clearable
              right={
                <Icon
                  onPress={() => setShowConfirmPassword(prev => !prev)}
                  name={showConfirmPassword ? 'eye' : 'eye-slash'}
                />
              }
            />
          </View>
        </View>

        <View>
          <CustomButton
            accessibilityLabel="loginBtn"
            className="login"
            label="Confirm"
            style={styles.confirmButton}
            loading={submitting}
            onPress={handleChangePwd}
            disabled={
              !formik.isValid || !Object.keys(formik.touched || {})?.length
            }
          />
        </View>
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

    backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 45,
      left: 20,
      flexDirection: 'row',
      alignItems: 'start',
      paddingHorizontal: 3,
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
      fontWeight: Platform.OS === 'ios' ? 600 : 700,
      marginTop: 20,
      marginBottom: 15,
      letterSpacing: 0,
      color: 'black',
    },

    input: {
      marginBottom: 10,
    },

    confirmButton: {
      marginBottom: Platform.OS === 'ios' ? 25 : bottom || 20,
    },
  });
}
export default EmailReVerify;
