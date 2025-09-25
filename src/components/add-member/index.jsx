import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AddMemberFormPersonalDetails from './add-member-personal-details';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import AddMemberMarriageDetails from './add-member-marriage-details';
import AddMemberFormEducationDetails from './add-member-education-details';
import AddMemberFormWorkDetails from './add-member-work-details';
import AddMemberFormMedicalDetails from './add-member-medical-details';
import AddMemberFormCommunityDetails from './add-member-community-details';
import AddMemberFormSocialDetails from './add-member-social-details';
import {
  Card,
  List,
  Button,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {useHeaderHeight} from '@react-navigation/elements';
import BackArrowIcon from '../../images/Icons/BackArrowIcon';
import Theme from '../../common/Theme';
import MarriageIcon from '../../core/icon/marriage-icon';
import EducationIcon from '../../core/icon/education-icon';
import MedicalIcon from '../../core/icon/medical-icon';
import WorkIcon from '../../core/icon/work-icon';
import ContactIcon from '../../core/icon/contact-icon';
import MoreDetailIcon from '../../core/icon/more-details-icon';
import {useDispatch, useSelector} from 'react-redux';
import {addNewMember} from '../../store/apps/tree/treeSlice';
import Confirm from '../Confirm';
import Toast from 'react-native-toast-message';
import CircleLoader from '../../core/Global/circularLoader';
import {Track} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNativeBackHandler from './../../hooks/useBackHandler';
import {updateProfilePic} from '../../core/ProfilePicCropper/updateProfilePic';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {GlobalStyle} from '../../core';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SearchFamilyMembers from './auto-complete';
import MultipleSpouse from '../add-member/MultipleSpouse';
import GreenTickIcon from '../../images/Icons/GreenTickIon';
import {Dropdown} from 'react-native-element-dropdown';
import NewTheme from '../../common/NewTheme';
import HeaderSeparator from '../../common/HeaderSeparator';
const {width} = Dimensions.get('window');
import ButtonSpinner from '../../common/ButtonSpinner';
import DropdownAnimation from '../../common/DropdownAnimation';
import {getmSpouseData} from '../../store/apps/tree';
import Axios from '../../plugin/Axios';

const FirstRoute = memo(
  ({
    isFocused,
    relation,
    userId,
    mSpouseData,
    spouseName,
    setSelectedSpouse,
    updateFormValues,
    validations,
    setValidations,
    setformValidations,
    theme,
    components,
    expanded,
    toggleExpanded,
    discardPopUp,
    setDiscardPopUp,
    handleDiscard,
    index,
  }) => (
    <View style={{paddingHorizontal: 10}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={{scrollbarColor: 'red'}}
        scrollIndicatorColor="#ccc">
        <View style={{paddingHorizontal: 10}}>
          <AddMemberFormPersonalDetails
            relation={relation}
            userId={userId}
            mSpouseData={mSpouseData || null}
            spouseName={spouseName}
            key={index}
            setSelectedSpouse={setSelectedSpouse}
            updateFormValues={updateFormValues}
            onValidationChange={event => {
              const values = [...validations];
              values[0] = event;
              setValidations(values);
            }}
          />
        </View>

        <View
          style={[
            styles.cardParentContainer,
            {
              backgroundColor: theme.colors.background,
            },
          ]}>
          {components.map(({Component, Icon, title}, index) => {
            if (title === 'Marriage Details') {
              if (relation !== 'husband' && relation !== 'wife') {
                return null;
              }
            }
            return (
              <View style={styles.IosShadow}>
                <View key={index} style={styles.cardContainer}>
                  <List.Accordion
                    rippleColor={'#FFD1BA'}
                    key={title}
                    style={[
                      {
                        backgroundColor: Theme.light.onWhite100,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        ...(expanded[title]
                          ? {}
                          : {
                              borderBottomLeftRadius: 8,
                              borderBottomRightRadius: 8,
                            }),
                      },
                    ]}
                    title={title}
                    expanded={expanded[title]}
                    onPress={() => toggleExpanded(title)}
                    left={Icon}
                    right={() => <DropdownAnimation play={expanded[title]} />}
                    titleStyle={styles.cardTitleStyle}>
                    <List.Item />
                    <Component
                      key={title}
                      onValidationChange={event => {
                        const values = [...validations];
                        values[0] = event;
                        // setValidations(values);
                        setformValidations(values);
                      }}
                      updateFormValues={updateFormValues}
                      // onRelationStatusChange={onRelationStatusChange}
                      relation={relation}
                      spouseName={spouseName}
                    />
                  </List.Accordion>
                </View>
              </View>
            );
          })}
        </View>
        {discardPopUp && (
          <Confirm
            title={'Are you sure you want to leave?'}
            subTitle={'If you discard, you will lose your changes.'}
            discardCtaText={'Discard'}
            continueCtaText={'Continue Editing'}
            onContinue={() => setDiscardPopUp(false)}
            onDiscard={handleDiscard}
            onCrossClick={() => setDiscardPopUp(false)}
          />
        )}
      </ScrollView>
    </View>
  ),
);

const SecondRoute = memo(
  ({
    isFocused,
    handleSelectedFamilyMember,
    mSpouseData,
    relation,
    setSelectedSpouse,
    index,
    onTyping,
    relationShipData,
    relationShipOption,
    handleRelationShipOption,
    userId,
  }) => (
    <View key={index} style={{}}>
      <SearchFamilyMembers
        handleSelectedFamilyMember={handleSelectedFamilyMember}
        relation={relation}
        onTyping={onTyping}
        userId={userId}
      />
      {relation !== 'husband' && relation !== 'wife' && (
        <View
          style={{
            paddingHorizontal: 20,
            position: 'absolute',
            top: 50,
            width: '100%',
            zIndex: 9,
            paddingTop: 10,
          }}>
          <Dropdown
            testID="RelationShip-Option"
            accessibilityLabel="RelationShip Option"
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 0.5,
              borderRadius: 4,
              paddingHorizontal: Platform.OS === 'ios' ? 10 : 8,
              backgroundColor: 'white',
              color: 'black',
            }}
            data={relationShipData}
            maxHeight={300}
            renderItem={(relationShip, selected) => {
              return (
                <View style={styles.dropdownItemStyle}>
                  <Text style={styles.dropdownButtonTxtStyle}>
                    {relationShip.name}
                  </Text>
                  {selected && <GreenTickIcon />}
                </View>
              );
            }}
            containerStyle={{borderRadius: 8}}
            labelField="name"
            valueField="name"
            placeholder={
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  // borderWidth:1,
                  height: 40,
                  // paddingTop:Platform.OS === 'ios' ? 12 :0
                }}>
                <Text style={{color: 'grey'}}>RelationShip</Text>
                <Text style={{color: 'red'}}>*</Text>
              </View>
            }
            placeholderStyle={{
              paddingLeft: Platform.OS === 'ios' ? 20 : 4,
              paddingTop: Platform.OS === 'ios' ? 10 : 0,
            }}
            itemTextStyle={{color: 'black'}}
            selectedTextStyle={{color: 'black', paddingLeft: 6}}
            value={relationShipOption}
            onChange={handleRelationShipOption}
          />
        </View>
      )}

      {mSpouseData !== null &&
        mSpouseData?.length >= 2 &&
        relation !== null &&
        (relation === 'son' || relation === 'daughter') && (
          <View
            style={{
              paddingHorizontal: 20,
              position: 'absolute',
              top: 100,
              width: '100%',
              zIndex: 9,
            }}>
            <MultipleSpouse
              mSpouseData={mSpouseData}
              setSelectedSpouse={setSelectedSpouse}
            />
          </View>
        )}
    </View>
  ),
);

const AddMemberDetails = ({
  relation,
  treeId,
  userId,
  currentTreeDetails,
  mSpouseData,
  spouseName,
  adaptedChild,
  addingChildFromBlank,
  spouseIdToAdd,
  emptyCardWithChildren = false,
  cLinkDataFromBalkan,
  setRelation,
  setfromRelationShipSelection,
  fromRelationShipSelection,
}) => {
  useNativeBackHandler(handleNavigateBack);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [validations, setValidations] = useState([]);
  const [tabTwoValidations, setTabTwoValidations] = useState(false);
  const [formValidations, setformValidations] = useState([]);
  const [discardPopUp, setDiscardPopUp] = useState(false);
  const [openModal, setModal] = useState(false);
  const [selectedSpouse, setSelectedSpouse] = useState(null);
  const [selectedValue, setSelectedValue] = useState({});
  const [index, setIndex] = useState(0);
  const [selectedValueForButton, setSelectedValueForButton] = useState(null);
  const [relationShipOption, setRelationShipOption] = useState('Biological');
  const userData = useSelector(state => state?.userInfo);
  const groupId = useSelector(state => state.userInfo.linkedGroup);
  const [onTypingFromAutoComplete, setOnTypingFromAutoComplete] =
    useState(null);
  let maidenName = null;
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Trees,
  );
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );
  const _basicInfo = useRef('');
  async function getUserProfile(userId) {
    try {
      const data = await Axios.get(`/getUserProfile/${userId}`);
      _basicInfo.current = data?.data?.myProfile;
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  const formatMessage = (template, replacements) => {
    return template.replace(/{(\w+)}/g, (_, key) => replacements[key] || '');
  };
  const [expanded, setExpanded] = useState({
    'Marriage Details': false,
    'Education History': false,
    'Work History': false,
    'Medical History': false,
    'Community Details': false,
    'Social Media': false,
  });
  const [confirmBtnLoading, setConfirmBtnLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    BD_Flag: null,
    MD_Flag: 0,
    DD_Flag: null,
    birthDetails: {},
    countryCode: null,
    educationDetails: {},
    location: {},
    marriageDetails: {},
    medicalDetails: {},
    secondaryEmail: null,
    secondaryMobileNo: null,
    mobileNo: null,
    moreInfo: {
      community: null,
      subcommunity: null,
      religion: null,
      motherTounge: null,
      gothra: null,
      deity: null,
      priestName: null,
      ancestorVillage: null,
      ancestorVillageinfo: null,
    },
    other: [],
    personalDetails: {},
    // communityDetails: {},
    sociallinks: {},
    workDetails: [],
  });
  const initialFormValue = {
    BD_Flag: null,

    isAroundDOB: false,
    isAroundDOD: false,

    MD_Flag: null,
    DD_Flag: null,
    birthDetails: {},
    countryCode: null,
    educationDetails: {},
    location: {},
    marriageDetails: {},
    medicalDetails: {},
    mobileNo: null,
    moreInfo: {
      community: null,
      subcommunity: null,
      religion: null,
      motherTounge: null,
      gothra: null,
      deity: null,
      priestName: null,
      ancestorVillage: null,
      ancestorVillageinfo: null,
    },
    other: [],
    personalDetails: {},
    // communityDetails: {},
    sociallinks: {},
    workDetails: {},
  };

  const relationShipData = [
    {id: 1, name: 'Biological'},
    {id: 2, name: 'Adopted'},
    {id: 3, name: 'Step'},
    {id: 4, name: 'Foster'},
    {id: 5, name: 'Guardian'},
  ];
  const userEnteredMaidenName = useRef(null);

  const components = [
    {
      title: 'Marriage Details',
      Component: AddMemberMarriageDetails,
      Icon: MarriageIcon,
    },
    {
      title: 'Education History',
      Component: AddMemberFormEducationDetails,
      Icon: EducationIcon,
    },
    {
      title: 'Work History',
      Component: AddMemberFormWorkDetails,
      Icon: WorkIcon,
    },
    {
      title: 'Medical History',
      Component: AddMemberFormMedicalDetails,
      Icon: MedicalIcon,
    },
    {
      title: 'Community Details',
      Component: AddMemberFormCommunityDetails,
      Icon: MoreDetailIcon,
    },
    {
      title: 'Social Media',
      Component: AddMemberFormSocialDetails,
      Icon: ContactIcon,
    },
  ];

  function isFormValid() {
    if (validations.includes(false)) {
      return false;
    }
    if (!validations.includes(false) && formValidations.includes(false)) {
      return false;
    }
    return !!(
      mSpouseData === null ||
      mSpouseData?.length < 1 ||
      (mSpouseData?.length > 1 && selectedSpouse !== null) ||
      relation === 'wife' ||
      relation === 'husband' ||
      relation === 'brother' ||
      relation === 'sister' ||
      relation === 'mother' ||
      relation === 'father' ||
      mSpouseData?.length === 1
    );
  }
  const navigation = useNavigation();

  function addMemberDataBalkan(
    addedMember,
    relation,
    emptyCardWithChildren = false,
  ) {
    const motherId = [];
    const fatherId = [];

    addedMember?.parents?.forEach(parent => {
      if (parent.personalDetails.gender === 'male') {
        fatherId.push(parent._id);
      } else {
        motherId.push(parent._id);
      }
    });
    let webViewDataToAdd = {
      addingMember: true,
      cLink: addedMember?.cLink,
      isClone: addedMember?.isClone,
      id: addedMember?._id,
      name: !addedMember?.personalDetails?.showNickname
        ? addedMember?.personalDetails?.name +
          ' ' +
          addedMember?.personalDetails?.lastname
        : addedMember?.personalDetails?.nickname,
      personalDetails: addedMember?.personalDetails,
      birthDetails: addedMember?.birthDetails,
      cognitousername: addedMember?.cognitousername,
      gender: addedMember?.personalDetails?.gender,
      fid: fatherId[0],
      mid: motherId[0],
      pids: [...addedMember.wifes, ...addedMember.husbands],
      dateRange: `${addedMember?.birthDetails?.dob ? new Date(addedMember?.birthDetails?.dob).getFullYear() : ''} - ${addedMember?.birthDetails?.dod ? new Date(addedMember?.birthDetails?.dod).getFullYear() : ''}`,
      relation: relation,
      children: addedMember?.children,
      emptyCardWithChildren,
    };
    if (addedMember.cognitousername !== null) {
      webViewDataToAdd.active = true;
    }
    if (addedMember.marriageDetails?.length > 0) {
      webViewDataToAdd.divorced = addedMember?.marriageDetails?.map(details => {
        if (details.relationship !== 'Married') {
          return details?.spouseId;
        }
      });
    }
    if (!addedMember?.personalDetails?.profilepic) {
      webViewDataToAdd.initials = `${addedMember?.personalDetails?.name !== '' ? addedMember?.personalDetails?.name?.[0] : ''}${addedMember?.personalDetails?.lastname !== '' ? addedMember?.personalDetails?.lastname?.[0] : ''}`;
    } else {
      webViewDataToAdd.photo = addedMember?.personalDetails?.profilepic;
    }

    /*

		   --- conditions to be taken care of :
		   1. balkan works on 3 ids fid, mid and pids , which is father, mother and spouse ids respectively
		   2. existing add member optionsm are :- add father, add mother, add brother, add sister, add child, add husband, add wife

		   ---------------------------------------------------------------------------------------------------------------------------------------------------
		   ( @add husband
			 @add wife
			 @add brother
			 @add sister
			 @add child ) => api will give the details of the node which was added, just send it to balkan
		   ---------------------------------------------------------------------------------------------------------------------------------------------------

		   ---------------------------------------------------------------------------------------------------------------------------------------------------
		   ( @add father
			 @add mother ) : api will give the (mother | father) details which was added ,and also pick up for whom the mother was added and send it to balkan.

		   ** note ** : if father or mother was added to multiple childrens take all the childrens ids and send it to balkan along with father or mother data
		   ---------------------------------------------------------------------------------------------------------------------------------------------------

		*/

    return webViewDataToAdd;
  }

  const updateFormValues = (section, values) => {
    if (values?.maidenName && values?.maidenName?.length) {
      userEnteredMaidenName.current = values.maidenName;
    }
    setFormValues(prevFormValues => {
      if (relation === 'husband' || relation === 'wife') {
        return {
          ...prevFormValues,
          [section]: values,
        };
      }
      const {marriageDetails, ...rest} = prevFormValues;
      return {
        ...rest,
        [section]: values,
      };
    });
  };

  function handleRelationShipOption(event) {
    setRelationShipOption(event.name);
  }

  const enableSecondTabButton = useMemo(() => {
    if (mSpouseData !== null && relation !== null && selectedSpouse !== null) {
      if (
        selectedValueForButton?.selectedValue &&
        selectedSpouse &&
        typeof onTypingFromAutoComplete === 'boolean'
      ) {
        return true;
      } else {
        return false;
      }
    } else if (
      selectedValueForButton?.selectedValue &&
      typeof onTypingFromAutoComplete === 'boolean'
    ) {
      return true;
    } else {
      return false;
    }
  }, [
    selectedValueForButton?.selectedValue,
    selectedSpouse,
    mSpouseData,
    relation,
    onTypingFromAutoComplete,
  ]);

  async function findMaidenName() {
    console.log('came came', _basicInfo);
    const parentsData = await dispatch(
      getmSpouseData({mSpouses: _basicInfo?.current?.parents}),
    ).unwrap();

    if (parentsData.length > 1) {
      const findFather = parentsData.find(item => item.gender === 'male');
      maidenName = findFather?.lastname;
    } else if (parentsData.length === 1) {
      maidenName = parentsData[0]?.lastname;
    }
    // setFormValues((prevFormValues) => ({
    // 	...prevFormValues,
    // 	marriageDetails: {
    // 		...prevFormValues.marriageDetails,
    // 		maidenName,
    // 	},
    // }));
  }

  const addMemberHandler = async () => {
    try {
      setConfirmBtnLoading(true);
      let selectedMspouseId = null;
      if (addingChildFromBlank && !adaptedChild) {
        selectedMspouseId = spouseIdToAdd;
      } else {
        selectedMspouseId =
          !mSpouseData || adaptedChild
            ? null
            : mSpouseData?.length > 1
              ? selectedSpouse
              : mSpouseData[0]?.id;
      }
      let finalUserId = userId;
      await getUserProfile(finalUserId);
      if (relation === 'mother' || relation === 'father') {
        if (cLinkDataFromBalkan?.isClinkPresent) {
          finalUserId = cLinkDataFromBalkan?.personHasParent
            ? cLinkDataFromBalkan?.personHasParent
            : finalUserId;
        }
      }
      if (relation === 'brother' || relation === 'sister') {
        if (cLinkDataFromBalkan?.isClinkPresent) {
          finalUserId = cLinkDataFromBalkan?.personHasParent
            ? cLinkDataFromBalkan?.personHasParent
            : finalUserId;
        }
      }
      if (relation === 'husband' && _basicInfo?.current?.parents?.length > 0) {
        await findMaidenName();
      }

      let data = null;
      if (index === 1) {
        data = JSON.parse(JSON.stringify(selectedValue));
        if (relation === 'wife' || relation === 'husband') {
          data.MD_Flag = 1;
          data.marriageDetails = {
            marraigeDate: null,
            location_of_wedding: {},
            maidenName: maidenName ?? null,
            linkYourSpouse: spouseName,
            relationship: 'Married',
            isAroundDateOfMarraige: false,
            domMediaIds: [],
          };
          data.personalDetails.relationStatus = 'married';
        } else {
          delete data?.marriageDetails;
        }
        data.relationshipOption = 'Biological';
        delete data.cognitousername;
        delete data.treeIdin;
        delete data.parents;
        delete data.children;
        delete data.husbands;
        delete data.wifes;
        delete data.siblings;
        delete data.linkedGroup;
        delete data.orignalimageurl;
        delete data.isClone;
        delete data.cLink;
        data.workDetails = [
          {
            company_name: '',
            company_role: '',
            dateOfFrom: '',
            dateOfTo: '',
            FD_Flag: '',
            isAroundWorkStartDate: false,
            TD_Flag: '',
            isAroundWorkEndDate: false,
          },
        ];
        data.sociallinks = [
          {
            account: 'facebook',
            label: 'Facebook',
            link: '',
          },
          {
            account: 'Insta',
            label: 'Instagram',
            link: '',
          },
          {
            account: 'Twitter',
            label: 'Twitter',
            link: '',
          },
        ];
        data.moreInfo = {
          religion: '',
          community: '',
          subcommunity: '',
          motherTounge: '',
          gothra: '',
          deity: '',
          priestName: '',
          ancestorVillage: '',
        };
        data.mobileNo = null;
        data.other = [];
        data.medicalDetails = {
          bloodgroup: null,
          chronic_condition: [
            {
              name: null,
            },
          ],
          allergies: [
            {
              name: null,
            },
          ],
          illnesses: [
            {
              name: null,
            },
          ],
          preExistingConditions: [
            {
              name: null,
            },
          ],
        };
        data.educationDetails = {
          college: [
            {
              degree: '',
              address: '',
              name: '',
              location: '',
              search_data: [],
              dateOfFrom: '',
              dateOfTo: '',
              FD_Flag: '',
              isAroundEducationStartDate: false,
              TD_Flag: '',
              isAroundEducationEndDate: false,
            },
          ],
        };
        data.countryCode = null;
        setSelectedValue(data);
      }

      const formValuesForPayload = formValues;
      if (formValuesForPayload.marriageDetails) {
        formValuesForPayload.marriageDetails.maidenName =
          userEnteredMaidenName?.current?.length > 0
            ? userEnteredMaidenName?.current
            : maidenName;
      }

      const addedMember = await dispatch(
        index === 0
          ? addNewMember({
              payload: {
                emptyCardWithChildren,
                adaptedChild,
                selectedMspouseId,
                ...formValuesForPayload,
              },
              userId: finalUserId,
              treeId,
              isRelation: relation,
            })
          : addNewMember({
              payload: {
                emptyCardWithChildren,
                adaptedChild,
                selectedMspouseId,
                ...data,
              },
              userId,
              treeId,
              isRelation: relation,
            }),
      ).unwrap();
      // Update Profile Picture
      try {
        const storedCroppedImageData =
          await AsyncStorage.getItem('croppedImageData');
        if (storedCroppedImageData !== null) {
          const imageData = JSON.parse(storedCroppedImageData);
          const imageUrl = await updateProfilePic(
            imageData,
            addedMember?._id,
            groupId,
            dispatch,
          );
          if (imageUrl) {
            // Update the addedMember object
            addedMember.personalDetails.profilepic = imageUrl;
          }
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching Image Data',
          text2: error,
        });
      }
      const webViewDataToAdd = addMemberDataBalkan(
        addedMember,
        relation,
        emptyCardWithChildren,
      );

      setConfirmBtnLoading(false);
      navigation.navigate('TreeScreen', {
        relation: {relation},
        currentTreeDetails: currentTreeDetails,
        webViewDataToAdd,
      });
      setfromRelationShipSelection(false);
      await AsyncStorage.removeItem('addMember_MD');
      await AsyncStorage.removeItem('addMember_ED');
      await AsyncStorage.removeItem('addMember_WD');
      await AsyncStorage.removeItem('addMember_MH');
      await AsyncStorage.removeItem('addMember_CD');
      await AsyncStorage.removeItem('addMember_SD');
      await AsyncStorage.removeItem('croppedImageData');
      setTimeout(() => {
        if (index === 1) {
          const messageTemplate = toastMessages[3002];
          const replacements = {
            name: selectedValue.personalDetails.name,
            lastname: selectedValue.personalDetails.lastname,
          };
          const formattedMessage = formatMessage(messageTemplate, replacements);
          Toast.show({
            type: 'success',
            text1: formattedMessage,
          });
        } else {
          const messageTemplate = toastMessages[3002];
          const replacements = {
            name: formValues.personalDetails.name,
            lastname: formValues.personalDetails.lastname,
          };
          const formattedMessage = formatMessage(messageTemplate, replacements);
          Toast.show({
            type: 'success',
            text1: formattedMessage,
          });
        }
      }, 2000);

      /* customer io and mixpanel event changes  start */
      Track({
        cleverTapEvent: 'added_tree_member',
        mixpanelEvent: 'addedTreeMember',
        userData,
      });
    } catch (error) {
    } finally {
      maidenName = null;
      userEnteredMaidenName.current = null;
    }
    /* customer io and mixpanel event chagnes  end */
  };

  // Temporary Solution for marriage details
  useEffect(() => {
    if (
      (mSpouseData && (relation === 'wife' || relation === 'husband')) ||
      (spouseName && (relation === 'wife' || relation === 'husband'))
    ) {
      toggleExpanded('Marriage Details');
    }

    // SetInitialLoading to false
    if (initialLoading) setTimeout(() => setInitialLoading(false), 500);
  }, []);

  useEffect(() => {
    if (initialLoading) setTimeout(() => setInitialLoading(false), 500);
  }, [initialLoading]);
  useFocusEffect(
    useCallback(() => {
      return () => setIndex(0);
    }, []),
  );

  const toggleExpanded = title => {
    setExpanded(prevState => ({
      ...prevState,
      [title]: !prevState[title],
    }));
  };

  function handleSelectedFamilyMember(selected) {
    // setTabTwoValidations(true);
    setSelectedValueForButton(selected);
    // if (
    //   mSpouseData !== null &&
    //   relation !== null &&
    //   (relation === 'son' || relation === 'daughter')
    // ) {
    //   if (selected.selectedValue && selectedSpouse) {
    //     console.log(true);
    //     setTabTwoValidations(true);
    //   }
    // } else if (selected.selectedValue) {
    //   setTabTwoValidations(true);
    // }

    setSelectedValue(selected?.selectedUserId?.myProfile);
  }

  const onTyping = e => {
    setOnTypingFromAutoComplete(e);
  };

  async function clearAddMemberAsyncStorage() {
    await AsyncStorage.removeItem('addMember_MD');
    await AsyncStorage.removeItem('addMember_ED');
    await AsyncStorage.removeItem('addMember_WD');
    await AsyncStorage.removeItem('addMember_MH');
    await AsyncStorage.removeItem('addMember_CD');
    await AsyncStorage.removeItem('addMember_SD');
  }

  useEffect(() => {
    if (index === 0) {
      setTabTwoValidations(false);
    }
  }, [index]);

  async function handleNavigateBack() {
    try {
      const MD = await AsyncStorage.getItem('addMember_MD');
      const ED = await AsyncStorage.getItem('addMember_ED');
      const WD = await AsyncStorage.getItem('addMember_WD');
      const MH = await AsyncStorage.getItem('addMember_MH');
      const CD = await AsyncStorage.getItem('addMember_CD');
      const SD = await AsyncStorage.getItem('addMember_SD');

      if (
        MD ||
        ED ||
        WD ||
        MH ||
        CD ||
        SD ||
        formValues.personalDetails.lastname !== '' ||
        formValues.personalDetails.livingStatus !== 'yes' ||
        formValues.personalDetails.middlename !== '' ||
        formValues.personalDetails.name !== '' ||
        formValues.personalDetails.profilepic !== null ||
        formValues.location.currentlocation !== null ||
        formValues.location.placeOfBirth !== null ||
        formValues.birthDetails.dob !== null
      ) {
        setDiscardPopUp(true);
      } else {
        if (!fromRelationShipSelection) {
          navigation.goBack();
        } else {
          setRelation('');
          setfromRelationShipSelection(false);
        }
      }
    } catch (error) {
      console.error('Error checking AsyncStorage:', error);
    }
  }

  const handleDiscard = async () => {
    await AsyncStorage.removeItem('addMember_MD');
    await AsyncStorage.removeItem('addMember_ED');
    await AsyncStorage.removeItem('addMember_WD');
    await AsyncStorage.removeItem('addMember_MH');
    await AsyncStorage.removeItem('addMember_CD');
    await AsyncStorage.removeItem('addMember_SD');
    if (!fromRelationShipSelection) {
      navigation.goBack();
    } else {
      setRelation('');
      setfromRelationShipSelection(false);
    }
  };
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const renderTabBar = props => (
    <View>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{
          height: 60,
          zIndex: 0,
        }}>
        <TabBar
          {...props}
          indicatorStyle={{
            backgroundColor: theme.colors.onBackground,
            borderRadius: 8,
            height: 40,
            marginTop: -20,
            borderWidth: 1.5,
            borderColor: theme.colors.outline,
          }}
          style={{
            backgroundColor: theme.colors.unSelectedTabBackgr,
            borderRadius: 8,
            marginHorizontal: 12,
            height: 40,
            shadowColor: '#000',
            marginVertical: 10,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
          }}
          renderLabel={({route, focused, color}, index) => (
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -5,
              }}>
              <Text
                variant="bold"
                style={{
                  color: focused ? theme.primary : theme.infoContentColor,
                  fontSize: 15,
                }}>
                {route.title}
              </Text>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );

  const routes = [
    {key: 'first', title: 'New Relative'},
    {key: 'second', title: 'From your tree'},
  ];
  const renderScene = ({route}) => {
    switch (route.key) {
      case 'first':
        return (
          <FirstRoute
            isFocused={index === 0}
            relation={relation}
            userId={userId}
            mSpouseData={mSpouseData}
            spouseName={spouseName}
            setSelectedSpouse={setSelectedSpouse}
            updateFormValues={updateFormValues}
            validations={validations}
            setValidations={setValidations}
            setformValidations={setformValidations}
            theme={theme}
            components={components}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            discardPopUp={discardPopUp}
            setDiscardPopUp={setDiscardPopUp}
            handleDiscard={handleDiscard}
            index={index}
          />
        );
      case 'second':
        return (
          <SecondRoute
            handleSelectedFamilyMember={handleSelectedFamilyMember}
            mSpouseData={mSpouseData}
            relation={relation}
            setSelectedSpouse={setSelectedSpouse}
            isFocused={index === 1}
            index={index}
            onTyping={onTyping}
            relationShipData={relationShipData}
            relationShipOption={relationShipOption}
            handleRelationShipOption={handleRelationShipOption}
            userId={userId}
          />
        );
      default:
        return null;
    }
  };
  return (
    <>
      <View style={styles.safeArea}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
            },
          ]}>
          <KeyboardAvoidingView
            style={{zIndex: 1, paddingTop: 20, height: '100%'}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={
              Platform.OS === 'ios' ? 48 : keyboardVisible ? 30 : 0
            }>
            <View
              style={[
                styles.header,
                {backgroundColor: theme.colors.background},
              ]}>
              <TouchableOpacity
                testID="back-arrow"
                style={{marginTop: 20}}
                onPress={handleNavigateBack}>
                <BackArrowIcon />
              </TouchableOpacity>

              {!initialLoading && (
                <TouchableOpacity style={styles.nextButton}>
                  <Button
                    testID="Add-member"
                    accessibilityLabel="add-relative-button"
                    onPress={addMemberHandler}
                    disabled={
                      index === 1
                        ? !enableSecondTabButton
                        : !isFormValid() || confirmBtnLoading
                    }
                    style={{
                      width: '100%',
                      color: 'white',
                      backgroundColor:
                        index === 1 && enableSecondTabButton
                          ? NewTheme.colors.primaryOrange
                          : index === 0 && isFormValid()
                            ? NewTheme.colors.primaryOrange
                            : '#FFC0A1',
                      borderColor: 'transparent',
                      borderWidth: 0,
                      borderRadius: 8,
                    }}>
                    {confirmBtnLoading ? (
                      <ButtonSpinner color={'white'} />
                    ) : (
                      <Text
                        style={{color: 'white'}}
                        accessibilityLabel="add-relative-text">
                        Add Relative
                      </Text>
                    )}
                  </Button>
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.tabcontainer, {marginTop: 50}]}>
              <HeaderSeparator />
              <View style={styles.tabmodalContainer}>
                <TabView
                  navigationState={{index, routes}}
                  renderScene={renderScene}
                  onIndexChange={e => {
                    setIndex(e);
                    if (e === 0) setInitialLoading(true);
                  }}
                  renderTabBar={renderTabBar}
                  style={{width: width}}
                  lazy
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Padding to account for status bar on Android and iOS
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    // SafeAreaView does not automatically account for notch, so set this manually if needed
    // paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.light.onSecondary,
  },
  customScrollBar: {
    backgroundColor: '#ccc',
  },
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.light.onSecondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  nextButton: {
    gap: 10,
    position: 'absolute',
    top: 20,
    right: 10,
    minWidth: 130,
    height: 40,
  },
  text: {
    color: Theme.light.shadow,
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingTop: 60,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: Theme.light.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.light.onSecondary,
  },
  cardParentContainer: {
    marginTop: 5,
    paddingBottom: 50,
    paddingHorizontal: 10,
    width: '100%',
  },
  IosShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
    }),
  },
  cardContainer: {
    marginTop: 10,
    fontSize: Theme.fonts.size.heading.sm,
    borderRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
    }),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  cardTitleStyle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  tabcontainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabmodalContainer: {
    paddingLeft: 15,
    paddingRight: 15,
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
  ButtonSpinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%',
    // height: '100%',
  },
});

export default memo(AddMemberDetails);
