// import * as React from 'react';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  MD3Colors,
  TextInput,
  Dialog,
  Button,
  Portal,
  useTheme,
  Text,
} from 'react-native-paper';
import {CustomDialog, GlobalStyle, CustomButton} from '../../../core';
import {EditIcon} from '../../../images';
import TickIcon from '../../../images/Icons/TickIcon';
import Icon from 'react-native-vector-icons/FontAwesome';
import NewTheme from '../../../common/NewTheme';
import EditIconTreeName from '../../../images/Icons/EditIconTreeName';

import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {ProfileHeader} from '../../../components';
import {ProfilePicturePlus} from '../../../images';
import FileUploader from '../../../common/media-uploader';
import {GlobalHeader, CustomInput} from '../../../components';
import {Theme} from '../../../common';
import {ProfilePicCropper} from '../../../core';
import {uploadMedia} from '../../../store/apps/mediaSlice';
import {resetPassword} from '../../../store/apps/auth/index';
import {passwordValidator} from './../../../utils/validators';
import {useDispatch, useSelector} from 'react-redux';
import {useFormik} from 'formik';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import * as KeyChain from 'react-native-keychain';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorBoundary from '../../../common/ErrorBoundary';
import ProfileImage from '../../../common/ProfileImageViewer';
import LottieView from 'lottie-react-native';
import * as Sentry from "@sentry/react-native";
import {desanitizeInput} from '../../../utils/sanitizers';

const ProfileSettings = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [text, setText] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showChangePwdDialog, setChnagePwdDialog] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  //const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [showPasswordValidations, setShowPasswordValidations] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    hasLetter: false,
    hasNumber: false,
    hasMinChar: false,
  });
  const email = useSelector(state => state?.userInfo.email);
  const mobileNo = useSelector(state => state?.userInfo.mobileNo);
  const [showAnimation, setShowAnimation] = useState(false);

  const userInfo = useSelector(state => state.userInfo);
  const image = useSelector(
    state => state?.userInfo?.personalDetails?.profilepic,
  );
  const name = useSelector(state => state?.userInfo?.personalDetails?.name);
  const lastname = useSelector(
    state => state?.userInfo?.personalDetails?.lastname,
  );
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );
  const {top} = useSafeAreaInsets();

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Profile_Settings?.Profile_Settings_Error,
  );

  const handleSettingIconPress = () => {
    navigation.navigate('DeleteAccount');
  };

  const editAnimationRef = useRef(null);

  const onAnimationFinish = useCallback(() => {
    setChnagePwdDialog(true);
    // Reset the focused tab when the animation finishes
  }, []);

  useEffect(() => {
    if (showChangePwdDialog) {
      editAnimationRef.current?.reset(); // Resets the animation
    }
  }, [showChangePwdDialog]);

  useEffect(() => {
    if (showAnimation && editAnimationRef.current) {
      editAnimationRef.current.play();
    }
  }, [showAnimation]);

  const getToken = async () => {
    const accessToken = await KeyChain.getGenericPassword({
      username: 'imuwAccessToken',
    });
    return accessToken.password;
  };

  const handleClose = () => {
    setShowAnimation(false);
    setChnagePwdDialog(false);
  };

  function handleBack() {
    navigation.goBack();
  }

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

  const handleChangePwd = async () => {
    try {
      const accessToken = await getToken();
      const passdata = {
        accessToken,
        password: formik?.values?.password,
      };

      const res = await dispatch(resetPassword(passdata)).unwrap();

      handleClose();
      Toast.show({
        type: 'success',
        text1:
          userManagementToastsConfig?.resetPassword?.success?.[res?.message],
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.['8005'],
      });
    }
    setShowPasswordValidations(false);
    formik.resetForm();
  };
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: yup.object().shape({
      password: yup
        .string()
        .test(
          'password',
          'Password field should accept minimum 8 char including at least 1 number and at least 1 alphabet',
          passwordValidator,
        )
        .required('This field is required'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords do not match')
        .required('This field is required'),
    }),
  });
  return (
    <ErrorBoundary.Screen>
      <View
        style={{paddingBottom: top}}
        accessibilityLabel="profile-settings-page">

        <GlobalHeader
          onBack={handleBack}
          heading={'Profile Settings'}
          backgroundColor={Theme.light.background}
          fontSize={20}
          // fontWeight={'normal'}
        />
        <GlobalStyle>
          <View style={{alignItems: 'left'}}>
            <View style={{display: 'flex', alignItems: 'left'}}>
              <View style={styles.content1}>
                {profilePicture || image ? (
                  <View>
                    <ProfileImage
                      loading="lazy"
                      uri={profilePicture || image}
                      alt="img"
                      style={styles.mediaIcon1}
                    />
                  </View>
                ) : (
                  <ProfilePicturePlus
                    style={styles.mediaIcon}
                    color={NewTheme.colors.secondaryDarkBlue}
                  />
                )}
                {/* <Text style={{paddingLeft: 10, color: 'black'}}>
                  Update Profile Photo
                </Text> */}
               
                <ProfilePicCropper
                  userId={userInfo._id}
                  setProfilePicture={setProfilePicture}>
                  <Text
                    style={styles.addtext}
                    testID="updatePhotoBasic"
                    accessibilityLabel="Update Profile Photo">
                    Update Profile Photo
                  </Text>
                </ProfilePicCropper>
                
                
              </View>
            </View>
            <View style={styles.content}>
              <Text style={styles.bold}>Name</Text>
              <Text style={{color: 'black'}}>
                {desanitizeInput(name)} {desanitizeInput(lastname)}
              </Text>
            </View>
            {mobileNo && (
              <View style={styles.content}>
                <Text style={styles.bold}>Mobile Number</Text>
                <Text style={{color: 'black'}}>+{mobileNo}</Text>
              </View>
            )}
            {email && (
              <View style={styles.content}>
                <Text style={styles.bold}>Email</Text>
                <Text style={{color: 'black'}}>{desanitizeInput(email)}</Text>
              </View>
            )}

            {email && (
              <View style={styles.content1}>
                <Text style={styles.bold1}>Password</Text>
                {/* <TouchableOpacity
                accessibilityLabel="show-logout-popup"
                onPress={() => setChnagePwdDialog(true)}>
                <EditIcon />
              </TouchableOpacity> */}
                <TouchableOpacity
                  accessibilityLabel="show-logout-popup"
                  onPress={() => {
                    setShowAnimation(true);
                    // editAnimationRef.current?.play();
                  }}>
                  {showAnimation && (
                    <LottieView
                      ref={editAnimationRef}
                      source={require('../../../animation/lottie/edit_icon.json')}
                      loop={false} // adjust as per your need
                      speed={1.5}
                      onAnimationFinish={onAnimationFinish}
                      style={{height: 35, width: 35, marginBottom: 5}}
                    />
                  )}
                  {!showAnimation && <EditIconTreeName />}
                </TouchableOpacity>
              </View>
            )}
            {email && (
              <Text style={{marginLeft: 10, color: 'black'}}>
                *************
              </Text>
            )}
            <View style={styles.column12}>
              <CustomButton
                accessibilityLabel="DeleteAccount"
                className="DeleteAccountBtn"
                label={'Delete Account'}
                onPress={handleSettingIconPress}
              />
            </View>
          </View>

          {/* Popup For Logout */}
          <CustomDialog
            visible={showChangePwdDialog}
            onClose={() => {
              setShowAnimation(false);
              setChnagePwdDialog(false);
              setShowPasswordValidations(false);
              formik.resetForm();
            }}
            title="Set New Password For"
            confirmLabel="Confirm Change"
            message={email}
            onConfirm={handleChangePwd}
            onCancel={() => {
              setShowAnimation(false);
              setChnagePwdDialog(false);
              setShowPasswordValidations(false);
              formik.resetForm();
            }}
            disabled={
              !formik.isValid || !Object.keys(formik.touched || {})?.length
            }
            customBody={
              <View>
                <CustomInput
                  autoCapitalize="none"
                  accessibilityLabel="signup-password"
                  autoComplete="off"
                  name="password"
                  label="New Password"
                  value={formik.values.password}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  onBlur={text => formik.handleBlur('password')(text)}
                  onChangeText={text => {
                    formik.handleChange('password')(text);
                    setShowPasswordValidations(true);
                    checkPasswordValidations(text);
                  }}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  clearable
                  required
                  right={
                    <Icon
                      onPress={() => setShowPassword(prev => !prev)}
                      name={showPassword ? 'eye' : 'eye-slash'}
                    />
                  }
                />
                {showPasswordValidations && (
                  <View style={{marginBottom: 12}}>
                    <Text
                      style={{fontSize: 10, fontWeight: 700, letterSpacing: 0}}>
                      Password must include at least{' '}
                      <Text
                        style={{
                          color: !passwordValidations.hasLetter
                            ? 'red'
                            : 'green',
                          fontSize: 9.2,
                        }}>
                        1 letter,{' '}
                      </Text>
                      <Text
                        style={{
                          color: !passwordValidations.hasNumber
                            ? 'red'
                            : 'green',
                          fontSize: 9.2,
                        }}>
                        1 number{' '}
                      </Text>
                      <Text
                        style={{
                          color: !passwordValidations.hasMinChar
                            ? 'red'
                            : 'green',
                          fontSize: 9.2,
                        }}>
                        & 8 characters
                      </Text>
                    </Text>
                  </View>
                )}

                <CustomInput
                  mode="outlined"
                  autoCapitalize="none"
                  accessibilityLabel="signup-confirm-password"
                  autoComplete="off"
                  name="password"
                  label="Confirm Password"
                  value={formik.values.confirmPassword}
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
                  errorText={formik.errors.confirmPassword}
                  onBlur={formik.handleBlur('confirmPassword')}
                  onChangeText={text => {
                    formik.handleChange('confirmPassword')(text);
                    checkPasswordValidations(text);
                  }}
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  required
                  clearable
                  right={
                    <Icon
                      onPress={() => setShowConfirmPassword(prev => !prev)}
                      name={showConfirmPassword ? 'eye' : 'eye-slash'}
                    />
                  }
                />
              </View>
            }
          />
        </GlobalStyle>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  column12: {
    width: '100%',
    marginTop: 10,
    border: 0,
  },
  addtext: {
    marginLeft: 20,
    fontSize: 18,
    color: NewTheme.colors.secondaryLightBlue,
  },
  mediaIcon: {
    marginTop: 7,
    // marginLeft: 5,
    height: 10,
    width: 10,
  },

  mediaIcon1: {
    marginTop: 7,
    //marginLeft: 5,
    height: 60,
    width: 60,
    borderRadius: 50,
  },
  content: {
    textAlign: 'left',
    padding: 10,
    marginTop: 10,
  },
  content1: {
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bold: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },

  bold1: {
    fontSize: 16,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    color: 'black',
  },

  input: {
    backgroundColor: 'white',
    marginVertical: 5,
    width: '100%',
  },
  editPencil: {
    paddingTop: 20,
  },
});

export default ProfileSettings;
