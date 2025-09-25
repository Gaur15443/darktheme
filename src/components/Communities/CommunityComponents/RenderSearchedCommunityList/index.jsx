import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { DefaultImage } from '../../../../core';
import { useNavigation } from '@react-navigation/native';
import {
  PrivateCommunityIcon,
  PublicCommunityIcon,
  RedSmallCheckMark,
  TimerIcon,
} from '../../../../images';
import NewTheme from '../../../../common/NewTheme';
import Axios from '../../../../plugin/Axios';
import Toast from 'react-native-toast-message';
import { cancelCommmunityJoinRequest } from '../../../../store/apps/createCommunity';
import { useDispatch, useSelector } from 'react-redux';
import ProfileImageViewer from '../../../../common/ProfileImageViewer';

import { useQueryClient } from '@tanstack/react-query';
import { updateCommuityJoinStatusCache } from '../../CommunityUtils/updateCommuityJoinStatusCache';
import FastImage from '@d11/react-native-fast-image';

const RenderSearchedCommunityList = ({ item, refetch }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const gotoCommunityDetails = async () => {
    navigation.navigate('CommunityDetails', {
      item: item,
      search: true,
    });
  };
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );

  const [requestStatus, setRequestStatus] = useState(
    item?.userJoined === 'REQUESTED'
      ? 'Requested'
      : item?.userJoined === 'ACTIVE'
        ? 'Joined'
        : 'Join',
  );

  useEffect(() => {
    setRequestStatus(
      item?.userJoined === 'REQUESTED'
        ? 'Requested'
        : item?.userJoined === 'ACTIVE'
          ? 'Joined'
          : 'Join',
    );
  }, [item?.userJoined]);

  const handleJoinCommunity = async requestStatus => {
    if (loading) return; // Prevent multiple clicks

    setLoading(true);
    if (requestStatus === 'Join') {
      const apiUrl = `/userCommunityJoinRequest/${item?._id}`;
      const res = await Axios.put(apiUrl);

      if (res.status === 200) {
        if (item?.privacyType === 'Private') {
          updateCommuityJoinStatusCache(queryClient, item, 'REQUESTED');
          setRequestStatus('Requested');
          Toast.show({
            type: 'success',
            text1: toastMessages?.['5002'],
          });
        } else {
          updateCommuityJoinStatusCache(queryClient, item, 'ACTIVE');

          setRequestStatus('Joined');
          Toast.show({
            type: 'success',
            text1: toastMessages?.['5003'],
          });
        }
      }
    }
    if (requestStatus === 'Requested') {
      const result = await dispatch(
        cancelCommmunityJoinRequest(item?._id),
      ).unwrap();

      if (result?.success) {
        updateCommuityJoinStatusCache(queryClient, item, 'INACTIVE');

        setRequestStatus('Join');
      }
    }
    setLoading(false);
  };

  return (
    <View
      key={item._id}
      style={{
        backgroundColor: theme.colors.onWhite100,
        // elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: {width: 0, height: 2},
        // shadowOpacity: 0.22,
        // shadowRadius: 2.22,
        marginVertical: 6,
        borderRadius: 8,
        paddingVertical: 5,
        borderWidth: 1.3,
        borderColor: '#dbdbdb',
      }}>
      <TouchableOpacity style={styles.wrapper} onPress={gotoCommunityDetails}>
        <View style={styles.topContainer}>
          <View style={styles.profilePicContainer}>
            {item?.logoUrl ? (
              <ProfileImageViewer uri={item?.logoUrl} size={40} />
            ) : (
              <FastImage style={styles.profilePic} source={{ uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityDefaultImage.png' }} />
            )}
          </View>
          <View style={styles.communityTitleContainer}>
            <Text
              accessible={true}
              variant="bold"
              style={[styles.communityTitle, { color: theme.colors.text, paddingTop: 4 }]}
              numberOfLines={2}>
              {item?.communityName ? item?.communityName : item?.name}
            </Text>
            <View style={styles.subTextContainer}>
              {item?.privacyType && (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 4,
                    alignItems: 'center',
                    width: 90,
                  }}>
                  {item?.privacyType === 'Public' ? (
                    <PublicCommunityIcon />
                  ) : (
                    <PrivateCommunityIcon />
                  )}
                  <Text
                    accessible={true}
                    style={[
                      styles.communitySubtitle,
                      { color: NewTheme.colors.primaryOrange },
                    ]}>
                    {item.privacyType}
                  </Text>
                </View>
              )}
              <Text
                style={[
                  styles.communitySubtitle,
                  { color: theme.colors.onSurfaceVariant, fontSize: 14 },
                ]}>
                {item?.membersCount && (
                  <Text accessible={true}>
                    {`${item.membersCount} ${item.membersCount === 1 ? 'Member' : 'Members'}`}
                  </Text>
                )}
              </Text>
            </View>
          </View>
          <View style={styles.checkMark}>
            {/* Join Button */}

            <View style={{ borderRadius: 6 }}>
              <TouchableOpacity
                onPress={() => handleJoinCommunity(requestStatus)}
                hitSlop={{ top: 10, bottom: 20, left: 20, right: 20 }}
                style={{
                  backgroundColor:
                    requestStatus === 'Join'
                      ? NewTheme.colors.primaryOrange
                      : NewTheme.colors.secondaryLightPeach,
                  width:
                    requestStatus === 'Join'
                      ? 46
                      : requestStatus === 'Joined'
                        ? 56
                        : 100,
                  height: 26,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 5,
                  flexDirection: 'row',
                  marginVertical: 0,
                  borderRadius: 6,
                  overflow: 'hidden',
                  pointerEvents: requestStatus === 'Joined' ? 'none' : 'auto',
                }}
                accessibilityLabel={`${requestStatus}-button`}
                accessibilityRole="button">
                <Text
                  style={{
                    color:
                      requestStatus === 'Join'
                        ? 'white'
                        : NewTheme.colors.primaryOrange,
                    fontSize: 12,
                    lineHeight: 17.63,
                  }}>
                  {requestStatus}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text style={{ fontSize: 10, alignSelf: 'flex-start' }} numberOfLines={2}>
          {item?.communityDescription}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'column',
    alignItems: 'center',
    height: 'auto',
    overflow: 'hidden',
  },
  topContainer: {
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 'auto',
    overflow: 'hidden',
  },
  profilePicContainer: { marginRight: 5, minWidth: 10 },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultProfilePic: { marginRight: 4 },
  communityTitleContainer: { flex: 4 },
  communityTitle: {
    fontSize: 18,
    lineHeight: 20,
  },

  communitySubtitle: {
    fontSize: 12,
    lineHeight: 19.06,
  },
  subTextContainer: {
    flexDirection: 'row',
    height: 22,
    alignItems: 'center',
  },
  checkMark: {
    marginRight: 5,
  },
});
export default RenderSearchedCommunityList;
