import * as Yup from 'yup';
import PropTypes from 'prop-types';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Text, useTheme} from 'react-native-paper';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CustomBottomSheet from '../CustomBottomSheet';
import CustomTextInput from '../CustomTextInput';
import {useFormik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';
import VideoThumbnail from './../../core/Media/VideoThumbnail';
import {SCREEN_WIDTH} from '../../constants/Screens';
import FileUploader from '../../common/media-uploader';
import {CloseIcon} from '../../images';
import {getRandomLetters, onlyInteger} from '../../utils';
import MediaUploaderIcon from '../../images/Icons/StoryMediaUploaderIcon';
import Toast from 'react-native-toast-message';
import {feedPage} from '../../store/apps/Feedback';
import {CustomButton} from '../../core';
import useKeyboardHeight from '../../hooks/useKeyboardheight';
import {isValidPhoneNumber} from 'libphonenumber-js/mobile';
import parsePhoneNumber from 'libphonenumber-js';
import CountryCode from '../CountryCode';
import {MainToast} from '../../../App';
import {CustomInput} from '..';

const HelpModal = function ({onClose = () => undefined, ...props}) {
  // ** Hooks
  const theme = useTheme();
  const dispatch = useDispatch();
  const keyboardHeight = useKeyboardHeight();
  const keyboardDenominator = useMemo(() => {
    return Platform.OS === 'android' ? 2.8 : 1;
  }, []);
  const snapPoint = useMemo(() => {
    return [640 + (keyboardHeight || 1) / keyboardDenominator];
  }, [keyboardHeight, keyboardDenominator]);
  const email = useSelector(state => state.userInfo.email);
  const profilePhoneNo = useSelector(state => state?.userInfo?.mobileNo);
  const personalDetails = useSelector(state => state.userInfo.personalDetails);
  const styles = createStyles();
  const iso = useRef('');
  const countryCode = useRef('');

  // ** States
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [mobileKey, setMobileKey] = useState(0);

  // Error Toast
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );

  const formik = useFormik({
    initialValues: {
      name: '',
      subject: '',
      description: '',
      msg: '',
      mobile: '',
      email: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('This field is required'),
      subject: Yup.string().required('This field is required'),
      description: Yup.string().required('This field is required'),
      email: Yup.string()
        .required('This field is required')
        .email('Invalid email'),
      mobile: Yup.string()
        .nullable()
        .optional()
        .test(
          'Invalid-characters',
          'Invalid characters (., + -) are not allowed',
          value => {
            // Check if there's any invalid character (.,+-) in the input
            return !/[.,+-]/.test(value);
          },
        )
        .test('valid-phone', 'Mobile number is invalid', validateNum),
    }),
  });

  useEffect(() => {
    if (personalDetails?.name && personalDetails?.lastname) {
      formik.setFieldValue(
        'name',
        `${personalDetails.name} ${personalDetails.lastname}`,
      );
    }
  }, [personalDetails]);

  useEffect(() => {
    if (email) {
      formik.setFieldValue('email', email);
    }
  }, [email]);

  useEffect(() => {
    if (profilePhoneNo) {
      try {
        const fullNumber = `+${profilePhoneNo}`;
        const phoneNumber = parsePhoneNumber(fullNumber);

        if (phoneNumber) {
          const mobileNo = phoneNumber.nationalNumber;
          formik.setFieldValue('mobile', mobileNo);
        }
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: userManagementToastsConfig?.catcherror?.errors?.['1601'],
        });
      }
    }
  }, [profilePhoneNo, countryCode.current]);

  const handleBlobData = useCallback(val => {
    setFiles(prev => [...prev, ...val]);
  }, []);

  const handleRemoveFile = useCallback(
    file => {
      setFiles(prev => prev.filter(i => i._id !== file._id));
    },
    [setFiles],
  );

  const resetHandler = () => {
    setFormKey(prevKey => prevKey + 1);
  };

  async function submit() {
    try {
      setIsSubmitting(true);
      const bodyFormData = new FormData();

      if (!formik.errors.purpose || !formik.errors.subject) {
        if (Array.isArray(files) && files.length > 0) {
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
        bodyFormData.append('name', `${formik.values.name} || Anonymous`);

        // bodyFormData.append('custom_fields[cf_pageroute]', 'profiledetails');

        // if (formik.values.mobile?.length > 0) {
        //   bodyFormData.append(
        //     'custom_fields[cf_phone]',
        //     formik.values.mobile
        // ? `${countryCode.current}${formik.values.mobile}`
        //       : '',
        //   );
        // }

        // let finalMobileNo = null;

        // if (finalMobileNo) {
        // bodyFormData.append(
        //   'custom_fields[cf_phone]',
        //  finalMobileNo,
        // );
        // }

        const finalMobileNo = formik.values.mobile
          ? `${countryCode.current}${formik.values.mobile}`
          : profilePhoneNo;
        if (finalMobileNo) {
          bodyFormData.append('custom_fields[cf_phone]', finalMobileNo);
        }

        bodyFormData.append('status', 2);
        bodyFormData.append('priority', 3);
        bodyFormData.append('subject', formik.values.subject || '');

        bodyFormData.append('description', formik.values.description || '');
        await dispatch(feedPage(bodyFormData)).unwrap();
        Toast.show({
          text1: 'Your message has been sent successfully.',
        });
        setTimeout(() => {
          formik.resetForm();
          resetHandler();
          onClose();
        }, 1000);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const RenderFilePreview = memo(function ({file}) {
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
  });
  function validateNum(num) {
    // It's optional.
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

  function resetMobile() {
    setMobileKey(prevKey => prevKey + 1);
  }

  function onSelect(data) {
    countryCode.current = data?.dialCode;
    iso.current = data.iso;
    formik.setFieldValue('mobile', '');
    resetMobile();
  }

  return (
    <>
      <CustomBottomSheet
        snapPoints={snapPoint}
        onClose={onClose}
        enableDynamicSizing={false}>
        <View key={formKey} style={styles.parent} {...props}>
          <Text variant="headlineMedium" style={styles.title}>
            Help Centre
          </Text>
          <CustomTextInput
            label="Name"
            maxLength={50}
            style={[styles.inputContainer, styles.shadow]}
            defaultValue={formik.values.name}
            onChangeText={text => formik.handleChange('name')(text)}
            onBlur={formik.handleBlur('name')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            clearable
            required
          />
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
              mode="outlined"
              style={{
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.37,
                shadowRadius: 7.49,
                elevation: 12,
              }}
            />

            {profilePhoneNo ? (
              <CustomInput
                key={mobileKey}
                keyboardType="number-pad"
                autoComplete="tel"
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
                  formik.setFieldValue('mobile', _text);
                }}
                onBlur={formik.handleBlur('mobile')}
                error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                helperText={formik.touched.mobile && formik.errors.mobile}
                style={[styles.inputContainer, styles.shadow, {flex: 1}]}
              />
            ) : (
              <CustomTextInput
                keyboardType="numeric"
                fullWidth
                label="Mobile Number"
                testID="mobileNumber"
                name="mobile"
                defaultValue={formik.values.mobile}
                onChangeText={_text => {
                  formik.handleChange({
                    target: {
                      name: 'mobile',
                      value: _text,
                    },
                  });
                  validateNum(_text);
                  formik.setFieldValue('mobile', _text);
                }}
                onBlur={formik.handleBlur('mobile')}
                error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                helperText={formik.touched.mobile && formik.errors.mobile}
                style={[styles.inputContainer, styles.shadow, {flex: 1}]}
              />
            )}
          </View>

          {email ? (
            <CustomInput
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="support-email"
              mode="outlined"
              name="email"
              label="Email"
              value={email}
              error={formik.touched.email && Boolean(formik.errors.email)}
              errorText={formik.touched.email && formik.errors.email}
              onBlur={formik.handleBlur('email')}
              onChangeText={email ? undefined : formik.handleChange('email')}
              clearable={!email}
              required
              disabled={!!email}
              contentStyle={{color: email ? '#888888' : 'black'}}
            />
          ) : (
            <CustomTextInput
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="support-email"
              mode="outlined"
              name="email"
              label="Email"
              defaultValue={formik.values.email}
              error={formik.touched.email && Boolean(formik.errors.email)}
              errorText={formik.touched.email && formik.errors.email}
              onBlur={formik.handleBlur('email')}
              onChangeText={email ? undefined : formik.handleChange('email')}
              clearable
              required
              contentStyle={{color: email ? '#888888' : 'black'}}
            />
          )}

          <CustomTextInput
            label="Subject"
            keyboardType="default"
            maxLength={50}
            style={[styles.inputContainer, styles.shadow]}
            defaultValue={formik.values.subject}
            onChangeText={text => formik.handleChange('subject')(text)}
            onBlur={formik.handleBlur('subject')}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            clearable
            required
          />
          <Text variant="titleMedium" style={styles.subTitle}>
            Please provide as much detail as possible to help us understand your
            experience (Please enter at least 25 characters)
          </Text>

          <View style={[styles.inputContainer, styles.shadow, {height: 143}]}>
            <CustomTextInput
              label="Description"
              autoComplete="off"
              keyboardType="default"
              multiline
              textVerticalAlign="top"
              maxLength={250}
              inputHeight={150}
              centerNumber={15}
              style={{height: 150}}
              contentStyle={{
                marginBottom: Platform.OS === 'ios' ? 30 : 10,
                paddingTop: 15,
                paddingHorizontal: 10,
              }}
              onChangeText={text => formik.handleChange('description')(text)}
              onBlur={formik.handleBlur('description')}
              defaultValue={formik.values.description}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              required
            />

            <Text
              style={{
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? '-10' : '-5',
                right: 8,
                color:
                  formik.values.description.length > 24 ? '#00C950' : 'red',
                fontSize: 12,
                fontWeight: '600',
              }}>
              {formik.values.description.length}{' '}
              {formik.values.description.length === 1
                ? 'character'
                : 'characters'}
            </Text>

            {formik.touched.description &&
              formik.values.description.length < 25 && (
                <Text
                  style={{
                    color: 'red',
                    fontSize: 8,
                    marginTop: Platform.OS === 'ios' ? 18 : 8,
                    marginLeft: 1,
                    letterSpacing: 0.1,
                  }}>
                  Please enter at least 25 characters to submit your feedback.
                </Text>
              )}
          </View>

          <View style={{display: 'flex', flexDirection: 'row', paddingTop: 8}}>
            <View>
              <FileUploader
                blobData={files || []}
                totalImageCountAllowed={9}
                totalVideoCountAllowed={1}
                allowedFiles={['image', 'video']}
                onGetMedia={handleBlobData}>
                <View style={styles.additionalContent}>
                  <MediaUploaderIcon
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                  />
                  <Text
                    variant="bold"
                    style={[
                      styles.addMedia,
                      {
                        color: theme.colors.primary,
                      },
                    ]}>
                    Add Media
                  </Text>
                </View>
              </FileUploader>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filesView}>
                {files.map((file, index) => (
                  <View key={`${file.uri}-${index}`}>
                    {<RenderFilePreview file={file} />}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
          <CustomButton
            label="Submit"
            disabled={
              isSubmitting ||
              formik.values.description.length < 25 ||
              !formik.isValid ||
              !Object.keys(formik.touched || {}).length
            }
            loading={isSubmitting}
            mode="contained"
            textColor="#fff"
            style={styles.submit}
            onPress={() => submit()}
            accessibilityLabel="support-ticket"
            className="support-ticket"
          />
        </View>
      </CustomBottomSheet>
      <MainToast />
    </>
  );
};

function createStyles() {
  return StyleSheet.create({
    parent: {
      paddingHorizontal: 40,
    },
    title: {
      textAlign: 'center',
      marginVertical: 2,
    },
    subTitle: {
      fontWeight: 'bold',
      fontSize: 11,
      lineHeight: 14,
    },
    filesView: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginHorizontal: 5,
      alignItems: 'center',
      marginTop: 10,

      minWidth: SCREEN_WIDTH,
    },
    submit: {
      marginTop: 10,
    },
    addMedia: {
      textAlign: 'center',
    },
    mediaIcon: {
      marginTop: 7,
    },
    shadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
    inputContainer: {
      borderRadius: 8,
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: '#FEF8F1',
    },
    additionalContent: {
      marginTop: 10,
      height: 85,
      width: 85,
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
  });
}

HelpModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default memo(HelpModal);
