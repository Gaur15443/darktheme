/* eslint-disable react-native/no-inline-styles */
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useTheme, Text} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import ButtonSpinner from '../../../../common/ButtonSpinner';
import {useDispatch, useSelector} from 'react-redux';

import Toast from 'react-native-toast-message';

import CustomSearchBar from '../../CommunityComponents/CustomSearchBar';
import RenderMemberList from '../../CommunityComponents/RenderMemberList';
import {
  fetchMember,
  makeDismissAdmin,
  removeMember,
} from '../../../../store/apps/createCommunity';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import NewTheme from './../../../../common/NewTheme';
import GlobalHeader from '../../../ProfileTab/GlobalHeader';
import SmallBottomSheet from '../../../../common/SmallBottomSheet';
import Spinner from '../../../../common/Spinner';
import {
  DismissAdminCommunityIcon,
  MakeAdminCommunityIcon,
  RemoveCommunityMemberIcon,
} from '../../../../images';
import {useGetCommunityMembers} from '../../../../store/apps/communitiesApi';
import {useQueryClient} from '@tanstack/react-query';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ManageCommunityMembers = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const navigation = useNavigation();

  const [query, setQuery] = useState('');
  const [ShowSelectRoleToAdmin, setShowSelectRoleToAdmin] = useState(false);
  const [ShowSelectRoleToMember, setShowSelectRoleToMember] = useState(false);
  const [memberId, setMemberId] = useState('');

  const [selectedRole, setSelectedRole] = useState('');
  const [ShowSelectOption, setShowSelectOption] = useState(false);

  const [selectedName, setSelectedName] = useState('');
  const [selectedLastname, setSelectedLastname] = useState('');
  const [removeMemberPopup, setRemoveMemberPopup] = useState(false);
  const [makeAdminPopup, setMakeAdminPopup] = useState(false);
  const [dismissAdminPopup, setDismissAdminPopup] = useState(false);
  const communityDetails = useSelector(
    state => state?.getCommunityDetails?.communityDetails,
  );
  const loggedInMemberData = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.loggedInMemberData,
  );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );

  const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useGetCommunityMembers(communityDetails?.data?._id);

  const fetchAllMemebrs = data?.pages?.flatMap(page => page.data) || [];

  const bottomSheetRefRoleToAdmin = useRef(null);
  const bottomSheetRefRoleToMember = useRef(null);
  const insets = useSafeAreaInsets();

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

  const closeModal = () => {
    setShowSelectOption(false);
    setShowSelectRoleToAdmin(false);
    setShowSelectRoleToMember(false);
  };

  // Filter Member by Search
  const filteredMembers = fetchAllMemebrs?.filter(member => {
    const {name, lastname} = member?.member?.personalDetails;

    const fullName = `${name} ${lastname}`.trim();
    return fullName?.toLowerCase()?.includes(query?.toLowerCase());
  });
  const pageIsFocused = useIsFocused();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <GlobalHeader
        heading={'Community Members'}
        onBack={goBack}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />
      <View style={{flex: 1}}>
        {isLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Spinner />
          </View>
        ) : (
          <>
            <View style={styles.container}>
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
                  title={`Make ${selectedName} ${selectedLastname} an admin of the ${communityDetails?.data?.communityName} community?`}
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
                  title={`Dismiss ${selectedName} ${selectedLastname} as an admin from the ${communityDetails?.data?.communityName} community?`}
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
              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <CustomSearchBar
                  label="Search Members"
                  value={query}
                  onChangeText={setQuery}
                  marginHorizontal={'2%'}
                  clearable
                />
              </View>
              {/* Communities List */}
              <FlatList
                data={filteredMembers}
                keyExtractor={item => item?.member?.memberId}
                contentContainerStyle={[
                  styles.FlatListContainerStyle,
                  loggedInMemberData?.memberRole !== 'Admin' && {
                    paddingBottom: 0,
                  },
                ]}
                renderItem={item => (
                  <RenderMemberList
                    item={item?.item}
                    screenType="editCommunity"
                    setRole={setRole}
                    loggedInMember={loggedInMemberData?.memberRole}
                  />
                )}
                onEndReached={
                  hasNextPage && !isFetchingNextPage && fetchNextPage
                }
                ListFooterComponent={() => {
                  if (isFetchingNextPage) {
                    return (
                      <View style={{alignItems: 'center', paddingVertical: 20}}>
                        <ButtonSpinner />
                      </View>
                    );
                  } else {
                    return null;
                  }
                }}
                accessibilityLabel="members-list"
              />
            </View>

            <SmallBottomSheet
              ref={bottomSheetRefRoleToAdmin}
              options={optionsRoleToAdmin}
              enableCrossIcon={false}
              titleFontWeight={500}
              contentHeight={300}
              optionVariant={'bold'}
              customOptionStyle={{color: 'black'}}
              showOptionDivider={true}
              containerStyle={{paddingTop: 0, paddingBottom: insets.bottom }}
            />

            <SmallBottomSheet
              ref={bottomSheetRefRoleToMember}
              options={optionsRoleToMember}
              enableCrossIcon={false}
              titleFontWeight={500}
              contentHeight={300}
              optionVariant={'bold'}
              customOptionStyle={{color: 'black'}}
              showOptionDivider={true}
              containerStyle={{paddingTop: 0}}
            />
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NewTheme.colors.backgroundCreamy,
  },
  display: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mainDisplay: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 6,
    borderWidth: 1,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  display: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mainDisplay: {
    paddingVertical: 25,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 6,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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

  selectedMembersCount: {
    fontSize: 14,
    lineHeight: 18.8,
    textAlign: 'center',
    marginTop: -10,
    fontFamily: 'PublicSans Bold',
  },
  formContainer: {marginHorizontal: 10},
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
  },
  ModalItemdivider: {borderBottomWidth: 1, borderColor: '#D2D2D2'},
  divider: {borderBottomWidth: 1, marginTop: 40},
  inviteContainer: {marginHorizontal: 10, marginTop: 24},
  membersTitle: {
    fontSize: 18,
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
  },
  errorText: {
    color: 'red',
    paddingVertical: 2,
  },
  searchBarContainer: {
    width: '100%',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  FlatListContainerStyle: {
    paddingBottom: 110,
    paddingHorizontal: 15,
    marginRight: 10,
  },
});

export default ManageCommunityMembers;
