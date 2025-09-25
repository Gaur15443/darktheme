import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import {useFormik} from 'formik';
import * as yup from 'yup';
import {Avatar, Text, Portal} from 'react-native-paper';
import MyWebView from 'react-native-autoheight-webview';
import {useNavigation} from '@react-navigation/native';
import InviteMemberIcon from '../../../images/Icons/InviteMemberIcon';
import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import CustomButton from '../../../core/CustomButton';
import _ from 'lodash';
import {
  ViewIcon,
  AddMemberIcon,
  SearchRecordIcon,
  LinkMemberIcon,
} from '../../../images/Icons/ModalIcon';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import DeleteIcon from '../../../images/Icons/DeleteIcon';
import SpouseTreeIcon from '../../../images/Icons/SpouseTreeIcon';
import {Theme} from '../../../common';
import {
  RoleConformation,
  changeFamilyName,
  getSpouseList,
  setAddMemberClinkList,
  setUserTree,
  resetUserTree,
} from '../../../store/apps/tree';
import {
  MakeContributorIcon,
  RemoveContributorIcon,
  UnlinkMemberIcon,
  IIcon,
} from '../../../images';
import {
  MakeRemoveContributor,
  UnlinkMember,
  DeleteCard,
  ContributorIIconCard,
  AccessRightsPopup,
} from '../../../components';
import {
  fetchUserProfile,
  resetUserProfile,
} from '../../../store/apps/fetchUserProfile';
import MembersTab from '../Members';
import {useSelector, useDispatch} from 'react-redux';
import {getUserInfo} from '../../../store/apps/userInfo';
import InviteModal from '../../../components/invite-popup';
import {getGroupData} from '../../../store/apps/memberDirectorySlice';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTreeName} from '../../../store/apps/tree/treeSlice';
import * as KeyChain from 'react-native-keychain';
// import {ProfilePicCropper} from '../../../core';
import {CustomInput} from '../../../components';
import TickMarkIcon from '../../../images/Icons/TickMarkIcon';
import GedcomLogsModal from '../../../components/GedcomLogModal';
import config from 'react-native-config';
import TreeAction from '../TreeAction';
import Spinner from '../../../common/Spinner';

import downloader from '../../../common/downloader';
import LoaderModal from '../../../components/LoaderComponent';
import LottieView from 'lottie-react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';
import EditIconTreeName from '../../../images/Icons/EditIconTreeName';
import * as Sentry from "@sentry/react-native";

const getToken = async () => {
  const accessToken = await KeyChain.getGenericPassword({
    username: 'imuwAccessToken',
  });
  return accessToken.password;
};

const windowHeight = Dimensions.get('window').height;

export default function TreeScreen({route}) {
  const [accessToken, setAccessToken] = useState('');
  getToken().then(accessToken => {
    setAccessToken(accessToken);
  });
  const {currentTreeDetails, relation, gedcomLogs, role, webViewDataToAdd} =
    route?.params;
  let treeId = currentTreeDetails?.tree?.id;
  let userId = currentTreeDetails?.user?.homePerson?.[0]?.homePerson;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // const [userData, setUserData] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [generation, setGeneration] = useState(null);
  const [isModal, setModal] = useState(false);
  const [gedLogsDialogOpen, setGedLogsDialogOpen] = useState(false);
  const [isVisibile, setVisible] = useState(false);
  const [isUnlinkModal, setIsUnlinkModal] = useState(false);
  const [isContributorModal, setIsContributorModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isSearchRecordSheet, SearRecordSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('tree');
  const [loading, setLoading] = useState(false);
  const [isSearchData, setSearchData] = useState([]);
  const webViewRef = useRef(null);
  const [external, setExternal] = useState(false);
  const [activeClassed, setActiveClassed] = useState('');
  const [isRoleConfirmation, setRoleConfirmation] = useState({});
  const [isMakeContributor, setIsMakeContributor] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [mSpouseData, setMSpouseData] = useState(null);
  // State To Show I Icon Modal
  const [isIIconVisible, setIIconlVisible] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [userRole, setUserRole] = useState(null);
  const [externalTree, setExternalTree] = useState(null);
  const [userID, setUserID] = useState(null);
  const [load, setLoad] = useState(null);
  const [accessRightsPopupVisible, setAccessRightsPopupVisible] =
    useState(false);
  const [dependentUser, setDependentUser] = useState(null);
  const [canDelete, setCanDelete] = useState(null);
  const [isNameOpen, setIsNameOpen] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [reloadTreeCallback, setReloadTreeCallback] = useState(false);

  // Animated Edit Icon
  const editAnimationRef = useRef(null);
  const onAnimationFinish = useCallback(() => {
    setIsNameOpen(false);
    // editAnimationRef.current?.reset();
    // Reset the focused tab when the animation finishes
  }, []);

  const formik = useFormik({
    initialValues: {
      familyNameInput: '',
    },
    validationSchema: yup.object().shape({
      familyNameInput: yup.string().required('This field is required'),
    }),
  });
  const {top} = useSafeAreaInsets();
  const [treeActionOpen, setTreeActionOpen] = useState(false);
  const userInfo = useSelector(state => state.userInfo);
  const getSpouseListArray = useSelector(state => state.Tree.spouseList);
  const userData = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );
  // const userData = useSelector(
  //   state => state?.fetchUserProfile?.basicInfo[onClickUserid]?.myProfile,
  // );

  useEffect(() => {
    if (onClickUserid) {
      dispatch(fetchUserProfile(onClickUserid)).unwrap();
    }
  }, [onClickUserid]);
  // To Reload The WebView Tree
  const [uriKey, setUriKey] = useState(0);
  const handleReloadWebView = () => {
    webViewRef?.current?.reload();
  };
  const [onClickUserid, setOnclickUserid] = useState(null);
  const [treeLoading, setTreeLoading] = useState(true);
  const clickEventData = useRef(null);
  const nodeTreeMenuClickId = useRef(null);
  const nodeTreeMenuNodes = useRef(null);
  const [cLinkMessage, setCLinkMessage] = useState({
    isClinkPresent: false,
    owner: null,
    personHasParent: null,
  });
  const [allClinks, setAllClinks] = useState([]);
  const [finalUserId, setFinalUserId] = useState(null);
  const [rootClinksWithoutRootId, setRootClinksWithoutRootId] = useState(null);
  const [isLoaderPdf, setIsLoaderPdf] = useState(false);

  async function checkAsyncStorage() {
    try {
      const storedValue = await AsyncStorage.getItem('ExternalTree');
      if (storedValue) {
        const {userTreeId, user} = JSON.parse(storedValue);
        setExternalTree(userTreeId);
        setUserID(user);
        setLoad(true);
      } else {
        setLoad(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: error,
      });
    }
  }

  useEffect(() => {
    if (!externalTree && !userID) {
      checkAsyncStorage();
    }
    return () => {
      dispatch(resetUserTree());
    };
  }, []);

  useEffect(() => {
    dispatch(setUserTree({treeId: currentTreeDetails?.tree?.id}));
  }, [currentTreeDetails]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      dispatch(resetUserProfile(userId)); // Resetting the userProfile
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userInfo) {
          await dispatch(getUserInfo()).unwrap();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    };

    fetchData();
  }, [dispatch, userInfo]);

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
  const isMember = useMemo(() => {
    if (userRole?.tree?.role === undefined || userRole?.tree?.role === 'User') {
      return true;
    } else {
      return false;
    }
  }, [userRole]);

  const FamilyStateClose = () => {
    setModalVisible(false);
  };

  const logo = require('../../../assets/images/thumbnail_imsuwe.png');
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };
  let nameFirstCharacter = '';
  let lastNameFirstCharacter = '';
  if (userData?.data?.name && userData?.data?.name.length >= 1) {
    nameFirstCharacter = userData?.data?.name.charAt(0).toUpperCase();
  }
  if (userData?.data?.lastname && userData?.data?.lastname.length >= 1) {
    lastNameFirstCharacter = userData?.data?.lastname.charAt(0).toUpperCase();
  }
  const capitalizeFirstLetter = string => {
    if (string && string?.length >= 1) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  };
  const goBack = () => {
    navigation.navigate('BottomTabs', {screen: 'Trees'});
  };

  const isOwnersClink = useMemo(() => {
    if (allClinks && currentTreeDetails?.user?.homePerson[0]?.homePerson) {
      const rootUser = currentTreeDetails?.user?.homePerson[0]?.homePerson;
      const clinkSet = new Set(allClinks);
      const result = clinkSet.has(rootUser) && userData?._id !== rootUser;
      clinkSet.delete(rootUser);
      const removedRootUser = Array.from(clinkSet);
      setRootClinksWithoutRootId(removedRootUser);
      return result;
    }
    return false;
  }, [
    currentTreeDetails?.user?.homePerson[0]?.homePerson,
    allClinks,
    userData?._id,
  ]);

  useEffect(() => {
    try {
      // For Card Role Confirmation
      if (userData?.id && userData?.treeId) {
        getRoleConformation(userData?.id, userData?.treeId);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [userData]);

  useEffect(() => {
    try {
      // For Logged User Role Confirmation
      async function fetchRole() {
        const currentUserRole = await getRoleConformation(
          userInfo?._id,
          currentTreeDetails?.tree?.id,
        );
        setUserRole(currentUserRole);
      }
      if (userInfo?._id && currentTreeDetails?.tree?.id) {
        fetchRole();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [userInfo?._id, currentTreeDetails?.tree?.id]);

  const getRoleConformation = async (userId, treeId) => {
    const apiUrl = `/getRoleConformation/${userId}/${treeId}`;
    const axiosConfig = {};
    // Keep await, without it it's not working, and if unwrap is used it will not work.
    const res = await dispatch(RoleConformation(apiUrl, axiosConfig));
    if (res.payload) {
      setRoleConfirmation(res.payload.roleConformation);
    }
    return res.payload?.roleConformation;
  };

  const AddNewMember = () => {
    const spouseFullName =
      userData?.data?.name + ' ' + userData?.data?.lastname;
    navigation.navigate('AddMemberForm', {
      treeId: userData.treeId,
      userId: userData.id,
      currentTreeDetails: currentTreeDetails,
      mSpouseData: mSpouseData,
      spouseName: spouseFullName,
      isBlankClick: false,
      cLinkDataFromBalkan: cLinkMessage,
    });

    setIsBottomSheetOpen(false);
  };

  const buttons = [
    {
      title: 'View',
      Icon: <ViewIcon />,
      bgcolor: Theme.light.secondary,
    },
    {
      title: 'Trees',
      Icon: <SpouseTreeIcon />,
      bgcolor: Theme.light.elevation.level2,
    },
    {
      title: 'Delete Card',
      Icon: <DeleteIcon />,
      bgcolor: Theme.light.error,
    },
  ];
  const handleImage = data => {
    setProfileImage(data);
  };

  // active Member card is not contributor check
  let isActiveMemberCardNotContributor =
    isRoleConfirmation?.tree?.role === 'Contributor' &&
    !userData?.data?.activeMember;

  const handleCardBtn = async title => {
    switch (title) {
      case 'View':
        let permission = false;

        // For own card access
        if (userInfo._id === isRoleConfirmation?.user?.id) {
          permission = true;
        }
        if (isOwnerOrContributor && !userData?.data?.activeMember) {
          // for contributor and owner - non-active card access
          permission = true;
        }
        // For Member Card
        if (
          isMember &&
          (!userData?.data?.activeMember || userData?.data?.activeMember)
        ) {
          if (userInfo._id === isRoleConfirmation?.user?.id) {
            permission = true;
          } else {
            permission = false;
          }
        }
        setIsBottomSheetOpen(false);
        navigation.navigate('ViewMemberDetails', {
          id: userData?.id,
          treeId: userData?.treeId,
          selectedMemberData: userData,
          currentTreeDetails: currentTreeDetails,
          reloadTreeCallback: reloadTreeCallback,
          permission: permission,
        });
        break;
      case 'Trees':
        const treeInfo = {
          user: userData?.id,
          userTreeId: userData?.treeId,
        };
        dispatch(getSpouseList(treeInfo));
        await AsyncStorage.setItem('ExternalTree', JSON.stringify(treeInfo));
        setExternalTree(userData?.treeId);
        setUserID(userData?.id);
        setIsBottomSheetOpen(false);
        checkAsyncStorage();
        break;
      case 'Delete Card':
        const dataToSendForPreDeleteValidation = {
          id: userData?._id,
        };
        if (userData?.isClone) {
          dataToSendForPreDeleteValidation.deletOnlyParticularCard = true;
        }
        sendDataToWebView({delete: dataToSendForPreDeleteValidation});
        setModal(true);
        break;
      default:
    }
  };

  const linkTOMember = () => {
    setIsBottomSheetOpen(false);

    navigation.navigate('LinkMember', {
      userId: finalUserId,
      treeId: treeId,
      selectedMemberData: userData,
      currentTreeDetails: currentTreeDetails,
      reloadTreeCallback: reloadTreeCallback,
    });
  };

  useEffect(() => {
    if (route?.params?.name) {
      const data = {
        updateNode: true,
        name: route?.params?.name,
        photo: route?.params?.photo,
        dateRange: route?.params?.dateRange,
        marriageData: route?.params?.marriageData,
        _id: userData?._id,
      };
      if (
        currentTreeDetails?.user?.homePerson?.[0]?.homePerson === userData?._id
      ) {
        data.rootName = route?.params?.name;
      }
      webViewRef?.current?.postMessage?.(JSON.stringify(data));
    }
  }, [
    route?.params?.name,
    route?.params?.photo,
    route?.params?.dateRange,
    route?.params?.marriageData,
  ]);
  // Reload tree callback
  useEffect(() => {
    if (route?.params?.reloadTree === true) {
      setReloadTreeCallback(!reloadTreeCallback);
      handleReloadWebView();
    }
    if (
      route?.params?.reloadTree === false &&
      route?.params?.from !== 'viewmember'
    ) {
      setReloadTreeCallback(!reloadTreeCallback);
      handleReloadWebView();
    }
  }, [route?.params?.reloadTree]);

  const unlinkMember = () => {
    setIsUnlinkModal(true);
  };

  const deleteMember = () => {
    handleCardBtn('Delete Card');
  };

  const handleMakeContributor = () => {
    setIsMakeContributor(true);
    setIsContributorModal(true);
    // setIsBottomSheetOpen(false);
  };

  const handleRemoveContributor = () => {
    setIsMakeContributor(false);
    setIsContributorModal(true);
    // setIsBottomSheetOpen(false);
  };
  // IIcon Toogle Visibility
  const handleIICon = () => {
    setIIconlVisible(true);
    setIsBottomSheetOpen(false);
  };

  function sendDataToWebView(data) {
    if (data) {
      webViewRef?.current?.postMessage?.(JSON.stringify(data));
    }
  }

  const senderId = userId;
  const senderFamilyTreeId = treeId;
  const resultsFamilyStats = useSelector(state => state.getFamilyStats);

  const handleFamilyStats = async () => {
    navigation.navigate('BottomSheetModal', {
      item: {senderId, senderFamilyTreeId},
    });
  };

  useEffect(() => {
    dispatch(getUserInfo());
    dispatch(getGroupData());
  }, []);

  const [showModal, setShowModal] = useState(false);
  const inviteContent = "You're invited to our event!";
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const SearchRecordData = async () => {
    setLoading(true);
    if (userData?.data?.name && userData?.data?.lastname) {
      setIsBottomSheetOpen(false);
      navigation.navigate('ImeusweSearchResults', {
        fname: userData?.data?.name,
        lname: userData?.data?.lastname,
      });
    }
  };

  const handleZoomIn = () => {
    if (webViewRef.current) {
      let newZoom = zoom + 10;
      if (newZoom > 145) {
        newZoom = 145;
      }
      setZoom(newZoom);
      webViewRef.current.injectJavaScript(`
        var element = document.querySelector('.parent');      
        element.style.zoom='${newZoom}%';
      `);
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current) {
      let newZoom = zoom - 10;
      if (Platform.OS === 'ios') {
        if (newZoom < 60) {
          newZoom = 60;
        }
      } else {
        if (newZoom < 45) {
          newZoom = 45;
        }
      }
      setZoom(newZoom);
      webViewRef.current.injectJavaScript(`
        var element = document.querySelector('.parent');      
        element.style.zoom='${newZoom}%';
      `);
    }
  };

  const handleTabPress = tab => {
    setIsNameOpen(true);
    formik.handleChange('familyNameInput')(familyName);
    setActiveTab(tab);
  };

  function discardFamilyNameChange() {
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        editAnimationRef?.current?.reset();
      }, 100);
    }
    setIsNameOpen(true);
    formik.handleChange('familyNameInput')(familyName);
  }

  const fetchData = async () => {
    const getTree = `/getTreeName/${treeId}`;
    const actionResult = await dispatch(getTreeName(getTree, {}));
    const result = actionResult.payload;
    setFamilyName(result.group.name);
    formik.handleChange('familyNameInput')(result.group.name);
  };
  const hideDialog = () => setVisible(false);
  useEffect(() => {
    try {
      fetchData();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, []);

  useEffect(() => {
    if (route?.params?.webViewDataToAdd) {
      webViewRef?.current?.postMessage?.(
        JSON.stringify(route?.params?.webViewDataToAdd),
      );
      if (route?.params?.webViewDataToAdd?.divorced?.length) {
        setTimeout(() => {
          sendDataToWebView({
            updateNode: true,
            _id: route?.params?.webViewDataToAdd?.pids?.[0],
            divorced: [route?.params?.webViewDataToAdd?.id],
          });
        }, 1);
      }
    }
  }, [route?.params?.webViewDataToAdd]);

  useEffect(() => {
    if (gedcomLogs) {
      setGedLogsDialogOpen(true);
      webViewRef?.current?.reload();
    }
  }, [gedcomLogs]);

  useEffect(() => {
    webViewRef?.current?.reload();
    setIsBottomSheetOpen(false);
    setProfilePicture(null);
  }, [profilePicture]);

  function shrinkDisplayFamilyName(userFamilyName) {
    // -> first convert to lower case for bertter identification
    const modifiableName = userFamilyName?.toLowerCase?.();
    if (modifiableName?.includes?.('family')) {
      const nameArray = modifiableName.split(' ');
      const removeFamilyWord = _.startCase(
        nameArray.slice(0, nameArray.length - 1).join(' '),
      );
      // -> if name exceeds more than 11 characters
      if (removeFamilyWord.length > 11) {
        return removeFamilyWord.slice(0, 11) + '...' + ' ' + 'Family';
      }
    }
    // -> else just return exising name
    return _.startCase(modifiableName);
  }

  function removeFamilyKeywordAndPreserveCase(inputString) {
    const lowercaseInput = inputString?.toLowerCase?.();

    // Check if "family" is present in the input string
    if (lowercaseInput.includes('family')) {
      // Split the name into words
      const words = inputString.split(/\s+/);

      // Filter out consecutive occurrences of "family"
      const filteredWords = words.filter((word, index, array) => {
        return !(
          index > 0 &&
          word.toLowerCase() === 'family' &&
          array[index - 1].toLowerCase() === 'family'
        );
      });

      // Join the filtered words back into a string
      inputString = filteredWords.join(' ');
    } else {
      // If "family" is not present, add it to the end of the name
      inputString += ' Family';
    }

    return inputString;
  }

  const updateTreeName = async () => {
    let choosenFamilyName = formik.values.familyNameInput;
    let payloadName = null;
    try {
      if (choosenFamilyName?.trim() !== '') {
        payloadName = removeFamilyKeywordAndPreserveCase(choosenFamilyName);
        payloadName = _.startCase(payloadName);
        const data = {
          ownerId: senderId,
          name: payloadName,
        };
        const resultAction = await dispatch(changeFamilyName(data));
        if (resultAction?.payload) {
          if (payloadName) {
            setFamilyName(payloadName);
            formik.handleChange('familyNameInput')(payloadName);
          }
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setIsNameOpen(true);
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          editAnimationRef?.current?.reset();
        }, 100);
      }
    }
  };

  function removeFamilySuffix(userFamilyName) {
    const data = userFamilyName?.split?.(' ');
    if (data.length === 1) {
      let normalizedStr = userFamilyName.replace(/\s+/g, '').toLowerCase();
      if (normalizedStr.endsWith('family')) {
        normalizedStr = normalizedStr.slice(0, -6); // Remove the last 6 characters ("family")
      }
      return normalizedStr;
    } else {
      const returnData = data?.slice?.(0, data.length - 1)?.join?.(' ');
      return returnData;
    }
  }

  function handleBlankClick(relation, value) {
    // relations - child, childandparent, partner, parent
    // conditions to be handled
    // if the relation is partner then get spouse name
    // if the relation is child then send the mid and relation
    // if the relation is childandparent the use that direct connection flag and send mspouse id null in the payload in addmember form and handle same in backend
    // if the relation is parent then detect the gender and add father or mother
    let spouseName = null;
    let userIdToAdd = null;
    let spouseToAdd = null;
    let gender = null;

    if (relation === 'child') {
      let spouseIdToAdd = null;
      let actualMember = null;
      if (nodeTreeMenuClickId.current === value?.e?.mid) {
        spouseIdToAdd = value?.e?.fid;
        actualMember = value?.e?.mid;
      } else {
        spouseIdToAdd = value?.e?.mid;
        actualMember = value?.e?.fid;
      }
      gender = value?.e?.gender;
      navigateBlankChildren(actualMember, gender, false, true, spouseIdToAdd);
    }
    if (relation === 'childandparent') {
      userIdToAdd = value?.e;
      gender = value?.t?.gender;
      navigateBlankChildren(userIdToAdd, gender, true);
    }
    if (relation === 'partner') {
      if (typeof value.e !== 'string') {
        spouseName = value?.spouseName;
        gender = value?.e?.gender;
        spouseToAdd = value?.e?.pids?.[0];
      } else {
        spouseName = value?.spouseName;
        gender = value?.i?.gender;
        spouseToAdd = value?.i?.pids?.[0];
      }
      navigateBlankSpouse(
        spouseToAdd,
        spouseName,
        gender,
        value?.emptyCardWithChildren,
      );
    }
    if (relation === 'parent') {
      userIdToAdd = value?.e;
      gender = value?.i?.gender;
      navigateBlankParent(userIdToAdd, gender);
    }
  }

  function navigateBlankSpouse(
    whomToAdd,
    spouseName,
    gender,
    emptyCardWithChildren = false,
  ) {
    navigation.navigate('AddMemberForm', {
      relation: gender === 'male' ? 'husband' : 'wife',
      userId: whomToAdd,
      treeId: treeId,
      currentTreeDetails: currentTreeDetails,
      spouseName: spouseName,
      isBlankClick: true,
      emptyCardWithChildren,
      cLinkDataFromBalkan: cLinkMessage,
    });
  }
  function navigateBlankParent(whomToAdd, gender) {
    navigation.navigate('AddMemberForm', {
      relation: gender === 'male' ? 'father' : 'mother',
      userId: whomToAdd,
      treeId: treeId,
      currentTreeDetails: currentTreeDetails,
      isBlankClick: true,
      cLinkDataFromBalkan: cLinkMessage,
    });
  }
  function navigateBlankChildren(
    whomToAdd,
    gender,
    adaptedChild,
    addingChildFromBlank = false,
    spouseIdToAdd = null,
    emptyCardWithChildren = false,
  ) {
    navigation.navigate('AddMemberForm', {
      relation: gender === 'male' ? 'son' : 'daughter',
      userId: whomToAdd,
      treeId: treeId,
      currentTreeDetails: currentTreeDetails,
      adaptedChild: adaptedChild,
      addingChildFromBlank,
      spouseIdToAdd,
      emptyCardWithChildren,
      isBlankClick: true,
      cLinkDataFromBalkan: cLinkMessage,
    });
  }
  function MakeAsContributorCalBck() {
    setIsMakeContributor(true);
    setIsContributorModal(true);
  }

  function fitTree() {
    webViewRef.current.injectJavaScript(`
      var fitButton = document?.querySelector('[data-tlbr="fit"]');
      if(fitButton){
          fitButton.click();
      }
  `);
  }

  const isTreeNameTickIconDisabled = useMemo(() => {
    if (!formik?.values?.familyNameInput?.length) {
      return true;
    }
    return false;
  }, [formik?.values?.familyNameInput]);

  const customCss =
    '* { -webkit-user-select: none; } input, textarea { -webkit-user-select: initial; } body { user-select: none !important; overflow-x: hidden !important; }';

  const customJs = `
      (function() {
        setTimeout(function() {
          try {
            var s = document.createElement('style');
            s.innerHTML = '${customCss.replace(/'/g, "\\'").replace(/(\r\n|\n|\r)/gm, '')}';
            document.head.appendChild(s);
          } catch (e) {  }
        }, 0); 
      })();`;

  return (
    <ErrorBoundary.Screen>
      <SafeAreaView style={styles.safeArea}>
        <View>
          <View style={styles.header}>
            <TouchableOpacity
              accessibilityLabel="goback"
              testID="goback"
              onPress={goBack}>
              <BackArrowIcon />
            </TouchableOpacity>
            <View
              style={{
                marginLeft: isNameOpen ? 30 : 15,
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isNameOpen ? (
                <>
                  <Text style={styles.title}>
                    {shrinkDisplayFamilyName(familyName)}
                  </Text>
                  {userRole?.tree?.role === 'owner' &&
                    familyName?.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setShowAnimation(true);
                          editAnimationRef.current?.play();
                          if (
                            formik?.values?.familyNameInput
                              ?.toLowerCase?.()
                              ?.endsWith?.('family')
                          ) {
                            formik.values.familyNameInput = removeFamilySuffix(
                              formik?.values?.familyNameInput,
                            );
                          }
                        }}
                        testID="familyNameEdit"
                        accessibilityLabel="familyNameEdit">
                        {Platform.OS === 'ios' ? (
                          <>
                            {showAnimation && (
                              <LottieView
                                key={isNameOpen}
                                ref={editAnimationRef}
                                source={require('../../../animation/lottie/edit_icon.json')}
                                autoPlay={false}
                                loop={false}
                                speed={1.5}
                                onAnimationFinish={onAnimationFinish}
                                style={{height: 35, width: 35, marginBottom: 5}}
                              />
                            )}
                            {!showAnimation && <EditIconTreeName />}
                          </>
                        ) : (
                          <LottieView
                            key={isNameOpen}
                            ref={editAnimationRef}
                            source={require('../../../animation/lottie/edit_icon.json')}
                            autoPlay={false}
                            loop={false}
                            speed={1.5}
                            onAnimationFinish={onAnimationFinish}
                            style={{height: 35, width: 35, marginBottom: 5}}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                </>
              ) : (
                <>
                  <View
                    accessibilityLabel="blankTouch"
                    onTouchEnd={discardFamilyNameChange}
                    style={{
                      backgroundColor: 'transparent',
                      height: Dimensions.get('window').height,
                      width: Dimensions.get('window').width,
                      position: 'absolute',
                      zIndex: 10,
                      top: 0,
                    }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 12,
                      zIndex: 12,
                      top: -5,
                    }}>
                    <CustomInput
                      label={'Family Name'}
                      testID={'familynameInput'}
                      accessibilityLabel={'familynameInput'}
                      style={{width: 180}}
                      value={formik.values.familyNameInput}
                      onChangeText={text =>
                        formik.handleChange('familyNameInput')(text)
                      }
                    />
                    <TouchableOpacity
                      disabled={isTreeNameTickIconDisabled}
                      style={{
                        opacity: isTreeNameTickIconDisabled ? 0.5 : 1,
                      }}
                      onPress={() => {
                        updateTreeName();
                      }}
                      testID="familyNameTick"
                      accessibilityLabel="familyNameTick">
                      <TickMarkIcon />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            {userRole?.tree?.role === 'owner' ? (
              <Text
                style={styles.title}
                testID="invite-popup"
                accessibilityLabel="invite-popup"
                onPress={handleShowModal}>
                <InviteMemberIcon color="rgba(231, 114, 55, 1)" />
              </Text>
            ) : (
              <View style={{width: 40}} />
            )}
          </View>
        </View>

        {activeTab === 'tree' ? (
          <>
            <View
              style={{
                flex: 1,
                minWidth: 400,
                minHeight: Dimensions.get('window').height,
                marginTop: 5,
                backgroundColor: Theme.light.background,
                zIndex: -1,
              }}>
              {Object.keys(userRole || {})?.length > 0 ? (
                <Sentry.Unmask 
                style={{
                  flex: 1,
                }}>
                <MyWebView
                  domStorageEnabled={true}
                  ref={webViewRef}
                  originWhitelist={['*']}
                  injectedJavaScript={
                    Platform.OS === 'android' ? customJs : undefined
                  }
                  injectedJavaScriptBeforeContentLoaded={
                    Platform.OS === 'ios' ? customJs : undefined
                  }
                  // customScript={`localStorage.clear();`}
                  source={{
                    uri: `${config.TREE_URL}/?tree=${currentTreeDetails?.tree?.id}&id=${currentTreeDetails?.user?.homePerson?.[0]?.homePerson}&userData=${btoa(
                      JSON.stringify({
                        userId: userInfo?._id,
                        email: userInfo?.email,
                        mobileNo: userInfo?.mobileNo,
                      }),
                    )}`,
                    headers: {
                      'is-member': JSON.stringify(
                        isOwnerOrContributor ? false : true,
                      ),
                    },
                  }}
                  style={[
                    {flex: 1},
                    Platform.OS === 'ios'
                      ? ''
                      : {
                          borderWidth: 1,
                          borderColor: 'rgb(253, 249, 242)',
                          backgroundColor: 'rgb(253, 249, 242)',
                        },
                    // ,
                  ]}
                  onLoad={() => {
                    sendDataToWebView({mobileLoded: true});
                  }}
                  renderLoading={() => (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: Theme.light.background,
                      }}>
                      <Spinner />
                    </View>
                  )}
                  startInLoadingState
                  customStyle={`.bft-filter {
                              top: 70px !important;
                              left: 15px !important;
                              display: flex;
                              flex-direction: column;
                              align-items: center;
                              }
                              #tree>svg {
                                background-color: rgb(253, 249, 242);
                              }
                              [data-ctrl-menu] {
                                display : none;
                              }
                              .bft-search {
                                top : 5px !important;
                              }
                              .boc-toolbar-container {
                                bottom : ${windowHeight / (Platform.OS === 'ios' ? 8 : 4)}px !important;
                              }
                              .addMember{
                                fill: rgb(253, 249, 242) !important;
                              }
                              .focused{
                                background-color: ${Theme.light.background} !important;
                              }
                              .svgCross{
                                transform: translateX(30px);
                              }
                              input{
                                background-color: ${Theme.light.background} !important;
                                padding: 0px 10px;
                              }
                              .gedComIcon {
                                display: none;
                              }
                              .pdfIcon:hover:before {
                              display:none;
                              }
                              .pdfIcon:hover:after {
                              display:none;
                              }

                            .minus:hover:after{
                                display:none;
                              }
                            
                              .minus:hover:before{
                                display:none;
                              }
                            
                             .plus:hover:after{
                                display:none;
                              }
                            
                              .plus:hover:before{
                                display:none;
                              }
                            
                             .fit:hover:after{
                                display:none;
                              }
                            
                              .fit:hover:before{
                                display:none;
                              }
                            
                             .stats:hover:after{
                                display:none;
                              }
                              
                            
                              .stats:hover:before{
                                display:none;
                              }
                              .crossIcon{
                                width: 15px !important;
                                margin-top: 18px !important;
                              }
                            
                              `}
                  onMessage={(event, target) => {
                    const value = JSON.parse(event?.nativeEvent?.data);
                    if (value.pdfUrl && value.fileName) {
                      setIsLoaderPdf(true);
                      downloader({
                        url: 'https://balkan.app/export/v3',
                        httpMethod: 'POST',
                        filename: value.fileName,
                        payload: value.pdfUrl,
                      })
                        .finally(() => {
                          setIsLoaderPdf(false);
                        })
                        .catch(err => {
                          Toast.show({
                            type: 'error',
                            text1: err.message,
                          });
                        });
                    }
                    if (value.allNode && value.rootNode) {
                      dispatch(
                        setAddMemberClinkList({
                          allNode: value.allNode,
                          rootUser: value.rootNode,
                        }),
                      );
                    }
                    if (value?.dependentMembers) {
                      setDependentUser(value?.dependentMembers);
                      setCanDelete(value?.canDelete);
                    }
                    if (value?.type === 'nodeTreeMenu') {
                      nodeTreeMenuClickId.current = value?.node?.id;
                      nodeTreeMenuNodes.current = value?.nodes;
                      return;
                    }
                    if (value) {
                      if (value?.familyStats) {
                        setGeneration(value?.gen);
                        handleFamilyStats();
                        return;
                      }
                      if (value?.gen) {
                        setGeneration(value?.gen);
                        return;
                      }
                    }

                    clickEventData.current = value;
                    if (value?._id) {
                      setOnclickUserid(value?._id);
                    }
                    if (value?.isBlankClick) {
                      handleBlankClick(value?.relation, value);
                      return;
                    }
                    if (
                      !value?.type &&
                      value &&
                      !value?.isBlankClick &&
                      !value?.familyStats &&
                      !value?.updateNode &&
                      !value?.allNode &&
                      !value?.dependentMembers &&
                      !value?.pdfUrl
                    ) {
                      if (value?.isClinkPresent) {
                        setAllClinks(value?.cLink?.allLinks);
                        setCLinkMessage({
                          isClinkPresent: true,
                          owner: value?.cLink?.owner || null,
                          personHasParent:
                            value?.cLink?.personHasParent || null,
                        });
                      } else {
                        setAllClinks([]);
                        setCLinkMessage({
                          isClinkPresent: false,
                          owner: null,
                          personHasParent: null,
                        });
                      }
                      setFinalUserId(value?._id);
                      if (value?.isClinkPresent) {
                        setFinalUserId(
                          value?.cLink?.owner
                            ? value?.cLink?.owner
                            : value?._id,
                        );
                      }
                      setActiveClassed(
                        value?.tags?.includes('ancestor')
                          ? 'ancestor'
                          : 'desendant',
                      );
                      setExternal(
                        value?.tags?.includes('ancestor')
                          ? false
                          : value?.isExternal,
                      );
                      setTreeActionOpen(true);
                    }
                  }}
                />
                </Sentry.Unmask>
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: Theme.light.background,
                  }}>
                  <Spinner />
                </View>
              )}

              <Modal
                animationType="slide"
                transparent={true}
                visible={isBottomSheetOpen}
                onRequestClose={handleCloseBottomSheet}>
                <TouchableOpacity
                  style={{
                    flex: 1,

                    justifyContent: 'center',
                    height: 100,
                    alignItems: 'center',
                  }}
                  activeOpacity={1}
                  onPress={handleCloseBottomSheet}>
                  <TouchableWithoutFeedback>
                    <View
                      style={[
                        styles.bottomSheet,
                        {
                          height: !isMember
                            ? windowHeight * 0.65
                            : windowHeight * 0.5,
                        },
                      ]}>
                      <View
                        style={{
                          flex: 0,
                          width: '100%',
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                        }}>
                        <Text
                          text={'Preview'}
                          family={'Poppins-med'}
                          size={16}
                        />
                      </View>

                      <View>
                        <View style={{alignItems: 'center'}}>
                          {/* For Own Card */}
                          {userInfo._id === isRoleConfirmation?.user?.id && (
                            <View style={styles.camera}>
                              {/* <ProfilePicCropper
                                userId={userInfo._id}
                                setProfilePicture={setProfilePicture}
                                addProfile>
                                <CameraIcon />
                              </ProfilePicCropper> */}
                            </View>
                          )}
                          {/* for Contributor and Owner */}
                          {(userRole?.tree?.role === 'Contributor' ||
                            userRole?.tree?.role === 'owner') &&
                            !userData?.data?.activeMember && (
                              <View style={styles.camera}>
                                {/* <ProfilePicCropper
                                  userId={userData?.id}
                                  setProfilePicture={setProfilePicture}
                                  addProfile>
                                  <CameraIcon />
                                </ProfilePicCropper> */}
                              </View>
                            )}
                          <View>
                            {userData?.data?.avatar || profilePicture ? (
                              <View
                                style={{
                                  borderRadius: 50,
                                  position: 'relative',
                                }}>
                                <Avatar.Image
                                  size={100}
                                  source={{
                                    uri:
                                      profilePicture || userData?.data?.avatar,
                                  }}
                                  style={{aspectRatio: 1}}
                                />
                              </View>
                            ) : (
                              <View
                                style={[
                                  styles.container,
                                  {
                                    backgroundColor:
                                      userData?.data?.gender === 'female'
                                        ? '#FFDEE6'
                                        : '#CFEEFF',
                                  },
                                ]}>
                                <Text
                                  style={{
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    color: Theme.light.shadow,
                                  }}>
                                  {nameFirstCharacter} {lastNameFirstCharacter}
                                </Text>
                              </View>
                            )}
                            {userData?.data?.activeMember && (
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
                                }}
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
                            {capitalizeFirstLetter(userData?.data?.name)}{' '}
                            {userData?.data?.middlename
                              ? userData.data.middlename.charAt(0).toUpperCase()
                              : ''}{' '}
                            {capitalizeFirstLetter(userData?.data?.lastname)}
                          </Text>
                        </View>

                        <View style={styles.fixToText}>
                          {buttons.map(({title, Icon, bgcolor}, index) => {
                            // Conditionally render the delete button

                            if (
                              title === 'Delete Card' &&
                              (isRoleConfirmation?.tree?.role === 'owner' ||
                                userData?.data?.activeMember ||
                                isMember)
                            ) {
                              return null; // Don't render the delete button
                            }
                            if (
                              (title === 'Trees' &&
                                userData?.data?.externalTreeId === undefined) ||
                              (title === 'Trees' &&
                                isRoleConfirmation?.tree?.role === 'owner')
                            ) {
                              return null;
                            }

                            return (
                              <CustomButton
                                key={index}
                                Icon={Icon}
                                title={
                                  title === 'Trees'
                                    ? `${userData?.data?.name}'s Tree`
                                    : title
                                }
                                bgcolor={bgcolor}
                                onPress={() => handleCardBtn(title)}
                              />
                            );
                          })}
                        </View>
                        {!isMember && (
                          <View style={{marginTop: 10}}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 40,
                              }}>
                              <AddMemberIcon />
                              <Text
                                testID="add-family-member"
                                onPress={AddNewMember}
                                style={{
                                  width: '70%',
                                  marginVertical: 10,
                                  marginHorizontal: 30,
                                  fontSize: 16,
                                  borderBottomWidth: 0.5,
                                  borderBottomColor: Theme.dark.shadow,
                                  color: Theme.light.shadow,
                                  // borderBottomStyle: 'solid',
                                }}>
                                Add Relative
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <SearchRecordIcon />
                              <Text
                                testID="search-record"
                                onPress={SearchRecordData}
                                style={{
                                  width: '70%',
                                  marginVertical: 10,
                                  marginHorizontal: 30,
                                  fontSize: 16,
                                  borderBottomWidth: 0.5,
                                  borderBottomColor: Theme.dark.shadow,
                                  color: Theme.light.shadow,
                                  // borderBottomStyle: 'solid',
                                }}>
                                Search Records
                              </Text>
                            </View>

                            {/* Link Member */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              {isRoleConfirmation?.tree?.role !== 'owner' &&
                                (userInfo._id ===
                                  isRoleConfirmation?.user?.id ||
                                  (userRole?.tree?.role === 'Contributor' &&
                                    isActiveMemberCardNotContributor) ||
                                  userRole?.tree?.role === 'owner') &&
                                (userData?.data?.activeMember ? (
                                  <UnlinkMemberIcon />
                                ) : (
                                  <LinkMemberIcon />
                                ))}
                              {isRoleConfirmation?.tree?.role !== 'owner' &&
                                (userInfo._id ===
                                  isRoleConfirmation?.user?.id ||
                                  (userRole?.tree?.role === 'Contributor' &&
                                    isActiveMemberCardNotContributor) ||
                                  userRole?.tree?.role === 'owner') &&
                                (userData?.data?.activeMember ? (
                                  <Text
                                    testID="unlink-member"
                                    onPress={unlinkMember}
                                    style={{
                                      width: '70%',
                                      marginVertical: 10,
                                      marginHorizontal: 30,
                                      fontSize: 16,
                                      borderBottomWidth: 0.5,
                                      borderBottomColor: Theme.dark.shadow,
                                      color: Theme.light.shadow,
                                      // borderBottomStyle: 'solid',
                                    }}>
                                    Unlink Member
                                  </Text>
                                ) : (
                                  <Text
                                    testID="link-member"
                                    onPress={linkTOMember}
                                    style={{
                                      width: '70%',
                                      marginVertical: 10,
                                      marginHorizontal: 30,
                                      fontSize: 16,
                                      borderBottomWidth: 0.5,
                                      borderBottomColor: Theme.dark.shadow,
                                      color: Theme.light.shadow,
                                      // borderBottomStyle: 'solid',
                                    }}>
                                    Link Member
                                  </Text>
                                ))}
                            </View>
                            {/* Contributor */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              {isRoleConfirmation?.tree?.role !== 'owner' &&
                                userInfo._id !== isRoleConfirmation?.user?.id &&
                                ((userRole?.tree?.role === 'Contributor' &&
                                  isRoleConfirmation?.tree?.role !==
                                    'Contributor') ||
                                  userRole?.tree?.role === 'owner') &&
                                (userData?.data?.activeMember &&
                                isRoleConfirmation?.tree?.role !==
                                  'Contributor' ? (
                                  <MakeContributorIcon />
                                ) : (
                                  userData?.data?.activeMember &&
                                  ((userRole?.tree?.role === 'Contributor' &&
                                    isRoleConfirmation?.tree?.role !==
                                      'Contributor') ||
                                    (userRole?.tree?.role === 'owner' &&
                                      isRoleConfirmation?.tree?.role ===
                                        'Contributor')) && (
                                    <RemoveContributorIcon />
                                  )
                                ))}

                              {/* Make Contributor */}
                              {isRoleConfirmation?.tree?.role !== 'owner' &&
                                userInfo._id !== isRoleConfirmation?.user?.id &&
                                ((userRole?.tree?.role === 'Contributor' &&
                                  isRoleConfirmation?.tree?.role !==
                                    'Contributor') ||
                                  userRole?.tree?.role === 'owner') &&
                                (userData?.data?.activeMember &&
                                isRoleConfirmation?.tree?.role !==
                                  'Contributor' ? (
                                  <Text
                                    testID="make-contributor"
                                    onPress={handleMakeContributor}
                                    style={{
                                      width: '70%',
                                      marginVertical: 10,
                                      marginHorizontal: 30,
                                      fontSize: 16,
                                      borderBottomWidth: 0.5,
                                      borderBottomColor: Theme.dark.shadow,
                                      color: Theme.light.shadow,
                                    }}>
                                    Make as Contributor
                                  </Text>
                                ) : (
                                  userData?.data?.activeMember &&
                                  ((userRole?.tree?.role === 'Contributor' &&
                                    isRoleConfirmation?.tree?.role !==
                                      'Contributor') ||
                                    (userRole?.tree?.role === 'owner' &&
                                      isRoleConfirmation?.tree?.role ===
                                        'Contributor')) && (
                                    <Text
                                      testID="remove-contributor"
                                      onPress={handleRemoveContributor}
                                      style={{
                                        width: '70%',
                                        marginVertical: 10,
                                        marginHorizontal: 30,
                                        fontSize: 16,
                                        borderBottomWidth: 0.5,
                                        borderBottomColor: Theme.dark.shadow,
                                        color: Theme.light.shadow,
                                      }}>
                                      Remove as Contributor
                                    </Text>
                                  )
                                ))}

                              {/* IIcon */}
                              {isRoleConfirmation?.tree?.role !== 'owner' &&
                              userInfo._id !== isRoleConfirmation?.user?.id &&
                              ((userRole?.tree?.role === 'Contributor' &&
                                isRoleConfirmation?.tree?.role !==
                                  'Contributor') ||
                                userRole?.tree?.role === 'owner') &&
                              userData?.data?.activeMember &&
                              isRoleConfirmation?.tree?.role !==
                                'Contributor' ? (
                                <TouchableOpacity
                                  testID="iicon"
                                  onPress={handleIICon}
                                  style={{marginRight: 10}}>
                                  <IIcon color="grey" />
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={{
                                    marginRight: 10,
                                    width: 30,
                                  }}
                                />
                              )}
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </TouchableOpacity>
              </Modal>
            </View>
          </>
        ) : (
          <MembersTab currentTreeDetails={currentTreeDetails} />
        )}
        <InviteModal
          familyName={familyName}
          visible={showModal}
          onClose={handleCloseModal}
          content={inviteContent}
          inviteEvent={'invite_tree_member'}
        />
        <ContributorIIconCard
          open={isIIconVisible}
          onClose={() => setIIconlVisible(false)}
        />

        {/* Delete Card PopUp */}
        {userData && dependentUser && isModal && (
          <DeleteCard
            isClone={userData?.isClone}
            userId={userData?._id}
            treeId={treeId}
            cLink={allClinks}
            name={`${userData?.personalDetails?.name} ${userData?.personalDetails?.lastname}`}
            dependentUser={dependentUser}
            canDelete={canDelete}
            open={isModal}
            isOwnersClink={isOwnersClink}
            rootClinksWithoutRootId={rootClinksWithoutRootId}
            handleReloadWebView={() => undefined}
            onClose={deletedUserId => {
              setModal(false);
              if (
                typeof deletedUserId === 'string' ||
                Array.isArray(deletedUserId)
              ) {
                if (userData?.isClone) {
                  sendDataToWebView({
                    _id: userData?._id,
                    deletingMember: true,
                  });
                  return;
                }
                if (isOwnersClink) {
                  sendDataToWebView({
                    _id: rootClinksWithoutRootId,
                    deletingMember: true,
                  });
                } else {
                  sendDataToWebView({
                    _id: deletedUserId,
                    deletingMember: true,
                  });
                }
                setAllClinks(null);
              }
            }}
          />
        )}

        {/* Unlink Card PopUp */}
        {userData && isUnlinkModal && (
          <UnlinkMember
            userId={finalUserId}
            treeId={currentTreeDetails?.tree?.id}
            name={`${userData?.personalDetails?.name} ${userData?.personalDetails?.lastname}`}
            open={isUnlinkModal}
            handleReloadWebView={handleReloadWebView}
            onClose={() => setIsUnlinkModal(false)}
          />
        )}
        {/* Make And Remove Contributor PopUp */}
        {userData && isContributorModal && (
          <MakeRemoveContributor
            userId={finalUserId}
            treeId={treeId}
            name={userData?.personalDetails?.name}
            lastname={userData?.personalDetails?.lastname}
            treename={isRoleConfirmation?.tree?.name}
            isMakeContributor={isMakeContributor}
            open={isContributorModal}
            setIsContributorModal={setIsContributorModal}
            onClose={() => {
              setIsContributorModal(false);
            }}
          />
        )}

        {gedLogsDialogOpen && gedcomLogs && (
          <GedcomLogsModal
            gedLogsDialogOpen={gedLogsDialogOpen}
            setGedLogsDialogOpen={setGedLogsDialogOpen}
            gedcomLogs={gedcomLogs}
          />
        )}

        {accessRightsPopupVisible && (
          <AccessRightsPopup
            visible={accessRightsPopupVisible}
            onClose={() => {
              setAccessRightsPopupVisible(false);
            }}
          />
        )}

        {treeActionOpen && (
          <TreeAction
            closeSheet={data => {
              setTreeActionOpen(false);
              if (data?.type === 'profilePicture') {
                const updatePic = {
                  updateNode: true,
                  photo: data.photo,
                  _id: onClickUserid,
                };
                if (updatePic._id) {
                  sendDataToWebView({
                    updateNode: true,
                    photo: data.photo,
                    _id: onClickUserid,
                  });
                }
              }
              setOnclickUserid(null);
            }}
            isOwnersClink={isOwnersClink}
            currentTree={currentTreeDetails}
            loggedInUserRole={userRole}
            onClickUserid={onClickUserid}
            finalUserId={finalUserId}
            isActiveMemberCardNotContributor={isActiveMemberCardNotContributor}
            handleReloadWebView={handleReloadWebView}
            unlinkMember={unlinkMember}
            reloadTreeCallback={reloadTreeCallback}
            clickEventData={clickEventData.current}
            deleteCardBtn={deleteMember}
            makeAsContributor={handleMakeContributor}
            removeAsContributor={handleRemoveContributor}
            cLinkDataFromBalkan={cLinkMessage}
            openContributorIcon={() => {
              setIIconlVisible(true);
            }}
          />
        )}
        {isLoaderPdf && (
          <Portal>
            <LoaderModal />
          </Portal>
        )}
      </SafeAreaView>
    </ErrorBoundary.Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    // Padding to account for status bar on Android and iOS
    paddingTop: Platform.OS === 'ios' ? 0 : '14%',
    // SafeAreaView does not automatically account for notch, so set this manually if needed
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    color: Theme.light.shadow,
    minHeight: 50,
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
    position: 'relative',
    zIndex: 1,
    backgroundColor: Theme.light.background,
    borderRadius: 50,
    top: 95,
    left: 40,
    padding: 5,
    color: Theme.light.shadow,
  },
  bottomSheet: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Theme.light.onOnPrimary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 25,
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
