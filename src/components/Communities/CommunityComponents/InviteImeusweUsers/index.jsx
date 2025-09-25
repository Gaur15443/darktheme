import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import CustomSearchBar from '../../CommunityComponents/CustomSearchBar';
import RenderMemberList from '../../CommunityComponents/RenderMemberList';
import Axios from '../../../../plugin/Axios';

import {useDispatch, useSelector} from 'react-redux';
import {communityDeepSearch} from '../../../../store/apps/createCommunity';
import theme from '../../../../common/NewTheme';
import {BottomBarButton, GlobalHeader} from '../../../../components';
import Spinner from '../../../../common/Spinner';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {Track} from '../../../../../App';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import Confirm from '../ConfirmCommunityPopup';

const InviteImeusweUsers = ({
  setdeepSearchformChanged,
  community_Id = null,
  fromScreen = 'invite',
}) => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [deepSearchMembers, setDeepSearchMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  // State to manage selected members
  const [currentSelectedMembers, setCurrentSelectedMembers] = useState([]);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState([]);
  const animationRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const dispatch = useDispatch();
  const communityData = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data || {},
  );
  const userData = useSelector(state => state?.userInfo);
  const communityId =
    community_Id ||
    useSelector(
      state => state?.getCommunityDetails?.communityDetails?.data?._id || null,
    );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );

  useEffect(() => {
    if (setdeepSearchformChanged) {
      setdeepSearchformChanged(currentSelectedMembers?.length > 0);
    }
  }, [currentSelectedMembers]);

  const debouncedFetchCommunities = useCallback(search => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      fetchImeusweUsers(search);
    }, 100);
  }, []);

  const handleSearch = text => {
    setQuery(text);
    if (text !== null) {
      fetchImeusweUsers(text);
    }
  };

  const fetchImeusweUsers = async (name = '') => {
    setIsLoading(true);
    const payload = {
      communityId: communityId,
      name: name,
    };
    const response = await dispatch(communityDeepSearch(payload));

    setDeepSearchMembers(response?.payload?.data || []);

    setIsLoading(false);
    setInitialLoading(false);
  };

  useEffect(() => {
    if (communityId) {
      fetchImeusweUsers('');
    }
    return () => {
      setDeepSearchMembers([]);
      setQuery('');
    };
  }, [communityId]);

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
    /* Clevertap io and mixpanel event changes  start */
    const props = {
      community_name: communityData?.communityName,
      category: communityData?.category?.categoryName,
      invite_firstname: selectedMemberDetails?.[0]?.personalDetails?.name,
      invite_lastname: selectedMemberDetails?.[0]?.personalDetails?.lastname,
    };

    Track({
      cleverTapEvent: "Community_Member_Added",
      mixpanelEvent: "Community_Member_Added",
      userData,
      cleverTapProps: props,
      mixpanelProps: props
    });   
    /* clevertap io and mixpanel event chagnes  end */
    Toast.show({
      type: 'success',
      text1: toastMessages?.['5013'],
    });
  };
  const handleTreeMemberSelection = member => {
    const memberId = member?._id;

    if (currentSelectedMembers.includes(memberId)) {
      // Deselect member
      setCurrentSelectedMembers(
        currentSelectedMembers.filter(id => id !== memberId),
      );
      setSelectedMemberDetails(prevDetails =>
        prevDetails.filter(detail => detail?._id !== memberId),
      );
      // Add to deepSearchMembers only if not already present
      setDeepSearchMembers(prevMembers => {
        const alreadyInDeepSearch = prevMembers.some(
          existingMember => existingMember?._id === memberId,
        );
        return alreadyInDeepSearch ? prevMembers : [...prevMembers, member];
      });
    } else {
      // Select member
      setCurrentSelectedMembers([...currentSelectedMembers, memberId]);
      setSelectedMemberDetails(prevDetails => [...prevDetails, member]);
      setDeepSearchMembers(prevMembers =>
        prevMembers.filter(detail => detail?._id !== memberId),
      ); // Remove from defaultMembers
    }
  };

  const filteredMembers = deepSearchMembers?.filter(member => {
    const {name, lastname} = member?.personalDetails || {};
    const fullName = `${name || ''} ${lastname || ''}`.trim().toLowerCase();
    const queryLowercase = query.toLowerCase();

    const isAlreadyJoined =
      member?.communityMemberStatus &&
      member?.communityMemberStatus === 'ACTIVE';

    const isAlreadySelected = currentSelectedMembers.includes(member?._id);

    // Combine logic to filter
    return (
      fullName.includes(queryLowercase) && // Match search query
      !isAlreadySelected // Exclude already selected members
    );
  });

  return (
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
                {filteredMembers?.length === 0 &&
                  query &&
                  !isLoading &&
                  currentSelectedMembers?.length > 0 && (
                    <Text
                      style={[
                        styles.selectedMembersCount,
                        {color: 'red', marginBottom: 10},
                      ]}>
                      No matches found
                    </Text>
                  )}
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
              {selectedMemberDetails?.length > 0 && (
                <View>
                  {selectedMemberDetails.map(member => (
                    <RenderMemberList
                      item={member}
                      screenType="iMeUsWeinviteScreen"
                      handleTreeMemberSelection={handleTreeMemberSelection}
                      selectedMembers={currentSelectedMembers}
                    />
                  ))}
                  {<Divider bold />}
                </View>
              )}

              {filteredMembers?.length > 0 && query?.length > 0 ? (
                <>
                  {/* Members List */}
                  <View>
                    {filteredMembers.map(member => (
                      <RenderMemberList
                        item={member}
                        screenType="iMeUsWeinviteScreen"
                        handleTreeMemberSelection={handleTreeMemberSelection}
                        selectedMembers={currentSelectedMembers}
                      />
                    ))}
                  </View>
                </>
              ) : // Empty State
              filteredMembers?.length === 0 && query && !isLoading ? (
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
                    <Text variant="bold" style={{fontSize: 22, color: 'black'}}>
                      No matches found
                    </Text>
                  </View>
                </View>
              ) : (
                !isLoading &&
                currentSelectedMembers?.length === 0 && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 20,
                    }}>
                    <Text variant="bold" style={{fontSize: 18, color: 'black'}}>
                      Search and Connect with iMeUsWe Users
                    </Text>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: -60,
                      }}>
                      <LottieView
                        ref={animationRef}
                        source={require('../../../../animation/lottie/InviteToCommunityImeusweUsers.json')}
                        autoPlay={true}
                        loop={true}
                        speed={0.5}
                        style={{height: 400, width: 383}}
                      />
                    </View>
                    <View style={{alignItems: 'center', marginTop: -40}}>
                      <Text
                        style={{
                          fontSize: 14,
                          textAlign: 'center',
                          color: 'black',
                        }}>
                        Explore the iMeUsWe user base to invite members and
                        build meaningful connections within your community.
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          )}
        </View>
      </ScrollView>
      {currentSelectedMembers?.length > 0 && (
        <View>
          <BottomBarButton
            label="Add Members"
            onPress={handleInviteMember}
            disabled={currentSelectedMembers?.length === 0}
          />
        </View>
      )}
    </ErrorBoundary.Screen>
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

export default InviteImeusweUsers;
