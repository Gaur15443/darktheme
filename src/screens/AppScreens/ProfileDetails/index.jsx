import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  BackHandler,
  Dimensions,
} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {Text, useTheme, RadioButton} from 'react-native-paper';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';

import {useFormik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';
import {Modal, Portal, HelperText} from 'react-native-paper';
import {CustomButton, GlobalStyle} from '../../../core';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserInfo} from '../../../store/apps/userInfo';
import {
  setUserBasicSignupInfo,
  updateGroupSignupPage,
} from '../../../store/apps/auth';
import CountryCode from '../../../components/CountryCode';
import {onlyInteger} from '../../../utils';
import {isValidNumber} from 'react-native-phone-number-input';
import {CustomInput} from '../../../components';
import {mixpanel} from '../../../../App';
import {Track} from '../../../../App';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import analytics from '@react-native-firebase/analytics';
import FamilyNameCta from '../../../images/Icons/FamilyNameCta';
import HelpModal from '../../../components/HelpModal';
import CleverTap from 'clevertap-react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';
import NewTheme from '../../../common/NewTheme';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import authConfig from '../../../configs';
import config from 'react-native-config';
import {isValidPhoneNumber} from 'libphonenumber-js/mobile';
import parsePhoneNumber from 'libphonenumber-js';
import CustomRadio from '../../../components/ProfileTab/CustomRadio';
import {sanitizeInput} from '../../../utils/sanitizers';

export default function ProfileDetailsScreen({navigation}) {
  const dispatch = useDispatch();

  const iso = useRef('');
  const countryCode = useRef('');
  const countryCodeRef = useRef(null);
  const detailsIsSubmittingRef = useRef(false);

  const personalDetails = useSelector(state => state.userInfo.personalDetails);
  const userId = useSelector(state => state.userInfo._id);
  const mobileVerified = useSelector(state => state.userInfo.mobileVerified);
  const SocialLoginData = useSelector(state => state.socialLoginData.data);
  const [selectedGender, setSelectedGender] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [familySubmitting, setFamilySubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [genderError, setGenderError] = useState(true);

  const userData = useSelector(state => state?.userInfo);

  const {top} = useSafeAreaInsets();
  const theme = useTheme();
  const styles = createStyles();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler?.removeEventListener?.('hardwareBackPress', onBackPress);
    }, []),
  );

  const formik = useFormik({
    initialValues: {
      firstName: '',
      surname: '',
      mobile: '',
    },
    validationSchema: Yup.object().shape({
      firstName: sanitizeInput(Yup.string()
        .required('First name is required')
        .matches(
          /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
          'Field cannot contain special characters or numbers.',
        )),
      surname: sanitizeInput(Yup.string()
        .required('Surname is required')
        .matches(
          /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
          'Field cannot contain special characters or numbers.',
        )),
      mobile: sanitizeInput(Yup.string()
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

        .test('valid-phone', 'Mobile number is invalid', validateNum)),
    }),
  });

  // useEffect(() => {
  //   console.log('---------');
  //   async function fetchData() {
  //     try {
  //       await fetchWalletData(userId);

  //       const response = await axios.get(
  //         `https://lh01p7qp-3000.inc1.devtunnels.ms/mobileVerificationWallet/${userId}`,
  //       );
  //       console.log('response', response.data);

  //       if (response.data.message === 'Wallet already exists') {
  //         // totalBalance is already set in fetchWalletData
  //         console.log('totalBalance from Home:', totalBalance);
  //         return;
  //       } else if (
  //         response.data.message === 'Verification Required' ||
  //         response.data.message === 'Mobile number not found'
  //       ) {
  //         const mobileNumber = response.data.mobileNo
  //           ? response.data.mobileNo.toString()
  //           : null;
  //         navigation.navigate('AstrologyLoginWithMobile', {
  //           onVerified: () => navigation.navigate('AstroHome'),
  //           mobileNumber,
  //         });
  //         console.log('mobileNumber', mobileNumber);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   }

  //   fetchData();
  // }, [navigation, fetchWalletData, totalBalance]);

  useEffect(() => {
    if (SocialLoginData?.givenName && SocialLoginData?.familyName) {
      formik.setFieldValue('firstName', SocialLoginData?.givenName);
      formik.setFieldValue('surname', SocialLoginData?.familyName);
    }
  }, [SocialLoginData]);

  useEffect(() => {
    if (personalDetails?.name && personalDetails?.lastname) {
      formik.setFieldValue('firstName', personalDetails?.name);
      formik.setFieldValue('surname', personalDetails?.lastname);
    }
  }, [personalDetails]);

  useEffect(() => {
    try {
      (async () => {
        await dispatch(getUserInfo()).unwrap();
      })();

      if (personalDetails && Object.keys(personalDetails || {})?.length) {
        formik.values.firstName = personalDetails.name
          ? personalDetails.name
          : SocialLoginData?.givenName;
        formik.values.surname = personalDetails.lastname
          ? personalDetails.lastname
          : SocialLoginData?.familyName;

        setSelectedGender(personalDetails?.gender || '');
        formik.validateForm();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, []);

  const checkMobileExistence = async (mobileNo, userId) => {
    try {
      const fullMobileNo = mobileNo
        ? `${countryCode.current}${mobileNo}`
        : null;
      const response = await axios.post(
        `${authConfig.authBaseUrl}/user/existingEmail`,
        {
          mobileNo: fullMobileNo,
          userId: userId,
        },
      );

      if (response.status === 200) {
        return true;
      }
      if (response.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'User already exists',
        });
        return false;
      }
      Toast.show({
        type: 'error',
        text1: 'Unexpected response from the server.',
      });
      return false;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message || 'An error occurred while checking Mobile No.',
      });
      return false;
    }
  };

  const handleGenderSelect = value => {
    setSelectedGender(value);
    setGenderError(false);
  };

  async function completeSignUp(e) {
    try {
      Keyboard.dismiss();
      setSubmitting(true);
      detailsIsSubmittingRef.current = true;

      const fullMobileNo = await checkMobileExistence(
        formik.values.mobile,
        userData?._id,
      );

      if (!fullMobileNo) {
        setSubmitting(false);
        detailsIsSubmittingRef.current = false;
        return;
      }

      const data = {
        name: formik.values.firstName,
        lastname: formik.values.surname,
        gender: selectedGender,
        countryCode: countryCode.current || null,
        countryISO: iso.current || null,
        mobileNumber: formik.values.mobile
          ? `${countryCode.current}${formik.values.mobile}`
          : null,
      };

      const phoneNo = userData?.mobileNo ? '+' + userData?.mobileNo : '';

      const cleverTapProps1 = {
        Name: `${data?.name} ${data?.lastname}`,
        Identity: userData?._id,
        Email: userData?.email,
        Phone: phoneNo,
        Gender: data?.gender,
      };
      CleverTap.recordEvent('Signup_Verified', cleverTapProps1);

      mixpanel.track('Signup_Verified', {
        user_id: userData?._id,
        email: userData?.email,
        phone: phoneNo,
        userFirstname: data?.name,
        userLastname: data?.lastname,
        gender: data?.gender,
      });

      await dispatch(setUserBasicSignupInfo(data)).unwrap();

      await AsyncStorage.removeItem('Signup');

      formik.values.familyName = formik.values.surname;

      if (userData?._id) {
        const cleverTapProps = {
          Name: `${data?.name} ${data?.lastname}`,
          Identity: userData?._id,
          Email: userData?.email,
          Phone: phoneNo,
          Gender: data?.gender,
        };
        CleverTap.profileSet(cleverTapProps);
        CleverTap.onUserLogin(cleverTapProps);
        CleverTap.recordEvent('signup', cleverTapProps);
        // mixpanel.alias(userData?._id);
        mixpanel.identify(userData?._id);
        mixpanel.getPeople().set({
          $user_id: userData?._id,
          $email: userData?.email,
          $phone: phoneNo,
          $name:
            userData?.personalDetails?.name +
            ' ' +
            userData?.personalDetails?.lastname,
        });
        mixpanel.track('newUserRegistered', {
          user_id: userData?._id,
          email: userData?.email,
          phone: phoneNo,
          userFirstname: data?.name,
          userLastname: data?.lastname,
          gender: data?.gender,
        });
      }
      // *** meta and firebase signup
      if (config.ENV === 'prod') {
        await analytics().logEvent('sign_up');
        AppEventsLogger.logEvent('signup', {
          email: userData?.email || '',
          phone: phoneNo,
          first_name: data?.name,
          last_name: data?.lastname,
        });
      }

      await handleUpdateGroupSignupPage();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setSubmitting(false);
      detailsIsSubmittingRef.current = false;
    }
  }

  async function handleUpdateGroupSignupPage(e) {
    try {
      setFamilySubmitting(true);

      if (!userId) {
        await dispatch(getUserInfo()).unwrap();
      }

      const data = {
        groupName: `${formik.values.surname} Family`,
      };

      const payload = {
        userId,
        data,
      };

      await dispatch(updateGroupSignupPage(payload)).unwrap();
      await dispatch(getUserInfo()).unwrap();

      navigation.reset({
        index: 0,
        routes: [{name: 'Home', params: {comingFrom: 'SignUpPage'}}],
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setFamilySubmitting(false);
    }
  }
  function onSelect(data) {
    countryCode.current = data?.dialCode;
    iso.current = data.iso;
    formik.setFieldValue('mobile', null);
  }
  function validateNum(num) {
    if (!num || !num.toString()?.length) {
      return true;
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

  return (
    <ErrorBoundary.Screen>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}>
        <View
          style={{
            backgroundColor: theme.colors.background,
            paddingTop: Platform.select({
              android: top,
            }),
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <GlobalStyle>
            <View style={styles.parent}>
              <Image
                source={{
                  uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png',
                }}
                style={styles.logo}
              />
              <View>
                <Text variant="headlineLarge" style={styles.title}>
                  Profile Details
                </Text>
                <View>
                  <CustomInput
                    label={'First Name'}
                    style={{marginTop: 10}}
                    fullWidth
                    testID="first-name"
                    name="firstName"
                    value={formik.values.firstName}
                    onChangeText={text => {
                      const capitalizedValue =
                        text.charAt(0).toUpperCase() + text.slice(1);
                      formik.handleChange({
                        target: {
                          name: 'firstName',
                          value: capitalizedValue,
                        },
                      });
                    }}
                    onBlur={formik.handleBlur('firstName')}
                    error={
                      formik.touched.firstName &&
                      Boolean(formik.errors.firstName)
                    }
                    errorText={formik.errors.firstName}
                    required
                  />
                  <CustomInput
                    style={styles.input}
                    fullWidth
                    label="Surname"
                    testID="last-name"
                    name="surname"
                    value={formik.values.surname}
                    onChangeText={text => {
                      const capitalizedValue =
                        text.charAt(0).toUpperCase() + text.slice(1);

                      formik.handleChange({
                        target: {
                          name: 'surname',
                          value: capitalizedValue,
                        },
                      });
                    }}
                    required
                    onBlur={formik.handleBlur('surname')}
                    error={
                      formik.touched.surname && Boolean(formik.errors.surname)
                    }
                    errorText={formik.errors.surname}
                  />
                  <Text variant="bodyLarge" style={styles.genderLabel}>
                    Select Gender
                    <Text
                      style={{
                        color: 'red',
                      }}>
                      *
                    </Text>
                  </Text>

                  <RadioButton.Group
                    accessibilityLabel="gender"
                    onValueChange={handleGenderSelect}
                    value={selectedGender}>
                    <View style={[styles.radioButtonContainer]}>
                      <CustomRadio
                        label="Male"
                        value="male"
                        onPress={() => {
                          setSelectedGender('male');
                          setGenderError(false);
                        }}
                        checked={selectedGender === 'male'}
                        labelStyle={{
                          color: '#444444',
                          fontSize: 16,
                          fontWeight: 600,
                          letterSpacing: 0,
                          marginLeft: -5,
                        }}
                        accessibilityLabel="gender-male"
                      />
                    </View>

                    <View style={[styles.radioButtonContainer]}>
                      <CustomRadio
                        label="Female"
                        value="female"
                        onPress={() => {
                          setSelectedGender('female');
                          setGenderError(false);
                        }}
                        checked={selectedGender === 'female'}
                        labelStyle={{
                          color: '#444444',
                          fontSize: 16,
                          fontWeight: 600,
                          letterSpacing: 0,
                          marginLeft: -5,
                        }}
                        accessibilityLabel="gender-female"
                      />
                    </View>

                    <View style={[styles.radioButtonContainer]}>
                      <CustomRadio
                        label="Unspecified"
                        value="unspecified"
                        onPress={() => {
                          setSelectedGender('unspecified');
                          setGenderError(false);
                        }}
                        checked={selectedGender === 'unspecified'}
                        labelStyle={{
                          color: '#444444',
                          fontSize: 16,
                          fontWeight: 600,
                          letterSpacing: 0,
                          marginLeft: -5,
                        }}
                        accessibilityLabel="gender-unspecified"
                      />
                    </View>
                  </RadioButton.Group>
                  {genderError && (
                    <HelperText
                      type="error"
                      style={{
                        fontSize: 12.3,
                        letterSpacing: 0.7,
                        marginTop: -5,
                      }}>
                      Gender is required
                    </HelperText>
                  )}

                  {!mobileVerified && (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: Platform.OS === 'ios' ? 30 : 20,
                        marginTop: Platform.OS === 'ios' ? 4 : 5,
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
                        autoComplete="tel"
                        keyboardType="phone-pad"
                        style={{flex: 1}}
                        fullWidth
                        label="Mobile Number"
                        testID="mobileNumber"
                        name="mobile"
                        value={formik.values.mobile}
                        onChangeText={_text => {
                          formik.handleChange({
                            target: {
                              name: 'mobile',
                              value: _text,
                            },
                          });
                          validateNum(_text);
                          const isValidMobile = _text.length === 10;
                          formik.setFieldValue('mobile', _text);
                          setSubmitting(isValidMobile ? false : submitting);
                        }}
                        onBlur={formik.handleBlur('mobile')}
                        error={
                          formik.touched.mobile && Boolean(formik.errors.mobile)
                        }
                        helperText={
                          formik.touched.mobile && formik.errors.mobile
                        }
                      />
                    </View>
                  )}

                  {formik.touched.mobile && formik.errors.mobile && (
                    <HelperText type="error">{formik.errors.mobile}</HelperText>
                  )}
                </View>
              </View>
              {!mobileVerified && (
                <Text
                  style={[
                    styles.endText,
                    {marginBottom: 15, marginTop: mobileVerified ? 3 : 0},
                  ]}>
                  Gain access to our premium support WhatsApp channel for timely
                  updates on iMeUsWe and important announcements.{'\n'}
                  Keep your mobile number updated to stay informed!
                </Text>
              )}
              <View>
                <CustomButton
                  style={{marginTop: !mobileVerified ? 0 : 20}}
                  onPress={completeSignUp}
                  label="Sign up"
                  loading={submitting}
                  testID="completeSignup"
                  disabled={
                    submitting ||
                    !formik.isValid ||
                    !selectedGender?.trim?.()?.length
                  }
                />
                <Text variant="bold" style={styles.infoText}>
                  Having trouble signing up?{' '}
                  <Text
                    variant="bold"
                    style={styles.link}
                    onPress={() => {
                      setShowHelpModal(true);
                      setIsVisible(false);
                    }}>
                    Click here{' '}
                  </Text>
                  for assistance.
                </Text>
              </View>
            </View>
          </GlobalStyle>
          <Portal>
            <Modal
              style={styles.modalStyle}
              contentContainerStyle={{
                borderRadius: 10,
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                top: 50,
                left: 10,
                right: 10,
                transform: [{translateX: 0}, {translateY: 50}],
              }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    padding: 10,
                    paddingTop: 30,
                    borderRadius: 10,
                  }}></ScrollView>
              </KeyboardAvoidingView>
            </Modal>
          </Portal>
        </View>
        {showHelpModal && (
          <Portal>
            <HelpModal
              onClose={() => {
                setShowHelpModal(false);
                setIsVisible(true);
              }}
            />
          </Portal>
        )}
      </SafeAreaView>
    </ErrorBoundary.Screen>
  );
}

function createStyles() {
  return StyleSheet.create({
    logoContainer: {
      alignItems: 'center',
    },
    logo: {
      width: 180,
      height: 50,
      resizeMode: 'contain',
      marginBottom: 6,
      alignSelf: 'center',
    },
    link: {
      color: NewTheme.colors.linkLightBlue,
      fontSize: 14,
    },
    parent: {
      height: '100%',
      display: 'flex',
      // justifyContent: 'space-between',
      paddingHorizontal: 25,
    },
    title: {
      marginBottom: 10,
      fontWeight: '700',
    },
    input: {
      marginTop: 10,
    },
    genderLabel: {
      marginTop: 8,
      marginBottom: 3,
      fontWeight: 'bold',
    },
    gender: {
      display: 'flex',
      flexDirection: 'row',
      gap: 16,
    },
    createFamilyTitle: {
      textAlign: 'center',
      marginBottom: 10,
      fontSize: 26,
      lineHeight: 32.9,
      fontWeight: 700,
    },
    modalStyle: {
      paddingHorizontal: 10,
      justifyContent: 'center',
      // height: 'auto',
    },
    infoText: {
      textAlign: 'center',
      marginBottom: 40,
    },
    endText: {
      textAlign: 'center',
      fontWeight: Platform.OS === 'ios' ? '800' : '800',
    },
    modalContainer: {
      // borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: NewTheme.colors.backgroundCreamy,
    },
    // Gender
    radioButtonContainer: {
      marginVertical: 3,
      paddingHorizontal: 1,
    },
  });
}
