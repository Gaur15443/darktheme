/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTheme, Text} from 'react-native-paper';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import ExitCommunityPopup from '../../CommunityComponents/ExitCommunityPopup';
import CustomTextInput from '../../../../components/CustomTextInput';
import {ProfilePicCropper} from '../../../../core';
import BottomBarButton from '../../CommunityComponents/BottomBarButton';
import {useDispatch, useSelector} from 'react-redux';
import UploadImagePlaceHolder from '../../../../images/Icons/UploadImagePlaceHolder';
import Toast from 'react-native-toast-message';
import {uploadCommunityLogo} from '../../../../store/apps/uploadCommunityLogo';
import {
  RemoveLogo,
  MakeAdminCommunityIcon,
  RemoveCommunityMemberIcon,
  DismissAdminCommunityIcon,
  CameraIcon,
  GallaryIcon,
} from '../../../../images';

import RenderMemberList from '../../CommunityComponents/RenderMemberList';
import {
  viewSingleCommunity,
  updateCommunity,
  fetchMember,
  removeMember,
  removeLogo,
  makeDismissAdmin,
} from '../../../../store/apps/createCommunity';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import NewTheme from './../../../../common/NewTheme';
import GlobalHeader from '../../../ProfileTab/GlobalHeader';
import SmallBottomSheet from '../../../../common/SmallBottomSheet';
import Spinner from '../../../../common/Spinner';
import CustomDropdown from '../../../customDropdown';
import CustomBottomSheet from '../../../CustomBottomSheet';
import ProfileImageViewer from '../../../../common/ProfileImageViewer';
import {ScrollView} from 'react-native-gesture-handler';
import {
  useGetAllCommunityCategories,
  useGetCommunityMembers,
  useGetSingleCommunity,
} from '../../../../store/apps/communitiesApi';
import {useQueryClient} from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { checkCommnityName } from '../../../../store/apps/createCommunity';

const EditCommunity = ({route}) => {
  const dispatch = useDispatch();
  const {data: categories} = useGetAllCommunityCategories();

  const cleanedCategories = categories?.map(category => ({
    ...category,
    label: category.categoryName.replace(/[~()]/g, ''),
    value: category._id,
  }));
  const theme = useTheme();
  const queryClient = useQueryClient();

  const navigation = useNavigation();
  const [croppedImageData, setCroppedImageData] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [profileLogoUrl, setProfileLogoUrl] = useState(null);
  const [query, setQuery] = useState('');
  const [ShowSelectRoleToAdmin, setShowSelectRoleToAdmin] = useState(false);
  const [ShowSelectRoleToMember, setShowSelectRoleToMember] = useState(false);
  const [memberId, setMemberId] = useState('');

  const [ShowSelectOption, setShowSelectOption] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedLastname, setSelectedLastname] = useState('');
  const [removeMemberPopup, setRemoveMemberPopup] = useState(false);
  const [makeAdminPopup, setMakeAdminPopup] = useState(false);
  const [dismissAdminPopup, setDismissAdminPopup] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [selection, setSelection] = useState(null);
  const [selectionDone, setSelectionDone] = useState(false);
  const insets = useSafeAreaInsets();
  const [isCommunityNameUnique, setIsCommunityNameUnique] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const prevValueRef = useRef('');

  const communityDetails = useSelector(
    state => state?.getCommunityDetails?.communityDetails,
  );
  const userId = useSelector(state => state?.userInfo?._id);
  const communityOwnerId = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data?.owner?._id,
  );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );
  const {data: singleCommunityData, isLoading} = useGetSingleCommunity(
    communityDetails?.data?._id,
  );
  const singleCommunity = singleCommunityData?.data;

  const {data} = useGetCommunityMembers(communityDetails?.data?._id);
  const fetchAllMemebrs = data?.pages?.flatMap(page => page.data) || [];

  const privacyTypeDropdownData = [
    {label: 'Public', value: 'Public'},
    {label: 'Private', value: 'Private'},
  ];
  const validationSchema = Yup.object().shape({
    communityName: Yup.string().required('Community Name is required'),
    communityDescription: Yup.string().required('Description is required'),
    privacyType: Yup.string().required('Privacy Type is required'),
    category: Yup.string().required('Category is required'),
  });

  const loggedInMemberData = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.loggedInMemberData,
  );
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const [isCategoryDropdownOpened, setIsCategoryDropdownOpened] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const bottomSheetRefRoleToAdmin = useRef(null);
  const bottomSheetRefRoleToMember = useRef(null);

  const checkCommunityNameAvailability = async (name, setErrorMessage) => {
    try {
      let nameObj = { };
      nameObj.communityName = name;
      nameObj.communityId = communityDetails?.data?._id;
  
      const data = await dispatch(checkCommnityName(nameObj)).unwrap(); //for api integration

      const isAvailable = !data?.nameExists;
      setErrorMessage(isAvailable ? '' : toastMessages?.validation?.["5020"]);
    } catch (error) {
      setErrorMessage(toastMessages?.validation?.["5021"]);
    }
  };
  
  const handleCommunityNameChange = (text) => {
    let inputValue = text;
  
    // Check conditions
    const onlyNumbers = /^[0-9 ]+$/.test(inputValue);
    const hasSpecialChars = /[^a-zA-Z0-9_ ]/.test(inputValue);
  
    if (hasSpecialChars) {
      setErrorMessage(toastMessages?.validation?.["5022"]);
    } else if (onlyNumbers && inputValue.length > 0) {
      setErrorMessage(toastMessages?.validation?.["5023"]);
    } else {
      setErrorMessage('');
    }
  
    if ( inputValue.length > 0 ) {
      inputValue = capitalizeFirstLetter(inputValue);
    }
  
    formik.setFieldValue('communityName', inputValue);
  
    // Immediate API call on valid input
    if (inputValue.length > 0 && !hasSpecialChars && !onlyNumbers) {
      checkCommunityNameAvailability(inputValue, setErrorMessage);
    } else if (inputValue.length === 0) {
      setErrorMessage('');
    }
  
    prevValueRef.current = inputValue;
  };

  const optionsRoleToAdmin = [
    {
      icon: MakeAdminCommunityIcon,
      text: `Make “${selectedName} ${selectedLastname}” an Admin`,
      onPress: () => {
        handleMakeAdmin();
      },
    },
    {
      icon: RemoveCommunityMemberIcon,
      text: `Remove from community`,
      onPress: () => {
        handleOpenPopupRemoveMemer();
      },
    },
  ];
  const optionsRoleToMember = [
    {
      icon: DismissAdminCommunityIcon,
      text: `Dismiss “${selectedName} ${selectedLastname}” as an Admin`,
      onPress: () => {
        handleDismissAdmin();
      },
    },
    {
      icon: RemoveCommunityMemberIcon,
      text: `Remove from community`,
      onPress: () => {
        handleOpenPopupRemoveMemer();
      },
    },
  ];

  const formik = useFormik({
    initialValues: {
      communityName: '',
      communityDescription: '',
      privacyType: '',
      category: '',
    },
    validationSchema,
    onSubmit: values => {
      setLoading(true); // Start loading
      const communityData = {
        ...values,
        communityId: communityDetails?.data?._id,
      };
      dispatch(updateCommunity(communityData))
        .then(response => {
          const communityId = communityDetails?.data?._id;
          // Refresh Community Data
          queryClient.refetchQueries(['CommmunityDetail', communityId]);
          if (croppedImageData || profileLogoUrl) {
            dispatch(
              uploadCommunityLogo({
                userId,
                communityId,
                imageFile: croppedImageData ? croppedImageData : profileLogoUrl,
              }),
            );
          }
          setTimeout(() => {
            navigation.navigate('CommunityDetails', {
              randomNo: Math.random(),
              communityId: communityId,
            });
            formik.resetForm();
            setCroppedImageData(null);
            setShowSelectOption(false);
            setLoading(false);
          }, 1000);

          Toast.show({
            type: 'success',
            text1: toastMessages?.['5006'],
          });
        })
        .catch(error => {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
          setLoading(false);
        });
    },
  });

  useEffect(() => {
    if (
      formik.values.communityDescription?.length > 0 &&
      formik?.values?.communityName?.length > 0 &&
      !selectionDone
    ) {
      setTimeout(() => {
        setSelection({start: 0, end: 0});
      }, 0);
      setTimeout(() => setSelectionDone(true), 1000);
    }
  }, [formik?.values?.communityDescription, formik?.values?.communityName]);

  const isAdmin = useMemo(() => {
    if (loggedInMemberData?.memberRole !== 'Admin') {
      return false;
    }
    return true;
  }, [loggedInMemberData]);

  const removeMemberCall = async memberId => {
    try {
      const data = {
        action: 'remove',
        memberId: memberId,
        id: communityDetails?.data?._id,
      };

      await dispatch(removeMember(data)).unwrap();
      setShowSelectRoleToMember(false);
      setRemoveMemberPopup(false);
      // Refresh Data
      queryClient.refetchQueries([
        'communityActiveMembers',
        communityDetails?.data?._id,
      ]);
      Toast.show({
        type: 'success',
        text1: `${selectedName} ${selectedLastname} ${toastMessages?.['5012']}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      setRemoveMemberPopup(false);
    }
  };
  const handleRoleChange = async (memberId, role) => {
    try {
      const payload = {
        data: {role: role === 'Admin' ? 'Admin' : 'Member', memberId: memberId},
        id: communityDetails?.data?._id,
      };
      await dispatch(makeDismissAdmin(payload)).unwrap();
      setShowSelectRoleToMember(false);
      setMakeAdminPopup(false);
      setDismissAdminPopup(false);
      // Refresh Data
      queryClient.refetchQueries([
        'communityActiveMembers',
        communityDetails?.data?._id,
      ]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      setRemoveMemberPopup(false);
    }
  };

  const handleOpenPopupRemoveMemer = () => {
    setRemoveMemberPopup(true);
    setShowSelectRoleToAdmin(false);
  };
  const handleMakeAdmin = () => {
    setMakeAdminPopup(true);
    setShowSelectRoleToAdmin(false);
  };
  const handleDismissAdmin = () => {
    setDismissAdminPopup(true);
    setShowSelectRoleToAdmin(false);
  };
  const removeLogoAction = async () => {
    try {
      if (!croppedImageData && profileLogoUrl) {
        const data = {
          ownerId: communityDetails?.data?.owner?._id,
          communityId: communityDetails?.data?._id,
        };
        const res = await dispatch(removeLogo(data)).unwrap();
        setProfileLogoUrl(null);
        setShowSelectOption(false);
      } else if (croppedImageData && profileLogoUrl) {
        const data = {
          ownerId: communityDetails?.data?.owner?._id,
          communityId: communityDetails?.data?._id,
        };
        await dispatch(removeLogo(data)).unwrap();
        setProfileLogoUrl(null);
        setShowSelectOption(false);
        setCroppedImageData(null);
      } else {
        setCroppedImageData(null);
        setShowSelectOption(false);
      }
    } catch (error) {}
  };

  const openOptions = () => {
    setShowOptions(true);
  };
  const closeOptions = () => {
    setShowOptions(false);
  };

  const goBack = () => {
    Keyboard.dismiss();
    navigation.setParams({});
    if (loggedInMemberData?.memberRole === 'Admin') {
      seOpenConfirmPopup(true);
    } else {
      navigation.goBack();
    }
  };

  const setRole = (role, name, lastName, item) => {
    setSelectedRole(role);
    setMemberId(item.memberId);
    setSelectedName(name);
    setSelectedLastname(lastName);
    if (role === 'Member') {
      // setShowSelectRoleToAdmin(!ShowSelectRoleToAdmin);
      bottomSheetRefRoleToAdmin.current?.open();
    } else if (role === 'Admin') {
      // setShowSelectRoleToMember(!ShowSelectRoleToMember);
      bottomSheetRefRoleToMember.current?.open();
    }
  };

  const selectOption = () => {
    if (loggedInMemberData?.memberRole === 'Admin') {
      setShowSelectOption(!ShowSelectOption);
    } else {
    }
  };
  const closeModal = () => {
    setShowSelectOption(false);
    setShowSelectRoleToAdmin(false);
    setShowSelectRoleToMember(false);
  };

  const setInitialFormValues = community => {
    setSelectedCategory(
      community?.category?.categoryName?.replace(/[~()]/g, '') || '',
    );
    setSelectedOption(community?.privacyType || '');
    formik.setFieldValue('communityName', community?.communityName || '');
    formik.setFieldValue('privacyType', community?.privacyType || '');
    formik.setFieldValue('category', community?.category?._id || '');
    formik.setFieldValue(
      'communityDescription',
      community?.communityDescription || '',
    );
  };

  useEffect(() => {
    if (singleCommunity) {
      setInitialFormValues(singleCommunity);
      if (
        typeof singleCommunity?.logoUrl === 'string' &&
        singleCommunity?.logoUrl.length > 0
      ) {
        setProfileLogoUrl(singleCommunity?.logoUrl);
      }
    }
  }, [singleCommunity]);

  const capitalizeFirstLetter = text => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Filter Member by Search
  const filteredMembers = fetchAllMemebrs?.filter(item =>
    item?.member?.personalDetails?.name
      ?.toLowerCase()
      .includes(query.toLowerCase()),
  );

  const handleSearchBarClick = () => {
    navigation.navigate('ManageCommunityMembers');
  };

  const handleOptionSelect = option => {
    setSelectedOption(option?.label);
    formik.setFieldValue('privacyType', option?.value);
    formik.setTouched({...formik.touched, privacyType: false});
    setIsDropdownOpened(false);
  };
  const handleCategorySelect = option => {
    setSelectedCategory(option?.label);
    formik.setFieldValue('category', option?.value);
    formik.setTouched({...formik.touched, category: false});
    setIsCategoryDropdownOpened(false);
  };

  const handleDropdownBlur = () => {
    if (isDropdownOpened && !formik.values.privacyType) {
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

  const renderFooter = () => {
    if (filteredMembers?.length >= 5 && filteredMembers?.length !== 0) {
      return (
        <View style={[styles.centerBtn, {marginTop: 15, marginBottom: 10}]}>
          <View style={styles.shareButtons}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                width: '100%',
                height: 48,
                overflow: 'hidden',
              }}
              onPress={handleSearchBarClick}
              accessibilityLabel="Show more members">
              <Text style={styles.shareText}>Show more</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  const pageIsFocused = useIsFocused();

  return (
    <>
      <GlobalHeader
        heading=" Community Details"
        onBack={goBack}
        backgroundColor={NewTheme.colors.backgroundCreamy}
        onPressAction={() => openOptions()}
      />
      <View style={{flex: 1}}>
        {isLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Spinner />
          </View>
        ) : (
          <>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom:
                  loggedInMemberData?.memberRole !== 'Admin' ? 0 : 50,
              }}>
              <View style={styles.container}>
                {showOptions && (
                  <ExitCommunityPopup
                    closeOptions={closeOptions}
                    showOptions={showOptions}
                    communityDetails={communityDetails}
                    communityOwnerId={communityOwnerId}
                    loggedInMemberData={loggedInMemberData}
                  />
                )}
                {openConfirmPopup && (
                  <Confirm
                    title={'Are you sure you want to leave?'}
                    subTitle={'If you discard, you will lose your changes.'}
                    discardCtaText={'Continue Editing'}
                    continueCtaText={'Discard Changes'}
                    onContinue={() => {
                      navigation.goBack();
                    }}
                    onDiscard={() => seOpenConfirmPopup(false)}
                    onBackgroundClick={() => seOpenConfirmPopup(false)}
                    accessibilityLabel="confirm-popup-basic-fact"
                    onCrossClick={() => seOpenConfirmPopup(false)}
                  />
                )}

                {removeMemberPopup && (
                  <Confirm
                    title={`Are you sure you want to remove ${selectedName} ${selectedLastname}?`}
                    discardCtaText={'Cancel'}
                    continueCtaText={'Remove'}
                    onDiscard={() => setRemoveMemberPopup(false)}
                    onContinue={() => {
                      removeMemberCall(memberId);
                    }}
                    hideSubtitle={true}
                    accessibilityLabel="confirm-popup-basic-fact"
                    onCrossClick={() => setRemoveMemberPopup(false)}
                  />
                )}
                {makeAdminPopup && (
                  <Confirm
                    title={`Make ${selectedName} ${selectedLastname} an admin of the ${singleCommunity?.communityName} community?`}
                    discardCtaText={'Cancel'}
                    continueCtaText={'Confirm'}
                    onDiscard={() => setMakeAdminPopup(false)}
                    onContinue={() => {
                      handleRoleChange(memberId, 'Admin');
                    }}
                    hideSubtitle={true}
                    accessibilityLabel="confirm-popup-make-admin"
                    onCrossClick={() => setMakeAdminPopup(false)}
                  />
                )}
                {dismissAdminPopup && (
                  <Confirm
                    title={`Dismiss ${selectedName} ${selectedLastname} as an admin from the ${singleCommunity?.communityName} community?`}
                    discardCtaText={'Cancel'}
                    continueCtaText={'Remove'}
                    onDiscard={() => setDismissAdminPopup(false)}
                    onContinue={() => {
                      handleRoleChange(memberId, 'Member');
                    }}
                    hideSubtitle={true}
                    accessibilityLabel="confirm-popup-dismiss-admin"
                    onCrossClick={() => setDismissAdminPopup(false)}
                  />
                )}

                {/* Main Form */}
                <View style={styles.formContainer}>
                  <View style={styles.formSubContainer}>
                    {loggedInMemberData?.memberRole === 'Admin' ? (
                      <TouchableOpacity onPress={selectOption}>
                        {!croppedImageData && !profileLogoUrl && (
                          <UploadImagePlaceHolder />
                        )}
                      </TouchableOpacity>
                    ) : (
                      !croppedImageData &&
                      !profileLogoUrl && <UploadImagePlaceHolder />
                    )}
                    <TouchableOpacity onPress={selectOption}>
                      {(profileLogoUrl || croppedImageData) && (
                        <View>
                          <ProfileImageViewer
                            pressable={
                              loggedInMemberData?.memberRole === 'Admin'
                                ? true
                                : false
                            }
                            selectOption={selectOption}
                            uri={
                              croppedImageData
                                ? croppedImageData.path
                                : profileLogoUrl
                            }
                            size={100}
                          />
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.communityDetailsContainer}>
                      {loggedInMemberData?.memberRole === 'Admin' ? (
                        <CustomTextInput
                          autoCorrect
                          mode="outlined"
                          inputHeight={48}
                          label={'Community Name'}
                          maxLength={50}
                          value={formik.values.communityName}
                          onChangeText={handleCommunityNameChange}
                          onBlur={formik.handleBlur('communityName')}
                          error={
                            formik.touched.communityName &&
                            formik.errors.communityName || errorMessage
                          }
                          clearable
                          accessibilityLabel="Community name input"
                          disabled={loggedInMemberData?.memberRole !== 'Admin'}
                          selection={selectionDone ? undefined : selection}
                        />
                      ) : (
                        <View
                          style={{
                            backgroundColor: '#F9F9F9',
                            padding: 12,
                            height: 48,
                            borderWidth: 2,
                            borderColor: '#D0D5DD',
                            borderRadius: 5,
                          }}>
                          <Text
                            style={{
                              color: '#888888',
                              fontWeight: 500,
                              fontSize: 16,
                            }}
                            accessibilityLabel="Community name display">
                            {formik.values.communityName}
                          </Text>
                        </View>
                      )}
                      {formik.touched.communityName &&
                        formik.errors.communityName && (
                          <Text style={[styles.errorText,{ marginTop: -5, marginLeft: 8 }]}>
                            {formik.errors.communityName}
                          </Text>
                        )}
                        {errorMessage && !(formik.touched.communityName && formik.errors.communityName) ? (
                                                                  <Text style={[styles.errorText,{ marginTop: -5, marginLeft: 8 }]}>{errorMessage}</Text>
                                                                ) : null}
                      {loggedInMemberData?.memberRole === 'Admin' &&
                      selectedOption?.length > 0 ? (
                        <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                          <CustomDropdown
                            accessibilityLabel="Select privacy type"
                            label="Privacy Type"
                            options={privacyTypeDropdownData}
                            value={selectedOption}
                            onOptionSelect={handleOptionSelect}
                            onFocus={() => setIsDropdownOpened(true)}
                            onBlur={handleDropdownBlur}
                            error={
                              formik.touched.privacyType &&
                              formik.errors.privacyType
                            }
                            defaultValue={selectedOption}
                            inputHeight={48}
                          />
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: '#F9F9F9',
                            padding: 12,
                            height: 48,
                            borderWidth: 2,
                            borderColor: '#D0D5DD',
                            borderRadius: 5,
                          }}>
                          <Text
                            accessibilityLabel="Privacy type display"
                            style={{
                              color: '#888888',
                              fontWeight: 500,
                              fontSize: 16,
                            }}>
                            {formik.values.privacyType} Group
                          </Text>
                        </View>
                      )}

                      {formik.touched.privacyType &&
                        formik.errors.privacyType && (
                          <Text style={styles.errorText}>
                            {formik.errors.privacyType}
                          </Text>
                        )}
                    </View>
                  </View>

                  {loggedInMemberData?.memberRole === 'Admin' &&
                  selectedCategory?.length > 0 ? (
                    <View style={{zIndex: 1000, backgroundColor: 'white'}}>
                      <CustomDropdown
                        accessibilityLabel="Select category"
                        label="Category"
                        options={cleanedCategories}
                        value={selectedCategory}
                        onOptionSelect={handleCategorySelect}
                        onFocus={() => setIsCategoryDropdownOpened(true)}
                        onBlur={handleCategoryDropdownBlur}
                        error={
                          formik.touched.category && formik.errors.category
                        }
                        defaultValue={selectedCategory}
                        inputHeight={48}
                        disable={loggedInMemberData?.memberRole !== 'Admin'}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: '#F9F9F9',
                        padding: 12,
                        height: 48,
                        borderWidth: 2,
                        borderColor: '#D0D5DD',
                        borderRadius: 5,
                      }}>
                      <Text
                        accessibilityLabel="Category display"
                        style={{
                          color: '#888888',
                          fontWeight: 500,
                          fontSize: 16,
                        }}>
                        {singleCommunity?.category?.categoryName
                          ? singleCommunity.category.categoryName.replace(
                              /[~()]/g,
                              '',
                            )
                          : 'Category'}
                      </Text>
                    </View>
                  )}

                  {formik.touched.category && formik.errors.category && (
                    <Text style={styles.errorText}>
                      {formik.errors.category}
                    </Text>
                  )}

                  {/* Description Of Community */}
                  {loggedInMemberData?.memberRole === 'Admin' ? (
                    <CustomTextInput
                      autoCorrect
                      mode="outlined"
                      inputHeight={124}
                      customBorderWidth={isAdmin ? null : 2}
                      customBorderColor={isAdmin ? null : '#D0D5DD'}
                      style={styles.description}
                      contentStyle={
                        isAdmin
                          ? {paddingTop: 15}
                          : {
                              backgroundColor: '#F9F9F9',
                              pointerEvents: 'none',
                              color: '#888888',
                              paddingTop: 15,
                            }
                      }
                      label={isAdmin ? 'Describe your Community' : null}
                      multiline={true}
                      centerNumber={15}
                      maxLength={725}
                      textVerticalAlign="top"
                      value={formik.values.communityDescription}
                      onChangeText={text =>
                        formik.setFieldValue(
                          'communityDescription',
                          capitalizeFirstLetter(text),
                        )
                      }
                      onBlur={formik.handleBlur('communityDescription')}
                      error={
                        formik.touched.communityDescription &&
                        formik.errors.communityDescription
                      }
                      disabled={loggedInMemberData?.memberRole !== 'Admin'}
                      accessibilityLabel="Community description input"
                      selection={selectionDone ? undefined : selection}
                    />
                  ) : (
                    <View
                      style={{
                        backgroundColor: '#F9F9F9',
                        padding: 12,
                        height: 124,
                        borderWidth: 2,
                        borderColor: '#D0D5DD',
                        borderRadius: 5,
                        marginTop: 10,
                      }}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        <Text
                          accessibilityLabel="Description display"
                          style={{
                            color: '#888888',
                            fontWeight: 500,
                            fontSize: 16,
                          }}>
                          {formik?.values?.communityDescription}
                        </Text>
                      </ScrollView>
                    </View>
                  )}

                  {formik.touched.communityDescription &&
                    formik.errors.communityDescription && (
                      <Text style={styles.errorText}>
                        {formik.errors.communityDescription}
                      </Text>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.divider}></View>
                <View style={styles.inviteContainer}>
                  <Text variant="bold" style={styles.membersTitle}>
                    Community Members
                  </Text>
                  <TouchableOpacity
                    hitSlop={{top: 20, bottom: 20, left: 30, right: 30}}
                    onPress={handleSearchBarClick}>
                    <Text
                      variant="bold"
                      style={{
                        fontSize: 12,
                        color: NewTheme.colors.primaryOrange,
                      }}>
                      View all members
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Communities List */}
                {filteredMembers?.slice(0, 5)?.map((item, index) => {
                  return (
                    <View style={{marginRight: 10}}>
                      <RenderMemberList
                        item={item}
                        screenType="editCommunity"
                        setRole={setRole}
                        loggedInMember={loggedInMemberData?.memberRole}
                      />
                    </View>
                  );
                })}
                {/* Render Footer if members exceed 5 */}
                {/* {filteredMembers?.length >= 5 && renderFooter()} */}
              </View>
            </ScrollView>

            {/* </TouchableWithoutFeedback> */}
            {ShowSelectOption && (
              <CustomBottomSheet
                enableDynamicSizing={false}
                hideIndicator={true}
                snapPoints={
                  croppedImageData || profileLogoUrl ? ['22%'] : ['15%']
                }
                onClose={() => {
                  closeModal();
                }}>
                <View>
                  <View style={styles.buttonContainer}>
                    {ShowSelectOption && (
                      <View style={styles.mainDisplay}>
                        <View
                          style={{
                            width: 50,
                            height: 5,
                            alignSelf: 'center',
                            // borderBottomWidth: 5,
                            // borderColor: '#DEDEDE',
                            backgroundColor: '#DEDEDE',
                            borderRadius: 5,
                          }}
                        />
                        <ProfilePicCropper
                          byForm
                          openType="camera"
                          setCroppedImageData={setCroppedImageData}
                          setShowSelectOption={setShowSelectOption}>
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
                          setCroppedImageData={setCroppedImageData}
                          setShowSelectOption={setShowSelectOption}>
                          <View
                            style={[
                              styles.display,
                              !croppedImageData &&
                                !profileLogoUrl && {borderBottomWidth: null},
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

                        {(croppedImageData || profileLogoUrl) && (
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
                    )}
                  </View>
                </View>
              </CustomBottomSheet>
            )}

            {/* == End Bottom Sheet == */}

            {/* == Start Bottom Sheet == */}
            <SmallBottomSheet
              ref={bottomSheetRefRoleToAdmin}
              options={optionsRoleToAdmin}
              enableCrossIcon={false}
              snapPoints={['20%']}
              titleFontWeight={500}
              customOptionStyle={{color: 'black'}}
              contentHeight={300}
              optionVariant={'bold'}
              showOptionDivider={true}
              containerStyle={{paddingTop: 0, paddingBottom: insets.bottom}}
            />
            <SmallBottomSheet
              ref={bottomSheetRefRoleToMember}
              options={optionsRoleToMember}
              enableCrossIcon={false}
              snapPoints={['20%']}
              titleFontWeight={500}
              optionVariant={'bold'}
              customOptionStyle={{color: 'black'}}
              contentHeight={300}
              showOptionDivider={true}
              containerStyle={{paddingTop: 0}}
            />

            {/* </> */}
            {/* Bottom Create Button */}
          </>
        )}
      </View>
      {loggedInMemberData?.memberRole === 'Admin' && (
        <BottomBarButton
          label="Save"
          onPress={formik.handleSubmit}
          disabled={
            formik?.values?.category === '' ||
            formik?.values?.communityName === '' ||
            formik?.values?.communityDescription === '' ||
            formik?.values?.privacyType === '' ||
            isLoading ||
            loading 
            || !(errorMessage ===  '')
          }
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NewTheme.colors.backgroundCreamy,
    paddingHorizontal: 10,
    paddingTop: 15,
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
    paddingLeft: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 97,
    alignItems: 'center',
    marginBottom: 10,
    // marginTop: 20,
  },
  headerIcon: {width: 28, height: 28, marginLeft: 10},
  headerTitle: {
    fontSize: 22,
    fontFamily: 'PublicSans Bold',
  },
  ButtonOne: {
    flexDirection: 'row',
    paddingRight: 50,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 14,
  },
  ButtonTwo: {
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  ButtonText: {fontSize: 18, color: '#FF0000', fontWeight: '600'},

  // ModalStyles: {
  //   gap: 5,
  //   alignItems: 'flex-end',
  //   paddingRight: 12,
  //   paddingTop: 82,
  //   justifyContent: 'flex-start',
  //   backgroundColor: 'transparent',
  // },
  selectedMembersCount: {
    fontSize: 14,
    lineHeight: 18.8,
    textAlign: 'center',
    marginTop: -10,
    fontFamily: 'PublicSans Bold',
  },
  formContainer: {marginHorizontal: 10, marginTop: 15},
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
    borderWidth: 1.5,
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
    height: 124,
    textAlignVertical: 'top',
  },
  ModalItemdivider: {borderBottomWidth: 1, borderColor: '#D2D2D2'},
  divider: {borderBottomWidth: 1, marginTop: 40},
  inviteContainer: {
    marginHorizontal: 10,
    marginTop: 24,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersTitle: {
    fontSize: 18,
    // lineHeight: 18.26,
  },
  InviteSubTitle: {
    fontSize: 14,
    lineHeight: 19.36,
  },
  inviteMemberButton: {
    marginTop: 20,
    elevation: 5,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'rgb(177, 42, 48)',
    paddingVertical: 2,
  },
  searchBarContainer: {width: '100%', marginVertical: 20},
  FlatListContainerStyle: {paddingBottom: 110, paddingHorizontal: 5},
  shareButtons: {
    width: '95%',
    height: 48,

    borderWidth: 1,
    borderRadius: 8,
    borderColor: NewTheme.colors.primaryOrange,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  centerBtn: {justifyContent: 'center', alignItems: 'center'},
  shareText: {
    fontSize: 18,
    color: NewTheme.colors.primaryOrange,
  },
});

export default EditCommunity;
