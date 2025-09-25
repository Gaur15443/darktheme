// import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
// import {Theme} from '../../../common';
// import React, {useState} from 'react';
// import {useSelector} from 'react-redux';
import CrossIcon from '../../../images/Icons/CrossIcon';
import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Platform,
  BackHandler,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  PixelRatio,
} from 'react-native';
import {useFormik} from 'formik';
import * as yup from 'yup';
import {Avatar, Portal, Dialog, Button} from 'react-native-paper';
import MyWebView from 'react-native-autoheight-webview';
import {useNavigation} from '@react-navigation/native';
import InviteMemberIcon from '../../../images/Icons/InviteMemberIcon';
import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import CustomButton from '../../../core/CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/FontAwesome';
import _, {truncate} from 'lodash';
import {getPublicDataPlural} from '../../../store/apps/listPublicData';
import {
  ViewIcon,
  CloseIcon,
  AddMemberIcon,
  SearchRecordIcon,
  LinkMemberIcon,
  CameraIcon,
} from '../../../images/Icons/ModalIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DeleteIcon from '../../../images/Icons/DeleteIcon';
import SpouseTreeIcon from '../../../images/Icons/SpouseTreeIcon';
import {Theme} from '../../../common';
import ProfilePicturePicker from '../../../core/profile-upload';
import {
  RoleConformation,
  fetchUserInfo,
  changeFamilyName,
  getSpouseList,
  removeSpouseListLastVal,
} from '../../../store/apps/tree';
import {
  MakeContributorIcon,
  RemoveContributorIcon,
  UnlinkMemberIcon,
  IIcon,
} from '../../../images';
import MembersTab from '../Members';
import BottomSheetModal from '../../../components/familyStats-popup';
import {useSelector, useDispatch} from 'react-redux';
import {getUserInfo} from '../../../store/apps/userInfo';
import {getFamilyStats} from '../../../store/apps/familyStats';
import {getDeepSearch} from '../../../store/apps/deepSearch';
import {getListPublicData} from '../../../store/apps/listPublicData';
import InviteModal from '../../../components/invite-popup';
import {getGroupData} from '../../../store/apps/memberDirectorySlice';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTreeName} from '../../../store/apps/tree/treeSlice';
import * as KeyChain from 'react-native-keychain';
import {ProfilePicCropper} from '../../../core';
import {EditIcon} from '../../../images';
import {CustomInput} from '../../../components';
import TickMarkIcon from '../../../images/Icons/TickMarkIcon';
import authConfig from '../../../configs';
import GedcomLogsModal from '../../../components/GedcomLogModal';
import config from 'react-native-config';
import {
  fetchUserProfile,
  resetUserProfile,
} from '../../../store/apps/fetchUserProfile';
import Confirm from '../../../components/Confirm';
import CustomBottomSheet from '../../../components/CustomBottomSheet/index';
import DefaultImage from '../../../core/UICompoonent/DefaultImage';
import ErrorBoundary from '../../../common/ErrorBoundary';
import ProfileImage from '../../../common/ProfileImageViewer';
import Spinner from '../../../common/ButtonSpinner';
import CustomScrollView from '../../../common/CustomScrollView';

const TreeAction = ({
  closeSheet,
  currentTree,
  loggedInUserRole,
  onClickUserid,
  isActiveMemberCardNotContributor,
  handleReloadWebView,
  unlinkMember,
  reloadTreeCallback,
  clickEventData,
  deleteCardBtn,
  makeAsContributor,
  removeAsContributor,
  openContributorIcon,
  finalUserId,
  cLinkDataFromBalkan,
  isOwnersClink,
}) => {
  const fontScale = PixelRatio.getFontScale();
  let treeId = currentTree?.tree?.id;
  let treeOwnerId = currentTree?.user?.homePerson?.[0]?.homePerson;
  const userInfo = useSelector(state => state.userInfo);
  const [userRole, setUserRole] = useState(loggedInUserRole);
  // const [userData, setUserData] = useState({});
  const [profilePicture, setProfilePicture] = useState(false);
  const [isModal, setModal] = useState(false);
  const [isUnlinkModal, setIsUnlinkModal] = useState(false);
  const [isRoleConfirmation, setRoleConfirmation] = useState({});
  const dispatch = useDispatch();
  const [count, setCount] = useState(1);
  const [allPluralData, setAllPluralData] = useState([]);
  const navigation = useNavigation();
  const capitalizeFirstLetter = string => {
    if (string && string?.length >= 1) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
  });
  const userData = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );
  // const userData = useSelector(
  //   state => state?.fetchUserProfile?.basicInfo[onClickUserid]?.myProfile,
  // );
  const [cardLoading, setCardLoading] = useState(true);
  const buttons = [
    {
      title: 'View',
      // eslint-disable-next-line react/no-unstable-nested-components
      Icon: ViewIcon,
      // bgcolor: Theme.light.secondary,
    },

    {
      title: 'Delete Card',
      Icon: DeleteIcon,
      // bgcolor: Theme.light.error,
    },
  ];

  let nameFirstCharacter = '';
  let lastNameFirstCharacter = '';
  if (userData?.data?.name && userData?.data?.name.length >= 1) {
    nameFirstCharacter = userData?.data?.name.charAt(0).toUpperCase();
  }
  if (userData?.data?.lastname && userData?.data?.lastname.length >= 1) {
    lastNameFirstCharacter = userData?.data?.lastname.charAt(0).toUpperCase();
  }
  const isOwnerOrContributor = useMemo(() => {
    if (
      userRole?.tree?.role === 'owner' ||
      userRole?.tree?.role === 'Contributor'
    ) {
      return true;
    } else {
      return false;
    }
  }, [userRole]);

  const isOwnerOfOtherTree = useMemo(() => {
    //if card which is clicked is other trees owner
    if (userData?._id === treeOwnerId && userInfo?._id !== treeOwnerId) {
      return true;
    }
    return false;
  }, [treeOwnerId, userData, userInfo]);

  const isActiveCard = useMemo(() => {
    if (userData?.cognitousername) {
      return true;
    }
    return false;
  }, [userData]);

  const canEdit = useMemo(() => {
    if (!isOwnerOrContributor) {
      return false;
    }
    if (
      userInfo?._id === userData?._id ||
      (userInfo?._id === treeOwnerId && isOwnersClink) ||
      (!isOwnerOfOtherTree && !isActiveCard)
    ) {
      return true;
    }
    return false;
  }, [
    userInfo,
    userData,
    isOwnerOfOtherTree,
    isActiveCard,
    isOwnersClink,
    treeOwnerId,
    isOwnerOrContributor,
  ]);

  const handleCardBtn = async title => {
    try {
      switch (title) {
        case 'View':
          closeSheet();
          let permission = false;

          // For own card access
          if (userInfo._id === isRoleConfirmation?.user?.id) {
            permission = true;
          }
          if (isOwnerOrContributor && !userData?.cognitousername) {
            // for contributor and owner - non-active card access
            permission = true;
          }
          // For Member Card
          if (
            isMember &&
            (!userData?.cognitousername || userData?.cognitousername)
          ) {
            if (userInfo._id === isRoleConfirmation?.user?.id) {
              permission = true;
            } else {
              permission = false;
            }
          }
          navigation.navigate('ViewMemberDetails', {
            id: userData._id,
            treeId: treeId,
            selectedMemberData: userData,
            currentTreeDetails: currentTree,
            reloadTreeCallback: reloadTreeCallback,
            permission: permission,
            fromMemberTab: false,
          });
          break;
        case 'Trees':
          const treeInfo = {
            user: userData?.id,
            userTreeId: userData?.treeId,
          };
          dispatch(getSpouseList(treeInfo));
          await AsyncStorage.setItem('ExternalTree', JSON.stringify(treeInfo));
          break;
        case 'Delete Card':
          closeSheet();
          deleteCardBtn();
          break;
        default:
        // Default case
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const getRoleConformation = async (userId, treeId) => {
    try {
      if ((finalUserId || userId) && treeId) {
        const apiUrl = `/getRoleConformation/${finalUserId || userId}/${treeId}`;
        const axiosConfig = {};
        // Keep await, without it it's not working, and if unwrap is used it will not work.
        const res = await dispatch(RoleConformation(apiUrl, axiosConfig));
        if (res.payload) {
          setRoleConfirmation(res.payload.roleConformation);
          // setCardLoading(false);
        }
        return res.payload?.roleConformation;
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setTimeout(() => {
        setCardLoading(false);
      }, 200);
    }
  };
  const unlinkMemberCallBack = () => {
    closeSheet();
    unlinkMember();
  };

  async function fetchData(userId) {
      await dispatch(fetchUserProfile(userId)).unwrap();
  }

  const handleMakeContributor = () => {
    closeSheet();
    makeAsContributor();
  };

  const handleRemoveContributor = () => {
    closeSheet();
    removeAsContributor();
  };

  const handleIICon = () => {
    closeSheet();
    openContributorIcon();
  };

  const AddNewMember = () => {
    const spouseFullName =
      userData?.personalDetails?.name +
      ' ' +
      userData?.personalDetails?.lastname;
    navigation.navigate('AddMemberForm', {
      treeId: currentTree?.tree?.id,
      userId: userData._id,
      currentTreeDetails: currentTree,
      //   mSpouseData: mSpouseData,
      spouseName: spouseFullName,
      spouseValidation: clickEventData,
      cLinkDataFromBalkan: cLinkDataFromBalkan,
    });
    closeSheet();

    // setIsBottomSheetOpen(false);
  };

  const SearchRecordData = async () => {
    closeSheet();

    if (
      userData?.personalDetails?.name &&
      userData?.personalDetails?.lastname
    ) {
      const capitalize = str => str?.trim()?.toUpperCase();
      const capitalizedFormData = {
        name: capitalize(userData?.personalDetails?.name),
        lastName: capitalize(userData?.personalDetails?.lastname),
      };

      setFormData({
        firstName: capitalizedFormData.name,
        surName: capitalizedFormData.lastName,
      });

      const data = {
        name: capitalizedFormData.name,
        lastName: capitalizedFormData.lastName,
        pageNum: count,
        pageSize: 10,
      };

      try {
        const response = await dispatch(getPublicDataPlural({payload: data}));

        if (response.payload?.length === 0) {
          return;
        }

        setAllPluralData(response.payload);
        setCount(1);

        navigation.navigate('ImuwTailorSearch', {
          formData: {
            name: capitalizedFormData.name,
            lastName: capitalizedFormData.lastName,
          },
        });
      } catch (error) {}
    } else {
    }
  };

  const linkTOMember = () => {
    closeSheet();

    navigation.navigate('LinkMember', {
      userId: finalUserId,
      treeId: treeId,
      selectedMemberData: userData,
      currentTreeDetails: currentTree,
      reloadTreeCallback: reloadTreeCallback,
    });
  };

  const isMember = useMemo(() => {
    if (userRole?.tree?.role === undefined || userRole?.tree?.role === 'User') {
      return true;
    } else {
      return false;
    }
  }, [userRole]);

  useEffect(() => {
    // For fetching role of card and details of it
    try {
      Promise.all([
        getRoleConformation(finalUserId, treeId),
        fetchData(onClickUserid),
      ]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [onClickUserid]);

  return (
    <ErrorBoundary.Screen>
      <CustomBottomSheet
        enableDynamicSizing={false}
        onClose={() => {
          dispatch(resetUserProfile(userData?._id));
          closeSheet();
        }}
        snapPoints={[530]}>
        {!cardLoading ? (
          <CustomScrollView
            accessibilityLabel="visibilityScroll"
            style={{
              flex: 0,
              marginBottom: 10,
              //warning!: dont remove this border width the bottom sheet will break
              // borderWidth: 1,
              borderColor: 'white',
              borderRadius: 10,
            }}>
            <View style={{alignItems: 'center', marginTop: 44}}>
              {/* For Own Card */}
              {userInfo._id === isRoleConfirmation?.user?.id && (
                <View style={styles.camera}>
                  <ProfilePicCropper
                    userId={userData?._id}
                    setProfilePicture={data => {
                      closeSheet({
                        type: 'profilePicture',
                        photo: data,
                        id: userData?._id,
                      });
                    }}
                    addProfile>
                    <CameraIcon />
                  </ProfilePicCropper>
                </View>
              )}
              {/* for Contributor and Owner */}
              {(userRole?.tree?.role === 'Contributor' ||
                userRole?.tree?.role === 'owner') &&
                !userData?.cognitousername && (
                  <View style={styles.camera}>
                    <ProfilePicCropper
                      testID="ProfileUpload"
                      accessibilityLabel="ProfileUpload"
                      userId={userData?._id}
                      setProfilePicture={data => {
                        closeSheet({
                          type: 'profilePicture',
                          photo: data,
                          id: userInfo._id,
                        });
                      }}
                      addProfile>
                      <CameraIcon accessibilityLabel="ProfileUploadIcon" />
                    </ProfilePicCropper>
                  </View>
                )}
              <View>
                {userData?.personalDetails?.profilepic ? (
                  <View
                    style={{
                      borderRadius: 50,
                      position: 'relative',
                    }}>
                    <ProfileImage
                      uri={
                        profilePicture || userData?.personalDetails?.profilepic
                      }
                      size={100}
                      style={{
                        borderWidth: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                      }}
                    />
                    {userData?.cognitousername && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderColor: Theme.light.avatarBorder,
                          borderWidth: 3,
                          borderRadius: 50,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </View>
                ) : (
                  <DefaultImage
                    size={100}
                    firstName={userData?.personalDetails?.name?.[0]}
                    lastName={userData?.personalDetails?.lastname?.[0]}
                    gender={userData?.personalDetails?.gender}
                    fontSize={20}
                  />
                )}
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 18,
                  marginBottom: 20,
                  marginTop: 10,
                  color: Theme.light.shadow,
                }}>
                {userData?.personalDetails?.name}{' '}
                {userData?.personalDetails?.middlename
                  ? userData.personalDetails.middlename.charAt(0)
                  : ''}{' '}
                {userData?.personalDetails?.lastname}
              </Text>
            </View>

            <View style={styles.fixToText}>
              {buttons.map(({title, Icon, bgcolor}, index) => {
                // Conditionally render the delete button

                if (
                  title === 'Delete Card' &&
                  (isRoleConfirmation?.tree?.role === 'owner' ||
                    userData?.cognitousername ||
                    isMember)
                ) {
                  if (
                    (userInfo?._id === treeOwnerId && isOwnersClink) ||
                    (isOwnersClink && !isActiveCard && isOwnerOrContributor)
                  ) {
                    return (
                      <CustomButton
                        key={index}
                        testID={title}
                        accessibilityLabel={title}
                        Icon={Icon}
                        iconProps={{
                          canEdit: canEdit ? true : false,
                        }}
                        title={
                          title === 'Trees'
                            ? `${userData?.data?.name}'s Tree`
                            : title === 'View' && canEdit
                              ? 'Edit'
                              : title
                        }
                        bgcolor={bgcolor}
                        onPress={() => handleCardBtn(title)}
                      />
                      // <Text>{isRoleConfirmation?.tree?.role}</Text>
                    );
                  } else {
                    return null; // Don't render the delete button
                  }
                }
                if (
                  title === 'Trees' &&
                  userData?.data?.externalTreeId === undefined
                ) {
                  return null;
                }

                return (
                  <CustomButton
                    iconProps={{
                      canEdit: canEdit ? true : false,
                    }}
                    key={index}
                    testID={title}
                    accessibilityLabel={title}
                    Icon={Icon}
                    title={
                      title === 'Trees'
                        ? `${userData?.data?.name}'s Tree`
                        : title === 'View' && canEdit
                          ? 'Edit'
                          : title
                    }
                    bgcolor={bgcolor}
                    onPress={() => handleCardBtn(title)}
                  />
                  // <Text>{isRoleConfirmation?.tree?.role}</Text>
                );
              })}
            </View>
            {!isMember && (
              <View
                style={{
                  marginTop: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 23,
                  }}>
                  <AddMemberIcon />
                  <View
                    style={{
                      borderBottomWidth: 0.9,
                      width: '65%',
                      borderColor: 'black',
                      marginRight: 5,
                    }}>
                    <Text
                      testID="add-family-member"
                      accessibilityLabel="add-family-member"
                      onPress={AddNewMember}
                      style={{
                        width: '70%',
                        marginVertical: 10,
                        fontSize: 16,
                        borderBottomColor: Theme.dark.shadow,
                        color: Theme.light.shadow,
                      }}>
                      Add Relative
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                  }}>
                  <SearchRecordIcon />
                  <View
                    style={{
                      borderBottomWidth: 0.9,
                      width: '65%',
                      borderColor: 'black',
                    }}>
                    <Text
                      testID="search-record"
                      accessibilityLabel="search-record"
                      onPress={SearchRecordData}
                      style={{
                        width: '70%',
                        marginVertical: 10,
                        fontSize: 16,
                        // borderBottomWidth: 0.5,
                        // borderBottomColor: Theme.dark.shadow,
                        color: Theme.light.shadow,
                        borderBottomColor: Theme.dark.shadow,
                        // borderBottomStyle: 'solid',
                      }}>
                      Search Records
                    </Text>
                  </View>
                </View>

                {/* Link Member */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                  }}>
                  {isRoleConfirmation?.tree?.role !== 'owner' &&
                    (userInfo._id === isRoleConfirmation?.user?.id ||
                      (userRole?.tree?.role === 'Contributor' &&
                        isActiveMemberCardNotContributor) ||
                      userRole?.tree?.role === 'owner') &&
                    (userData?.cognitousername ? (
                      <>
                        <UnlinkMemberIcon />
                        <View
                          style={{
                            borderBottomWidth: 0.9,
                            width: '65%',
                            borderColor: 'black',
                          }}>
                          <Text
                            testID="unlink-member"
                            accessibilityLabel="unlink-member"
                            onPress={unlinkMemberCallBack}
                            style={{
                              width: '70%',
                              marginVertical: 10,
                              fontSize: 16,
                              // borderBottomWidth: 0.5,
                              // borderBottomColor: Theme.dark.shadow,
                              color: Theme.light.shadow,
                              // borderBottomStyle: 'solid',
                            }}>
                            Unlink Member
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <LinkMemberIcon />
                        <View
                          style={{
                            borderBottomWidth: 0.5,
                            width: '65%',
                            borderColor: 'black',
                          }}>
                          <Text
                            testID="link-member"
                            accessibilityLabel="link-member"
                            onPress={linkTOMember}
                            style={{
                              width: '70%',
                              marginVertical: 10,
                              fontSize: 16,
                              // borderBottomWidth: 0.9,
                              // borderBottomColor: Theme.dark.shadow,
                              color: Theme.light.shadow,
                              // borderBottomStyle: 'solid',
                            }}>
                            Link Member
                          </Text>
                        </View>
                      </>
                    ))}
                </View>
                {/* Contributor */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  {/* Make Contributor */}
                  {isRoleConfirmation?.tree?.role !== 'owner' &&
                    !(
                      userData?.birthDetails?.dod ||
                      userData?.birthDetails?.isArroundDOD
                    ) &&
                    !isRoleConfirmation?.tree?.collabrationReq &&
                    isRoleConfirmation?.user?.cognitousername !== null &&
                    userInfo._id !== isRoleConfirmation?.user?.id &&
                    isRoleConfirmation?.tree?.role === 'User' && (
                      <>
                        <MakeContributorIcon style={{marginLeft: 2}} />
                        <View
                          style={{
                            borderBottomWidth: 0.9,
                            width: '65%',
                            borderColor: 'black',
                            marginLeft: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            testID="make-contributor"
                            accessibilityLabel="make-contributor"
                            onPress={handleMakeContributor}
                            style={{
                              width: '70%',
                              marginVertical: 10,
                              fontSize: 16,
                              ...(fontScale > 1.3
                                ? {}
                                : {borderWidth: 1, borderColor: 'white'}),
                              // borderBottomWidth: 0.5,
                              // borderBottomColor: Theme.dark.shadow,
                              color: Theme.light.shadow,
                              // borderBottomStyle: 'solid',
                            }}>
                            Make as Contributor
                          </Text>
                          <TouchableOpacity
                            testID="iicon"
                            accessibilityLabel="iicon"
                            accessibilityRole="button"
                            onPress={handleIICon}
                            style={{marginRight: 0}}>
                            <IIcon color="grey" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  {isRoleConfirmation?.tree?.role !== 'owner' &&
                    !(
                      userData?.birthDetails?.dod ||
                      userData?.birthDetails?.isArroundDOD
                    ) &&
                    isRoleConfirmation?.user?.cognitousername !== null &&
                    userInfo._id !== isRoleConfirmation?.user?.id &&
                    isRoleConfirmation?.tree?.role === 'Contributor' && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '77%',
                          position: 'relative',
                        }}>
                        <RemoveContributorIcon style={{marginLeft: 2}} />
                        <View
                          style={{
                            borderColor: 'black',
                            marginLeft: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderBottomWidth: 0.9,
                            width: '85%',
                            gap: 10,
                          }}>
                          <Text
                            testID="remove-contributor"
                            accessibilityLabel="remove-contributor"
                            onPress={handleRemoveContributor}
                            style={{
                              fontSize: 16,
                              maxWidth: '70%',
                              ...(fontScale > 1.3
                                ? {}
                                : {borderWidth: 1, borderColor: 'white'}),
                              marginVertical: 10,
                              color: Theme.light.shadow,
                            }}>
                            Remove as Contributor
                          </Text>
                          <TouchableOpacity
                            testID="iicon"
                            accessibilityLabel="iicon"
                            accessibilityRole="button"
                            onPress={handleIICon}>
                            <IIcon color="grey" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                </View>
              </View>
            )}
          </CustomScrollView>
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 530,
            }}>
            <Spinner height={50} width={50} />
          </View>
        )}
        {/* </View> */}
      </CustomBottomSheet>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  goBack: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    right: 0,
    left: 10,
    width: 80,
    height: 40,
    backgroundColor: Theme.light.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Theme.light.primary,
    borderWidth: 3,
    borderRadius: 10,
  },
  wrapper: {
    flex: 1,
    backgroundColor: Theme.light.background,
    marginTop: Platform.OS === 'ios' ? 70 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Theme.light.shadow,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.light.shadow,
  },
  icon: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    color: Theme.light.shadow,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: Theme.light.shadow,
  },
  container: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    // borderWidth: 1,
    position: 'absolute',
    // borderWidth: 1,
    zIndex: 1,
    backgroundColor: Theme.light.onWhite100,
    borderRadius: 50,
    top: '43%',
    left: '55%',
    padding: 5,
    color: Theme.light.shadow,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Theme.light.onOnPrimary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 25,
    bottom: 0,
  },
  text: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: Theme.light.shadow,
  },
  fixToText: {
    flexDirection: 'row',
    gap: 60,
    justifyContent: 'space-around',
    paddingTop: 20,
  },
  tabWrapper: {
    flex: 1,
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  tabWrap: {
    margin: '5%',
    marginTop: 0,
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'start',
    color: Theme.dark.shadow,
    backgroundColor: Theme.light.outlineVariant,
    width: '100%',
    height: '30px',
    borderRadius: 10,
    marginTop: 20,
  },
});

export default TreeAction;
