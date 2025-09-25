import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import {setAdjustResize, setAdjustPan} from 'rn-android-keyboard-adjust';
import {useTheme, Text, HelperText} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';

import {GlobalStyle, CustomButton, VideoThumbnail} from '../../../core';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import {Theme} from '../../../common';

import {AddImage, FeedbackImg} from '../../../images';

import {CloseIcon} from '../../../images/Icons/ModalIcon';
import Confirm from '../../../components/Confirm';
import {GlobalHeader, CustomInput} from '../../../components';

import FileUploader from '../../../common/media-uploader';
import {feedPage} from '../../../store/apps/Feedback';
import {useIsFocused} from '@react-navigation/native';
import {getRandomLetters, onlyInteger} from '../../../utils';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NewTheme from '../../../common/NewTheme';
import CustomDropdown from '../../../components/customDropdown';
import ErrorBoundary from '../../../common/ErrorBoundary';
import CountryCode from '../../../components/CountryCode';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {isValidPhoneNumber} from 'libphonenumber-js';
import parsePhoneNumber from 'libphonenumber-js';

const ImuwFeedback = ({comingFrom}) => {
  useNativeBackHandler(handleBack);

  const [files, setFiles] = useState([]);
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();

  const email = useSelector(state => state?.userInfo?.email);
  const name = useSelector(state => state?.userInfo?.personalDetails?.name);
  const lastname = useSelector(
    state => state?.userInfo?.personalDetails?.lastname,
  );
  const profilePhoneNo = useSelector(state => state?.userInfo?.mobileNo);

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const {top} = useSafeAreaInsets();
  const data = [
    {
      label: 'Feature Request',
      value: 'Feature Request',
      description:
        'Is there something you’d like to see in the app? Share your ideas with us!',
      accessibilityLabel: 'feature_request',
    },
    {
      label: 'Report a New Bug',
      value: 'Report a New Bug',
      description:
        'Found a glitch? Let us know so we can fix it as soon as possible.',
      accessibilityLabel: 'report_bug',
    },
    {
      label: 'General Feedback',
      value: 'General Feedback',
      description: 'Any other thoughts or comments? We’re all ears.',
      accessibilityLabel: 'general_feedback',
    },
    {
      label: 'Astrology Feedback',
      value: 'Astrology Feedback',
      description:
        'Help us improve your astrology experience. Your insights matter!',
      accessibilityLabel: 'astrology_feedback',
    },
  ];

  const renderItem = item => {
    const isSelected = value === item.value;
    return (
      <ErrorBoundary>
        <View
          style={[
            styles.itemdrop,
            isSelected && {backgroundColor: '#D9D9D9', borderRadius: 8},
          ]}>
          <View style={{flex: 11}}>
            <Text style={styles.label}>{item.label}</Text>
            <Text>{item.description}</Text>
          </View>
          {isSelected && (
            <Icon name="check" size={20} color="#3473DC" style={{flex: 1}} />
          )}
        </View>
      </ErrorBoundary>
    );
  };

  const handleBlobData = val => {
    setFiles([...files, ...val]);
  };

  const styles = StyleSheet.create({
    descLength: {
      textAlign: 'right',
      marginRight: 10,
    },
    dropdown: {
      height: 50,
      borderColor: 'rgba(51, 48, 60, 0.3)',
      color: 'rgba(51, 48, 60, 0.3)',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      backgroundColor: 'white',
    },
    row1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    column4: {
      flex: 1,
      margin: 4,
    },
    column2: {
      flex: 1,
      marginRight: 10,
    },

    pickerview: {
      height: 50,
      maxHeight: 50,
      minHeight: 50,
      borderColor: '#ccc6c6',
      borderRadius: 4,

      width: '100%',
      maxWidth: '100%',
      minWidth: '100%',
      borderWidth: 1,
      paddingTop: 0,
      marginTop: 5,
      backgroundColor: 'white',

      border: '1px solid #ccc6c6',
    },
    mediaIcon: {
      marginTop: 7,
    },
    textInputStyle: {
      border: '0px solid #ccc6c6',
    },
    astricRed: {
      color: 'red',
    },
    column12: {
      marginTop: 12,
      border: 0,
    },

    additionalContent: {
      marginTop: 10,
      height: 85,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      display: 'flex',

      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
      paddingHorizontal: 5,
    },
    para: {
      color: 'black',
      fontWeight: '600',
      fontSize: 15,
      textAlign: 'center',
      paddingBottom: 14,
    },
    paraLine: {
      color: 'black',
      fontWeight: '600',
      fontSize: 15,
      textAlign: 'center',
    },
    head: {
      color: 'black',
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      paddingBottom: 12,
    },
    label: {
      color: 'black',
      fontWeight: '700',
    },
    itemdrop: {
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownContainer: {
      borderRadius: 8,
    },
    rlabel: {
      position: 'absolute',
      // backgroundColor: 'Transperent',
      left: 6,
      top: -9,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 12,
      color: 'gray',
    },
  });
  const [reasonToFeedback, setReasonToFeedback] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [blobData, setBlobData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Profile_Settings,
  );

  useEffect(() => {
    setSaveButtonDisabled(
      !formik.values.purpose ||
        !formik.values.subject ||
        formik.values.message.length < 25 ||
        !formik.isValid ||
        !Object.keys(formik.touched || {}).length,
    );
  });
  const validationSchema = Yup.object().shape({
    purpose: Yup.string().required('Purpose is required'),
    subject: Yup.string()
      .max(100, 'Description must be 100 characters or less')
      .required('Subject is required'),
    email: Yup.string().required('Email is required').email('Invalid email'),
    mobileNo: Yup.string()
      .nullable()
      .optional()
      .test(
        'invalid-characters',
        'Invalid characters (., + -) are not allowed',
        value => {
          return !/[.,+-]/.test(value);
        },
      )
      .test('valid-phone', 'Mobile number is invalid', validateNum),
  });

  const formik = useFormik({
    initialValues: {
      purpose: '',

      subject: '',
      message: '',

      title: '',
      mobileNo: '',
      email: '',
    },

    validationSchema,
  });

  useEffect(() => {
    if (email) {
      formik.setFieldValue('email', email);
    }
  }, [email]);

  useEffect(() => {
    if (profilePhoneNo) {
      const mobileStr = profilePhoneNo.toString();
      const mobileWithoutCountryCode = mobileStr.startsWith('91')
        ? mobileStr.substring(2)
        : mobileStr;
      formik.setFieldValue('mobileNo', mobileWithoutCountryCode);
    }
  }, [profilePhoneNo]);

  const submit = async () => {
    const bodyFormData = new FormData();
    try {
      if (!formik.errors.purpose || !formik.errors.subject) {
        // If email is missing or invalid, redirect to WhatsApp with full message
        // if (!email || !email.includes('@')) {
        // const whatsappNumber = '917387865055';  Your WhatsApp Business number

        // const userMessage = `
        //   Name: ${name || ''} ${lastname || ''}
        //   Purpose: ${formik.values.purpose || ''}
        //   Subject: ${formik.values.subject || ''}
        //   Message: ${formik.values.message || ''}
        // `;

        // const encodedMessage = encodeURIComponent(userMessage.trim());
        // const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        //   formik.resetForm();
        //   // resetHandler();
        //   setTimeout(() => {
        //     navigation.goBack();
        //   }, 1000);
        //   Linking.openURL(whatsappURL);
        //   return;
        // }

        // Proceed with Freshdesk form submission
        if (Array.isArray(files)) {
          for (const data of files) {
            const fileName = getRandomLetters();

            bodyFormData.append('attachments[]', {
              uri: data.mediaUrl,
              name: fileName,
              type: data.mimeType,
            });
          }
        }

        bodyFormData.append('email', email || formik.values.email);
        bodyFormData.append('name', `${name} ${lastname}`);
        bodyFormData.append(
          'custom_fields[cf_reasontocontact]',
          formik.values.purpose,
        );

        bodyFormData.append('status', 2);
        bodyFormData.append('priority', 3);
        bodyFormData.append('subject', formik.values.subject);
        if (!Object.keys(message).length) {
          bodyFormData.append('description', formik.values.message);
        }
        const finalMobileNo = formik.values.mobileNo
          ? `${countryCode}${formik.values.mobileNo}`
          : profilePhoneNo;
        if (finalMobileNo) {
          bodyFormData.append('custom_fields[cf_phone]', finalMobileNo);
        }
        const res = await dispatch(feedPage(bodyFormData)).unwrap();
        if (res) {
          Toast.show({
            type: 'success',
            text1: toastMessages?.['8003'],
          });
          formik.resetForm();
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.Profile_Settings_Error?.['8006'],
      });
    }
  };

  const handleRemoveFile = file => {
    const uploadedFiles = files;
    const filtered = uploadedFiles.filter(i => i.mediaUrl !== file.mediaUrl);

    setFiles([...filtered]);
  };

  const feedback = async () => {
    try {
      setLoading(true);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  function renderFilePreview(file) {
    return (
      <View style={{position: 'relative'}}>
        <TouchableOpacity
          onPress={() => handleRemoveFile(file)}
          style={{
            backgroundColor: 'lightgray',
            position: 'absolute',
            top: -10,
            zIndex: 10,
            borderRadius: 5,
            right: -8,
          }}>
          <CloseIcon />
        </TouchableOpacity>
        {file?.type?.toLowerCase() === 'image' ? (
          <Image
            style={{
              zIndex: 1,
              resizeMode: 'cover',
              borderRadius: 8,
              height: 85,
              width: 85,
            }}
            alt={file.type}
            source={{uri: file.mediaUrl}}
          />
        ) : (
          <View
            style={{
              borderRadius: 8,
              height: 85,
              width: 85,
            }}>
            <VideoThumbnail
              renderLocalThumbnailIos={true}
              thumbnailUrl={
                file?.thumbnailUrl ? file?.thumbnailUrl : file.mediaUrl
              }
              resize={'cover'}
              src={file.mediaUrl}
              preventPlay={false}
              imuwMediaStyle={{width: '100%', height: '100%'}}
              imuwThumbStyle={{borderRadius: 6, width: '100%'}}
            />
          </View>
        )}
      </View>
    );
  }
  function handleBack() {
    if (
      formik.values.purpose !== '' ||
      formik.values.subject !== '' ||
      formik.values.message !== '' ||
      files.length > 0
    ) {
      setOpenConfirmPopup(true);
    } else {
      if (comingFrom === 'Home') {
        navigation.navigate('BottomTabs', {screen: 'Home'});
      } else {
        navigation.goBack();
      }
    }
  }
  const [selectedOption, setSelectedOption] = useState('');
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const handleOptionSelect = option => {
    setSelectedOption(option?.value);
    formik.setFieldValue('purpose', option?.value);
    formik.setTouched({...formik.touched, purpose: false});
    setIsDropdownOpened(false);
  };

  const handleDropdownBlur = () => {
    if (isDropdownOpened && !selectedOption) {
      formik.setTouched({...formik.touched, purpose: true});
    }
    setIsDropdownOpened(false);
  };
  const [countryCode, setCountryCode] = useState('');

  const handleCountrySelect = selectedCountry => {
    const dialCode = selectedCountry.dialCode.startsWith('+')
      ? selectedCountry.dialCode
      : `+${selectedCountry.dialCode}`;
    setCountryCode(dialCode);
  };

  function validateNum(num) {
    if (!num || !num?.toString?.()?.length) {
      return true;
    }

    const sanitizedNum = num.replace(/[^0-9]/g, '');
    if (sanitizedNum.startsWith('0')) {
      return false;
    }
    const dialCode = countryCode.replace('+', '');
    const fullNumber = `+${dialCode}${sanitizedNum}`;

    const phoneNumber = parsePhoneNumber(fullNumber);
    if (phoneNumber) {
      phoneNumber.formatNational();
      return isValidPhoneNumber(fullNumber);
    }
  }

  const isFocused = useIsFocused();

  useEffect(() => {
    if (Platform.OS === 'android') {
      setAdjustResize();
      return () => {
        setAdjustPan();
      };
    }
  }, []);

  return (
    <>
      <GlobalHeader
        accessibilityLabel="goBack"
        onBack={handleBack}
        heading={'Get Help'}
        backgroundColor={Theme.light.background}
        fontSize={24}
      />
      <KeyboardAwareScrollView
        KeyboardAwareScrollView={false}
        extraScrollHeight={50}
        keyboardShouldPersistTaps={'always'}>
        {openConfirmPopup && (
          <Confirm
            title={'Are you sure you want to leave?'}
            subTitle={'If you discard, you will lose your changes.'}
            discardCtaText={'Discard'}
            continueCtaText={'Continue Editing'}
            onContinue={() => setOpenConfirmPopup(false)}
            onDiscard={() => {
              navigation.goBack();
            }}
            onCrossClick={() => setOpenConfirmPopup(false)}
          />
        )}
        <GlobalStyle>
          <View style={{padding: 12}}>
            <View style={{alignItems: 'center', paddingBottom: 12}}>
              <FeedbackImg />
            </View>
            <Text style={styles.head}>We value your feedback</Text>
            <Text style={styles.para}>
              Your experience is our top priority, and we’re always striving to
              make iMeUsWe better for you.
            </Text>

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 5,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 8,
                zIndex: 1000,
              }}>
              <CustomDropdown
                accessibilityLabel="feedbackpurpose"
                required
                label="Feedback Type"
                options={data}
                value={selectedOption}
                onOptionSelect={handleOptionSelect}
                onFocus={() => setIsDropdownOpened(true)}
                onBlur={handleDropdownBlur}
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                feedback={feedback}
                inputHeight={50}
                maxDropDownHeight={300}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 4,
                marginTop: 15,
              }}>
              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                  backgroundColor: 'white',
                  borderRadius: 8,
                }}>
                <CountryCode
                  enabledCountryCode
                  preferredCountries={['in', 'us', 'gb']}
                  onSelect={handleCountrySelect}
                  accessibilityLabel="countryCodeInput"
                  defaultCountry="in"
                  value={countryCode}
                  label="Mobile Number"
                  testID="countryCodeInput"
                  name="mobile"
                  customStyle={{height: 50}}
                />
              </View>

              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  flex: 1,
                }}>
                <CustomInput
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  style={{flex: 1}}
                  fullWidth
                  label="Mobile number"
                  testID="mobileNumber"
                  name="mobileNo"
                  inputHeight={50}
                  value={formik.values.mobileNo}
                  onChangeText={text => {
                    formik.handleChange({
                      target: {
                        name: 'mobileNo',
                        value: text,
                      },
                    });
                    validateNum(text);
                    formik.setFieldValue('mobileNo', text);
                  }}
                  onBlur={formik.handleBlur('mobileNo')}
                  error={
                    formik.touched.mobileNo && Boolean(formik.errors.mobileNo)
                  }
                  helperText={formik.touched.mobileNo && formik.errors.mobileNo}
                />
              </View>
            </View>
            {formik.touched.mobileNo && formik.errors.mobileNo && (
              <HelperText type="error" accessibilityLabel="mobileNo-error">
                {formik.errors.mobileNo}
              </HelperText>
            )}

            <View
              style={[
                styles.column12,
                {
                  padding: 0,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  borderColor: theme.colors.background,
                  marginTop: 20,
                },
              ]}>
              <CustomInput
                autoCorrect={false}
                name="Email"
                accessibilityLabel="email"
                mode="outlined"
                label="Email"
                keyboardType="email-address"
                inputHeight={50}
                value={formik.values.email || email}
                error={formik.touched.email && Boolean(formik.errors.email)}
                onBlur={formik.handleBlur('email')}
                onChangeText={email ? undefined : formik.handleChange('email')}
                clearable={!email}
                required
                disabled={!!email}
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                contentStyle={{
                  color: email ? '#888888' : 'black',
                  fontWeight: 600,
                }}
              />
            </View>
            {formik.touched.email && formik.errors.email && (
              <HelperText type="error" accessibilityLabel="email-error">
                {formik.errors.email}
              </HelperText>
            )}

            <View
              style={[
                styles.column12,
                {
                  padding: 0,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  borderColor: theme.colors.background,
                  marginTop: 20,
                },
              ]}>
              <CustomInput
                autoCorrect={false}
                name="Subject"
                accessibilityLabel="subject"
                mode="outlined"
                label="Feedback Subject"
                maxLength={100}
                inputHeight={50}
                value={formik.values.subject}
                onChangeText={text => {
                  formik.handleChange('subject')(text);
                }}
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                onBlur={formik.handleBlur('subject')}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                clearable
                required
              />
            </View>
            {formik.touched.subject && formik.errors.subject && (
              <HelperText type="error" accessibilityLabel="subject-error">
                {formik.errors.subject}
              </HelperText>
            )}

            <View style={{paddingTop: 20}}>
              <Text style={styles.paraLine}>
                Please provide as much detail as possible to help us understand
                your experience.
              </Text>
              <Text style={styles.para}>
                (Please enter at least 25 characters)
              </Text>
            </View>
            <View
              style={[
                styles.column12,
                {
                  padding: 0,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  borderColor: theme.colors.background,
                },
              ]}>
              <CustomInput
                accessibilityLabel="message"
                multiline
                style={[
                  styles.textInputStyle,
                  styles.message,
                  {backgroundColor: 'white', height: 150},
                ]}
                mode="outlined"
                label="Description"
                maxLength={750}
                inputHeight={150}
                centerNumber={15}
                name="message"
                onChangeText={text => {
                  formik.handleChange('message')(text);
                }}
                textVerticalAlign="top"
                onBlur={formik.handleBlur('message')}
                value={formik.values.message}
                error={formik.touched.message && Boolean(formik.errors.message)}
                outlineColor={theme.colors.altoGray}
                required
              />
              <Text
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 10,
                  color: formik.values.message.length > 24 ? '#00C950' : 'red',
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                {formik.values.message.length}{' '}
                {formik.values.message.length === 1
                  ? 'character'
                  : 'characters'}
              </Text>
            </View>
            {formik.touched.message && formik.values.message.length < 25 && (
              <Text
                style={{
                  color: 'red',
                  fontSize: 12,
                  marginTop: 5,
                  marginLeft: 10,
                }}>
                Please enter at least 25 characters to submit your feedback.
              </Text>
            )}

            <View
              style={{display: 'flex', flexDirection: 'row', paddingTop: 8}}>
              <View>
                <FileUploader
                  totalVideoCountAllowed={1}
                  totalImageCountAllowed={9}
                  blobData={files}
                  allowedFiles={['image', 'video']}
                  onGetMedia={handleBlobData}>
                  <View style={styles.additionalContent}>
                    <AddImage style={styles.mediaIcon} />
                    <Text
                      style={{
                        color: NewTheme.colors.primaryOrange,
                        paddingBottom: 12,
                        paddingTop: 6,
                      }}>
                      Add Media
                    </Text>
                  </View>
                </FileUploader>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={files.length > 2}>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginHorizontal: 5,
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  {files.map(file => (
                    <View key={file.uri}>{renderFilePreview(file)}</View>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View style={{paddingTop: 20}}>
              <Text style={styles.para}>
                By sending your feedback, you are allowing us to contact you for
                more details.
              </Text>
            </View>

            <View style={[styles.row, {marginBottom: 130}]}>
              <View style={styles.column12}>
                <CustomButton
                  accessibilityLabel="submit-feedbackBtn"
                  className="feedbackBtn"
                  label={'Confirm'}
                  disabled={saveButtonDisabled}
                  onPress={() => submit()}
                />
              </View>
            </View>
          </View>
        </GlobalStyle>
      </KeyboardAwareScrollView>
    </>
  );
};

export default ImuwFeedback;
