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
import { useState, useRef, useEffect } from 'react';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../../core';
import TermsAndPolicy from '../../components/Auth/TermsAndPolicy/index';
import { CustomInput } from '../../components';
import MobilesNewIcon from '../../images/Icons/MobilesIcon';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { passwordValidator } from '../../utils/validators';
import { registerWithEmail } from '../../store/apps/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Facebook from '../../components/Auth/SocialLogin/facebook/Facebook';
import Googlelogin from '../../components/Auth/SocialLogin/Google/Googlelogin';
import AppleLogin from '../../components/Auth/SocialLogin/Apple/AppleLogin';
import NewTheme from '../../common/NewTheme';
import { GlobalStyle } from '../../core';
import {
  KeyboardStickyView,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import useKeyboardHeight from '../../hooks/useKeyboardheight';
import useBlurOnKeyboardHide from '../../hooks/useBlurOnKeyboardHide';
import FastImage from '@d11/react-native-fast-image';
import { sanitizeInput } from '../../utils/sanitizers';

function SignUpScreen() {
  const styles = useCreateStyles();
  const keyboardShown = useKeyboardHeight();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
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

  const inputsRef = useBlurOnKeyboardHide();

  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height:
      (Platform.OS === 'ios' ? windowHeight - 210 : windowHeight - 170) +
      progress.value * 57,
  }));
  const animatedSocialStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - progress.value * 2),
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

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object().shape({
      email: sanitizeInput(Yup.string()
        .required('This field is required')
        .email('Invalid email')),
      password: sanitizeInput(Yup.string()
        .test('password', '', passwordValidator)
        .required('This field is required')),
      confirmPassword: sanitizeInput(Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords do not match')
        .required('This field is required')),
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

  function timeToExpire(minutesToAdd = 30) {
    const currentTime = new Date();

    const result = currentTime.setMinutes(
      currentTime.getMinutes() + minutesToAdd,
    );

    return result;
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      isSubmittingRef.current = true;

      const { email, password } = formik.values;

      await dispatch(registerWithEmail({ email, password })).unwrap();

      navigation.navigate('EmailVerification', { email });
    } catch (error) {
      const { name: errorName } = error || '';
      const { email } = formik.values;

      if (errorName === 'userEmailNotVerified') {
        const signUpStage = {
          stageName: 'signUpEmailVerify',
          email,
          exp: timeToExpire().toString(),
        };

        await AsyncStorage.setItem('Signup', JSON.stringify(signUpStage));

        navigation.navigate('EmailVerification', { email });
        return;
      }
      if (userManagementToastsConfig?.signup?.errors?.[errorName]) {
        error.message = userManagementToastsConfig?.signup?.errors?.[errorName];
      }
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  }

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
            navigation.navigate('LoginWithOtp');
            formik.resetForm();
          }}
          style={styles.mobileIconContainer}>
          <MobilesNewIcon style={styles.mobileIcon} />
          <Text style={styles.mobileIcontext}>Mobile</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.bottomContainer, animatedStyle]}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Enter your email ID</Text>

          <View>
            <CustomInput
              ref={ref => (inputsRef.current[0] = ref)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="signup-email"
              mode="outlined"
              name="email"
              label="Email ID"
              value={formik.values.email}
              error={formik.touched.email && Boolean(formik.errors.email)}
              errorText={formik.touched.email && formik.errors.email}
              onBlur={formik.handleBlur('email')}
              onChangeText={formik.handleChange('email')}
              style={styles.input}
              clearable
              required
            />

            <CustomInput
              ref={ref => (inputsRef.current[1] = ref)}
              autoCapitalize="none"
              accessibilityLabel="signup-password"
              autoComplete="off"
              name="password"
              label="Password"
              value={formik.values.password}
              error={formik.touched.password && Boolean(formik.errors.password)}
              errorText={formik.touched.password && formik.errors.password}
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
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0 }}>
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
              ref={ref => (inputsRef.current[2] = ref)}
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

            <Animated.View
              style={[styles.socialContainer, animatedSocialStyle]}>
              <View style={styles.socialrow}>
                <View style={styles.line} />
                <Text style={styles.Ortext}>Or</Text>
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

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 5,
          }}>
          <Text
            suppressHighlighting
            variant="bodyLarge"
            style={{
              fontSize: 12,
              letterSpacing: 0,
              fontWeight: '600',
              textAlign: 'center',
            }}>
            Already have an account?{' '}
          </Text>

          <Text
            onPress={() => {
              navigation.navigate('Login');
              formik.resetForm();
            }}
            accessibilityLabel="logIn"
            suppressHighlighting
            style={{
              color: '#3473DC',
              fontSize: 12,
              letterSpacing: 0,
              fontWeight: '700',
              textAlign: 'center',
            }}>
            Login here
          </Text>
        </View>

        <View>
          <KeyboardStickyView
            offset={{
              opened: Platform.OS === 'ios' ? 70 : 40,
            }}>
            <CustomButton
              accessibilityLabel="loginBtn"
              className="login"
              label="Confirm"
              onPress={handleSubmit}
              style={styles.confirmButton}
              loading={submitting}
              disabled={
                submitting ||
                !formik.isValid ||
                !Object.keys(formik.touched || {})?.length
              }
            />
          </KeyboardStickyView>

          <TermsAndPolicy
            screenType="LoginWithMobile"
            style={styles.termsAndPolicyStyle}
          />
        </View>
      </Animated.View>
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
      shadowRadius: 4,
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
      marginBottom: 15,
      letterSpacing: 0,
      color: 'black',
    },

    input: {
      marginBottom: 10,
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

    confirmButton: {
      marginBottom: 10,
    },

    termsAndPolicyStyle: {
      paddingTop: -10,
      paddingBottom: Platform.OS === 'ios' ? 50 : bottom || 20,
    },
  });
}
export default SignUpScreen;
