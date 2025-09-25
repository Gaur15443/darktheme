import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useTheme, Text} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import CustomTextInput from '../../../../components/CustomTextInput';
import {ProfilePicCropper} from '../../../../core';
import BottomBarButton from '../../CommunityComponents/BottomBarButton';
import {useDispatch, useSelector} from 'react-redux';
import {
  createCommunity,
  checkCommnityName,
} from '../../../../store/apps/createCommunity';
import UploadImagePlaceHolder from '../../../../images/Icons/UploadImagePlaceHolder';
import Toast from 'react-native-toast-message';
import {uploadCommunityLogo} from '../../../../store/apps/uploadCommunityLogo';
import Theme from '../../../../common/NewTheme';
import {GlobalHeader} from '../../../../components';
import CustomDropdown from '../../../customDropdown';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import {Track} from '../../../../../App';
import CustomBottomSheet from '../../../CustomBottomSheet';
import {CameraIcon, GallaryIcon, RemoveLogo} from '../../../../images';
import {useGetAllCommunityCategories} from '../../../../store/apps/communitiesApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';

const CreateCommunity = ({route}) => {
  const PlatfromValue = Dimensions.get('window').height;
  const {selectedMembers = []} = route.params || {};
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const {data: categories} = useGetAllCommunityCategories();

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const [isCategoryDropdownOpened, setIsCategoryDropdownOpened] =
    useState(false);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [communityNameTyped, setCommunityNameTyped] = useState(true);
  const [communityDescTyped, setCommunityDescTyped] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isLogoModal, setLogoModal] = useState(false);
  const [isCommunityNameUnique, setIsCommunityNameUnique] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const insets = useSafeAreaInsets();
  const prevValueRef = useRef('');

  const checkCommunityNameAvailability = async (
    name,
    setIsUnique,
    setErrorMessage,
  ) => {
    try {
      let nameObj = {communityName: name};

      let data = await dispatch(checkCommnityName(nameObj)).unwrap();

      const isAvailable = !data?.nameExists;
      setIsUnique(isAvailable);
      setErrorMessage(isAvailable ? '' : toastMessages?.validation?.['5020']);
    } catch (error) {
      setErrorMessage(toastMessages?.validation?.['5021']);
      setIsUnique(false);
    }
  };

  const handleCommunityNameChange = text => {
    let inputValue = text;

    // Check conditions
    const onlyNumbers = /^[0-9 ]+$/.test(inputValue);
    const hasSpecialChars = /[^a-zA-Z0-9_ ]/.test(inputValue);

    if (hasSpecialChars) {
      setErrorMessage('Only " _ " is allowed as a special character');
    } else if (onlyNumbers && inputValue.length > 0) {
      setErrorMessage('Should contain at least one character.');
    } else {
      setErrorMessage('');
    }

    if (inputValue.length > 0 && communityNameTyped) {
      inputValue = capitalizeFirstLetter(inputValue);
      setTimeout(() => {
        setCommunityNameTyped(false);
      }, 1000);
    }

    if (inputValue.length === 0 || formik.values.communityName?.length === 0) {
      setCommunityNameTyped(true);
    }

    formik.setFieldValue('communityName', inputValue);
    setIsFormDirty(checkIfFormIsDirty());

    // Immediate API call on valid input
    if (inputValue.length > 0 && !hasSpecialChars && !onlyNumbers) {
      checkCommunityNameAvailability(
        inputValue,
        setIsCommunityNameUnique,
        setErrorMessage,
      );
    } else if (inputValue.length === 0) {
      setErrorMessage('');
    }

    prevValueRef.current = inputValue;
  };

  const scrollViewRef = useRef(null);
  const handleFocus = yPosition => {
    // Scroll to the position of the TextInput when focused
    if (Platform.OS === 'ios') {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({y: 160, animated: true});
      }
    }
  };
  // Function to check if any input field is filled
  const checkIfFormIsDirty = () => {
    return (
      formik.values.communityName.trim() !== '' ||
      formik.values.communityDescription.trim() !== '' ||
      formik.values.privacyType.trim() !== '' ||
      formik.values.category.trim() !== '' ||
      selectedMembers?.length > 0 ||
      croppedImageData !== null
    );
  };
  const handleOptionSelect = option => {
    setSelectedOption(option?.label);
    formik.setFieldValue('privacyType', option?.value);
    formik.setTouched({...formik.touched, privacyType: false});
    setIsDropdownOpened(false);
    setIsFormDirty(checkIfFormIsDirty());
  };
  const handleCategorySelect = option => {
    setSelectedCategory(option?.label);
    formik.setFieldValue('category', option?.value);
    formik.setTouched({...formik.touched, category: false});
    setIsCategoryDropdownOpened(false);
    setIsFormDirty(checkIfFormIsDirty());
  };

  const handleCloseDiscardPopup = () => seOpenConfirmPopup(false);

  const handleDropdownBlur = () => {
    if (isDropdownOpened && !selectedOption) {
      formik.setTouched({...formik.touched, privacyType: true});
    }
    setIsDropdownOpened(false);
  };
  const handleCategoryDropdownBlur = () => {
    if (isCategoryDropdownOpened && !selectedCategory) {
      formik.setTouched({...formik.touched, category: true});
    }
    setIsDropdownOpened(false);
  };

  const cleanedCategories = categories?.map(category => ({
    ...category,
    label: category.categoryName.replace(/[~()]/g, ''),
    value: category._id,
  }));

  const theme = useTheme();
  const navigation = useNavigation();
  const [croppedImageData, setCroppedImageData] = useState(
    route.params?.croppedImageData || null,
  );
  const userId = useSelector(state => state?.userInfo?._id);
  const userInfo = useSelector(state => state?.userInfo);
  const privacyTypeDropdownData = [
    {label: 'Public', value: 'Public'},
    {label: 'Private', value: 'Private'},
  ];
  const validationSchema = Yup.object().shape({
    communityName: Yup.string().required('Community Name is required').trim(),
    communityDescription: Yup.string().required('Description is required'),
    privacyType: Yup.string().required('Privacy Type is required'),
    category: Yup.string().required('Category is required'),
  });

  const formik = useFormik({
    initialValues: {
      communityName: route.params?.communityName || '',
      communityDescription: route.params?.communityDescription || '',
      privacyType: route.params?.privacyType || '',
      category: route.params?.category || '',
    },
    validationSchema,
    onSubmit: values => {
      const cleanedValues = {
        ...values,
        communityName: values.communityName.trim().replace(/\s+/g, ' '),
        membersList: selectedMembers,
      };

      const communityData = cleanedValues;
      dispatch(createCommunity(communityData))
        .then(response => {
          const communityId = response?.payload?.data?._id;
          // Refresh Data For Your Communities List
          queryClient.invalidateQueries({
            queryKey: ['userOwnedCommunities'],
          });

          const uploadedImage = croppedImageData;
          if (croppedImageData) {
            dispatch(
              uploadCommunityLogo({
                userId,
                communityId,
                imageFile: croppedImageData,
              }),
            );
          }
          navigation.setParams({});
          formik.resetForm();
          setCroppedImageData(null);
          navigation.navigate('InviteIntialCommunityMembers', {
            item: {
              _id: communityId,
              uploadedImage,
              communityName: values?.communityName,
              fromScreen: 'createCommunity',
            },
          });
          Toast.show({
            type: 'success',
            text1: toastMessages?.['5001'],
          });

          /* customer io and mixpanel event changes  start */
          const props = {
            community_name: communityData?.communityName,
            privacy_type: communityData?.privacyType,
            category: selectedCategory,
            community_description: communityData?.communityDescription,
            community_id: communityId,
          };
          Track({
            cleverTapEvent: 'community_created',
            mixpanelEvent: 'community_created',
            userInfo,
            cleverTapProps: props,
            mixpanelProps: props,
          });
          /* clevertap and mixpanel events ---end****/
        })
        .catch(error => {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        });
    },
  });

  useEffect(() => {
    setIsFormDirty(checkIfFormIsDirty());
  }, [formik?.values]);

  const goBack = () => {
    Keyboard.dismiss();
    if (isFormDirty || checkIfFormIsDirty()) {
      seOpenConfirmPopup(true);
    } else {
      closeform();
    }
  };
  const closeform = () => {
    navigation.setParams({});
    navigation.goBack();
  };
  const capitalizeFirstLetter = text => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  useEffect(() => {
    if (formik?.values?.communityName?.length === 0) {
      setCommunityNameTyped(true);
    }
    if (formik?.values?.communityDescription?.length === 0) {
      setCommunityDescTyped(true);
    }
  }, [formik?.values?.communityName, formik?.values?.communityDescription]);

  const closeModal = () => {
    setLogoModal(false);
  };

  const removeLogoAction = () => {
    if (croppedImageData) {
      setCroppedImageData(null);
      setLogoModal(false);
    }
  };

  const pageIsFocused = useIsFocused();
  return (
    <>
      <GlobalHeader
        heading={'Create Community'}
        onBack={goBack}
        backgroundColor={Theme.colors.backgroundCreamy}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Theme.colors.backgroundCreamy,
        }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          contentContainerStyle={{
            height: Platform.OS === 'ios' ? PlatfromValue : '100%',
          }}>
          <View style={styles.container}>
            {/* Header*/}

            {/* Main Form */}
            <View style={styles.formContainer}>
              <View style={styles.formSubContainer}>
                <TouchableOpacity onPress={() => setLogoModal(true)}>
                  {croppedImageData ? (
                    <View>
                      <Image
                        style={styles.profilePic}
                        source={{
                          uri: croppedImageData?.path,
                        }}
                        accessibilityLabel="profile picture"
                      />
                    </View>
                  ) : (
                    <UploadImagePlaceHolder />
                  )}
                </TouchableOpacity>

                <View style={styles.communityDetailsContainer}>
                  <CustomTextInput
                    autoCorrect
                    mode="outlined"
                    inputHeight={48}
                    style={styles.communityName}
                    label={'Community Name'}
                    maxLength={50}
                    value={formik.values.communityName}
                    onChangeText={handleCommunityNameChange}
                    onBlur={formik.handleBlur('communityName')}
                    error={
                      (formik.touched.communityName &&
                        formik.errors.communityName) ||
                      errorMessage
                    }
                    required
                    clearable
                    accessibilityLabel="Input field for the community name"
                  />
                  {errorMessage &&
                  !(
                    formik.touched.communityName && formik.errors.communityName
                  ) ? (
                    <Text
                      style={[
                        styles.errorText,
                        {marginTop: -5, marginLeft: 8},
                      ]}>
                      {errorMessage}
                    </Text>
                  ) : null}
                  {formik.touched.communityName &&
                    formik.errors.communityName && (
                      <Text
                        style={[
                          styles.errorText,
                          {marginTop: -8, marginLeft: 8},
                        ]}>
                        {formik.errors.communityName}
                      </Text>
                    )}
                  <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                    <CustomDropdown
                      accessibilityLabel="Privacy Type"
                      required
                      label="Privacy Type"
                      options={privacyTypeDropdownData}
                      value={selectedOption}
                      onOptionSelect={handleOptionSelect}
                      onFocus={() => setIsDropdownOpened(true)}
                      onBlur={handleDropdownBlur}
                      error={
                        formik.touched.privacyType && formik.errors.privacyType
                      }
                      inputHeight={48}
                    />
                  </View>

                  {formik.touched.privacyType && formik.errors.privacyType && (
                    <Text
                      style={[
                        styles.errorText,
                        {marginTop: -8, marginLeft: 8},
                      ]}>
                      {formik.errors.privacyType}
                    </Text>
                  )}
                </View>
              </View>

              <View style={{zIndex: 1000, backgroundColor: 'white'}}>
                <CustomDropdown
                  accessibilityLabel="category"
                  required
                  label="Category"
                  options={cleanedCategories}
                  value={selectedCategory}
                  onOptionSelect={handleCategorySelect}
                  onFocus={() => setIsCategoryDropdownOpened(true)}
                  onBlur={handleCategoryDropdownBlur}
                  error={formik.touched.category && formik.errors.category}
                  inputHeight={48}
                />
              </View>
              {formik.touched.category && formik.errors.category && (
                <Text style={[styles.errorText, {marginLeft: 8}]}>
                  {formik.errors.category}
                </Text>
              )}

              {/* Description Of Community */}
              <CustomTextInput
                autoCorrect
                mode="outlined"
                inputHeight={232}
                style={styles.description}
                label={'Describe your Community'}
                contentStyle={styles.inputContent}
                multiline={true}
                centerNumber={15}
                maxLength={725}
                textVerticalAlign="top"
                onFocus={() => {
                  handleFocus();
                  setIsFocused(true);
                }}
                value={formik.values.communityDescription}
                onChangeText={text => {
                  let inputValue = text;
                  if (text.length > 0 && communityDescTyped) {
                    // Capitalize the first letter only when the input is initially empty
                    inputValue = capitalizeFirstLetter(inputValue);
                    setTimeout(() => {
                      setCommunityDescTyped(false);
                    }, 1000);
                  }
                  if (
                    text?.length === 0 ||
                    formik.values.communityDescription?.length === 0
                  ) {
                    setCommunityDescTyped(true);
                  }

                  formik.setFieldValue('communityDescription', inputValue);
                  setIsFormDirty(checkIfFormIsDirty());
                }}
                onBlur={() => {
                  setIsFocused(false);
                  formik.setFieldTouched('communityDescription', true);
                  formik.handleBlur('communityDescription');
                }}
                error={
                  formik.touched.communityDescription &&
                  formik.errors.communityDescription
                }
                required
                accessibilityLabel="Input field for community description"
              />

              {formik.touched.communityDescription &&
                formik.errors.communityDescription && (
                  <Text style={[styles.errorText, {marginLeft: 8}]}>
                    {formik.errors.communityDescription}
                  </Text>
                )}
            </View>
          </View>
        </ScrollView>
        {/* Bottom Create Button */}

        {isLogoModal && (
          <CustomBottomSheet
            enableDynamicSizing={false}
            hideIndicator={true}
            snapPoints={croppedImageData ? ['22%'] : [`20%`]}
            onClose={() => {
              closeModal();
            }}>
            <View>
              <View style={styles.buttonContainer}>
                <View style={styles.mainDisplay}>
                  <View
                    style={{
                      width: 50,
                      height: 5,
                      alignSelf: 'center',
                      backgroundColor: '#DEDEDE',
                      borderRadius: 5,
                    }}
                  />
                  <ProfilePicCropper
                    byForm
                    openType="camera"
                    setShowSelectOption={closeModal}
                    setCroppedImageData={setCroppedImageData}>
                    <View
                      style={styles.display}
                      accessibilityLabel="add/change image logo">
                      <CameraIcon />
                      <Text
                        accessibilityLabel="add/change image text"
                        variant="bold"
                        style={[
                          styles.eventTitle,
                          {color: theme.colors.scrim},
                        ]}>
                        Camera
                      </Text>
                    </View>
                  </ProfilePicCropper>
                  <ProfilePicCropper
                    byForm
                    openType="gallary"
                    setShowSelectOption={closeModal}
                    setCroppedImageData={setCroppedImageData}>
                    <View
                      style={[
                        styles.display,
                        !croppedImageData && {borderBottomWidth: null},
                      ]}
                      accessibilityLabel="add/change image logo">
                      <GallaryIcon />
                      <Text
                        accessibilityLabel="add/change image text"
                        variant="bold"
                        style={[
                          styles.eventTitle,
                          {color: theme.colors.scrim},
                        ]}>
                        Photos
                      </Text>
                    </View>
                  </ProfilePicCropper>

                  {croppedImageData && (
                    <TouchableOpacity
                      style={[styles.display, {borderBottomWidth: null}]}
                      accessibilityLabel="Remove Logo"
                      onPress={removeLogoAction}>
                      <RemoveLogo />
                      <Text
                        accessibilityLabel="Remove Logo Text"
                        variant="bold"
                        style={[
                          styles.eventTitle,
                          {color: theme.colors.scrim},
                        ]}>
                        Remove Image
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </CustomBottomSheet>
        )}

        {openConfirmPopup && (
          <Confirm
            title={'Are you sure you want to leave?'}
            subTitle={'If you discard, you will lose your changes.'}
            discardCtaText={'Continue Editing'}
            continueCtaText={'Discard Changes'}
            onBackgroundClick={handleCloseDiscardPopup}
            onContinue={() => closeform()}
            onDiscard={() => {
              seOpenConfirmPopup(false);
            }}
            accessibilityLabel="confirm-popup-basic-fact"
            onCrossClick={() => seOpenConfirmPopup(false)}
          />
        )}
      </SafeAreaView>
      <BottomBarButton
        label="Create"
        onPress={formik.handleSubmit}
        disabled={!formik.isValid || !formik.dirty || !(errorMessage === '')}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundCreamy,
    paddingHorizontal: 10,
  },
  display: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingRight: 20,
    borderBottomWidth: 0.7,
    borderColor: '#E2E2E2',
  },
  mainDisplay: {
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  eventTitle: {
    fontSize: 20,
    lineHeight: 24,
    paddingLeft: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerIcon: {width: 28, height: 28},
  headerTitle: {
    fontSize: 22,
    fontFamily: 'PublicSans Bold',
  },
  selectedMembersCount: {
    fontSize: 14,
    lineHeight: 18.8,
    textAlign: 'center',
    marginTop: -10,
    fontFamily: 'PublicSans Bold',
  },
  formContainer: {marginHorizontal: 10, paddingTop: 20},
  formSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityDetailsContainer: {
    width: '68%',
    gap: 10,
    justifyContent: 'space-between',
  },
  communityName: {
    backgroundColor: 'white',
    height: 48,
  },
  dropdown: {
    borderColor: '#C3C3C3',
    borderRadius: 6,
    height: 48,
    backgroundColor: 'white',
  },
  dropdownItems: {
    fontSize: 16,
    lineHeight: 26,
  },
  dropdownSelectedText: {
    color: 'black',
    paddingLeft: 10,
    fontSize: 16,
    lineHeight: 26,
  },
  dropdownPlaceholderText: {paddingLeft: 10, fontSize: 16, lineHeight: 26},
  description: {
    marginTop: 10,
    backgroundColor: 'white',
    // height: 124,
  },
  inputContent: {
    marginTop: Platform.OS === 'ios' ? 8 : 0,
  },
  divider: {borderBottomWidth: 1, marginTop: 40},
  inviteContainer: {marginHorizontal: 10, marginTop: 5},
  inviteTitle: {
    fontSize: 16,
    fontFamily: 'PublicSans Bold',
    lineHeight: 28.26,
  },
  InviteSubTitle: {
    fontSize: 14,
    lineHeight: 19.36,
  },
  inviteMemberButton: {
    marginTop: 20,
    elevation: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  errorText: {
    color: 'rgb(177, 42, 48)',
    paddingVertical: 2,
  },
});

export default CreateCommunity;
