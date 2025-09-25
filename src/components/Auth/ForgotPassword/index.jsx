import {StyleSheet, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import {useEffect, useState, useRef, memo} from 'react';
import {
  HelperText,
  Modal as ModalPaper,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import {useFormik} from 'formik';
import * as yup from 'yup';
import {passwordValidator} from './../../../utils/validators';
import {forgotPassword, resetPassword} from '../../../store/apps/auth';
import {CustomButton} from '../../../core';
import {CustomInput, Otp} from '../../../components';
import TickIcon from '../../../images/Icons/TickIcon';
import {forgotPasswordVerification} from './../../../store/apps/auth/index';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * @param {object} props
 * @param {Function} onCloseForgotPassword - Function to close this component.
 * @param {Function} onSuccess - Function to handle success message.
 */
function ForgotPassword({onCloseForgotPassword, onSuccess}) {
  const otpDigitCount = 4;
  const dispatch = useDispatch();
  const styles = createStyles();
  const theme = useTheme();

  const [otpKeys, setOtpKeys] = useState('');
  const [otpHasError, setOtpHasError] = useState(false);
  const [requestingResetPass, setRequestingResetPass] = useState(false);
  const [requestingForgotPassOtp, setRequestingForgotPassOtp] = useState(false);
  const [inProcess, setInProcess] = useState(false);
  const [otpReset, setOtpReset] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(true);
  const [forceReset, setForceReset] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordValidations, setShowPasswordValidations] = useState(false);
  const [counterStart, setCounterStart] = useState(false);
  const [timer, setTimer] = useState(180);
  const interValIdRef = useRef(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [passwordValidations, setPasswordValidations] = useState({
    hasLetter: false,
    hasNumber: false,
    hasMinChar: false,
  });
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const formik = useFormik({
    initialValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .required('This field is required')
        .email('Invalid email'),
      newPassword: yup
        .string()
        .test(
          'password',
          'Password field should accept minimum 8 char including at least 1 number and at least 1 alphabet',
          passwordValidator,
        )
        .required('This field is required'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword'), null], 'Passwords do not match')
        .required('This field is required'),
    }),
  });

  useEffect(() => {
    if (timer !== 0) {
      setSeconds(() => updateSeconds());
      setMinutes(() => updateMinutes());
    } else {
      clearInterval(interValIdRef.current);
      setTimer(180);
      setCounterStart(false);
    }
  }, [minutes, seconds, timer]);

  useEffect(
    () => () => {
      clearInterval(interValIdRef.current);
    },
    [],
  );

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

  async function requestOtp() {
    try {
      const payload = {
        email: formik.values.email,
      };
      await dispatch(forgotPassword(payload)).unwrap();
      setForceReset(false);
      setShowForgotPassword(false);
      setShowChangePassword(true);
    } catch (error) {
      if (userManagementToastsConfig?.forgotPassword?.errors?.[error.message]) {
        Toast.show({
          type: 'error',
          text1:
            userManagementToastsConfig?.forgotPassword?.errors?.[
              error.message
            ] || 'Something went wrong, please retry',
        });
        return;
      }
      Toast.show({
        type: 'error',
        text1: error.message || 'Something went wrong, please retry',
      });
    }
  }
  async function resendForgotPasswordOtp() {
    try {
      setInProcess(true);
      if (!formik.values.email?.length) {
        throw new Error("Email can't be empty");
      }
      setRequestingForgotPassOtp(true);

      const payload = {
        email: formik.values.email,
      };

      await dispatch(forgotPassword(payload)).unwrap();
      setOtpKeys('');
      setOtpReset(true);
      timeSetOutOtp();
      Toast.show({
        type: 'success',
        text1: userManagementToastsConfig?.otp?.success?.['1503'],
      });
    } catch (error) {
      if (userManagementToastsConfig?.forgotPassword?.errors?.[error.message]) {
        Toast.show({
          type: 'error',
          text1:
            userManagementToastsConfig?.forgotPassword?.errors?.[
              error.message
            ] || 'Something went wrong, please retry',
        });
        return;
      }
      Toast.show({
        type: 'error',
        text1: error.message || 'Something went wrong, please retry',
      });
    } finally {
      setInProcess(false);
      setRequestingForgotPassOtp(false);
    }
  }
  function timeSetOutOtp() {
    setCounterStart(true);
    const interValId = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    interValIdRef.current = interValId;
  }
  function updateMinutes() {
    let _minutes = Math.floor(timer / 60);
    if (_minutes < 10) {
      _minutes = `0${_minutes}`;
    }
    return _minutes?.slice?.(0, 2) || _minutes;
  }

  function updateSeconds() {
    let _timer = timer % 60;
    if (_timer < 10) {
      _timer = `0${timer}`;
    }
    return _timer?.slice?.(0, 2) || _timer;
  }
  async function handleResetPassword() {
    try {
      setRequestingResetPass(true);
      const verificationPayload = {
        email: formik.values.email,
        verificationCode: otpKeys,
      };

      await dispatch(forgotPasswordVerification(verificationPayload)).unwrap();
      const accessToken = await AsyncStorage.getItem(
        'forgotPasswordVerificationAccessToken',
      );

      const resetPasswordPayload = {
        accessToken,
        password: formik.values.newPassword,
      };

      const response = await dispatch(
        resetPassword(resetPasswordPayload),
      ).unwrap();
      setShowChangePassword(false);
      setForceReset(false);
      setShowForgotPassword(false);
      onSuccess(
        userManagementToastsConfig?.resetPassword?.success?.[response.message],
      );
    } catch (error) {
      if (
        userManagementToastsConfig?.forgotPassword?.errors?.[error?.message] ===
        'Verification Code Incorrect'
      ) {
        setOtpHasError(true);
        setOtpReset(true);
        return;
      }
      Toast.show({
        type: 'error',
        text1:
          userManagementToastsConfig?.forgotPassword?.errors?.[
            error?.message
          ] || error.message,
      });
    } finally {
      setInProcess(false);
      setRequestingResetPass(false);
    }
  }

  return (
    <Portal>
      <ModalPaper
        visible
        style={{
          paddingHorizontal: 25,
          height: 'auto',
        }}
        contentContainerStyle={{
          backgroundColor: theme.colors.onWhite100,
          paddingHorizontal: 15,
          paddingVertical: 25,
          borderRadius: 10,
        }}
        dismissable
        onDismiss={onCloseForgotPassword}>
        {showForgotPassword && (
          <View>
            <Text variant="headlineLarge" style={{textAlign: 'center'}}>
              Reset Password
            </Text>
            <Text
              variant="titleMedium"
              style={[
                {
                  textAlign: 'center',
                  marginBottom: 16,
                },
                forceReset && {color: 'red', fontSize: 'larger'},
              ]}>
              {forceReset
                ? 'Important Update: Please reset your password to login'
                : 'Please enter your email'}
            </Text>
            <CustomInput
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              mode="outlined"
              label="Email"
              testID="forgotPassEmail"
              required
              clearable
              onBlur={formik.handleBlur('email')}
              onChangeText={formik.handleChange('email')}
              error={formik.touched.email && Boolean(formik.errors.email)}
              errorText={formik.errors.email}
            />

            <CustomButton
              label={'Request OTP'}
              testID="forgotPassSubmit"
              onPress={requestOtp}
              style={styles.buttonMargin}
              loading={requestingForgotPassOtp}
              disabled={
                requestingForgotPassOtp ||
                formik.errors.email?.length > 0 ||
                !formik.values?.email?.length
              }
            />
            <CustomButton
              label="Cancel"
              testID="forgotPassCancel"
              onPress={onCloseForgotPassword}
              color={theme.colors.primary}
              style={styles.outlinedButton}
            />
          </View>
        )}
        {showChangePassword && (
          <View>
            <Text variant="headlineMedium" style={{textAlign: 'center'}}>
              Reset Password
            </Text>
            <Text
              variant="titleMedium"
              style={{
                textAlign: 'center',
                marginBottom: 16,
              }}>
              Please enter the OTP sent to your email
            </Text>

            <Otp
              digitCount={otpDigitCount}
              hasError={otpHasError}
              otpReset={otpReset}
              onClipboardPasted={otp => setOtpKeys(otp)}
              onGetKeys={e => {
                setOtpKeys(e);
              }}
            />

            <View>
              {counterStart && (
                <Text style={styles.centeredText}>
                  Request a new OTP in{' '}
                  <Text style={{fontWeight: 'bold'}}>
                    {minutes}:{seconds}
                  </Text>
                </Text>
              )}
              {!counterStart && (
                <TouchableOpacity
                  onPress={async () => await resendForgotPasswordOtp()}>
                  <Text
                    variant="titleMedium"
                    style={[styles.centeredText, styles.link]}>
                    Resend OTP
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <CustomInput
              style={{
                marginBottom: 8,
              }}
              autoCapitalize="none"
              name="newPassword"
              mode="outlined"
              testId="newPassword"
              label="New password"
              testID="newPassword"
              onChangeText={text => {
                formik.handleChange({
                  target: {
                    name: 'newPassword',
                    value: text,
                  },
                });
                setShowPasswordValidations(true);
                checkPasswordValidations(text);
              }}
              onBlur={formik.handleBlur('newPassword')}
              error={
                formik.touched.newPassword && Boolean(formik.errors.newPassword)
              }
              secureTextEntry={!showNewPassword}
              right={
                <Icon
                  onPress={() => setShowNewPassword(prev => !prev)}
                  name={showNewPassword ? 'eye' : 'eye-off'}
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
              autoCapitalize="none"
              mode="outlined"
              testId="confirmPassword"
              name="confirmPassword"
              testID="confirmPassword"
              label="Confirm password"
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              onChangeText={formik.handleChange('confirmPassword')}
              onBlur={formik.handleBlur('confirmPassword')}
              secureTextEntry={!showConfirmPassword}
              right={
                <Icon
                  onPress={() => setShowConfirmPassword(prev => !prev)}
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                />
              }
            />

            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <HelperText type="error">
                  {formik.errors.confirmPassword}
                </HelperText>
              )}

            <CustomButton
              label="Reset"
              testID="reset"
              style={styles.buttonMargin}
              onPress={handleResetPassword}
              loading={requestingResetPass}
              disabled={
                otpKeys?.length < otpDigitCount ||
                requestingResetPass ||
                !formik.isValid ||
                !formik.values?.newPassword?.length
              }
            />
            <CustomButton
              label="Cancel"
              testID="cancelChangePass"
              color={theme.colors.primary}
              style={styles.outlinedButton}
              onPress={onCloseForgotPassword}
            />
          </View>
        )}
      </ModalPaper>
    </Portal>
  );
}

ForgotPassword.displayName = 'ForgotPassword';

export default memo(ForgotPassword);

function createStyles() {
  const theme = useTheme();

  return StyleSheet.create({
    centeredText: {
      textAlign: 'center',
      paddingVertical: 4,
    },
    link: {
      color: theme.colors.primary,
    },
    buttonMargin: {
      marginTop: 10,
      marginBottom: 10,
    },
    outlinedButton: {
      borderColor: theme.colors.primary,
      borderWidth: 1,
      backgroundColor: theme.colors.onWhite100,
    },
  });
}

ForgotPassword.propTypes = {
  onCloseForgotPassword: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
