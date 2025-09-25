import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';

import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useTheme, HelperText, Avatar} from 'react-native-paper';
import {
  daysInMonth,
  generateMonthList,
  getDateFromOffset,
} from '../../../utils/format';

import {useFormik} from 'formik';
import * as Yup from 'yup';

import Theme from '../../../common/Theme';
import ProfilePicturePlus from '../../../images/Icons/ProfilePicturePlus';
import {ProfilePicCropper} from '../../../core';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import MultipleSpouse from '../MultipleSpouse';
import CustomInput from '../../CustomTextInput';
import CustomRadio from '../../ProfileTab/CustomRadio';
import {Dropdown} from 'react-native-element-dropdown';
import GreenTickIcon from '../../../images/Icons/GreenTickIon';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import NewTheme from '../../../common/NewTheme';
import GlobalCheckBox from '../../ProfileTab/GlobalCheckBox';
import CustomDropdown from '../../customDropdown';
import CountryCode from '../../CountryCode';
import {isValidPhoneNumber} from 'libphonenumber-js/mobile';
import parsePhoneNumber from 'libphonenumber-js';
import {Pressable} from 'react-native-gesture-handler';

const AddMemberFormPersonalDetails = ({
  userId,
  relation,
  updateFormValues,
  onValidationChange,
  mSpouseData,
  setSelectedSpouse,
  spouseName,
}) => {
  const [croppedImageData, setCroppedImageData] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const dispatch = useDispatch();

  const today = new Date();
  const theme = useTheme();
  const pageIsFocused = useIsFocused();
  const [locationinfo, setLocationInfo] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusDeathPrefix, setIsFocusDeathPrefix] = useState(false);
  const [isFocusPrefix, setIsFocusPrefix] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [deathLocation, setDeathLocation] = useState('');

  const [isBirthDatePickerVisible, setBirthDatePickerVisibility] =
    useState(false);
  const [isDeathDatePickerVisible, setDeathDatePickerVisibility] =
    useState(false);
  const [selectedBirthDate, setSelectedBirthDate] = useState(null);
  const [selectedDeathDate, setSelectedDeathDate] = useState(null);
  const [minDeathDate, setMinDeathDate] = useState(null);
  const [maxBirthDate, setMaxBirthDate] = useState(new Date());
  const [relationShipOption, setRelationShipOption] = useState('Biological');
  const birthDateInputRef = useRef(null);
  const deathDateInputRef = useRef(null);
  const groupId = useSelector(state => state.userInfo.linkedGroup);
  const [checkboxError, setCheckboxError] = useState('');
  const [nameTyped, setNameTyped] = useState(true);
  const [middleNameTyped, setMiddleNameTyped] = useState(true);
  const [surNameTyped, setsurNameTyped] = useState(true);
  const [nickNameTyped, setNickNameTyped] = useState(true);
  const [defaultCountry, setDefaultCountry] = useState(null);
  const iso = useRef('');
  const countryCode = useRef('');

  // Lose Focus Of Custom Inputs
  const inputRefs = {
    firstName: useRef(null),
    middleName: useRef(null),
    surName: useRef(null),
    nickname: useRef(null),
    birthPlace: useRef(null),
    currentPlace: useRef(null),
    deathPlace: useRef(null),
  };

  const blurInputs = () => {
    Object.keys(inputRefs).forEach(key => {
      if (inputRefs[key].current) {
        inputRefs[key].current.blur();
      }
    });
  };
  const data = [
    {label: 'On', value: '1'},
    {label: 'Around (~)', value: '2'},
  ];
  const closeBirthDatePicker = () => {
    setBirthDatePickerVisibility(false);
    birthDateInputRef.current.blur();
  };
  const closeDeathDatePicker = () => {
    setDeathDatePickerVisibility(false);
    deathDateInputRef.current.blur();
  };
  const handleBirthDateChange = date => {
    const fullIsoDob = new Date(date).toISOString();

    setMinDeathDate(date);
    setSelectedBirthDate(moment(date).format('DD MMM YYYY'));

    formik.setFieldValue('birthDetails.dob', fullIsoDob);
    formik.setFieldValue('BD_Flag', 1);
    setBirthDatePickerVisibility(false);
    birthDateInputRef.current.blur();
  };
  const handleDeathDateChange = date => {
    setMaxBirthDate(date);
    const fullIsoDod = new Date(date).toISOString();

    setSelectedDeathDate(moment(date).format('DD MMM YYYY'));

    formik.setFieldValue('birthDetails.dod', fullIsoDod);
    formik.setFieldValue('DD_Flag', 1);

    setDeathDatePickerVisibility(false);
    deathDateInputRef.current.blur();
  };
  const relationShipData = [
    {label: 'Biological', value: 'Biological'},
    {label: 'Adopted', value: 'Adopted'},
    {label: 'Step', value: 'Step'},
    {label: 'Foster', value: 'Foster'},
    {label: 'Guardian', value: 'Guardian'},
  ];
  const relationship = ['wife', 'daughter', 'sister', 'mother'];
  const marriedStatus = ['father', 'mother', 'husband', 'wife'];
  function getStatus(value, status) {
    if (status === 'gender') {
      return relationship.includes(value) ? 'female' : 'male';
    }
    if (status === 'isMarried') {
      return marriedStatus.includes(value) ? 'married' : 'single';
    }
  }
  const relationStatus =
    (mSpouseData && (relation === 'wife' || relation === 'husband')) ||
    (spouseName && (relation === 'wife' || relation === 'husband'))
      ? 'married'
      : 'single';
  const formik = useFormik({
    initialValues: {
      BD_Flag: null,
      DD_Flag: null,
      secondaryEmail: '',
      countryCode: '',
      countryISO: '',
      secondaryMobileNo: '',
      prefix: 'On',
      prefixDeath: 'On',
      personalDetails: {
        name: '',
        middlename: '',
        lastname: '',
        nickname: '',
        showNickname: false,
        gender: getStatus(relation, 'gender'),
        relationStatus: relationStatus,
        profilepic: null,
        livingStatus: 'yes',
      },
      birthDetails: {
        dob: null,
        dod: null,
      },
      location: {
        currentlocation: null,
        placeOfBirth: null,
        placeOfDeath: null,
      },
      relationshipOption: 'Biological',
    },
    validationSchema: Yup.object().shape({
      secondaryEmail: Yup.string().optional().email('Invalid email'),
      secondaryMobileNo: Yup.string()
        .nullable()
        .optional()
        .test(
          'invalid-characters',
          'Invalid characters (.,+-) are not allowed',
          value => {
            return !/[.,+-]/.test(value);
          },
        )
        .test('valid-phone', 'Mobile number is invalid', validateNum),
      personalDetails: Yup.object().shape({
        name: Yup.string()
          .required('This field is required')
          .matches(
            /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
            'Field cannot contain special characters or numbers.',
          ),
        middlename: Yup.string().matches(
          /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
          'Field cannot contain special characters or numbers.',
        ),
        lastname: Yup.string()
          .required('This field is required')
          .matches(
            /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
            'Field cannot contain special characters or numbers.',
          ),
      }),
    }),
  });

  useEffect(() => {
    updateFormValues('BD_Flag', 1);
  }, [formik.values.birthDetails.dob]);

  useEffect(() => {
    updateFormValues('DD_Flag', 1);
  }, [formik.values.birthDetails.dod]);

  useEffect(() => {
    if (formik.values.personalDetails?.name?.length === 0) {
      setNameTyped(true);
    }
    if (formik.values.personalDetails?.middlename?.length === 0) {
      setMiddleNameTyped(true);
    }
    if (formik.values.personalDetails?.lastname?.length === 0) {
      setsurNameTyped(true);
    }
    if (formik.values.personalDetails?.nickname?.length === 0) {
      setNickNameTyped(true);
    }
  }, [
    formik.values.personalDetails.name,
    formik.values.personalDetails.middlename,
    formik.values.personalDetails.lastname,
    formik.values.personalDetails.nickname,
  ]);

  useEffect(() => {
    formik.validateForm();
    onValidationChange(formik.isValid);

    const fullMobileNumber =
      formik.values.countryCode && formik.values.secondaryMobileNo
        ? `${formik.values.countryCode}${formik.values.secondaryMobileNo}`
        : formik.values.secondaryMobileNo || '';

    updateFormValues('personalDetails', formik.values.personalDetails);
    updateFormValues('secondaryEmail', formik.values.secondaryEmail);
    updateFormValues('countryCode', formik.values.countryCode);
    updateFormValues('countryISO', formik.values.countryISO);
    updateFormValues('secondaryMobileNo', fullMobileNumber);
    updateFormValues('birthDetails', formik.values.birthDetails);
    updateFormValues('location', formik.values.location);
    updateFormValues(
      'isAroundDOB',
      formik.values.prefix === 'On' ? false : true,
    );
    updateFormValues(
      'isAroundDOD',
      formik.values.prefixDeath === 'On' ? false : true,
    );
    updateFormValues('relationshipOption', formik.values.relationshipOption);
  }, [formik.isValid, formik.values]);

  const capitalizeFirstLetter = string => {
    if (string && string?.length >= 1) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  };

  const fetchUserInfo = useSelector(state => state.Tree.fetchUserInfo);
  useEffect(() => {
    if (fetchUserInfo?.myProfile && relation) {
      // seIsImage(true);
      formik.values.personalDetails.lastname = `${fetchUserInfo?.myProfile?.personalDetails?.lastname}`;
    }
  }, [relation]);

  const handleLivingStatusChange = status => {
    formik.handleChange('personalDetails.livingStatus')(status);
    if (status === 'yes') {
      setSelectedDeathDate(null);
      setDeathLocation(null);
      formik.setFieldValue('location.placeOfDeath', '');
    }
  };

  function handleRelationShipOption(event) {
    setRelationShipOption(event.value);
    formik.setFieldValue('relationshipOption', event.value);
  }

  const handleSelectionChange = (label, setFieldValue, name) => {
    setFieldValue(name, label);
  };
  const filteredData = value => {
    return data.filter(item => item.label !== value);
  };

  // Checkbox change handler
  const handleCheckboxChange = () => {
    if (!formik.values.personalDetails.nickname) {
      // Set error message if nickname is empty
      setCheckboxError(
        'Please enter a nickname before selecting the checkbox.',
      );
      return; // Prevent changing the checkbox state
    } else {
      // Clear the error message if nickname is valid
      setCheckboxError('');
    }
    formik.setFieldValue(
      'personalDetails.showNickname',
      !formik.values.personalDetails.showNickname,
    );
  };

  // Store Cropped Image Data For Later Use
  useEffect(() => {
    const storeCroppedImageData = async () => {
      if (croppedImageData) {
        try {
          await AsyncStorage.setItem(
            'croppedImageData',
            JSON.stringify(croppedImageData),
          );
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Error fetching user info:',
            text2: error,
          });
        }
      }
    };
    storeCroppedImageData();
  }, [croppedImageData]);

  // Effect to handle nickname changes
  useEffect(() => {
    if (!formik.values.personalDetails.nickname) {
      // If nickname is empty, uncheck the checkbox and set an error message
      formik.setFieldValue('personalDetails.showNickname', false);
    } else {
      // Clear the error message if the nickname is valid
      setCheckboxError('');
    }
  }, [formik.values.personalDetails.nickname]);

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

  function onSelect(data) {
    countryCode.current = data?.dialCode;
    iso.current = data.iso;
    setDefaultCountry(data?.iso);
    formik.setFieldValue('countryISO', data?.iso);
    formik.setFieldValue('countryCode', data?.dialCode);
    formik.setFieldValue('secondaryMobileNo', '');
  }

  return (
    <View style={{marginTop: 15}}>
      <View style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 20,
          }}
          testID="add-profile">
          <ProfilePicCropper byForm setCroppedImageData={setCroppedImageData}>
            {croppedImageData?.path ? (
              <ProfilePicCropper
                byForm
                setCroppedImageData={setCroppedImageData}>
                <Avatar.Image
                  size={50}
                  source={{
                    uri: croppedImageData?.path,
                  }}
                />
              </ProfilePicCropper>
            ) : (
              <View style={styles.placeholder}>
                <ProfilePicCropper
                  byForm
                  setCroppedImageData={setCroppedImageData}>
                  <ProfilePicturePlus
                    color={NewTheme.colors.secondaryDarkBlue}
                  />
                </ProfilePicCropper>
              </View>
            )}
          </ProfilePicCropper>
          <ProfilePicCropper byForm setCroppedImageData={setCroppedImageData}>
            <Text style={styles.addtext}>Add a profile picture</Text>
          </ProfilePicCropper>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.column12}>
          <CustomInput
            testID="relationship-type"
            disabled
            style={[styles.textInputBack, {marginBottom: 10}]}
            mode="outlined"
            label="Relationship Type"
            value={capitalizeFirstLetter(relation)}
            required
            relationField
            inputHeight={45}
          />
          {/* RELATIONSHIP OPTION FOR BALKAN */}
          {relation !== 'husband' && relation !== 'wife' && (
            <View style={{paddingTop: 10, paddingBottom: 10}}>
              <View style={{zIndex: 1000, backgroundColor: 'white'}}>
                <CustomDropdown
                  accessibilityLabel="RelationShip Option"
                  required
                  label="RelationShip"
                  options={relationShipData}
                  value={relationShipOption}
                  onOptionSelect={handleRelationShipOption}
                  inputHeight={40}
                  feedback={<GreenTickIcon />}
                  feedbackIconColor={'#27C394'}
                />
              </View>
            </View>
          )}

          {mSpouseData !== null &&
            mSpouseData?.length >= 2 &&
            relation !== null &&
            (relation === 'son' || relation === 'daughter') && (
              <MultipleSpouse
                mSpouseData={mSpouseData}
                setSelectedSpouse={setSelectedSpouse}
              />
            )}
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            testID="member-first-name"
            mode="outlined"
            name="personalDetails.name"
            label="First Name"
            value={formik.values.personalDetails?.name}
            onChangeText={text => {
              let inputValue = text;
              if (text.length > 0 && nameTyped) {
                // Capitalize the first letter only when the input is initially empty
                inputValue =
                  inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
                setTimeout(() => {
                  setNameTyped(false);
                }, 1000);
              }
              if (
                text?.length === 0 ||
                formik.values.personalDetails?.name?.length === 0
              ) {
                setNameTyped(true);
              }

              // // Capitalize the first character and keep the rest of the text as is
              // const capitalizedText =
              //   text.charAt(0).toUpperCase() + text.slice(1);

              formik.handleChange('personalDetails.name')(inputValue);
            }}
            style={styles.textInputBack}
            onBlur={formik.handleBlur('personalDetails.name')}
            error={
              formik.touched.personalDetails?.name &&
              !!formik.errors.personalDetails?.name
            }
            ref={inputRefs.firstName}
            clearable
            required
          />

          {formik.touched.personalDetails?.name &&
            formik.errors.personalDetails?.name && (
              <HelperText style={{color: 'red'}}>
                {formik.errors.personalDetails?.name}
              </HelperText>
            )}

          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInputBack}
            testID="member-middle-name"
            name="personalDetails.middlename"
            label="Middle Name"
            value={formik.values.personalDetails?.middlename}
            onChangeText={text => {
              let inputValue = text;
              if (text.length > 0 && middleNameTyped) {
                // Capitalize the first letter only when the input is initially empty
                inputValue =
                  inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
                setTimeout(() => {
                  setMiddleNameTyped(false);
                }, 1000);
              }
              if (
                text?.length === 0 ||
                formik.values.personalDetails?.middlename?.length === 0
              ) {
                setMiddleNameTyped(true);
              }

              formik.handleChange('personalDetails.middlename')(inputValue);
            }}
            onBlur={formik.handleBlur('personalDetails.middlename')}
            error={
              formik.touched.personalDetails?.middlename &&
              !!formik.errors.personalDetails?.middlename
            }
            ref={inputRefs.middleName}
            clearable
          />

          {formik.touched.personalDetails?.middlename &&
            formik.errors.personalDetails?.middlename && (
              <HelperText style={{color: 'red'}}>
                {formik.errors.personalDetails?.middlename}
              </HelperText>
            )}

          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInputBack}
            testID="member-surname"
            name="personalDetails.lastname"
            label="Surname"
            value={formik.values.personalDetails.lastname}
            onChangeText={text => {
              let inputValue = text;
              if (text.length > 0 && surNameTyped) {
                // Capitalize the first letter only when the input is initially empty
                inputValue =
                  inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
                setTimeout(() => {
                  setsurNameTyped(false);
                }, 1000);
              }
              if (
                text?.length === 0 ||
                formik.values.personalDetails?.lastname?.length === 0
              ) {
                setsurNameTyped(true);
              }

              formik.handleChange('personalDetails.lastname')(inputValue);
            }}
            onBlur={formik.handleBlur('personalDetails.lastname')}
            error={
              formik.touched.personalDetails?.lastname &&
              !!formik.errors.personalDetails?.lastname
            }
            ref={inputRefs.surName}
            clearable
            required
          />

          {formik.touched.personalDetails?.lastname &&
            formik.errors.personalDetails?.lastname && (
              <HelperText style={{color: 'red'}}>
                {formik.errors.personalDetails?.lastname}
              </HelperText>
            )}

          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInputBack}
            testID="member-nickname"
            name="personalDetails.nickname"
            label="Nickname"
            value={formik.values.personalDetails.nickname}
            onChangeText={text => {
              let inputValue = text;
              if (text.length > 0 && nickNameTyped) {
                // Capitalize the first letter only when the input is initially empty
                inputValue =
                  inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
                setTimeout(() => {
                  setNickNameTyped(false);
                }, 1000);
              }
              if (
                text?.length === 0 ||
                formik.values.personalDetails?.nickname?.length === 0
              ) {
                setNickNameTyped(true);
              }
              formik.handleChange('personalDetails.nickname')(inputValue);
            }}
            onBlur={formik.handleBlur('personalDetails.nickname')}
            error={
              formik.touched.personalDetails?.nickname &&
              !!formik.errors.personalDetails?.nickname
            }
            ref={inputRefs.nickname}
            clearable
          />

          {formik.touched.personalDetails?.nickname &&
            formik.errors.personalDetails?.nickname && (
              <HelperText style={{color: 'red'}}>
                {formik.errors.personalDetails?.nickname}
              </HelperText>
            )}

          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            <View style={{flex: 1, paddingTop: 4}}>
              <GlobalCheckBox
                checkBoxColor={NewTheme.colors.primaryOrange}
                testID="add-member-showNickname"
                check={formik.values.personalDetails.showNickname}
                onCheck={handleCheckboxChange}
              />
            </View>
            <View style={{flex: 12, alignItems: 'flex-start'}}>
              <Text
                style={{
                  fontSize: 16,
                  color: NewTheme.colors.lightText,
                }}>
                Display nickname on tree instead of full name
              </Text>
            </View>
          </View>
          {checkboxError ? (
            <Text style={{color: 'red', fontSize: 14, paddingTop: 5}}>
              {checkboxError}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 4,
          marginTop: 12,
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
          inputHeight={45}
          keyboardType="numeric"
          style={{flex: 1}}
          fullWidth
          label="Mobile Number"
          testID="mobileNumber"
          name="secondaryMobileNo"
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
          error={
            formik.touched.secondaryMobileNo &&
            Boolean(formik.errors.secondaryMobileNo)
          }
          helperText={
            formik.touched.secondaryMobileNo && formik.errors.secondaryMobileNo
          }
        />
      </View>

      {formik.touched.secondaryMobileNo && formik.errors.secondaryMobileNo && (
        <HelperText type="error" accessibilityLabel="mobileNo-error">
          {formik.errors.secondaryMobileNo}
        </HelperText>
      )}

      <CustomInput
        inputHeight={45}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        autoComplete="email"
        accessibilityLabel="signup-email"
        mode="outlined"
        name="secondaryEmail"
        label="Email ID"
        value={formik.values.secondaryEmail}
        onBlur={formik.handleBlur('secondaryEmail')}
        onChangeText={formik.handleChange('secondaryEmail')}
        error={
          Boolean(formik.errors.secondaryEmail) && formik.touched.secondaryEmail
        }
        errorText={formik.errors.secondaryEmail}
        testID="add-member-email"
        style={{marginTop: 15}}
      />

      <View style={{marginTop: 15}}>
        <Text style={styles.text}>Status</Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 10,
          }}>
          <CustomRadio
            label="Living"
            checked={formik.values.personalDetails.livingStatus === 'yes'}
            onPress={() => handleLivingStatusChange('yes')}
          />
          <View style={{marginLeft: 70}}>
            <CustomRadio
              label="Deceased"
              checked={formik.values.personalDetails.livingStatus === 'no'}
              onPress={() => handleLivingStatusChange('no')}
            />
          </View>
        </View>
      </View>
      <View style={{marginTop: 20}}>
        <View>
          <View style={styles.container}>
            <View style={[styles.column, styles.prefixColumn]}>
              <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                <CustomDropdown
                  testID="prefix"
                  label={formik.values.prefix}
                  options={filteredData(formik.values.prefix)}
                  value={formik.values.prefix}
                  onOptionSelect={itemValue => {
                    handleSelectionChange(
                      itemValue.label,
                      formik.setFieldValue,
                      'prefix',
                    );
                  }}
                  onBlur={() => setIsFocusPrefix(false)}
                  onFocus={() => {
                    setIsFocusPrefix(true);
                    blurInputs();
                  }}
                  inputHeight={40}
                />
              </View>
            </View>
            <View style={[styles.column, styles.datePickerColumn]}>
              <CustomInput
                inputHeight={45}
                autoCapitalize="none"
                autoCorrect={false}
                ref={birthDateInputRef}
                testID="add-birth-date"
                mode="outlined"
                style={styles.textInputBack}
                name="birth-date"
                label="Birth Date"
                value={selectedBirthDate ? selectedBirthDate : ''}
                onFocus={() => setBirthDatePickerVisibility(true)}
                showSoftInputOnFocus={false}
              />

              <ImuwDatePicker
                mode="date"
                testID="birth-date-picker"
                maximumDate={maxBirthDate}
                selectedDate={maxBirthDate}
                onClose={closeBirthDatePicker}
                open={isBirthDatePickerVisible}
                onDateChange={handleBirthDateChange}
              />
            </View>
          </View>
        </View>

        <View>
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInputBack}
            name="location.placeOfBirth"
            label="Birth Place"
            testID="birthplace"
            value={birthLocation}
            onChangeText={text => {
              // Capitalize the first character and keep the rest of the text as is
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);

              setBirthLocation(capitalizedText);
              formik.setFieldValue('location.placeOfBirth', capitalizedText);
            }}
            onBlur={formik.handleBlur('location.placeOfBirth')}
            ref={inputRefs.birthPlace}
            clearable
          />
          {formik.values.personalDetails.livingStatus === 'yes' && (
            <CustomInput
              inputHeight={45}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={styles.textInputBack}
              name="location.currentlocation"
              label="Current Place"
              value={currentLocation}
              testID="current-place"
              onChangeText={text => {
                // Capitalize the first character and keep the rest of the text as is
                const capitalizedText =
                  text.charAt(0).toUpperCase() + text.slice(1);
                setCurrentLocation(capitalizedText);
                formik.setFieldValue(
                  'location.currentlocation',
                  capitalizedText,
                );
              }}
              onBlur={formik.handleBlur('location.currentlocation')}
              ref={inputRefs.currentPlace}
              clearable
            />
          )}
        </View>
      </View>
      {formik.values.personalDetails.livingStatus === 'no' && (
        <>
          <View style={{marginTop: 20}}>
            <View>
              <View style={styles.container}>
                <View style={[styles.column, styles.prefixColumn]}>
                  <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                    <CustomDropdown
                      testID="prefixDeath"
                      label={formik.values.prefixDeath}
                      options={filteredData(formik.values.prefixDeath)}
                      value={formik.values.prefixDeath}
                      onOptionSelect={itemValue => {
                        handleSelectionChange(
                          itemValue.label,
                          formik.setFieldValue,
                          'prefixDeath',
                        );
                      }}
                      onFocus={() => {
                        setIsFocusDeathPrefix(true);
                        blurInputs();
                      }}
                      onBlur={() => setIsFocusDeathPrefix(false)}
                      inputHeight={40}
                    />
                  </View>
                </View>
                <View style={[styles.column, styles.datePickerColumn]}>
                  <CustomInput
                    inputHeight={45}
                    autoCapitalize="none"
                    autoCorrect={false}
                    ref={deathDateInputRef}
                    mode="outlined"
                    testID="death-date"
                    style={styles.textInputBack}
                    name="deathDate"
                    label="Death Date"
                    value={selectedDeathDate ? selectedDeathDate : ''}
                    onFocus={() => setDeathDatePickerVisibility(true)}
                    showSoftInputOnFocus={false}
                  />

                  <ImuwDatePicker
                    testID="death-date-picker"
                    minimumDate={minDeathDate ? minDeathDate : null}
                    mode="date"
                    onClose={closeDeathDatePicker}
                    open={isDeathDatePickerVisible}
                    onDateChange={handleDeathDateChange}
                  />
                </View>
              </View>
            </View>
          </View>
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInputBack}
            name="location.placeOfDeath"
            label="Death Place"
            testID="death-place"
            value={deathLocation}
            onChangeText={text => {
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);
              setDeathLocation(capitalizedText);
              formik.setFieldValue('location.placeOfDeath', capitalizedText);
            }}
            onBlur={formik.handleBlur('location.placeOfDeath')}
            ref={inputRefs.deathPlace}
            clearable
          />
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  row1: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTextStyle: {
    color: 'black',
    fontWeight: 400,
    left: -5,
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
    paddingTop: 9,
  },
  datePickerColumn: {
    flex: 1.5,
    marginLeft: 5,
  },

  dropdown: {
    width: '125%',
    backgroundColor: 'white',
    height: 40,
    borderColor: '#C3C3C3',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  text: {
    marginLeft: 3,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.light.scrim,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.light.scrim,
  },
  column4: {
    width: '33%',
  },
  column2: {
    flex: 1,
    marginRight: 10,
  },
  picker: {
    backgroundColor: 'white',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.light.scrim,
  },
  textInputBack: {
    backgroundColor: Theme.light.onWhite100,
    marginVertical: 8,
  },
  pickerview: {
    height: 50,
    borderColor: '#ccc6c6',
    borderRadius: 4,
    overflow: 'hidden',
    textAlign: 'center',
    borderWidth: 1,
    paddingTop: 0,
    marginTop: 5,
    backgroundColor: 'white',

    border: '1px solid #ccc6c6',
  },
  mediaIcon: {
    marginTop: 7,
    marginLeft: 5,
  },
  textInputStyle: {
    marginTop: 4,
    height: 50,
    borderRadius: 4,
  },
  location: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 17,
    color: 'black',
    paddingLeft: 15,
    borderColor: '#ccc6c6',
    borderWidth: 1,
  },
  column12: {
    border: 0,
  },
  description: {},
  additionalContent: {
    height: 50,
    backgroundColor: 'blue',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderRadius: 4,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginBottom: 20,
  },
  addtext: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
    marginLeft: 20,
    fontSize: 18,
    color: NewTheme.colors.secondaryDarkBlue,
  },
  placeholder: {
    borderRadius: 100,
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
});

export default AddMemberFormPersonalDetails;
