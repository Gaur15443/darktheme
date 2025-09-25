import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import {
  IconButton,
  Avatar,
  Text,
  List,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {RoleConformation} from '../../../store/apps/tree';
import {DefaultImage} from '../../../core';
import {getUserInfo} from '../../../store/apps/userInfo';
import {getInvitedMember} from '../../../store/apps/Members';
import {getInvitedTreeMember} from '../../../store/apps/suggestedInvites';
import {getGroupData} from '../../../store/apps/memberDirectorySlice';
import {MakeRemoveContributor, RemoveMemberFamily} from '../../../components';
import {GlobalStyle} from '../../../core';
import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import {Theme} from '../../../common';
import IIconTwo from '../../../images/Icons/IIcon/IIconTwo';
import {
  EmailIcon,
  MakeContributorBtn,
  PhoneIcon,
  RemoveContributorBtn,
  SearchRecordBtn,
  ViewMemberDetailsIcon,
} from '../../../images';
import Toast from 'react-native-toast-message';
import InviteModal from '../../../components/invite-popup';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import InviteMemberIcon from '../../../images/Icons/InviteMemberIcon';
import Spinner from '../../../common/Spinner';
import HeaderSeparator from '../../../common/HeaderSeparator';
import ErrorBoundary from '../../../common/ErrorBoundary';
import PullToRefresh from '../../../common/PullToRefresh';
import NewTheme from '../../../common/NewTheme';
import ProfileImageViewer from '../../../common/ProfileImageViewer';

// Cache to store member data per tree ID
const memberCache = new Map();

const MIN_SPINNER_DURATION = 500;

const Members = ({route}) => {
  const {currentTreeDetails} = route?.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const theme = useTheme();

  // State variables
  const [isOpen, setIsOpen] = useState(true);
  const [filteredId, setFilteredId] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // Unified refreshing state
  const [images, setImages] = useState([]);
  const [recommendToInvite, setRecommendToInvite] = useState([]);
  const [isRoleConfirmation, setRoleConfirmation] = useState(null);
  const [expandedMember, setExpandedMember] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedMemberDetails, setInvitedMemberDetails] = useState(false);
  const [isMakeContributor, setIsMakeContributor] = useState(false);
  const [isContributorModal, setIsContributorModal] = useState(false);
  const [invitedType, setInvitedType] = useState('');
  const [isMembersAccordionExpanded, setIsMembersAccordionExpanded] =
    useState(true);
  const [isSuggestedInvitesExpanded, setIsSuggestedInvitesExpanded] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const inviteContent = "You're invited to our event!";
  const toggleTooltip = () => setTooltipVisible(!tooltipVisible);

  const surname = currentTreeDetails?.tree?.name;
  const senderId = useSelector(state => state?.userInfo?._id);
  const treeIdin = currentTreeDetails?.tree?.id;
  const currentTreeOwnerId = currentTreeDetails.user.homePerson[0].homePerson;
  const groupId = useSelector(state => state.userInfo.linkedGroup);
  const invitedMemberData = useSelector(state => state?.invitedMember);
  const invitedTreeMembers = useSelector(
    state => state?.invitedTreeMember.invitedTreeMembers,
  );

  const withMinDuration = async promise => {
    const startTime = Date.now();
    const result = await promise;
    const elapsed = Date.now() - startTime;
    const remaining = MIN_SPINNER_DURATION - elapsed;
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!senderId) {
          setLoadingData(true);
          await withMinDuration(dispatch(getUserInfo()).unwrap());
        }
        setIsLoading(false);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching user info:',
          text2: error.message,
        });
        setIsLoading(false);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [dispatch, senderId]);

  useEffect(() => {
    console.log(`Tree changed to treeIdin: ${treeIdin}`);
    setFilteredId(null);
    setRecommendToInvite([]);
  }, [treeIdin]);

  // Fetch and cache member data for the current tree ID
  const getMemberId = async (forceRefresh = false) => {
    try {
      if (!treeIdin) {
        throw new Error('Tree ID is undefined');
      }
      const cacheKey = treeIdin;

      // Check cache and Redux store first unless forceRefresh is true
      if (!forceRefresh) {
        if (memberCache.has(cacheKey)) {
          console.log(`Cache hit for treeIdin: ${cacheKey}`);
          const cachedData = memberCache.get(cacheKey);
          setFilteredId(cachedData.filteredId);
          setRecommendToInvite(cachedData.recommendToInvite || []);
          // Check if data exists in Redux store
          if (
            cachedData.filteredId &&
            invitedTreeMembers[cachedData.filteredId]?.data
          ) {
            processTreeMemberData(
              invitedTreeMembers[cachedData.filteredId].data,
              cachedData.filteredId,
            );
          }
          return;
        }
        // Check Redux store
        if (invitedTreeMembers[cacheKey]?.data) {
          console.log(`Store hit for treeIdin: ${cacheKey}`);
          const storeData = invitedTreeMembers[cacheKey].data;
          processTreeMemberData(storeData, cacheKey);
          return;
        }
      }

      console.log(
        `Cache and store miss for treeIdin: ${cacheKey}, fetching from API`,
      );
      setLoadingData(true);
      const data = await withMinDuration(dispatch(getGroupData()).unwrap());
      const filteredData = data.filter(
        item =>
          (item.groupName === surname &&
            item?.ownerId?._id?._id === currentTreeOwnerId) ||
          (item.groupName === `${surname} Family` &&
            item?.ownerId?._id?._id === currentTreeOwnerId),
      );

      if (filteredData.length > 0) {
        const id = filteredData[0]?._id;
        setFilteredId(id);

        await withMinDuration(
          Promise.all([
            dispatch(getInvitedMember(id)).unwrap(),
            dispatch(getInvitedTreeMember(id)).unwrap(),
          ]),
        );
      } else {
        setFilteredId(null);
        setRecommendToInvite([]);
        memberCache.set(cacheKey, {
          filteredId: null,
          recommendToInvite: [],
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error fetching member data',
        text2: error.message,
      });
      setFilteredId(null);
      setRecommendToInvite([]);
    } finally {
      setLoadingData(false);
    }
  };

  const processTreeMemberData = (treeMemberData, membersId) => {
    try {
      if (!treeMemberData || membersId !== filteredId) {
        console.log(
          `Skipping processTreeMemberData: membersId ${membersId} does not match filteredId ${filteredId}`,
        );
        return;
      }

      console.log(`Processing treeMemberData for membersId: ${membersId}`);
      const treeRes = treeMemberData.treeRes;
      if (!treeRes) {
        setRecommendToInvite([]);
        memberCache.set(treeIdin, {
          filteredId,
          recommendToInvite: [],
        });
        return;
      }

      let updatedRecommendToInvite = treeRes.filter(element => {
        if (element.dob) {
          const dob = Number(element.dob.slice(0, 4));
          const currentDate = new Date().getFullYear();
          const isEligibleDob = currentDate - dob;
          return (
            (element.InviteStatus === 'no' || element.InviteStatus === 'yes') &&
            element.livingStatus !== 'no' &&
            isEligibleDob >= 18
          );
        }
        return (
          (element.InviteStatus === 'no' || element.InviteStatus === 'yes') &&
          element.livingStatus !== 'no'
        );
      });

      updatedRecommendToInvite.sort((a, b) => {
        const fa = a.fname.toLowerCase();
        const fb = b.fname.toLowerCase();
        return fa < fb ? -1 : fa > fb ? 1 : 0;
      });

      setRecommendToInvite(updatedRecommendToInvite);

      console.log(
        `Updating cache for treeIdin: ${treeIdin}, membersId: ${membersId}`,
      );
      memberCache.set(treeIdin, {
        filteredId: membersId,
        recommendToInvite: updatedRecommendToInvite,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error processing suggested invites',
        text2: error.message,
      });
      setRecommendToInvite([]);
      if (treeIdin && filteredId) {
        memberCache.set(treeIdin, {
          filteredId,
          recommendToInvite: [],
        });
      }
    }
  };

  useEffect(() => {
    if (filteredId && invitedTreeMembers[filteredId]?.data) {
      processTreeMemberData(invitedTreeMembers[filteredId].data, filteredId);
    }
  }, [invitedTreeMembers, filteredId]);

  useEffect(() => {
    if (!isLoading && senderId && treeIdin) {
      getRoleConformation(senderId, treeIdin);
      getMemberId();
    }
  }, [isLoading, senderId, treeIdin, dispatch]);

  const getRoleConformation = async (userId, treeId) => {
    try {
      setLoadingData(true);
      const apiUrl = `/getRoleConformation/${userId}/${treeId}`;
      const res = await withMinDuration(
        dispatch(RoleConformation(apiUrl, {})).unwrap(),
      );
      setRoleConfirmation(res.roleConformation);
      return res.roleConformation;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error fetching role confirmation',
        text2: error.message,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleMemberRemoved = async () => {
    try {
      await getMemberId(true);
      setRefresh(!refresh);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error refreshing members',
        text2: error.message,
      });
    }
  };

  const handleDropdownClick = member => {
    setExpandedMember(expandedMember === member ? null : member);
  };

  const handleMembersAccordionToggle = () => {
    setIsMembersAccordionExpanded(!isMembersAccordionExpanded);
    if (isSuggestedInvitesExpanded) {
      setIsSuggestedInvitesExpanded(false);
    }
  };

  const handleSuggestedInvitesAccordionToggle = () => {
    setIsSuggestedInvitesExpanded(!isSuggestedInvitesExpanded);
    if (isMembersAccordionExpanded) {
      setIsMembersAccordionExpanded(false);
    }
  };

  const handleInviteButtonClick = member => {
    setInvitedMemberDetails(member);
    setInvitedType('tree');
    setShowInviteModal(true);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleViewMember = member => {
    try {
      let permission = member?.role === 'owner' && member?._id === senderId;
      const dataToProvide = {
        _id: member?.role === 'owner' ? member?.ownerId : member?._id,
        personalDetails: {
          avatar: member?.pic,
          name: member?.fname,
          lastname: member?.lname,
          gender: member?.gender,
        },
      };
      navigation.navigate('ViewMemberDetails', {
        id: member?.role === 'owner' ? member?.ownerId : member?._id,
        treeId: treeIdin,
        selectedMemberData: dataToProvide,
        currentTreeDetails,
        permission,
        fromMemberTab: true,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error viewing member',
        text2: error.message,
      });
    }
  };

  const handleMakeContributor = () => {
    setIsMakeContributor(true);
    setIsContributorModal(true);
  };

  const handleRemoveContributor = () => {
    setIsMakeContributor(false);
    setIsContributorModal(true);
  };

  const handleSearchRecords = async member => {
    navigation.navigate('ImeusweSearchResults', {
      fname: member?.fname,
      lname: member?.lname,
    });
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setLoadingData(true);
      await getMemberId(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error refreshing data',
        text2: error.message,
      });
    } finally {
      setRefreshing(false);
      setLoadingData(false);
    }
  };

  const renderSuggestedMembers = members => {
    if (!members || members.length === 0) {
      return (
        <Text
          variant="bold"
          style={{
            marginLeft: 10,
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 16.45,
            marginVertical: 15,
            color: theme.colors.text,
          }}>
          Suggested Invites smartly makes invites recommendations based on
          details added to your family tree.
        </Text>
      );
    }

    return members.map((member, index) => (
      <View
        key={index}
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          marginVertical: 3,
          marginHorizontal: 3,
          elevation: 5,
          paddingLeft: 5,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
          }),
        }}>
        <List.Item
          title={`${member.fname} ${member.lname}`}
          left={() =>
            member.pic ? (
              <ProfileImageViewer uri={member.pic} size={64} />
            ) : (
              <DefaultImage
                size={64}
                firstName={member.fname}
                lastName={member.lname}
                gender={member.gender}
              />
            )
          }
          right={() => (
            <View
              style={{
                flexDirection: 'row',
                width: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                testID="invite-btn"
                accessibilityLabel="invite-btn"
                style={{
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
                onPress={() => handleInviteButtonClick(member)}>
                <Image
                  style={{width: 35, height: 35}}
                  source={require('../../../images/InviteIcon.png')}
                />
                <Text
                  variant="bold"
                  style={{
                    textAlign: 'center',
                    marginTop: 5,
                    color: theme.colors.primary,
                  }}>
                  {member.InviteStatus === 'yes' ? 'Resend Invite' : 'Invite'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          descriptionStyle={{color: 'red'}}
          titleStyle={{fontFamily: 'PublicSans Bold', fontSize: 16}}
        />
      </View>
    ));
  };

  const renderMembersWithDropdown = members => {
    if (!members || members.length === 0) {
      return (
        <Text style={{marginLeft: 20, fontSize: 18, fontWeight: '600'}}>
          No members available.
        </Text>
      );
    }
    return members.map((member, index) => (
      <View
        key={index}
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          marginVertical: 3,
          marginHorizontal: 3,
          elevation: 5,
          paddingLeft: 5,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
          }),
        }}>
        <TouchableOpacity onPress={() => handleDropdownClick(member)}>
          <List.Item
            title={`${member.fname} ${member.lname}`}
            description={
              <View>
                <View
                  style={{
                    borderRadius: 6,
                    marginVertical: 6,
                    backgroundColor: 'rgba(255, 234, 202, 1)',
                  }}>
                  <Text
                    variant="bold"
                    style={{
                      color: 'rgba(231, 114, 55, 1)',
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                    }}>
                    {member.role === 'User'
                      ? 'Member'
                      : member.role === 'owner'
                        ? 'Owner'
                        : member.role}
                  </Text>
                </View>
              </View>
            }
            left={() => (
              <View style={{position: 'relative', marginLeft: 2}}>
                {member.pic ? (
                  <ProfileImageViewer uri={member.pic} size={64} />
                ) : (
                  <DefaultImage
                    size={64}
                    firstName={member.fname}
                    lastName={member.lname}
                    gender={member.gender}
                  />
                )}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderColor: theme.colors.avatarBorder,
                    borderWidth: 3,
                    borderRadius: 32,
                    pointerEvents: 'none',
                  }}
                />
              </View>
            )}
            right={() => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'absolute',
                  right: -10,
                  top: 5,
                }}>
                <FontAwesomeIcon
                  testID="dropdown-btn"
                  accessibilityLabel="dropdown-btn"
                  name={
                    expandedMember === member ? 'chevron-up' : 'chevron-down'
                  }
                  size={15}
                  color={'rgba(3, 89, 151, 1)'}
                />
              </View>
            )}
            titleStyle={{fontFamily: 'PublicSans Bold', fontSize: 20}}
          />
          {expandedMember === member && renderAdditionalDetails(member)}
        </TouchableOpacity>
      </View>
    ));
  };

  const renderAdditionalDetails = member => {
    return (
      <View>
        <View style={{marginVertical: 0, marginHorizontal: 10, marginTop: -5}}>
          {member?.mobileNo && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 25,
              }}>
              <PhoneIcon />
              <Text
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: 24,
                  marginLeft: 10,
                  color: theme.colors.text,
                }}>
                +{String(member.mobileNo).slice(0, 2)}{' '}
                {String(member.mobileNo).slice(2)}
              </Text>
            </View>
          )}
          {member?.email && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 25,
              }}>
              <EmailIcon />
              <Text
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: 24,
                  color: theme.colors.text,
                }}>
                {member.email}
              </Text>
            </View>
          )}
        </View>
        <View style={{flexDirection: 'row'}}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              margin: 15,
              marginRight: 15,
              borderRadius: 8,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              testID="view-member-details"
              accessibilityLabel="view-member-details"
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 74,
              }}
              onPress={() => handleViewMember(member)}>
              <ViewMemberDetailsIcon />
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 8,
                }}>
                <Text style={{color: theme.colors.text}}>View</Text>
                <Text style={{color: theme.colors.text}}>Member</Text>
              </View>
            </TouchableOpacity>
            {member?.role !== 'owner' &&
              ((currentTreeDetails.user?.role === 'Contributor' &&
                member?._id !== senderId) ||
                currentTreeDetails.user?.role === 'owner') &&
              (member?.role === 'Contributor' ? (
                <TouchableOpacity
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 74,
                  }}
                  testID="Remove-Contributor"
                  accessibilityLabel="Remove-Contributor"
                  onPress={handleRemoveContributor}>
                  <RemoveContributorBtn />
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingTop: 8,
                    }}>
                    <Text style={{color: theme.colors.text}}>Remove as</Text>
                    <Text style={{color: theme.colors.text}}>Contributor</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  testID="Make-Contributor"
                  accessibilityLabel="Make-Contributor"
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 74,
                  }}
                  onPress={handleMakeContributor}>
                  <MakeContributorBtn />
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingTop: 8,
                    }}>
                    <Text style={{color: theme.colors.text}}>Make as</Text>
                    <Text style={{color: theme.colors.text}}>Contributor</Text>
                  </View>
                </TouchableOpacity>
              ))}
            {isContributorModal && (
              <MakeRemoveContributor
                userId={member?._id}
                treeId={treeIdin}
                name={member?.fname}
                lastname={member?.lname}
                treename={currentTreeDetails?.tree?.name}
                isMakeContributor={isMakeContributor}
                handleMembersTabRefresh={handleMemberRemoved}
                open={isContributorModal}
                setIsContributorModal={setIsContributorModal}
                onClose={() => setIsContributorModal(false)}
              />
            )}
            <TouchableOpacity
              testID="search-records"
              accessibilityLabel="search-records"
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 74,
              }}
              onPress={() => handleSearchRecords(member)}>
              <SearchRecordBtn />
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 8,
                }}>
                <Text style={{color: theme.colors.text}}>Search</Text>
                <Text style={{color: theme.colors.text}}>Records</Text>
              </View>
            </TouchableOpacity>
            {member?.role !== 'owner' &&
              currentTreeDetails?.user?.role === 'owner' && (
                <RemoveMemberFamily
                  member={member}
                  groupId={groupId}
                  onMemberRemoved={handleMemberRemoved}
                />
              )}
            {(member?.role !== 'owner' &&
              currentTreeDetails?.user?.role === 'owner') === false && (
              <View style={{width: 75, height: 74}} />
            )}
            {(member?.role !== 'owner' &&
              (currentTreeDetails?.user?.role === 'owner' ||
                (currentTreeDetails?.user?.role === 'Contributor' &&
                  member?._id !== senderId))) === false && (
              <View style={{width: 55, height: 74}} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ErrorBoundary.Screen>
      <View style={{marginTop: Platform.OS === 'ios' ? 45 : 45}}>
        <View style={styles.header}>
          <TouchableOpacity testID="goback" onPress={goBack}>
            <BackArrowIcon />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
              textAlign: 'center',
            }}>
            <Text style={{fontSize: 22}} variant="bold">
              Family Members
            </Text>
          </View>
          {currentTreeDetails.user.role === 'owner' ? (
            <View style={{marginTop: 5}}>
              <Text
                style={styles.title}
                testID="invite-popup"
                onPress={handleShowModal}>
                <InviteMemberIcon
                  height={35}
                  width={35}
                  color="rgba(231, 114, 55, 1)"
                />
              </Text>
              <InviteModal
                visible={showModal}
                onClose={handleCloseModal}
                content={inviteContent}
                inviteEvent={'invite_tree_member'}
              />
            </View>
          ) : (
            <View style={{width: 40}} />
          )}
        </View>
      </View>
      <HeaderSeparator />
      <ScrollView
        contentContainerStyle={{paddingBottom: 20}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={NewTheme.colors.primaryOrange}
            colors={[NewTheme.colors.primaryOrange]}
          />
        }>
        <GlobalStyle>
          {loadingData ? (
            <View style={styles.spinnerContainer}>
              <Spinner />
            </View>
          ) : (
            <View>
              <View>
                {currentTreeDetails?.tree?.name && (
                  <Text style={styles.treeNameText} variant="bold">
                    {currentTreeDetails.tree.name}
                  </Text>
                )}
              </View>
              {currentTreeDetails?.user?.role === 'owner' && (
                <View>
                  <TouchableOpacity
                    testID="suggested-invites-tab"
                    accessibilityLabel="suggested-invites-tab"
                    style={{
                      backgroundColor: 'rgba(223, 235, 255, 1)',
                      marginTop: 50,
                      height: 50,
                      justifyContent: 'center',
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomLeftRadius: isSuggestedInvitesExpanded
                        ? 10
                        : null,
                      borderBottomRightRadius: isSuggestedInvitesExpanded
                        ? 10
                        : null,
                    }}
                    onPress={handleSuggestedInvitesAccordionToggle}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}>
                      <Text
                        variant="bold"
                        style={{
                          color: 'rgba(3, 89, 151, 1)',
                          marginRight: 10,
                        }}>
                        Suggested Invites
                      </Text>
                      <TouchableOpacity
                        testID="suggested-invite-iicon"
                        accessibilityLabel="suggested-invite-iicon"
                        onPress={toggleTooltip}>
                        <IIconTwo size={20} color={'rgba(3, 89, 151, 1)'} />
                      </TouchableOpacity>
                      <Modal
                        visible={tooltipVisible}
                        animationType="fade"
                        transparent={true}
                        statusBarTranslucent={true}
                        onRequestClose={toggleTooltip}>
                        <TouchableWithoutFeedback onPress={toggleTooltip}>
                          <View style={styles.modalBackground}>
                            <TouchableWithoutFeedback>
                              <View style={styles.modalContent}>
                                <Text variant="bold" style={styles.modalTitle}>
                                  Suggested Invites
                                </Text>
                                <Text style={styles.modalDescription}>
                                  Suggested Invites smartly makes invite
                                  recommendations based on details added to your
                                  family tree.
                                </Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    </View>
                    <FontAwesomeIcon
                      name={
                        isSuggestedInvitesExpanded
                          ? 'chevron-up'
                          : 'chevron-down'
                      }
                      size={15}
                      color={'rgba(3, 89, 151, 1)'}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {isSuggestedInvitesExpanded && (
                <View style={{backgroundColor: theme.colors.background}}>
                  {renderSuggestedMembers(recommendToInvite)}
                </View>
              )}
              <View style={{marginBottom: 100}}>
                <TouchableOpacity
                  testID="members-tab"
                  accessibilityLabel="members-tab"
                  style={{
                    marginTop:
                      currentTreeDetails?.user?.role !== 'owner' ? 50 : 0,
                    backgroundColor: 'rgba(255, 234, 202, 1)',
                    height: 50,
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopRightRadius:
                      currentTreeDetails?.user?.role === 'owner' &&
                      isSuggestedInvitesExpanded
                        ? 10
                        : null,
                    borderTopLeftRadius:
                      currentTreeDetails?.user?.role === 'owner' &&
                      isSuggestedInvitesExpanded
                        ? 10
                        : null,
                  }}
                  onPress={handleMembersAccordionToggle}>
                  <Text
                    variant="bold"
                    style={{
                      color: 'rgba(231, 114, 55, 1)',
                    }}>
                    Members
                  </Text>
                  <FontAwesomeIcon
                    name={
                      isMembersAccordionExpanded ? 'chevron-up' : 'chevron-down'
                    }
                    size={15}
                    color={'rgba(231, 114, 55, 1)'}
                  />
                </TouchableOpacity>
                {isMembersAccordionExpanded && (
                  <View style={{backgroundColor: theme.colors.background}}>
                    {renderMembersWithDropdown(
                      invitedMemberData?.invitedMember?.final
                        ?.filter(member => member?.InviteStatus === 'accepted')
                        .reverse(),
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </GlobalStyle>
      </ScrollView>
      {showInviteModal && (
        <InviteModal
          familyName={surname}
          visible={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            handleMemberRemoved();
          }}
          invitedMemberDetails={invitedMemberDetails}
          invitedType={invitedType}
          inviteEvent={'invite_suggested_member'}
        />
      )}
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeNameText: {
    marginBottom: -20,
    fontSize: 20,
    top: 15,
    left: 5,
  },
  tabContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Theme.light.shadow,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'PublicSans Bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  memberButton: {
    marginRight: 10,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    backgroundColor: 'white',
    padding: 5,
    position: 'absolute',
    borderRadius: 4,
    top: 215,
  },
  modalTitle: {
    fontSize: 14,
    color: 'black',
  },
  modalDescription: {
    fontSize: 12,
    fontWeight: 500,
    color: 'black',
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
  },
});

export default Members;
