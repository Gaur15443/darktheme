import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { RadioButton } from 'react-native-paper';
import { useTheme, HelperText, Avatar, Text } from 'react-native-paper';
import { GlobalStyle } from '../../../core';
import { CustomButton } from '../../../core';
import { isValidNumber } from 'react-native-phone-number-input';
import { DefaultImage } from '../../../core';
import Theme from '../../../common/Theme';
import { GlobalHeader, CustomInput, GlobalCheckBox } from '../../../components';
import Toast from 'react-native-toast-message';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import { ProfilePicCropper } from '../../../core';
import { getUserInfo } from '../../../store/apps/userInfo';
import CustomRadio from '../CustomRadio';
import { useDispatch, useSelector } from 'react-redux';
import Confirm from '../../Confirm';
import { getAdduserProfiles } from '../../../store/apps/addUserProfile';
import { useNavigation } from '@react-navigation/native';
import {
  fetchUserProfile,
  resetUserProfile,
} from '../../../store/apps/fetchUserProfile';
import moment from 'moment';
import CountryCode from '../../CountryCode';
import { onlyInteger } from '../../../utils';
import _ from 'lodash';
import { parsePhone } from '../../../utils/format';
import VerifiedIcon from '../../../images/Icons/verifiedIcon';
import ReverifyIcon from '../../../images/Icons/ReverifyIcon';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { nameValidator } from '../../../utils/validators';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import { Dropdown } from 'react-native-element-dropdown';
import { updateProfilePic } from '../../../core/ProfilePicCropper/updateProfilePic';
import NewTheme, { colors } from '../../../common/NewTheme';
import { capitalize } from '../../../utils/format';
import axios from 'axios';
import authConfig from '../../../configs';
import { loginwithMobile, resendOtpMobile } from '../../../store/apps/auth';
import { isValidPhoneNumber } from 'libphonenumber-js/mobile';
import parsePhoneNumber from 'libphonenumber-js';
import { desanitizeInput } from '../../../utils/sanitizers';

const BasicFact = ({ route }) => {
  useNativeBackHandler(handleBack);
  const data = [
    { label: 'On', value: '1' },
    { label: 'Around (~)', value: '2' },
  ];
  const id = route.params ? route.params.id : undefined;
  const styles = StyleSheet.create({
    textInputStyle: {
      border: '0px solid #ccc6c6',
      marginTop: 15,
    },
    itemTextStyle: {
      color: 'black',
      fontWeight: 400,
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    column: {
      flex: 1,
    },
    prefixColumn: {
      flex: 1,
      marginTop: 15,
    },
    datePickerColumn: {
      flex: 2,
      marginLeft: 5,
    },

    dropdown: {
      backgroundColor: 'white',
      height: 40,
      borderColor: 'rgba(51, 48, 60, 0.3)',
      borderWidth: 1,
      borderRadius: 5,
      paddingLeft: 8,
    },
    mobiletextInputStyle: {
      border: '0px solid #ccc6c6',
    },
    dateContainer: {
      flexDirection: 'row',
      gap: 5,
    },
    addtext: {
      marginLeft: 20,
      fontSize: 18,
      color: NewTheme.colors.secondaryLightBlue,
    },
    row1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    column2: {
      flex: 1,
      marginHorizontal: 10,
    },

    Gendercontainer: {
      marginTop: 5,
      padding: 5,
      borderWidth: 1,
      borderColor: Theme.light.darkOrange,
      borderRadius: 6,
      backgroundColor: 'transparent',
    },

    Selectlabel: {
      fontSize: 18,
      marginBottom: 5,
      letterSpacing: 0,
    },

    radioButtonContainer: {
      marginVertical: 5.2,
    },

    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      width: 320,
      alignItems: 'center',
    },

    modalText: {
      fontSize: 20,
      fontWeight: '1000',
      textAlign: 'center',
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    subText: {
      fontSize: 12,
      marginBottom: 20,
      letterSpacing: 0,
      color: 'red',
      fontWeight: Platform.OS === 'ios' ? 600 : 900,
      textAlign: 'center',
      marginBottom: 14,
    },

    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },

    modalButton: {
      backgroundColor: Theme.light.primary,
      padding: 10,
      borderRadius: 6,
      width: '45%',
      alignItems: 'center',
    },
    CancelmodalButtonText: {
      color: 'white',
      letterSpacing: 0,
      fontSize: 13,
      fontWeight: '1000',
    },
    ConfirmChangemodalButtonText: {
      color: 'white',
      letterSpacing: 0,
      fontSize: 13,
      fontWeight: '1000',
    },
  });

  const validationSchema = Yup.object().shape({
    firstname: Yup.string()
      .required('This field is required')
      .matches(
        /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
        'Field cannot contain special characters or numbers.',
      ),
    middlename: Yup.string().matches(
      /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
      'Field cannot contain special characters or numbers.',
    ),
    surname: Yup.string()
      .required('This field is required')
      .matches(
        /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
        'Field cannot contain special characters or numbers.',
      ),
    emailuser: Yup.string().email('Invalid email'),

    mobileNo: Yup.string()
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
    secondaryEmail: Yup.string().optional().email('Invalid email'),
    secondaryMobileNo: Yup.string()
      .nullable()
      .optional()
      .test('valid-phone', 'Mobile number is invalid', validateNum),
  });

  const dispatch = useDispatch();
  const theme = useTheme();

  const iso = useRef('');
  const [defaultCountry, setDefaultCountry] = useState(null);
  const [CroppedImageData, setCroppedImageData] = useState(null);
  const [isFocusDeathPrefix, setIsFocusDeathPrefix] = useState(false);
  const [isFocusPrefix, setIsFocusPrefix] = useState(false);

  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const navigation = useNavigation();
  const [selectedGender, setSelectedGender] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingGender, setPendingGender] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const dateInputRef = useRef(null);
  const [goToMobileScreen, setGoToMobileScreen] = useState(false);
  const [goToEmailScreen, setGoToEmailScreen] = useState(false);
  const [showDatePickerDeath, setShowDatePickerDeath] = useState(false);
  const [genderConfirmed, setGenderConfirmed] = useState(false);
  const [confirmationGender, setConfirmationGender] = useState(false);
  const [selectedDeathDate, setSelectedDeathDate] = useState(null);
  const dateInputRefDeath = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingMobile, setLoadingMobile] = useState(true);

  const userInfo = useSelector(state => state?.userInfo);

  const userId = id ? id : useSelector(state => state?.userInfo._id);
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );
  const basicInfoGender = useSelector(
    state =>
      state?.fetchUserProfile?.basicInfo[userId]?.myProfile?.personalDetails
        ?.gender,
  );
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const groupId = useSelector(state => state.userInfo.linkedGroup);

  const toastMessages = useSelector(
    state =>
      state?.getToastMessages?.toastMessages?.Info_Tab?.basic_facts_error,
  );

  const [showNickName, setShowNickName] = useState(false);

  const isFromReverifyRef = useRef(false);
  const isFromMobileReverifyRef = useRef(false);

  // Email APi Check
  const checkEmailExistence = async (email, userId) => {
    try {
      const response = await axios.post(
        `${authConfig.authBaseUrl}/user/existingEmail`,
        {
          email: email,
          userId: userId,
        },
      );
      if (response.status === 200) {
        return true;
      }
      if (response.status === 201) {
        Toast.show({
          type: 'error',
          text1: toastMessages?.['12001'],
        });
        return false;
      }
      return false;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.['12002'],
      });
      return false;
    }
  };

  const checkMobileExistence = async (mobileNo, userId) => {
    try {
      const fullMobileNo = formik.values.mobileNo
        ? `${formik.values.countryCode}${formik.values.mobileNo}`
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
          text1: toastMessages?.['12003'],
        });
        return false;
      }
      return false;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.['12004'],
      });
      return false;
    }
  };

  async function handleMobileOTP(mobileNo) {
    try {
      const mobileNoFormik = formik.values.mobileNo
        ? `${formik.values.countryCode}${formik.values.mobileNo}`
        : null;
      const res = await dispatch(
        resendOtpMobile({ mobileNo: mobileNoFormik }),
      ).unwrap();
    } catch (error) {
      const { name: errorName } = error || '';
      if (errorName === 'userVerified') {
        const mobileNoFormik = formik.values.mobileNo
          ? `${formik.values.countryCode}${formik.values.mobileNo}`
          : null;
        const mobile = mobileNoFormik;
        const res = await dispatch(loginwithMobile({ mobile })).unwrap();
      } else if (errorName === 'userDoesNotExist') {
        const mobileNoFormik = formik.values.mobileNo
          ? `${formik.values.countryCode}${formik.values.mobileNo}`
          : null;
        const mobile = mobileNoFormik;
        await resendMobileOTP(mobile);
      } else if (userManagementToastsConfig?.signup?.errors?.[errorName]) {
        error.message = userManagementToastsConfig?.signup?.errors?.[errorName];
        Toast.show({
          type: 'error',
          text1: toastMessages?.['12004'],
        });
      } else {
        Toast.show({ type: 'error', text1: toastMessages?.['12004'] });
      }
    }
  }

  async function resendMobileOTP(mobileNoFormik) {
    try {
      const data = { mobileNo: mobileNoFormik };
      const res = await dispatch(resendOtpMobile(data)).unwrap();
    } catch (error) {
      if (userManagementToastsConfig?.signup?.errors?.[errorName]) {
        error.message = userManagementToastsConfig?.signup?.errors?.[errorName];
        Toast.show({
          type: 'error',
          text1: toastMessages?.['12005'],
        });
      } else {
        Toast.show({ type: 'error', text1: toastMessages?.['12005'] });
      }
    }
  }

  const handleClose = async () => {
    await dispatch(fetchUserProfile(userId))
      .unwrap()
      .then(() => {
        dispatch(getUserInfo());
        setLoading(false);

        if (isFromMobileReverifyRef.current || goToMobileScreen) {
          navigation.navigate('MobileOTPverification');
        } else if (isFromReverifyRef.current || goToEmailScreen) {
          navigation.navigate('EmailReVerify');
        } else {
          navigation.goBack();
        }
        // dispatch(resetUserProfile(userId));
        setGoToMobileScreen(false);
        setGoToEmailScreen(false);
        isFromReverifyRef.current = false;
        isFromMobileReverifyRef.current = false;
      });
  };

  useEffect(() => {
    if (basicInfoGender) {
      setSelectedGender(basicInfoGender);
    }
  }, [basicInfoGender]);

  const handleGenderChange = value => {
    setPendingGender(value);
    setShowModal(true);
  };

  const handleConfirm = () => {
    formik.setFieldValue('gender', pendingGender);
    setShowModal(false);
    setConfirmationGender(true);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleDateChange = date => {
    setSelectedDate(date);
    setShowDatePicker(false);
    dateInputRef.current.blur();
  };
  const handleDateChangeDeath = date => {
    if (selectedDate && moment(date).isBefore(selectedDate)) {
      Alert.alert(
        'Invalid Date',
        'Death date cannot be earlier than birth date.',
      );
      return;
    }
    setSelectedDeathDate(date);
    setShowDatePickerDeath(false);
    dateInputRefDeath.current.blur();
  };

  const formik = useFormik({
    initialValues: {
      gender: '',
      livingStatus: 'yes',
      firstname: '',
      middlename: '',
      surname: '',
      prefix: '',
      prefixDeath: '',
      emailuser: '',
      placeOfBirth: '',
      curentPlace: '',

      placeOfDeath: '',

      mobileNo: '',
      countryCode: '',
      secondaryMobileNo: '',
      secondaryEmail: '',
    },
    validationSchema,
    onSubmit: async values => {
      try {
        let allClinks = [];
        if (Array.isArray(basicInfo?.cLink) && basicInfo.cLink.length > 0) {
          allClinks = basicInfo.cLink.flatMap(link => link?.linkId || []);
          allClinks = [...allClinks, basicInfo?._id];
        }
        setLoading(true);
        let imageUrl = null;
        if (CroppedImageData !== null) {
          await updateProfilePic(CroppedImageData, userId, groupId, dispatch);
          const updatedimage = await dispatch(fetchUserProfile(userId));
          imageUrl = updatedimage?.payload?.myProfile?.orignalimageurl;
        }

        // If already registred for email
        let emailToSave = basicInfo?.email || null;
        if (values.emailuser && !userInfo.emailVerified) {
          const canSaveEmail = await checkEmailExistence(
            values.emailuser,
            userId,
          );
          if (!canSaveEmail) {
            setLoading(false);
            setGoToEmailScreen(true);
            return;
          }
          emailToSave = values.emailuser.toLocaleLowerCase();
        }

        let mobileToSave = basicInfo?.mobileNo || null;
        if (values.mobileNo && !userInfo.mobileVerified) {
          const canMobileSave = await checkMobileExistence(
            values.mobileNo,
            userId,
          );
          if (!canMobileSave) {
            setLoading(false);
            setGoToMobileScreen(true);
            return;
          }
          mobileToSave = values.mobileNo;
        }

        const formData = {
          countryISO: iso.current,
          countryCode: formik.values.countryCode,
          mobileNo: formik.values.mobileNo
            ? `${formik.values.countryCode}${formik.values.mobileNo}`
            : null,
          secondaryMobileNo: formik.values.secondaryMobileNo
            ? `${formik.values.countryCode}${formik.values.secondaryMobileNo}`
            : null,
          personalDetails: {
            name: formik.values.firstname,
            middlename: formik.values.middlename,
            profilepic: imageUrl || basicInfo?.orignalimageurl,
            lastname: formik.values.surname,
            relationStatus: basicInfo?.personalDetails?.relationStatus,
            // gender: basicInfo?.personalDetails?.gender,
            gender: formik.values.gender,
            livingStatus: formik.values.livingStatus,
            nickname: formik.values.nickname,
            showNickname: showNickName,
          },

          location: {
            placeOfBirth: formik.values.placeOfBirth || null,

            placeOfDeath: formik.values.placeOfDeath || null,

            currentlocation: formik.values.curentPlace || null,

            currentLocationObject: basicInfo?.location?.currentLocationObject,
          },
          // email: formik.values.emailuser ? formik.values.emailuser : undefined,
          email: emailToSave,
          secondaryEmail: formik.values.secondaryEmail
            ? formik.values.secondaryEmail
            : undefined,
          livingStatus: formik.values.value,
          BD_Flag: 1,
          DD_Flag: 1,

          isAroundDOB: selectedDate ? formik.values.prefix !== 'On' : false,
          isAroundDOD: selectedDeathDate
            ? formik.values.prefixDeath !== 'On'
            : false,
          birthDetails: {
            ...basicInfo.birthDetails,
            dob: selectedDate || null,
            dod: selectedDeathDate || null,
          },

          userId,
          cLinks: basicInfo?.cLink?.length ? allClinks : [],
          cloneOwner: basicInfo?.isClone
            ? basicInfo?.cLink?.[0]?.linkId?.[0]
            : null,
          clinkIsPresent: basicInfo?.cLink?.length > 0,
        };

        await dispatch(getAdduserProfiles(formData)).unwrap();
        dispatch(resetUserProfile(userId));
      } catch (error) {
        setLoading(false);

        Toast.show({
          type: 'error',
          text1: toastMessages?.['12005'],
        });
      } finally {
        setLoading(false);
        handleClose();
      }
    },
  });

  useEffect(() => {
    try {
      if (basicInfo?.countryCode && basicInfo?.mobileNo) {
        const phoneInfo = parsePhone(
          `${basicInfo.mobileNo}`.startsWith('+')
            ? basicInfo.mobileNo
            : `+${basicInfo.mobileNo}`,
          basicInfo?.countryISO || '',
        );
        if (phoneInfo?.country) {
          iso.current = phoneInfo?.country;
          setDefaultCountry(phoneInfo?.country);
        }
        formik.values.mobileNo = phoneInfo.nationalNumber;
        formik.values.countryCode = basicInfo.countryCode;
      }

      if (basicInfo?.countryCode && basicInfo?.secondaryMobileNo) {
        const phoneInfo = parsePhone(
          `${basicInfo.secondaryMobileNo}`.startsWith('+')
            ? basicInfo.secondaryMobileNo
            : `+${basicInfo.secondaryMobileNo}`,
          basicInfo?.countryISO || '',
        );
        if (phoneInfo?.country) {
          iso.current = phoneInfo.country;
          setDefaultCountry(phoneInfo.country);
        }

        formik.values.countryCode = basicInfo.countryCode;
      }

      if (basicInfo && basicInfo.personalDetails) {
        if (
          basicInfo.personalDetails.name &&
          formik.values.firstname !== basicInfo.personalDetails.name
        ) {
          formik.setFieldValue('firstname', basicInfo.personalDetails.name);
        }
        if (
          basicInfo.personalDetails.gender &&
          formik.values.gender !== basicInfo.personalDetails.gender
        ) {
          formik.setFieldValue('gender', basicInfo.personalDetails.gender);
        }
        if (
          basicInfo.personalDetails.gender &&
          basicInfo.personalDetails.gender !== 'unspecified'
        ) {
          setGenderConfirmed(true);
        }

        if (
          basicInfo.personalDetails.lastname &&
          formik.values.surname !== basicInfo.personalDetails.lastname
        ) {
          formik.setFieldValue('surname', basicInfo.personalDetails.lastname);
        }
        if (
          basicInfo.personalDetails.nickname &&
          formik.values.nickname !== basicInfo.personalDetails.nickname
        ) {
          formik.setFieldValue('nickname', basicInfo.personalDetails.nickname);
        }

        if (
          basicInfo.personalDetails.livingStatus &&
          formik.values.livingStatus !== basicInfo.personalDetails.livingStatus
        ) {
          formik.setFieldValue(
            'livingStatus',
            basicInfo.personalDetails.livingStatus,
          );
        }
        if (
          basicInfo.personalDetails.middlename &&
          formik.values.middlename !== basicInfo.personalDetails.middlename
        ) {
          formik.setFieldValue(
            'middlename',
            basicInfo.personalDetails.middlename,
          );
        }
        if (basicInfo.email && formik.values.emailuser !== basicInfo.email) {
          formik.setFieldValue('emailuser', basicInfo.email);
        }
        if (
          basicInfo.secondaryEmail &&
          formik.values.secondaryEmail !== basicInfo.secondaryEmail
        ) {
          formik.setFieldValue('secondaryEmail', basicInfo.secondaryEmail);
        }

        if (basicInfo?.location?.placeOfBirth) {
          formik.setFieldValue(
            'placeOfBirth',
            basicInfo?.location?.placeOfBirth?.length
              ? basicInfo?.location?.placeOfBirth
              : (basicInfo?.location?.placeOfBirth?.formatted_address ?? ''),
          );
        }

        if (basicInfo?.location?.placeOfDeath) {
          formik.setFieldValue(
            'placeOfDeath',
            basicInfo?.location?.placeOfDeath?.length
              ? basicInfo?.location?.placeOfDeath
              : (basicInfo?.location?.placeOfDeath?.formatted_address ?? ''),
          );
        }
        if (basicInfo?.location?.currentlocation) {
          formik.setFieldValue(
            'curentPlace',
            basicInfo?.location?.currentlocation?.length
              ? basicInfo?.location?.currentlocation
              : (basicInfo?.location?.currentlocation?.formatted_address ?? ''),
          );
        }
        if (basicInfo?.birthDetails?.dob) {
          setSelectedDate(moment(basicInfo?.birthDetails?.dob).toDate());
        }

        formik.setFieldValue(
          'prefix',
          basicInfo?.isAroundDOB === false ? 'On' : 'Around (~)',
        );
        formik.setFieldValue(
          'prefixDeath',
          basicInfo?.isAroundDOD === false ? 'On' : 'Around (~)',
        );
        if (basicInfo?.birthDetails?.dod) {
          setSelectedDeathDate(moment(basicInfo?.birthDetails?.dod).toDate());
        }
      }
      setLoadingMobile(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.['12005'],
      });
    }
  }, [basicInfo]);

  useEffect(() => {
    if (basicInfo && !loadingMobile) {
      const re = new RegExp(`^${basicInfo.countryCode}`);
      formik.setFieldValue(
        'mobileNo',
        `${basicInfo?.mobileNo || ''}`.replace(re, ''),
      );
    }

    if (basicInfo && !loadingMobile) {
      const re = new RegExp(`^${basicInfo.countryCode}`);
      formik.setFieldValue(
        'secondaryMobileNo',
        `${basicInfo?.secondaryMobileNo || ''}`.replace(re, ''),
      );
    }
  }, [basicInfo, loadingMobile]);

  function handleBack() {
    if (
      formik.values.firstname !== '' ||
      formik.values.middlename !== '' ||
      formik.values.gender !== '' ||
      formik.values.surname !== '' ||
      formik.values.nickname !== '' ||
      formik.values.emailuser !== '' ||
      selectedDate !== null ||
      formik.values.placeOfBirth !== '' ||
      formik.values.curentPlace !== '' ||
      selectedDeathDate !== null ||
      formik.values.placeOfDeath !== ''
    ) {
      seOpenConfirmPopup(true);
    } else {
      seOpenConfirmPopup(false);
    }
  }

  function onSelect(data) {
    iso.current = data.iso;
    formik.setFieldValue('countryCode', data?.dialCode);
    setDefaultCountry(data?.iso);

    if (`${basicInfo?.countryCode}` === data?.dialCode) {
      const re = new RegExp(`^${basicInfo?.countryCode}`);
      formik.setFieldValue(
        'mobileNo',
        `${basicInfo?.mobileNo || ''}`.replace(re, ''),
      );
    } else {
      formik.setFieldValue('mobileNo', '');
      formik.setFieldValue('secondaryMobileNo', '');
    }
  }
  function validateNum(num) {
    if (!num || !num.toString()?.length) {
      return true;
    }
    const sanitizedNum = num.replace(/\D/g, '');
    if (sanitizedNum.startsWith('0')) {
      return false;
    }
    const fullNumber = `+${formik.values.countryCode}${sanitizedNum}`;
    const phoneNumber = parsePhoneNumber(fullNumber);

    if (phoneNumber) {
      phoneNumber.formatNational();
      return isValidPhoneNumber(fullNumber);
    }
  }

  const handleLivingStatusChange = status => {
    formik.handleChange('livingStatus')(status);
    if (status === 'yes') {
      setSelectedDeathDate(null);
      formik.setFieldValue('placeOfDeath', '');
      formik.setFieldValue('curentPlace', '');
    }
  };
  const handleSelectionChange = (label, setFieldValue, name) => {
    setFieldValue(name, label);
  };
  const filteredData = value => {
    return data.filter(item => item.label !== value);
  };

  useEffect(() => {
    setShowNickName(basicInfo?.personalDetails?.showNickname);
  }, []);
  // Checkbox change handler
  const handleCheckboxChange = () => {
    setShowNickName(!showNickName);
  };

  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Basic Facts'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          <GlobalStyle>
            <View>
              {openConfirmPopup && (
                <Confirm
                  title={'Are you sure you want to leave?'}
                  subTitle={'If you discard, you will lose your changes.'}
                  discardCtaText={'Discard'}
                  continueCtaText={'Continue Editing'}
                  onContinue={() => seOpenConfirmPopup(false)}
                  onDiscard={() => {
                    navigation.goBack();
                  }}
                  accessibilityLabel="confirm-popup-basic-fact"
                  onBackgroundClick={() => seOpenConfirmPopup(false)}
                  onCrossClick={() => seOpenConfirmPopup(false)}
                />
              )}

              <View>
                <View style={{ flex: 1 }}>
                  <ProfilePicCropper
                    byForm
                    setCroppedImageData={setCroppedImageData}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 10,
                        paddingBottom: 10,
                        paddingLeft: 10,
                        alignItems: 'center',
                      }}
                      testID="add-profile"
                    >
                      {CroppedImageData?.path ||
                      basicInfo?.personalDetails?.profilepic ? (
                        <Avatar.Image
                          size={55}
                          accessibilityLabel="Basic-Fact-Profile"
                          source={{
                            uri:
                              CroppedImageData?.path ||
                              basicInfo?.personalDetails?.profilepic,
                          }}
                          style={{
                            borderWidth: 3,
                            borderColor: 'rgb(41, 221, 69)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      ) : (
                        <View
                          style={styles.placeholder}
                          accessibilityLabel="Basic-Fact-DefaultImage"
                        >
                          <DefaultImage
                            size={64}
                            firstName={basicInfo?.personalDetails?.name}
                            lastName={basicInfo?.personalDetails?.lastname}
                            gender={basicInfo?.personalDetails?.gender}
                          />
                        </View>
                      )}
                      <Text
                        style={styles.addtext}
                        testID="updatePhotoBasic"
                        accessibilityLabel="Update Profile Photo"
                      >
                        Update Profile Photo
                      </Text>
                    </View>
                  </ProfilePicCropper>
                </View>
                <View style={styles.dateContainer}>
                  <CustomInput
                    name="firstname"
                    testID="first-name"
                    mode="outlined"
                    label="First Name"
                    onChangeText={text => {
                      formik.setFieldValue('firstname', text);
                    }}
                    accessibilityLabel="first-name"
                    required
                    clearable
                    value={formik.values.firstname}
                    style={[
                      styles.textInputStyle,
                      { backgroundColor: 'white' },
                      { flex: 1 },
                    ]}
                    onBlur={formik.handleBlur('firstname')}
                    error={
                      formik.touched.firstname &&
                      Boolean(formik.errors.firstname)
                    }
                    helperText={
                      formik.touched.firstname && formik.errors.firstname
                    }
                  />
                  <CustomInput
                    name="middlename"
                    testID="middlename"
                    mode="outlined"
                    label="Middle Name"
                    accessibilityLabel="middlename"
                    style={[
                      styles.textInputStyle,
                      { backgroundColor: 'white' },
                      { flex: 1 },
                    ]}
                    clearable
                    onChangeText={text => {
                      formik.setFieldValue('middlename', text);
                    }}
                    value={formik.values.middlename}
                    onBlur={formik.handleBlur('middlename')}
                    error={
                      formik.touched.middlename &&
                      Boolean(formik.errors.middlename)
                    }
                    helperText={
                      formik.touched.middlename && formik.errors.middlename
                    }
                  />
                </View>

                <View>
                  <CustomInput
                    name="surname"
                    testID="surname"
                    mode="outlined"
                    label="Surname"
                    required
                    accessibilityLabel="surname"
                    clearable
                    style={[
                      styles.textInputStyle,
                      { backgroundColor: 'white' },
                    ]}
                    onChangeText={text => {
                      formik.setFieldValue('surname', text);
                    }}
                    value={formik.values.surname}
                    onBlur={formik.handleBlur('surname')}
                    error={
                      formik.touched.surname && Boolean(formik.errors.surname)
                    }
                    helperText={formik.touched.surname && formik.errors.surname}
                  />
                </View>
                <View>
                  <CustomInput
                    name="nickname"
                    testID="nickname"
                    mode="outlined"
                    label="Nickname"
                    // required
                    accessibilityLabel="nickname"
                    clearable
                    style={[
                      styles.textInputStyle,
                      { backgroundColor: 'white' },
                    ]}
                    onChangeText={text => {
                      formik.setFieldValue('nickname', text);
                    }}
                    value={formik.values.nickname}
                    onBlur={formik.handleBlur('nickname')}
                    error={
                      formik.touched.nickname && Boolean(formik.errors.nickname)
                    }
                    helperText={
                      formik.touched.nickname && formik.errors.nickname
                    }
                  />
                  <View
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    <View style={{ flex: 1, paddingTop: 4 }}>
                      <GlobalCheckBox
                        checkBoxColor={NewTheme.colors.primaryOrange}
                        testID="add-member-showNickname"
                        check={showNickName}
                        onCheck={handleCheckboxChange}
                      />
                    </View>
                    <View style={{ flex: 12, alignItems: 'flex-start' }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: NewTheme.colors.lightText,
                        }}
                      >
                        Display nickname on tree instead of full name
                      </Text>
                    </View>
                  </View>
                </View>

                <View>
                  {genderConfirmed ? (
                    <View>
                      {formik.values.gender === 'male' ||
                      formik.values.gender === 'female' ? (
                        <CustomInput
                          name="gender"
                          testID="gender"
                          label="Gender"
                          type="text"
                          fullWidth
                          accessibilityLabel="gender"
                          size="small"
                          value={capitalize(formik.values.gender)}
                          onChangeText={() => {}}
                          clearable={false}
                          mode="outlined"
                          maskText
                          onBlur={formik.handleBlur('gender')}
                          error={Boolean(formik.errors.gender)}
                          style={[
                            {
                              marginTop: 10,
                            },
                            {
                              pointerEvents: 'none',
                            },
                          ]}
                          contentStyle={{ backgroundColor: '#F9F9F9' }}
                          rightContentStyles={{ backgroundColor: '#F9F9F9' }}
                          inputContainerStyle={{ paddingRight: 0 }}
                        />
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.Gendercontainer}>
                      <Text style={styles.Selectlabel}>Select Gender</Text>
                      <RadioButton.Group
                        onValueChange={handleGenderChange}
                        value={formik.values.gender}
                      >
                        <View
                          style={[
                            styles.radioButtonContainer,
                            formik.values.gender === 'unspecified' &&
                              styles.selected,
                          ]}
                        >
                          <CustomRadio
                            label="Unspecified"
                            labelStyle={{
                              color:
                                pendingGender !== 'Unspecified' &&
                                confirmationGender
                                  ? '#868e96'
                                  : 'black',
                              fontSize: Platform.OS === 'ios' ? 14 : 15,
                              letterSpacing: 0,
                              fontWeight: Platform.OS === 'ios' ? 300 : 400,
                            }}
                            checked={formik.values.gender === 'unspecified'}
                            onPress={() => {
                              if (
                                formik.values.gender !== 'male' &&
                                !confirmationGender
                              ) {
                                handleGenderChange('unspecified');
                              }
                            }}
                            accessibilityLabel="gender-unspecified"
                            disabled={
                              formik.values.gender === 'male' ||
                              pendingGender !== 'unspecified'
                            }
                          />
                        </View>
                        <View
                          style={[
                            styles.radioButtonContainer,
                            formik.values.gender === 'male' && styles.selected,
                          ]}
                        >
                          <CustomRadio
                            label="Male"
                            labelStyle={{
                              color:
                                pendingGender !== 'male' && confirmationGender
                                  ? '#868e96'
                                  : 'black',
                              fontSize: Platform.OS === 'ios' ? 14 : 15,
                              letterSpacing: 0,
                              fontWeight: Platform.OS === 'ios' ? 300 : 400,
                            }}
                            checked={formik.values.gender === 'male'}
                            onPress={() => handleGenderChange('male')}
                            accessibilityLabel="gender-male"
                            disabled={
                              pendingGender !== 'male' && confirmationGender
                            }
                          />
                        </View>
                        <View
                          style={[
                            styles.radioButtonContainer,
                            formik.values.gender === 'female' &&
                              styles.selected,
                          ]}
                        >
                          <CustomRadio
                            label="Female"
                            labelStyle={{
                              color:
                                pendingGender !== 'female' && confirmationGender
                                  ? '#868e96'
                                  : 'black',
                              fontSize: Platform.OS === 'ios' ? 14 : 15,
                              letterSpacing: 0,
                              fontWeight: Platform.OS === 'ios' ? 300 : 400,
                            }}
                            checked={formik.values.gender === 'female'}
                            onPress={() => handleGenderChange('female')}
                            accessibilityLabel="gender-female"
                            disabled={
                              pendingGender !== 'female' && confirmationGender
                            }
                          />
                        </View>
                      </RadioButton.Group>

                      <Modal
                        transparent={true}
                        animationType="fade"
                        visible={showModal}
                        onRequestClose={handleCancel}
                      >
                        <TouchableWithoutFeedback onPress={handleCancel}>
                          <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                              <Text style={styles.modalText}>
                                Confirm Gender
                              </Text>
                              <Text style={styles.subText}>
                                Note: Once confirmed, changes made will be
                                irreversible.
                              </Text>
                              <View style={styles.modalButtons}>
                                <TouchableOpacity
                                  style={[
                                    styles.modalButton,
                                    {
                                      backgroundColor: Theme.light.onSecondary,
                                      borderWidth: 0.8,
                                      borderColor: Theme.light.outlineVariant,
                                    },
                                  ]}
                                  onPress={handleCancel}
                                >
                                  <Text
                                    style={[
                                      styles.CancelmodalButtonText,
                                      { color: Theme.light.orange },
                                    ]}
                                  >
                                    Discard Changes
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.modalButton}
                                  onPress={handleConfirm}
                                >
                                  <Text
                                    style={styles.ConfirmChangemodalButtonText}
                                  >
                                    Confirm Changes
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    </View>
                  )}
                </View>

                <View>
                  {route.params.id === userInfo._id && (
                    <CustomInput
                      name="emailuser"
                      testID="email"
                      label={userInfo.emailVerified ? 'Email' : 'Verify Email'}
                      type="text"
                      fullWidth
                      accessibilityLabel="email"
                      size="small"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formik.values.emailuser}
                      onChangeText={text => {
                        formik.setFieldValue('emailuser', text);
                      }}
                      rightContentStyles={
                        userInfo.emailVerified
                          ? { backgroundColor: '#F9F9F9' }
                          : {}
                      }
                      inputContainerStyle={{ paddingRight: 0 }}
                      contentStyle={
                        userInfo.emailVerified
                          ? { backgroundColor: '#F9F9F9' }
                          : {}
                      }
                      right={
                        userInfo.emailVerified ? (
                          <VerifiedIcon
                            testID="VerifiedIcon"
                            style={{ marginRight: 5, padding: 0 }}
                          />
                        ) : (
                          <ReverifyIcon
                            style={{ marginRight: 2 }}
                            onPress={() => {
                              if (
                                formik.values.emailuser &&
                                !userInfo.emailVerified &&
                                !formik.errors.emailuser
                              ) {
                                checkEmailExistence(
                                  formik.values.emailuser,
                                  userId,
                                ).then(canSaveEmail => {
                                  if (canSaveEmail) {
                                    isFromReverifyRef.current = true;
                                    setGoToEmailScreen(true);
                                    formik.handleSubmit();
                                    navigation.navigate('EmailReVerify');
                                    return;
                                  }
                                });
                              }
                            }}
                            disabled={
                              !formik.values.emailuser ||
                              userInfo.emailVerified ||
                              Boolean(formik.errors.emailuser)
                            }
                          />
                        )
                      }
                      clearable
                      mode="outlined"
                      onBlur={formik.handleBlur('emailuser')}
                      error={
                        Boolean(formik.errors.emailuser) &&
                        formik.touched.emailuser
                      }
                      errorText={formik.errors.emailuser}
                      disabled={userInfo.emailVerified === true}
                      style={[
                        styles.textInputStyle,
                        { backgroundColor: 'white' },
                      ]}
                    />
                  )}
                </View>

                {route.params.id !== userInfo._id && (
                  <View style={{ marginTop: 13 }}>
                    <CustomInput
                      name="secondaryEmail"
                      testID="secondaryEmail"
                      label="Email"
                      type="text"
                      fullWidth
                      autoCapitalize="none"
                      keyboardType="email-address"
                      accessibilityLabel="secondaryEmail"
                      size="small"
                      value={formik.values.secondaryEmail}
                      onChangeText={text => {
                        formik.setFieldValue('secondaryEmail', text);
                      }}
                      clearable
                      mode="outlined"
                      onBlur={formik.handleBlur('secondaryEmail')}
                      error={
                        Boolean(formik.errors.secondaryEmail) &&
                        formik.touched.secondaryEmail
                      }
                      errorText={formik.errors.secondaryEmail}
                    />
                  </View>
                )}

                {route.params.id === userInfo._id && !loadingMobile && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 15,
                    }}
                  >
                    <CountryCode
                      style={{ margintop: 20 }}
                      disabledFetchingCountry={!!defaultCountry?.length}
                      enabledCountryCode
                      preferredCountries={['in', 'us', 'gb']}
                      onSelect={onSelect}
                      accessibilityLabel="countryCodeInput"
                      label="Mobile Number"
                      testID="countryCodeInput"
                      name="mobile"
                      defaultCountry={defaultCountry}
                      defaultCountryCode={
                        defaultCountry ? '' : formik.values?.countryCode
                      }
                      disabled={userInfo.mobileVerified === true}
                    />

                    <CustomInput
                      keyboardType="numeric"
                      testID="mobileNo"
                      name="mobileNo"
                      label={
                        userInfo.mobileVerified
                          ? 'Mobile Number'
                          : 'Verify Mobile Number'
                      }
                      fullWidth
                      rightContentStyles={
                        userInfo.mobileVerified
                          ? { backgroundColor: '#F9F9F9' }
                          : {}
                      }
                      inputContainerStyle={{ paddingRight: 0 }}
                      contentStyle={
                        userInfo.mobileVerified
                          ? { backgroundColor: '#F9F9F9' }
                          : {}
                      }
                      disabled={userInfo.mobileVerified === true}
                      right={
                        userInfo.mobileVerified ? (
                          <VerifiedIcon
                            testID="VerifiedIcon"
                            style={{ marginRight: 5, padding: 0 }}
                          />
                        ) : (
                          <ReverifyIcon
                            style={{ marginRight: 2 }}
                            onPress={async () => {
                              if (
                                formik.values.mobileNo &&
                                !userInfo.mobileVerified &&
                                isValidNumber &&
                                !formik.errors.mobileNo
                              ) {
                                const canSaveEmail = await checkMobileExistence(
                                  formik.values.mobileNo,
                                  userId,
                                );
                                if (canSaveEmail) {
                                  isFromMobileReverifyRef.current = true;
                                  setGoToMobileScreen(true);
                                  formik.handleSubmit();
                                  const delay = ms =>
                                    new Promise(resolve => {
                                      setTimeout(resolve, ms);
                                    });
                                  await delay(2000);
                                  await handleMobileOTP(formik.values.mobileNo);
                                  navigation.navigate('MobileOTPverification');
                                  return;
                                }
                              }
                            }}
                            disabled={
                              !formik.values.mobileNo ||
                              userInfo.mobileVerified ||
                              !isValidNumber ||
                              Boolean(formik.errors.mobileNo)
                            }
                          />
                        )
                      }
                      accessibilityLabel="mobileNo"
                      type="tel"
                      mode="outlined"
                      pattern="[0-9]*"
                      inputmode="numeric"
                      value={formik.values.mobileNo}
                      onChangeText={text => {
                        formik.handleChange(text);

                        validateNum(text);
                        formik.handleChange({
                          target: {
                            name: 'mobileNo',
                            value: text,
                          },
                        });
                      }}
                      onBlur={formik.handleBlur('mobileNo')}
                      error={Boolean(formik.errors.mobileNo)}
                      helperText={formik.errors.mobileNo}
                      style={[{ backgroundColor: 'white' }, { flex: 1 }]}
                    />
                  </View>
                )}
                {formik.touched.mobileNo && formik.errors.mobileNo && (
                  <HelperText type="error" accessibilityLabel="mobileNo-error">
                    {formik.errors.mobileNo}
                  </HelperText>
                )}

                {route.params.id !== userInfo._id && !loadingMobile && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 15,
                    }}
                  >
                    <CountryCode
                      style={{ margintop: 20 }}
                      disabledFetchingCountry={!!defaultCountry?.length}
                      enabledCountryCode
                      preferredCountries={['in', 'us', 'gb']}
                      onSelect={onSelect}
                      accessibilityLabel="countryCodeInput"
                      label="Mobile Number"
                      testID="countryCodeInput"
                      name="mobile"
                      defaultCountry={defaultCountry}
                      defaultCountryCode={
                        defaultCountry ? '' : formik.values?.countryCode
                      }
                    />
                    <CustomInput
                      keyboardType="numeric"
                      testID="secondaryMobileNo"
                      name="secondaryMobileNo"
                      label={'Mobile Number'}
                      fullWidth
                      accessibilityLabel="secondaryMobileNo"
                      type="tel"
                      mode="outlined"
                      pattern="[0-9]*"
                      inputmode="numeric"
                      value={formik.values.secondaryMobileNo}
                      onChangeText={text => {
                        formik.handleChange(text);
                        validateNum(text);
                        formik.handleChange({
                          target: {
                            name: 'secondaryMobileNo',
                            value: text,
                          },
                        });
                      }}
                      onBlur={formik.handleBlur('secondaryMobileNo')}
                      error={Boolean(formik.errors.secondaryMobileNo)}
                      helperText={formik.errors.secondaryMobileNo}
                      style={[{ backgroundColor: 'white' }, { flex: 1 }]}
                    />
                  </View>
                )}
                {formik.touched.secondaryMobileNo &&
                  formik.errors.secondaryMobileNo && (
                    <HelperText
                      type="error"
                      accessibilityLabel="mobileNo-error"
                    >
                      {formik.errors.secondaryMobileNo}
                    </HelperText>
                  )}

                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 25,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <CustomRadio
                      label="Living"
                      labelStyle={{ color: 'black' }}
                      checked={formik.values.livingStatus === 'yes'}
                      onPress={() => handleLivingStatusChange('yes')}
                      accessibilityLabel="livingStatus-Living"
                    />
                    <CustomRadio
                      label="Deceased"
                      labelStyle={{ color: 'black' }}
                      checked={formik.values.livingStatus === 'no'}
                      onPress={() => handleLivingStatusChange('no')}
                      accessibilityLabel="livingStatus-Deceased"
                    />
                  </View>
                </View>

                <View>
                  <View style={styles.container}>
                    <View style={[styles.column, styles.prefixColumn]}>
                      <Dropdown
                        testID="prefix"
                        style={[
                          styles.dropdown,
                          isFocusPrefix && {
                            borderColor: theme.colors.primary,
                            borderWidth: 2,
                          },
                        ]}
                        accessibilityLabel="prefix"
                        data={filteredData(formik.values.prefix)}
                        itemTextStyle={styles.itemTextStyle}
                        selectedTextStyle={{ color: 'black' }}
                        placeholderStyle={{ color: 'black', fontWeight: 400 }}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={formik.values.prefix}
                        value={formik.values.prefix}
                        onFocus={() => setIsFocusPrefix(true)}
                        onBlur={() => setIsFocusPrefix(false)}
                        onChange={item =>
                          handleSelectionChange(
                            item.label,
                            formik.setFieldValue,
                            'prefix',
                          )
                        }
                      />
                    </View>
                    <View style={[styles.column, styles.datePickerColumn]}>
                      <CustomInput
                        name="date"
                        accessibilityLabel="date"
                        ref={dateInputRef}
                        testID="date"
                        mode="outlined"
                        label="Birth Date"
                        style={[
                          styles.textInputStyle,
                          { backgroundColor: 'white' },
                        ]}
                        value={
                          selectedDate
                            ? moment(selectedDate).format('DD MMM YYYY')
                            : ''
                        }
                        onFocus={() => setShowDatePicker(true)}
                        showSoftInputOnFocus={false}
                      />
                      <Animated.View
                        entering={SlideInDown.duration(250).damping(10)}
                      >
                        <ImuwDatePicker
                          onClose={() => {
                            setShowDatePicker(false);
                            dateInputRef.current.blur();
                          }}
                          accessibilityLabel="datepicker"
                          open={showDatePicker}
                          testID="datepicker"
                          selectedDate={
                            selectedDate ? new Date(selectedDate) : new Date()
                          }
                          mode="date"
                          onDateChange={handleDateChange}
                        />
                      </Animated.View>
                    </View>
                  </View>
                </View>
                <View>
                  <CustomInput
                    name="birthlocationinfo"
                    testID="birth-place"
                    mode="outlined"
                    accessibilityLabel="birth-place"
                    label="Birth Place"
                    style={[
                      styles.textInputStyle,
                      { backgroundColor: 'white' },
                    ]}
                    onChangeText={text => {
                      formik.setFieldValue('placeOfBirth', text);
                    }}
                    clearable
                    value={desanitizeInput(formik.values.placeOfBirth)}
                  />
                </View>
                {formik.values.livingStatus === 'yes' && (
                  <View>
                    <CustomInput
                      name="currentlocationinfo"
                      testID="currentlocationinfo"
                      mode="outlined"
                      accessibilityLabel="currentlocationinfo"
                      label="Current Place"
                      clearable
                      style={[
                        styles.textInputStyle,
                        { backgroundColor: 'white' },
                      ]}
                      onChangeText={text => {
                        formik.setFieldValue('curentPlace', text);
                      }}
                      value={desanitizeInput(formik.values.curentPlace)}
                    />
                  </View>
                )}
                {formik.values.livingStatus === 'no' && (
                  <View>
                    <View style={styles.container}>
                      <View style={[styles.column, styles.prefixColumn]}>
                        <Dropdown
                          testID="prefixDeath"
                          accessibilityLabel="prefixDeath"
                          style={[
                            styles.dropdown,
                            isFocusDeathPrefix && {
                              borderColor: theme.colors.primary,
                              borderWidth: 2,
                            },
                          ]}
                          data={filteredData(formik.values.prefixDeath)}
                          itemTextStyle={styles.itemTextStyle}
                          selectedTextStyle={{ color: 'black' }}
                          placeholderStyle={{ color: 'black', fontWeight: 400 }}
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={formik.values.prefixDeath}
                          value={formik.values.prefixDeath}
                          onFocus={() => setIsFocusDeathPrefix(true)}
                          onBlur={() => setIsFocusDeathPrefix(false)}
                          onChange={item =>
                            handleSelectionChange(
                              item.label,
                              formik.setFieldValue,
                              'prefixDeath',
                            )
                          }
                        />
                      </View>
                      <View style={[styles.column, styles.datePickerColumn]}>
                        <CustomInput
                          name="date"
                          accessibilityLabel="dateDeath"
                          ref={dateInputRefDeath}
                          testID="dateDeath"
                          mode="outlined"
                          label="Death Date"
                          style={[
                            styles.textInputStyle,
                            { backgroundColor: 'white' },
                          ]}
                          value={
                            selectedDeathDate
                              ? moment(selectedDeathDate).format('DD MMM YYYY')
                              : ''
                          }
                          onFocus={() => setShowDatePickerDeath(true)}
                          showSoftInputOnFocus={false}
                        />
                        <ImuwDatePicker
                          onClose={() => {
                            setShowDatePickerDeath(false);
                            dateInputRefDeath.current.blur();
                          }}
                          accessibilityLabel="DeathDatePicker"
                          open={showDatePickerDeath}
                          testID="DeathDatePicker"
                          selectedDate={
                            selectedDeathDate
                              ? new Date(selectedDeathDate)
                              : new Date()
                          }
                          mode="date"
                          onDateChange={handleDateChangeDeath}
                        />
                      </View>
                    </View>
                    <View>
                      <CustomInput
                        name="deathlocationinfo"
                        testID="deathlocationinfo"
                        mode="outlined"
                        label="Death Place"
                        accessibilityLabel="deathlocationinfo"
                        clearable
                        style={[
                          styles.textInputStyle,
                          { backgroundColor: 'white' },
                        ]}
                        onChangeText={text => {
                          formik.setFieldValue('placeOfDeath', text);
                        }}
                        value={formik.values.placeOfDeath}
                      />
                    </View>
                  </View>
                )}
              </View>
              <View style={[styles.row, { paddingTop: 20, marginBottom: 100 }]}>
                <View style={styles.column12}>
                  <CustomButton
                    accessibilityLabel="addBasicFactBtn"
                    testID="addBasicFactBtn"
                    className="addBasicFactBtn"
                    label={'Save'}
                    onPress={() => formik.handleSubmit()}
                    loading={loading}
                    disabled={!formik.isValid || loading}
                  />
                </View>
              </View>
            </View>
          </GlobalStyle>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default BasicFact;
