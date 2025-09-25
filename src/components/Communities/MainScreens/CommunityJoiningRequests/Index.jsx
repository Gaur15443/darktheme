import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useRef, useState} from 'react';
import BasicCustomCommunityHeader from '../../CommunityComponents/BasicCustomCommunityHeader';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {FlatList} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {
  getCommunityJoiningRequests,
  manageMemberRequest,
} from '../../../../store/apps/getCommunityJoiningRequests';
import RenderMemberList from '../../CommunityComponents/RenderMemberList';
import Toast from 'react-native-toast-message';
import {ActivityIndicator, useTheme} from 'react-native-paper';
import theme from '../../../../common/NewTheme';
import {GlobalHeader} from '../../../../components';
import {Track} from '../../../../../App';
import {useGetCommunityJoiningRequests} from '../../../../store/apps/communitiesApi';
import Spinner from '../../../../common/Spinner';

const CommunityJoiningRequests = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );
  const communityDetails = useSelector(
    state => state?.getCommunityDetails?.communityDetails,
  );
  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCommunityJoiningRequests(communityDetails?.data?._id);
  const members = data?.pages?.flatMap(page => page.data) || [];

  const [allRequests, setAllRequests] = useState(members);

  const userData = useSelector(state => state?.userInfo);

  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    if (allRequests.length === 0 && !isLoading) {
      const timer = setTimeout(() => setShowEmptyState(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowEmptyState(false);
    }
  }, [allRequests, isLoading]);

  useEffect(() => {
    if (members.length > 0) setAllRequests(members);
  }, [data]);

  const handleAcceptDecline = async (action, memberdata) => {
    const payload = {
      communityId: communityDetails?.data?._id,
      action,
      memberId: memberdata?.memberId,
    };
    const res = await dispatch(manageMemberRequest(payload)).unwrap();
    if (res.success) {
      setAllRequests(prevRequests =>
        prevRequests.filter(
          request => request.memberId !== memberdata.memberId,
        ),
      );
      if (action === 'accept') {
        /* customer io and mixpanel event changes  start */
        const props = {
          community_name: communityDetails?.data?.communityName,
          category: communityDetails?.data?.category?.categoryName,
          invite_firstname: memberdata?.member?.personalDetails?.name,
          invite_lastname: memberdata?.member?.personalDetails?.lastname,
        };
        Track({
          cleverTapEvent: 'Accept_Pending_Request',
          mixpanelEvent: 'Accept_Pending_Request',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });
        /* clevertap io and mixpanel event chagnes  end */
        Toast.show({
          type: 'success',
          text1: toastMessages?.['5004'],
        });
      } else {
        /* Clevertap io and mixpanel event changes  start */
        const props = {
          community_name: communityDetails?.data?.communityName,
          category: communityDetails?.data?.category?.categoryName,
          invite_firstname: memberdata?.member?.personalDetails?.name,
          invite_lastname: memberdata?.member?.personalDetails?.lastname,
        };
        Track({
          cleverTapEvent: 'Decline_Pending_Request',
          mixpanelEvent: 'Decline_Pending_Request',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });
        /* clevertap io and mixpanel event chagnes  end */
        Toast.show({
          type: 'success',
          text1: toastMessages?.['5005'],
        });
      }
    }
    // refresh the list
    refetch();
  };

  const goBack = () => {
    navigation.goBack();
  };

  const RenderEmptyState = () => {
    return (
      <View
        accessibilityLabel="Empty state view"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: 500,
        }}>
        <Text
          style={{fontSize: 22, color: theme.colors.lightText}}
          accessibilityLabel="No requests found text">
          No requests found
        </Text>
      </View>
    );
  };

  const pageIsFocused = useIsFocused();
  return (
    <>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          accessibilityLabel="Loading-spinner">
          <Spinner />
        </View>
      ) : (
        <>
          <GlobalHeader
            heading={'Pending Requests'}
            onBack={goBack}
            backgroundColor={theme.colors.backgroundCreamy}
          />
          <SafeAreaView
            style={{flex: 1, backgroundColor: theme.colors.backgroundCreamy}}>
            <View
              style={styles.container}
              accessibilityLabel="Main container view">
              {/* Header*/}

              {/* Communities List */}
              <FlatList
                data={allRequests}
                keyExtractor={item => item.memberId}
                contentContainerStyle={styles.FlatListContainerStyle}
                ListEmptyComponent={showEmptyState && RenderEmptyState}
                renderItem={item => (
                  <RenderMemberList
                    item={item.item}
                    screenType="CommunityJoiningRequests"
                    handleAcceptDecline={handleAcceptDecline}
                  />
                )}
                onEndReached={
                  hasNextPage && !isFetchingNextPage && fetchNextPage
                }
                ListFooterComponent={() => {
                  if (isFetchingNextPage) {
                    return (
                      <View style={{alignItems: 'center', paddingVertical: 20}}>
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.secondaryLightBlue}
                        />
                      </View>
                    );
                  } else {
                    return null;
                  }
                }}
                accessibilityLabel="Pending requests list"
              />
            </View>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundCreamy,
    paddingHorizontal: 20,
  },
  FlatListContainerStyle: {paddingBottom: 110, paddingHorizontal: 5},
});
export default CommunityJoiningRequests;
