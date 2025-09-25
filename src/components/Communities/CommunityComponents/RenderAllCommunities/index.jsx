import { axios } from 'axios';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { DefaultImage } from '../../../../core';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import { NewTag } from '../../../../images';
import { markCommunityAsSeen } from '../../../../api';
import { useQueryClient } from '@tanstack/react-query';
import { Shadow } from 'react-native-shadow-2';
import FastImage from '@d11/react-native-fast-image';

function ShadowWrapper({ children }) {
  return (
    <Shadow
      distance={0}
      // startColor="rgba(0, 0, 0, 0.2)"
      // offset={[0, 1]}
      // radius={1.41}
      style={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      containerStyle={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {children}
    </Shadow>
  );
}

const RenderAllCommunities = ({
  item,
  closeDrawer,
  selectedCommunity = () => { },
  screen = 'default',
  setRefresh,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const gotoCommunityDetails = async () => {
    closeDrawer();
    if (item?.recentlyJoined && screen === 'drawer') {
      markCommunityAsSeen({ communityId: item._id });

      queryClient.invalidateQueries({
        queryKey: ['userJoinedCommunities'],
      });
    }

    navigation.navigate('CommunityDetails', {
      item: item,
      onGoBack: data => setRefresh(data),
    });
  };

  return (
    <ErrorBoundary>
      <View
        accessibilityLabel={`Community card for ${item?.communityName || item?.name}`}
        key={item._id}
        style={[
          {
            backgroundColor: theme.colors.onWhite100,
            // elevation: 2,
            // shadowColor: '#000',
            // shadowOffset: {width: 0, height: 2},
            // shadowOpacity: 0.22,
            // shadowRadius: 2.22,
            borderRadius: 8,
            marginVertical: 3,
            borderWidth: 1,
            borderColor: '#dbdbdb',
          },
        ]}>
        <ShadowWrapper>
          <TouchableOpacity
            style={[styles.wrapper, { backgroundColor: '#ffff' }]}
            onPress={() => {
              screen === 'communitySelector'
                ? selectedCommunity(item)
                : gotoCommunityDetails();
            }}
            accessibilityLabel={`Go to ${item?.communityName || item?.name}`}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: '20%',
                  justifyContent: 'center',
                  padding: 5,
                }}>
                <View
                  style={[styles.profilePicContainer, { position: 'relative' }]}>
                  {item?.logoUrl ? (
                    <Image
                      style={styles.profilePic}
                      source={{ uri: item?.logoUrl }}
                      accessibilityLabel={`${item?.communityName || item?.name} community logo`}
                    />
                  ) : (
                    <FastImage
                      style={styles.profilePic}
                      source={{
                        uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityDefaultImage.png',
                      }}
                      accessibilityLabel="Default community logo"
                    />
                  )}

                  {item?.recentlyJoined && screen === 'drawer' && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -3,
                        left: '10%',
                      }}>
                      <NewTag />
                    </View>
                  )}
                </View>
              </View>
              <View
                style={{ width: '65%', padding: 5, justifyContent: 'center' }}>
                <View style={styles.communityTitleContainer}>
                  <Text
                    variant="bold"
                    accessible={true}
                    accessibilityLabel={`Community name: ${item?.communityName || item?.name}`}
                    style={[styles.communityTitle, { color: theme.colors.text }]}
                    numberOfLines={2}>
                    {item?.communityName ? item?.communityName : item?.name}
                  </Text>
                  {item?.membersCount && (
                    <Text
                      accessibilityLabel={`Number of members: ${item?.membersCount}`}
                      accessible={true}
                      style={[
                        styles.communitySubtitle,
                        { color: theme.colors.onSurfaceVariant },
                      ]}>
                      {item?.membersCount}{' '}
                      {item?.membersCount === 1 ? 'member' : 'members'}
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={{
                  width: '15%',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                {item?.countNotifications > 0 && screen === 'drawer' && (
                  <View style={styles.countNotificationsView}>
                    <Text style={styles.countNotificationText}>
                      {item?.countNotifications}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </ShadowWrapper>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profilePicContainer: {},
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultProfilePic: { marginRight: 4 },
  communityTitleContainer: {},
  communityTitle: {
    fontSize: 16,
    lineHeight: 20,
  },

  communitySubtitle: {
    fontSize: 12,
    lineHeight: 19.06,
    marginTop: 2,
  },
  countNotificationsView: {
    backgroundColor: 'red',
    borderRadius: 30,
    boderWidth: 1,
    borderColor: 'red',
    // padding: 2
    // paddingHorizontal: 1,
    // paddingVertical: 1,
  },
  countNotificationText: {
    color: '#ffff',
    fontSize: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
export default RenderAllCommunities;