import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import CustomSearchBar from '../../CommunityComponents/CustomSearchBar';
import RenderMemberList from '../../CommunityComponents/RenderMemberList';

import {useDispatch, useSelector} from 'react-redux';
import {fetchTreeMember} from '../../../../store/apps/createCommunity';
import theme from '../../../../common/NewTheme';
import Spinner from '../../../../common/Spinner';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import Axios from '../../../../plugin/Axios';
import BottomBarButton from '../BottomBarButton';
import Toast from 'react-native-toast-message';
import Confirm from '../ConfirmCommunityPopup';
import LottieView from 'lottie-react-native';
import {Track} from '../../../../../App';
import {useGetAllTreeActiveMember} from '../../../../store/apps/communitiesApi';
import {useQueryClient} from '@tanstack/react-query';

const InviteSearchScreen = ({
  setFormChanged,
  community_Id = null,
  fromScreen = 'invite',
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  // State to manage selected members
  const [currentSelectedMembers, setCurrentSelectedMembers] = useState([]);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState([]);

  const animationRef = useRef(null);

  const communityData = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data || {},
  );

  const communityId =
    community_Id ||
    useSelector(
      state => state?.getCommunityDetails?.communityDetails?.data?._id || null,
    );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );

  const {
    data,
    isLoading: initialLoading,
    refetch,
  } = useGetAllTreeActiveMember(communityId);
  const fetchedMembers = data?.data;
  const [defaultMembers, setDefaultMembers] = useState(fetchedMembers);

  // Sync local state with fetched data when API response updates
  useEffect(() => {
    setDefaultMembers(fetchedMembers);
  }, [fetchedMembers]);

  const userData = useSelector(state => state?.userInfo);
  const handleSearch = text => {
    setQuery(text);
  };

  useEffect(() => {
    if (setFormChanged) {
      setFormChanged(currentSelectedMembers?.length > 0);
    }
  }, [currentSelectedMembers]);

  const handleInviteMember = async () => {
    const apiUrl = `/communityUserInvite/${communityId}`;
    const payload = {
      userId: currentSelectedMembers,
    };
    const res = Axios.post(apiUrl, payload);
    if (fromScreen !== 'createCommunity') {
      navigation.goBack();
    }
    if (fromScreen === 'createCommunity') {
      navigation.navigate('CommunityDetails', {
        item: {_id: communityId, fromScreen: 'createCommunity'},
      });
    }
    // Refresh
    refetch();


  /* Clevertap io and mixpanel event changes  start */
      Track({
        cleverTapEvent: "Community_Member_Added_Family",
        mixpanelEvent: "Community_Member_Added_Family",
        userData
      });   
  /* clevertap io and mixpanel event chagnes  end */    
    Toast.show({
      type: 'success',
      text1: toastMessages?.['5013'],
    });
  };

  const handleTreeMemberSelection = member => {
    const memberId = member?.recever?._id;

    if (currentSelectedMembers.includes(memberId)) {
      // Deselect member
      setCurrentSelectedMembers(
        currentSelectedMembers.filter(id => id !== memberId),
      );
      setSelectedMemberDetails(prevDetails =>
        prevDetails.filter(detail => detail?.recever?._id !== memberId),
      );
      setDefaultMembers(prevMembers => [...prevMembers, member]); // Add back to defaultMembers
    } else {
      // Select member
      setCurrentSelectedMembers([...currentSelectedMembers, memberId]);
      setSelectedMemberDetails(prevDetails => [...prevDetails, member]);
      setDefaultMembers(prevMembers =>
        prevMembers.filter(detail => detail?.recever?._id !== memberId),
      ); // Remove from defaultMembers
    }
  };

  const filteredMembers = defaultMembers?.filter(member => {
    const {name, lastname} = member?.recever?.personalDetails || {};
    const fullName = `${name || ''} ${lastname || ''}`.trim().toLowerCase();
    const queryLowercase = query.toLowerCase();

    const isAlreadyAccepted =
      member?.recever?.communityMemberStatus &&
      member?.recever?.communityMemberStatus === 'ACTIVE';

    // Combine the existing logic with the new conditions
    return fullName.includes(queryLowercase);
  });

  return (
    <>
      <ErrorBoundary.Screen>
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          accessibilityLabel="Scrollable screen for member selection"
          contentContainerStyle={{paddingBottom: 130}}>
          <View style={styles.container}>
            {/* Header*/}
            {initialLoading ? (
              <View accessibilityLabel="Loading spinner">
                <Spinner />
              </View>
            ) : (
              <View style={styles.mainContainer}>
                {/* Search Bar */}

                <View
                  style={styles.searchBarContainer}
                  accessibilityLabel="Search bar for searching members">
                  <CustomSearchBar
                    label="Search"
                    value={query}
                    onChangeText={handleSearch}
                    clearable
                  />
                </View>
                {/* Selected Member Count */}
                <View>
                  <Text
                    style={styles.selectedMembersCount}
                    accessibilityLabel={`${currentSelectedMembers?.length} members selected`}>
                    {currentSelectedMembers?.length === 1
                      ? `${currentSelectedMembers?.length} Member Selected`
                      : `${currentSelectedMembers?.length} Members Selected`}
                  </Text>
                </View>
                {/* Selected Members Section */}
                {defaultMembers?.length > 0 ? (
                  <>
                    {selectedMemberDetails?.length > 0 && (
                      <View>
                        {selectedMemberDetails.map(member => (
                          <RenderMemberList
                            item={member}
                            screenType="inviteScreen"
                            handleTreeMemberSelection={
                              handleTreeMemberSelection
                            }
                            selectedMembers={currentSelectedMembers}
                          />
                        ))}
                        {defaultMembers?.length !== 0 && <Divider bold />}
                      </View>
                    )}
                    {/* Members List */}
                    <View>
                      {filteredMembers.map(member => (
                        <RenderMemberList
                          item={member}
                          screenType="inviteScreen"
                          handleTreeMemberSelection={handleTreeMemberSelection}
                          selectedMembers={currentSelectedMembers}
                        />
                      ))}
                    </View>
                  </>
                ) : (
                  selectedMemberDetails?.length === 0 && (
                    // Empty State
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <LottieView
                        ref={animationRef}
                        source={require('../../../../animation/lottie/InviteToCommunity.json')}
                        autoPlay={true}
                        loop={false}
                        speed={2}
                        style={{height: 350, width: 383}}
                      />
                      <View style={{alignItems: 'center', marginTop: -40}}>
                        <Text
                          variant="bold"
                          style={{fontSize: 22, color: 'black'}}>
                          No family members found
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            textAlign: 'center',
                            color: 'black',
                          }}>
                          Start by adding your loved ones to the family tree and
                          inviting them to be part of this community.
                        </Text>
                      </View>
                    </View>
                  )
                )}

                {/* Selected Members With Zero Default Members */}
                {defaultMembers?.length === 0 &&
                  selectedMemberDetails?.length > 0 && (
                    <>
                      <View>
                        {selectedMemberDetails.map(member => (
                          <RenderMemberList
                            item={member}
                            screenType="inviteScreen"
                            handleTreeMemberSelection={
                              handleTreeMemberSelection
                            }
                            selectedMembers={currentSelectedMembers}
                          />
                        ))}
                        {defaultMembers?.length !== 0 && <Divider bold />}
                      </View>

                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <LottieView
                          ref={animationRef}
                          source={require('../../../../animation/lottie/InviteToCommunity.json')}
                          autoPlay={true}
                          loop={false}
                          speed={2}
                          style={{height: 350, width: 383}}
                        />
                        <View style={{alignItems: 'center', marginTop: -40}}>
                          <Text
                            variant="bold"
                            style={{fontSize: 22, color: 'black'}}>
                            No family members found
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              textAlign: 'center',
                              color: 'black',
                            }}>
                            Start by adding your loved ones to the family tree
                            and inviting them to be part of this community.
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
              </View>
            )}
          </View>
        </ScrollView>
      </ErrorBoundary.Screen>
      {currentSelectedMembers?.length > 0 && (
        <View>
          <BottomBarButton
            label="Add Members"
            onPress={handleInviteMember}
            disabled={currentSelectedMembers?.length === 0}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.backgroundCreamy,
    paddingHorizontal: 10,
  },
  headerContainer: {
    height: 77,
  },
  selectedMembersCount: {
    fontSize: 12,
    lineHeight: 14.1,
    marginTop: -10,
    textAlign: 'center',

    marginBottom: 20,
  },
  mainContainer: {marginHorizontal: 10},
  searchBarContainer: {width: '100%', marginBottom: 20, marginTop: 10},
  FlatListContainerStyle: {paddingBottom: 150, paddingRight: 5},
  shareHeading: {fontSize: 18, lineHeight: 28.26, marginVertical: 10},
  shareButtons: {
    width: '100%',
    height: 48,

    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.colors.primaryOrange,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  shareText: {
    fontSize: 18,
    color: theme.colors.primaryOrange,
  },
  divider: {borderBottomWidth: 0.9, marginBottom: 10, marginTop: 20},
  loadMoreLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default InviteSearchScreen;
