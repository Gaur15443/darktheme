import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { HelperText, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../../core';
import TermsAndPolicy from '../../components/Auth/TermsAndPolicy/index';
import EmailNewIcon from '../../images/Icons/EmailNewIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Toast from 'react-native-toast-message';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  registerWithMobile,
  loginwithMobile,
  setMobileNumber,
  setCountryCodeStore,
} from '../../store/apps/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import CountryCode from '../../components/CountryCode';
import { CustomInput } from '../../components';
import { isValidPhoneNumber } from 'libphonenumber-js/mobile';
import parsePhoneNumber from 'libphonenumber-js';

export function splitPhoneNumber(input) {
  if (!input || input.length < 6) {
    return { countryCode: '', nationalNumber: input, isoCode: '' };
  }
  let phoneNumber;
  if (input.startsWith('+')) {
    phoneNumber = parsePhoneNumberFromString(input);
  } else {
    phoneNumber = parsePhoneNumberFromString(input);
  }

  if (!phoneNumber || !phoneNumber.isValid()) {
    return { countryCode: '', nationalNumber: input, isoCode: '' };
  }

  const countryCode = '+' + phoneNumber.countryCallingCode;
  const nationalNumber = phoneNumber.nationalNumber;
  const isoCode = phoneNumber.country;

  return { countryCode, nationalNumber, isoCode };
}
import { mixpanel } from '../../../App';
import CleverTap from 'clevertap-react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import FastImage from '@d11/react-native-fast-image';

function LoginWithMobile() {
  const dispatch = useDispatch();
  const styles = useCreateStyles();
  const navigation = useNavigation();
  const iso = useRef('');
  const countryCode = useRef('');
  const isSubmittingRef = useRef(false);
  const countryCodeRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const mobileNumber = useSelector(state => state.authSlice.mobileNumber);
  const countryCodeStore = useSelector(state => state.authSlice.countryCode);

  const formik = useFormik({
    initialValues: {
      mobile: '',
    },
    validationSchema: Yup.object().shape({
      mobile: Yup.string()
        .nullable()
        .optional()
        .test(
          'invalid-characters',
          'Invalid characters (.,+-) are not allowed',
          value => {
            // Check if there's any invalid character (., -) in the input
            return !/[.,+-]/.test(value);
          },
        )
        .test('valid-phone', 'Mobile number is invalid', validateNum),
    }),
  });

  useEffect(() => {
    if (mobileNumber && countryCodeStore) {
      formik.values.mobile = mobileNumber.toString();
      countryCode.current = countryCodeStore.toString();
      // dispatch(setMobileNumber(null))
    }
  }, []);

  function validateNum(num) {
    if (!num || !num.toString()?.length) {
      return true;
    }
    if (!/^[0-9]+$/g.test(`${num}`)) {
      return false;
    }

    const sanitizedNum = num.replace(/\D/g, '');
    if (sanitizedNum.startsWith('0')) {
      return false;
    }
    const fullNumber = `+${countryCode.current}${sanitizedNum}`;
    const phoneNumber = parsePhoneNumber(fullNumber);
    if (phoneNumber) {
      phoneNumber.formatNational();
      return isValidPhoneNumber(fullNumber);
    }
  }

  function onSelect(data) {
    countryCode.current = data?.dialCode;
    iso.current = data.iso;
    formik.setFieldValue('mobile', null);
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      isSubmittingRef.current = true;

      const mobileNo = formik.values.mobile?.length
        ? `${countryCode.current}${formik.values.mobile}`
        : null;

      dispatch(setMobileNumber(mobileNo));
      dispatch(setCountryCodeStore(countryCode.current));

      await dispatch(
        registerWithMobile({ mobileNo, countryCode: countryCode.current }),
      ).unwrap();

      const phoneNo = mobileNo ? '+' + mobileNo : '';
      const cleverTapProps = {
        Phone: phoneNo,
      };

      CleverTap.recordEvent('OTP_Requested', cleverTapProps);

      mixpanel.track('OTP_Requested', {
        phone: phoneNo,
      });

      navigation.navigate('VerifyMobileOTP', {
        mobileNo,
        countryCode: countryCode.current,
      });
    } catch (error) {
      const { name: errorName } = error || '';
      const { mobile } = formik.values;

      if (errorName === 'userVerified') {
        const mobileNo = formik.values.mobile?.length
          ? `${countryCode.current}${formik.values.mobile}`
          : null;
        try {
          await dispatch(
            loginwithMobile({ mobileNo, countryCode: countryCode.current }),
          ).unwrap();

          navigation.navigate('VerifyMobileOTP', {
            reDirecttoHome: true,
            mobileNo,
          });

          return;
        } catch (error) {
          if (error.name === 'dailyLimitReached') {
            Toast.show({
              type: 'error',
              text1: error?.message,
            });
          }
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
          return;
        }
      }

      if (errorName === 'userMobileNotVerified') {
        const mobileNo = formik.values.mobile?.length
          ? `${countryCode.current}${formik.values.mobile}`
          : null;

        navigation.navigate('VerifyMobileOTP', { mobileNo });
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
    <>
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
              formik.resetForm();
            }}
            style={styles.iconContainer}>
            <EmailNewIcon style={styles.emailIcon} />
            <Text style={styles.emailText}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.topSection}>
            <Text style={styles.title}>Enter your number</Text>

            <View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <CountryCode
                  ref={countryCodeRef}
                  enabledCountryCode
                  onSelect={onSelect}
                  preferredCountries={['in', 'us', 'gb']}
                  defaultCountry="IN"
                  class="country-code-input"
                  testID="countryCodeInput"
                />
                <CustomInput
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType={
                    Platform.OS === 'ios' ? 'telephoneNumber' : undefined
                  }
                  importantForAutofill={
                    Platform.OS === 'android' ? 'yes' : undefined
                  }
                  style={{ flex: 1 }}
                  fullWidth
                  label="Mobile number"
                  testID="mobileNumber"
                  name="mobile"
                  value={formik.values.mobile}
                  onChangeText={_text => {
                    const { countryCode, nationalNumber, isoCode } =
                      splitPhoneNumber(_text);
                    if (
                      countryCode?.toString?.()?.length &&
                      isoCode?.toString?.()?.length
                    ) {
                      const _data = {
                        dialCode: countryCode?.replace?.('+', ''),
                        iso: isoCode,
                      };
                      // onSelect(_data);
                      countryCodeRef.current?.choose(_data);
                    }

                    const text = nationalNumber.toString();
                    formik.handleChange({
                      target: {
                        name: 'mobile',
                        value: text,
                      },
                    });
                    validateNum(text);
                    const isValidMobile = text.length === 10;
                    formik.setFieldValue('mobile', text);
                    setSubmitting(isValidMobile ? false : submitting);
                  }}
                  onBlur={formik.handleBlur('mobile')}
                  error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  helperText={formik.touched.mobile && formik.errors.mobile}
                />
              </View>
              {formik.touched.mobile && formik.errors.mobile && (
                <HelperText type="error" style={{ color: 'red', marginLeft: 70 }}>
                  {formik.errors.mobile}
                </HelperText>
              )}
            </View>
          </View>

          <View>
            <KeyboardStickyView
              offset={{
                opened: 10,
              }}>
              <CustomButton
                style={styles.confirmButton}
                accessibilityLabel="confirmMobile"
                className="confirm-OTP"
                label="Confirm"
                onPress={handleSubmit}
                loading={submitting}
                disabled={
                  submitting || !formik.isValid || !formik.values.mobile
                }
              />

              <TermsAndPolicy
                screenType="LoginWithMobile"
                style={styles.termsAndPolicyStyle}
              />
            </KeyboardStickyView>
          </View>
        </View>
      </View>
    </>
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
      height: Platform.OS === 'ios' ? windowHeight - 210 : windowHeight - 170,
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

    confirmButton: {
      marginBottom: 10,
    },

    termsAndPolicyStyle: {
      paddingTop: -10,
      paddingBottom: Platform.OS === 'ios' ? 50 : bottom || 20,
    },
  });
}

export default LoginWithMobile;
