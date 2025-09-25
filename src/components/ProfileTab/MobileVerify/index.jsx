import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {HelperText, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {CustomButton} from '../../../core';

import Toast from 'react-native-toast-message';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {
  registerWithMobile,
  loginwithMobile,
  setMobileNumber,
  setCountryCodeStore,
  resendOtpMobile,
} from '../../../store/apps/auth';
import {useDispatch, useSelector} from 'react-redux';
import CountryCode from '../../CountryCode';
import {CustomInput} from '../..';
import {isValidNumber} from 'react-native-phone-number-input';
import {BackArrowIcon} from '../../../images';
import {getUserInfo} from '../../../store/apps/userInfo';
import {colors} from '../../../common/NewTheme';

function MobileVerification() {
  const dispatch = useDispatch();
  const styles = useCreateStyles();
  const navigation = useNavigation();
  const iso = useRef('');
  const countryCode = useRef('');
  const isSubmittingRef = useRef(false);

  const [submitting, setSubmitting] = useState(false);
  const [mobileValue, setMobilevalue] = useState(null);

  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const mobileNoUser = useSelector(state => state?.userInfo.mobileNo);
  const mobileVerified = useSelector(state => state?.userInfo.mobileVerified);
  const userId = useSelector(state => state?.userInfo._id);

  useEffect(() => {
    dispatch(getUserInfo());
  }, []);

  useEffect(() => {
    if (mobileNoUser) {
      const mobileStr = mobileNoUser.toString();
      const mobileWithoutCountryCode = mobileStr.startsWith('91')
        ? mobileStr.substring(2)
        : mobileStr;

      setMobilevalue(mobileWithoutCountryCode);
    }
  }, [mobileNoUser]);

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

  function validateNum(num) {
    if (!num || !num.toString()?.length) {
      return true;
    }
    if (!/^[0-9]+$/g.test(`${num}`)) {
      return false;
    }

    const sanitizedNum = num.replace(/\D/g, '');
    return isValidNumber(sanitizedNum, iso.current);
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

      const mobileNo = mobileNoUser
        ? mobileNoUser
        : formik.values.mobile?.length
          ? `${countryCode.current}${formik.values.mobile}`
          : null;

      await dispatch(
        registerWithMobile({mobileNo, countryCode: countryCode.current}),
      ).unwrap();

      navigation.navigate('MobileOTPverification', {
        mobileNo,
        countryCode: countryCode.current,
      });
    } catch (error) {
      const {name: errorName} = error || '';
      const {mobile} = formik.values;

      if (errorName === 'userVerified') {
        const mobileNo = mobileNoUser
          ? mobileNoUser
          : formik.values.mobile?.length
            ? `${countryCode.current}${formik.values.mobile}`
            : null;
        await dispatch(
          loginwithMobile({mobileNo, countryCode: countryCode.current}),
        ).unwrap();

        navigation.navigate('MobileOTPverification', {
          reDirecttoHome: true,
          mobileNo,
        });

        return;
      }

      if (errorName === 'userMobileNotVerified') {
        const mobileNo = mobileNoUser
          ? mobileNoUser
          : formik.values.mobile?.length
            ? `${countryCode.current}${formik.values.mobile}`
            : null;
        navigation.navigate('MobileOTPverification', {mobileNo});
        await resendMobileOTP(mobileNo);
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

  async function resendMobileOTP(mobileNo) {
    try {
      const data = {
        mobileNo: Number(mobileNo),
      };
      await dispatch(resendOtpMobile(data)).unwrap();
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
    <>
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
                  enabledCountryCode
                  onSelect={onSelect}
                  preferredCountries={['in', 'us', 'gb']}
                  defaultCountry="IN"
                  class="country-code-input"
                  testID="countryCodeInput"
                />

                <CustomInput
                  keyboardType="numeric"
                  style={{flex: 1}}
                  fullWidth
                  label="Mobile number"
                  testID="mobileNumber"
                  name="mobile"
                  value={mobileValue}
                  onChangeText={setMobilevalue}
                  disabled={mobileVerified !== true}
                  contentStyle={{backgroundColor: '#e6e6e6'}}
                />
              </View>
            </View>
          </View>

          <View>
            <CustomButton
              style={styles.confirmButton}
              accessibilityLabel="confirmMobile"
              className="confirm-OTP"
              label="Confirm"
              onPress={handleSubmit}
              loading={submitting}
            />
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
      color: 'black',
      fontSize: 16,
      fontWeight: Platform.OS === 'ios' ? 600 : 800,
      marginTop: 20,
      marginBottom: 8,
    },

    confirmButton: {
      marginBottom: Platform.OS === 'ios' ? 25 : 20,
    },
  });
}

export default MobileVerification;
