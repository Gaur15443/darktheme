import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import CustomSearchBar from '../../CommunityComponents/CustomSearchBar';
import RenderMemberList from '../../CommunityComponents/RenderMemberList';
import {
  CommunityInviteSearchScreenEmptyState,
  CopyLinkIcon,
  PlusIcon,
  ShareViaIcon,
} from '../../../../images/';
import Axios from '../../../../plugin/Axios';
import Toast from 'react-native-toast-message';
import Share from 'react-native-share';
import {useDispatch, useSelector} from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  communityDeepSearch,
  fetchTreeMember,
} from '../../../../store/apps/createCommunity';
import theme from '../../../../common/NewTheme';
import {GlobalHeader} from '../../../../components';
import CleverTap from 'clevertap-react-native';
import {mixpanel} from '../../../../../App';

const InviteScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [defaultMembers, setDefaultMembers] = useState([]);
  const [deepSearchMembers, setDeepSearchMembers] = useState([]);
  const [defaultPage, setDefaultPage] = useState(1);
  const [deepSearchPage, setDeepSearchPage] = useState(1);
  const [lastfetchedTreeDataLength, setLastfetchedTreeDataLength] =
    useState(null);
  const [lastfetchedImeusweDataLength, setLastfetchedImeusweDataLength] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const inviteTimeoutRef = useRef({});
  const dispatch = useDispatch();

  const communityId = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data?._id || null,
  );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );
  const communityData = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data || {},
  );

  const handleSearch = text => {
    setQuery(text);
    setDeepSearchPage(1);
    if (text !== null) {
      fetchImeusweUsers(1, text);
    }
  };

  const fetchImeusweUsers = async (page = 1, name = '') => {
    setIsLoading(true);
    const payload = {
      page: page,
      communityId: communityId,
      name: name,
    };
    const response = await dispatch(communityDeepSearch(payload));
    setLastfetchedImeusweDataLength(response?.payload?.data?.length);

    if (page === 1) {
      setDeepSearchMembers(response?.payload?.data || []);
    } else {
      setDeepSearchMembers(prev => [
        ...prev,
        ...(response?.payload?.data || []),
      ]);
    }
    setIsLoading(false);
  };
  const fetchTreeUsers = async (page = 1) => {
    setIsLoading(true);
    const payload = {
      page: page.toString(),
      communityId: communityId,
    };
    const response = await dispatch(fetchTreeMember(payload));
    setLastfetchedTreeDataLength(response?.payload?.data?.length);
    if (page === 1) {
      setDefaultMembers(response?.payload?.data || []);
    } else {
      setDefaultMembers(prev => [...prev, ...(response?.payload?.data || [])]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (communityId) {
      fetchTreeUsers();
    }
    return () => {
      setLastfetchedTreeDataLength(null);
      setLastfetchedImeusweDataLength(null);
      setDefaultMembers([]);
      setDeepSearchMembers([]);
      setQuery('');
    };
  }, [communityId]);

  const handleLoadMore = () => {
    if (query) {
      if (!isLoading && lastfetchedImeusweDataLength === 25) {
        fetchImeusweUsers(deepSearchPage + 1, query);
        setDeepSearchPage(prev => prev + 1);
      }
    } else {
      if (!isLoading && lastfetchedTreeDataLength === 10) {
        fetchTreeUsers(defaultPage + 1);
        setDefaultPage(prev => prev + 1);
      }
    }
  };

  // Function to format the message with the link
  const formatMessage = generatedLink => {
    return `Check out this Community Group on iMeUsWe - ${communityData?.communityName} 
Connect with like-minded individuals who share similar values, interests, and more. 
${generatedLink}`;
  };

  // Generate Invite Link
  const handleCopyLink = async () => {
    const apiUrl = `/shareCommunityLink/${communityId}`;
    const res = await Axios.get(apiUrl);
    if (res?.data?.data) {
      const generatedLink = res?.data?.data;
      const message = formatMessage(generatedLink);
      Clipboard.setString(message);
      Toast.show({
        type: 'success',
        text1: toastMessages?.['5008'],
      });
    }
  };

  const handleShareVia = async () => {
    const apiUrl = `/shareCommunityLink/${communityId}`;
    const res = await Axios.get(apiUrl);

    const generatedLink = res?.data?.data;
    const message = formatMessage(generatedLink);
    const options = {
      title: `Invite Community Members`,
      message,
      subject: 'Invite Community Members',
      failOnCancel: false,
    };

    const result = await Share.open(options);
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: toastMessages?.['5009'],
      });
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleAddMemberBtn = () => {
    navigation.navigate('InviteToCommunity'); // Make sure to have a SearchScreen defined in your navigation
  };

  const pageIsFocused = useIsFocused();

  return (
    <>
      <GlobalHeader
        heading={'Invite to Community'}
        onBack={goBack}
        backgroundColor={theme.colors.backgroundCreamy}
      />
      <SafeAreaView
        style={{flex: 1, backgroundColor: theme.colors.backgroundCreamy}}>
        <ScrollView bounces={false}>
          <View style={styles.container}>
            {/* Header*/}

            <View style={styles.mainContainer}>
              {/* Heading For Share Options */}
              <View>
                <Text variant="bold" style={styles.shareHeading}>
                  Share externally
                </Text>
              </View>

              {/* Copy Link Button */}
              <View style={styles.centerBtn}>
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
                    accessibilityLabel="Copy link to invite members"
                    onPress={handleCopyLink}>
                    <CopyLinkIcon />
                    <Text variant="bold" style={styles.shareText}>
                      Copy Link
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Share Via Button */}
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
                    accessibilityLabel="Share link via other apps"
                    onPress={handleShareVia}>
                    <ShareViaIcon />
                    <Text variant="bold" style={styles.shareText}>
                      Share via...
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View
                accessibilityLabel="Divider"
                style={[
                  styles.divider,
                  {borderBottomColor: theme.colors.lightText},
                ]}></View>

              {/* Heading For Share Through App */}
              <View>
                <Text
                  variant="bold"
                  style={styles.shareHeading}
                  accessibilityLabel="Add family tree or iMeUsWe members">
                  Add family tree or iMeUsWe members
                </Text>

                {/* Add Members Button */}
                <View style={styles.centerBtn}>
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
                      accessibilityLabel="Add members"
                      onPress={handleAddMemberBtn}>
                      <PlusIcon size={24} />
                      <Text variant="bold" style={styles.shareText}>
                        Add members
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundCreamy,
    paddingHorizontal: 10,
  },
  headerContainer: {
    height: 77,
  },
  emptyStateText: {fontSize: 22},
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
  },

  mainContainer: {marginHorizontal: 10},
  searchBarContainer: {width: '100%', marginBottom: 20, marginTop: 5},
  FlatListContainerStyle: {paddingBottom: 200, paddingRight: 5},
  shareHeading: {
    fontSize: 18,
    lineHeight: 28.26,
    marginVertical: 10,
    marginBottom: 15,
  },
  shareButtons: {
    width: '95%',
    height: 48,

    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.colors.primaryOrange,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  centerBtn: {justifyContent: 'center', alignItems: 'center'},
  shareText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  divider: {borderBottomWidth: 0.9, marginBottom: 10, marginTop: 20},
});

export default InviteScreen;
