import React, { useState, useRef } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Keyboard,
  Dimensions,
  Pressable,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import MobilesNewIcon from '../../images/Icons/MobilesIcon';

import { useFormik } from 'formik';
import * as yup from 'yup';
import { Text, useTheme } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../hooks/useAuth';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { CustomButton } from '../../core';
import { Googlelogin, ForgotPassword, CustomInput } from '../../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TermsAndPolicy from '../../components/Auth/TermsAndPolicy';

import Facebook from '../../components/Auth/SocialLogin/facebook/Facebook';
import AppleLogin from '../../components/Auth/SocialLogin/Apple/AppleLogin';
import {
  KeyboardStickyView,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import useKeyboardHeight from '../../hooks/useKeyboardheight';
import FastImage from '@d11/react-native-fast-image';

function LoginScreen() {
  const styles = useCreateStyles();
  const navigation = useNavigation();
  const windowHeight = Dimensions.get('window').height;

  const auth = useAuth();
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validateOnChange: true,
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .required('This field is required')
        .email('Invalid email'),
      password: yup.string().required('This field is required'),
    }),
  });
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const [rememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const keyboardShown = useKeyboardHeight();
  const progress = useSharedValue(0);
  const passwordRef = useRef(null);

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

  const onSubmit = async () => {
    try {
      Keyboard.dismiss();
      setSubmitting(true);
      const { email, password } = formik.values;
      const login = 'normalLogin';
      await auth.login({ email, password, rememberMe, login }, error => {
        const { name: errorName = '' } = error?.response?.data || '';
        if (userManagementToastsConfig?.login?.errors?.[errorName]) {
          if (
            userManagementToastsConfig?.login?.errors?.[errorName].includes(
              'password',
            )
          ) {
            formik.setFieldError('email', ' ');
            formik.setFieldError(
              'password',
              userManagementToastsConfig?.login?.errors?.[errorName],
            );
            return;
          }
          formik.setFieldError(
            'email',
            userManagementToastsConfig?.login?.errors?.[errorName],
          );
        } else if (error.message === 'pass not defined') {
          setShowForgotPassword(true);
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: userManagementToastsConfig?.catcherror?.errors?.['1601'],
      });
    } finally {
      setSubmitting(false);
    }
  };

  function handleResetPasswordSuccess(msg) {
    Toast.show({
      type: 'success',
      text1: typeof msg === 'string' ? msg : 'Password changed successfully',
    });
    setShowForgotPassword(false);
  }

  return (
    <View style={{ flex: 1 }} accessibilityLabel="login-page">

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
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              size="small"
              label="Email ID"
              name="email"
              value={formik.values.email}
              onBlur={formik.handleBlur('email')}
              onChangeText={formik.handleChange('email')}
              error={Boolean(formik.errors.email) && formik.touched.email}
              errorText={formik.errors.email}
              accessibilityLabel="email"
              clearable
              required
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus?.()}
            />

            <CustomInput
              style={{
                marginTop: 16,
              }}
              ref={passwordRef}
              autoCapitalize="none"
              mode="outlined"
              label="Password"
              name="password"
              accessibilityLabel="password"
              value={formik.values.password}
              onBlur={formik.handleBlur('password')}
              onChangeText={text => formik.handleChange('password')(text)}
              secureTextEntry={!showPassword}
              error={Boolean(formik.errors.password) && formik.touched.password}
              errorText={formik.errors.password}
              clearable
              required
              right={
                <FontAwesome
                  onPress={() => setShowPassword(prev => !prev)}
                  name={showPassword ? 'eye' : 'eye-slash'}
                />
              }
            />
            <Pressable>
              <Text
                onPress={() => {
                  Keyboard.dismiss();
                  setShowForgotPassword(true);
                }}
                accessibilityLabel="forgotPassword"
                style={[
                  styles.forgotPassword,
                  styles.link,
                  {
                    color: '#3473DC',
                    alignSelf: 'flex-end',
                    textAlign: 'right',
                    fontSize: 12,
                    marginTop: 5,
                  },
                ]}>
                Forgot Password?
              </Text>
            </Pressable>

            {showForgotPassword && (
              <ForgotPassword
                onCloseForgotPassword={() => setShowForgotPassword(false)}
                onSuccess={handleResetPasswordSuccess}
              />
            )}

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
            Don't have an account?{' '}
          </Text>

          <Text
            onPress={() => navigation.navigate('SignUp')}
            accessibilityLabel="logIn"
            suppressHighlighting
            style={{
              color: '#3473DC',
              fontSize: 12,
              letterSpacing: 0,
              fontWeight: '700',
              textAlign: 'center',
            }}>
            Sign Up here
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
              onPress={onSubmit}
              style={styles.confirmButton}
              loading={submitting}
              disabled={
                submitting ||
                !formik.isValid ||
                !Object.keys(formik.touched || {})?.length
              }
            />
            <TermsAndPolicy
              screenType="LoginWithMobile"
              style={styles.termsAndPolicyStyle}
            />
          </KeyboardStickyView>
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

export default LoginScreen;
