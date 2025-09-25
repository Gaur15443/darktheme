import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import {HelperText, useTheme} from 'react-native-paper';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {CustomButton} from '../../../core';
import TermsAndPolicy from '../../../components/Auth/TermsAndPolicy/index';
import EmailNewIcon from '../../../images/Icons/EmailIcon';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import parsePhoneNumber from 'libphonenumber-js';
import Toast from 'react-native-toast-message';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {registerWithMobile, loginwithMobileV2} from '../../../store/apps/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import CountryCode from '../../../components/CountryCode';
import {CustomInput} from '../../../components';
import {isValidNumber} from 'react-native-phone-number-input';
import GradientView from '../../../common/gradient-view';
import {isValidPhoneNumber} from 'libphonenumber-js/mobile';
import {mixpanel} from '../../../App';
import CleverTap from 'clevertap-react-native';
import {KeyboardStickyView} from 'react-native-keyboard-controller';
import {parsePhoneNumberFromString} from 'libphonenumber-js';
import {BackArrowIcon} from '../../../images';
import FastImage from '@d11/react-native-fast-image';

export function splitPhoneNumber(input) {
  if (!input || input.length < 6) {
    return {countryCode: '', nationalNumber: input, isoCode: ''};
  }

  let phoneNumber;

  if (input.startsWith('+')) {
    phoneNumber = parsePhoneNumberFromString(input);
  } else {
    phoneNumber = parsePhoneNumberFromString(input);
  }

  if (!phoneNumber || !phoneNumber.isValid()) {
    return {countryCode: '', nationalNumber: input, isoCode: ''};
  }

  const countryCode = '+' + phoneNumber.countryCallingCode;

  const nationalNumber = phoneNumber.nationalNumber;

  const isoCode = phoneNumber.country;

  return {countryCode, nationalNumber, isoCode};
}

function AstrologyLoginWithMobile() {
  const dispatch = useDispatch();
  const styles = useCreateStyles();
  const route = useRoute();
  console.log('route.params:', route.params);
  const navigation = useNavigation();
  const iso = useRef('');
  const countryCode = useRef('');
  const isSubmittingRef = useRef(false);
  const UserEmail = useSelector(state => state?.userInfo?.email);
  const [isVerified, setIsVerified] = useState(false);
  const countryCodeRef = useRef(null);

  console.log('UserEmail', UserEmail);

  const [submitting, setSubmitting] = useState(false);
  const mobileNumber = useSelector(state => state.authSlice.mobileNumber);
  const countryCodeStore = useSelector(state => state.authSlice.countryCode);
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const formik = useFormik({
    initialValues: {
      mobile: '',
    },
    validationSchema: Yup.object().shape({
      mobile: Yup.string()
        .nullable()
        .optional()
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
    console.log('data', data);
    countryCode.current = data?.dialCode;
    iso.current = data.iso;
    formik.setFieldValue('mobile', null);
  }

  function timeToExpire(minutesToAdd = 30) {
    const currentTime = new Date();

    const result = currentTime.setMinutes(
      currentTime.getMinutes() + minutesToAdd,
    );

    return result;
  }

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // Disable iOS swipe-back gesture
    });
  }, [navigation]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const unsubscribe = navigation.addListener('beforeRemove', e => {
  //       if (!isVerified) {
  //         // Prevent navigation if not verified
  //         e.preventDefault();
  //         Alert.alert(
  //           'Verification Required',
  //           'Please verify your mobile number to proceed. You cannot go back until verification is complete.',
  //           [
  //             {
  //               text: 'OK',
  //               onPress: () => {
  //                 // Stay on this page (do nothing, or redirect explicitly if needed)
  //               },
  //             },
  //           ],
  //           {cancelable: false},
  //         );
  //       }
  //     });

  //     return unsubscribe;
  //   }, [navigation, isVerified]),
  // );

  useEffect(() => {
    console.log('useEffect triggered in AstrologyLoginWithMobile');
    const mobileNumber = route.params?.mobileNumber;
    console.log('mobileNumber:', mobileNumber);
    if (mobileNumber) {
      console.log('Setting mobile:', mobileNumber);
      formik.setFieldValue('mobile', mobileNumber);
      countryCode.current = '91'; // Default country code
      iso.current = 'IN'; // Default ISO code
    } else {
      console.log('No mobileNumber found in route.params');
    }
  }, [route.params?.mobileNumber]);

  async function handleSubmit() {
    try {
      setSubmitting(true);
      isSubmittingRef.current = true;
      const fallbackTarget = 'AstroHome';
      const mobileNo = formik.values.mobile?.length
        ? `${countryCode.current}${formik.values.mobile}`
        : null;

      await dispatch(
        loginwithMobileV2({
          mobileNo,
          countryCode: countryCode.current,
          email: UserEmail,
        }),
      ).unwrap();

      navigation.navigate('AstrologyVerifyMobileOTP', {
        mobileNo,
        navigationTarget:
          route?.params?.navigationTarget || navigationTarget || fallbackTarget,
      });
    } catch (error) {
      const {name: errorName} = error || '';
      const {mobile} = formik.values;

      if (errorName === 'userVerified') {
        const mobileNo = formik.values.mobile?.length
          ? `${countryCode.current}${formik.values.mobile}`
          : null;
        await dispatch(
          loginwithMobileV2({
            mobileNo,
            countryCode: countryCode.current,
            email: UserEmail,
          }),
        ).unwrap();

        navigation.navigate('AstrologyVerifyMobileOTP', {
          reDirecttoHome: true,
          mobileNo,
          navigationTarget:
            route?.params?.navigationTarget ||
            navigationTarget ||
            fallbackTarget,
        });

        return;
      }

      if (errorName === 'userEmailNotVerified') {
        const signUpStage = {
          stageName: 'signUpEmailVerify',
          email,
          exp: timeToExpire().toString(),
        };

        navigation.navigate('VerifyMobileOTP', {mobile});
        return;
      }

      if (errorName === 'userMobileNotVerified') {
        navigation.navigate('VerifyMobileOTP', {mobile});
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
      <View style={{flex: 1}} accessibilityLabel="presignup-page">
        <View style={styles.parent}>
          <FastImage
            source={{
              uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/astrology-logo2.png',
            }}
            style={styles.logo}
          />
          {/* <TouchableOpacity
            onPress={() => {
              navigation.navigate('SignUp');
            }}
            style={styles.iconContainer}>
            <EmailNewIcon style={styles.emailIcon} />
            <Text style={styles.emailText}>Email</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'Home'}],
              });
            }}
            style={styles.iconContainer}>
            <BackArrowIcon fill="#fff" />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.bottomContainer}> */}
        <LinearGradient
          colors={['#4B309F', '#0E0E10']} // Your gradient colors
          style={[styles.bottomContainer]}>
          <View style={styles.topSection}>
            <Text style={styles.title}>Enter your number</Text>

            <View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 25,
                }}>
                {/* <Text> */}
                <CountryCode
                  enabledCountryCode
                  onSelect={onSelect}
                  preferredCountries={['in', 'us', 'gb']}
                  defaultCountry="IN"
                  class="country-code-input"
                  testID="countryCodeInput"
                  flagSize={12}
                  customStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Milky transparent
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                  countryCodeTextColor="white"
                />
                {/* </Text> */}

                <CustomInput
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType={
                    Platform.OS === 'ios' ? 'telephoneNumber' : undefined
                  }
                  style={{
                    flex: 1,
                  }}
                  contentStyle={{
                    backgroundColor: 'transparent',
                    color: 'white',
                  }}
                  innerContainerStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Milky transparent
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                  containerStyle={{
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                    borderRadius: 8,
                  }}
                  theme={{
                    colors: {
                      text: 'white',
                      placeholder: 'rgba(255, 255, 255, 0.6)',
                      primary: 'white', // ✅ removes orange focus line
                      underlineColor: 'transparent', // ✅ removes underline
                      background: 'transparent',
                    },
                  }}
                  placeholder="Mobile number"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  testID="mobileNumber"
                  name="mobile"
                  value={formik.values.mobile}
                  onChangeText={text => {
                    // formik.handleChange(text);
                    formik.setFieldValue('mobile', text);
                    validateNum(text);
                    formik.handleChange({
                      target: {
                        name: 'mobile',
                        value: text,
                      },
                    });
                  }}
                  onBlur={formik.handleBlur('mobile')}
                  error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  helperText={formik.touched.mobile && formik.errors.mobile}
                />
              </View>
              {formik.touched.mobile && formik.errors.mobile && (
                <HelperText
                  type="error"
                  style={{color: 'red', marginLeft: 100}}>
                  {formik.errors.mobile}
                </HelperText>
              )}
            </View>
          </View>

          <View style={{paddingHorizontal: 25}}>
            <KeyboardStickyView
              offset={{
                opened: 10,
              }}>
              <CustomButton
                style={
                  submitting ||
                  !formik.isValid ||
                  !Object.keys(formik.touched || {}).length ||
                  !formik.values.mobile
                    ? styles.confirmButtonDisabled
                    : styles.confirmButtonEnabled
                }
                accessibilityLabel="confirmMobile"
                className="confirm-OTP"
                label="Confirm"
                labelStyle={{color: '#6944D3'}}
                onPress={handleSubmit}
                loading={submitting}
                disabled={
                  submitting || !formik.isValid || !formik.values.mobile
                }
              />

              <TermsAndPolicy
                screenType="AstrologyLoginWithMobile"
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
        </LinearGradient>
        {/* </View> */}
      </View>
    </>
  );
}

// Create Styles
function useCreateStyles() {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  return StyleSheet.create({
    parent: {
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      flex: 1,
    },

    logo: {
      width: '100%',
      height: 280,
      resizeMode: 'cover',
    },

    // Style for the icon
    iconContainer: {
      // display: "flex",
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 45,
      left: 5,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 8,
    },

    emailIcon: {
      marginRight: 5,
    },

    emailText: {
      color: '#868e96',
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },

    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      height: Platform.OS === 'ios' ? windowHeight - 190 : windowHeight - 200,
      width: '100%',
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      backgroundColor: '#4B309F',
      // paddingHorizontal: 25,
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
      color: 'white',
      fontSize: 16,
      fontWeight: Platform.OS === 'ios' ? 600 : 800,
      marginTop: 20,
      marginBottom: 8,
      paddingHorizontal: 25,
    },

    confirmButton: {
      marginBottom: 10,
      backgroundColor: 'white',
      opacity: 0.6,
    },
    confirmButtonEnabled: {
      marginBottom: 10,
      backgroundColor: 'white',
      // opacity: 1,
    },
    confirmButtonDisabled: {
      marginBottom: 10,
      backgroundColor: 'white',
      opacity: 0.6,
    },

    termsAndPolicyStyle: {
      paddingTop: -10,
      paddingBottom: Platform.OS === 'ios' ? 50 : 20,
    },
  });
}

export default AstrologyLoginWithMobile;
