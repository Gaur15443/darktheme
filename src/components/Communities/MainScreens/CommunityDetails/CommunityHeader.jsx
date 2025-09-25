import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  // TouchableOpacity,
  Animated,
} from 'react-native';
import { Text } from 'react-native-paper';
import {
  TimerIcon,
  PlusIcon,
  ThreeDotHorizontal,
  CommunityJoiningRequestIcon,
  BackArrowIcon,
} from '../../../../images';
import { useNavigation } from '@react-navigation/native';
import theme from '../../../../common/NewTheme';
import NewTheme from '../../../../common/NewTheme';
import { DefaultImage } from '../../../../core';
import ProfileImageViewer from '../../../../common/ProfileImageViewer';
import LottieView from 'lottie-react-native';
import FastImage from '@d11/react-native-fast-image';
import { Pressable as TouchableOpacity } from 'react-native-gesture-handler';

const CommunityHeader = ({
  communityId,
  logoUrl,
  communityName,
  membersCount,
  communityDescription,
  avatars,
  goBack,
  category,
  handleJoinCommunity,
  requestStatus,
  loggedInMemberData,
  onClickOpenBottomSheet,
  scrolled,
  animatedHeaderHeight,
  privacyType,
  handleOpenBottomSheet,
  setDescriptionHeight,
  setTitleHeight,
  onClickOpenNotificationBottomSheet,
}) => {
  const navigation = useNavigation();
  const cleanedCategory = category?.replace(/[~()]/g, '');
  // Handler to calculate text height
  const handleTextLayout = event => {
    const { height } = event.nativeEvent.layout;
    setDescriptionHeight(height);
  };

  const handleTextLayoutTwo = event => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const gotoManageMembers = () => {
    navigation.navigate('ManageCommunityMembers');
  };

  return (
    <>
      <View style={styles.headerShadow}>
        <FastImage
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityHeaderBackground.png',
          }}
          style={styles.backgroundImage}>
          <Animated.View
            style={[
              styles.headerContainer,
              {paddingBottom: 10},
              {
                paddingTop: 30,
                paddingHorizontal: 15,
              },
            ]}>
            <>
              {/*  When not scrolled, show full details */}
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={() => goBack()}
                accessibilityLabel="GoBack"
                accessibilityRole="button">
                <BackArrowIcon />
              </TouchableOpacity>
              <View style={styles.detailsContainer}>
                {/* Community Logo */}
                <View>
                  {typeof logoUrl === 'string' ? (
                    <ProfileImageViewer uri={logoUrl} size={60} />
                  ) : (
                    <FastImage
                      style={styles.logo}
                      source={{
                        uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityDefaultImage.png',
                      }}
                      accessibilityLabel="Community-logo"
                    />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      variant="bold"
                      style={styles.communityName}
                      onLayout={handleTextLayoutTwo}
                      accessibilityLabel={`CommunityName-${communityName}`}>
                      {communityName}
                    </Text>
                    {loggedInMemberData?.memberStatus === 'ACTIVE' && (
                      <View style={{borderRadius: 10, marginRight: 8}}>
                        <TouchableOpacity
                          onPress={onClickOpenNotificationBottomSheet}
                          style={{
                            backgroundColor: 'white',
                            width: 28,
                            height: 28,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                            overflow: 'hidden',
                          }}
                          accessibilityLabel="CommunityNotificationBell"
                          accessibilityRole="button">
                          <LottieView
                            source={require('../../../../animation/lottie/mute.json')}
                            autoPlay
                            loop
                            style={{height: 40, width: 40}}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    {loggedInMemberData?.memberStatus === 'ACTIVE' && (
                      <View style={{borderRadius: 10}}>
                        <TouchableOpacity
                          onPress={onClickOpenBottomSheet}
                          style={{
                            backgroundColor: 'white',
                            width: 28,
                            height: 28,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                            overflow: 'hidden',
                          }}
                          accessibilityLabel="ThreeDotHorizontal"
                          accessibilityRole="button">
                          <ThreeDotHorizontal />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 4,
                      padding: 4,
                      maxWidth: 'auto',
                      alignSelf: 'flex-start',
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: NewTheme.colors.primaryOrange,
                      }}
                      accessibilityLabel={`Category-${cleanedCategory}`}>
                      {cleanedCategory}
                    </Text>
                  </View>
                </View>
              </View>
              {communityDescription?.length > 0 && (
                <Text
                  style={{fontSize: 12, color: 'black'}}
                  onLayout={handleTextLayout}>
                  {communityDescription}
                </Text>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 5,
                }}>
                {/* Members Count And Avatars */}
                <TouchableOpacity
                  onPress={gotoManageMembers}
                  style={{flexDirection: 'row'}}
                  hitSlop={{top: 20, bottom: 20, left: 30, right: 30}}>
                  <View style={styles.avatarContainer}>
                    {avatars?.map((avatar, index) =>
                      avatar?.profilepic ? (
                        <Image
                          key={avatar.id}
                          source={{uri: avatar.profilepic}}
                          style={[
                            styles.avatar,
                            {
                              left: index * 12,
                              zIndex: avatars?.length + index,
                            },
                          ]}
                          accessibilityLabel={`${avatar.name}'s-profile-picture`}
                        />
                      ) : (
                        <DefaultImage
                          key={avatar.id}
                          firstName={avatar?.name}
                          lastName={avatar?.lastname}
                          gender={avatar?.gender}
                          size={20}
                          style={{
                            left: index * 12,
                            zIndex: avatars?.length + index,
                            position: 'absolute',
                          }}
                          accessibilityLabel={`${avatar?.name}-${avatar?.lastname}-default-image`}
                        />
                      ),
                    )}
                  </View>

                  <Text
                    style={[
                      styles.subText,
                      {
                        marginLeft:
                          avatars?.length > 0 ? avatars?.length * 12 + 15 : 0, // Adjust margin based on number of avatars
                      },
                    ]}
                    accessibilityLabel={`Members-count-${membersCount || 0}`}>
                    {membersCount
                      ? `${membersCount} ${membersCount === 1 ? 'Member' : 'Members'}`
                      : '0 Community Members'}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {/* Join Button */}
                  {loggedInMemberData?.memberStatus !== 'ACTIVE' && (
                    <View style={{borderRadius: 6}}>
                      <TouchableOpacity
                        onPress={() => handleJoinCommunity(requestStatus)}
                        style={{
                          backgroundColor:
                            requestStatus === 'Join'
                              ? theme.colors.primaryOrange
                              : 'white',
                          width: requestStatus === 'Join' ? 56 : 138,
                          height: 28,
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 5,
                          flexDirection: 'row',
                          marginVertical: 0,
                          borderRadius: 6,
                          overflow: 'hidden',
                        }}
                        accessibilityLabel={`${requestStatus}-button`}
                        accessibilityRole="button">
                        {requestStatus === 'Requested' && <TimerIcon />}
                        <Text
                          style={{
                            color:
                              requestStatus === 'Join'
                                ? 'white'
                                : theme.colors.primaryOrange,
                            fontSize: 15,
                            lineHeight: 17.63,
                          }}>
                          {requestStatus}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Community Requests Buttons */}
                  <View style={{flexDirection: 'row', marginRight: 10}}>
                    {loggedInMemberData?.memberRole === 'Admin' &&
                      privacyType === 'Private' && (
                        <View style={{borderRadius: 6}}>
                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate('CommunityJoiningRequests');
                            }}
                            accessibilityLabel="Community-joining-requests"
                            accessibilityRole="button"
                            style={{
                              backgroundColor: 'white',
                              width: 28,
                              height: 28,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 6,
                              overflow: 'hidden',
                            }}>
                            <CommunityJoiningRequestIcon size={11.2} />
                          </TouchableOpacity>
                        </View>
                      )}
                  </View>

                  {/* Create Post Button */}
                  {loggedInMemberData?.memberRole &&
                    loggedInMemberData?.memberStatus === 'ACTIVE' && (
                      <>
                        <View style={{borderRadius: 6}}>
                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate('CreateCommunityPosts', {
                                fromScreen: 'insideCommunity',
                                communityDetails: {
                                  _id: communityId,
                                  communityName: communityName,
                                  logoUrl: logoUrl,
                                },
                              });
                            }}
                            style={{
                              backgroundColor: 'white',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'row',
                              borderRadius: 6,
                              overflow: 'hidden',
                            }}
                            accessibilityLabel="Create-new-post"
                            accessibilityRole="button">
                            {/* <View style={{flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', padding: 10}}>
                              <PlusIcon size={16} />
                              <Text
                                style={{
                                  color: theme.colors.primaryOrange,
                                  fontSize: 15,
                                  lineHeight: 18,
                                }}>
                                Create Post
                              </Text>
                              </View> */}
                            <View
                              style={{
                                flexDirection: 'row',
                                gap: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 10,
                              }}>
                              <PlusIcon size={16} />
                              <Text
                                style={{
                                  color: theme.colors.primaryOrange,
                                  fontSize: 15,
                                  lineHeight: 18,
                                }}>
                                Create Post
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                </View>
              </View>
            </>
          </Animated.View>
        </FastImage>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'space-between',
  },
  headerShadow: {
    // elevation: 7,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.22,
    // shadowRadius: 2.22,
    zIndex: 2,
    backgroundColor: 'white',
  },
  backgroundImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  headerIcon: { width: 28, height: 28, marginTop: 15 },
  stickyHeader: {
    flexDirection: 'row',
    height: 50,
    gap: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5,
    gap: 7,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { gap: 5, flex: 1 },
  headerTitle: { fontSize: 24 },
  communityNameSticky: {
    fontSize: 18,
    flex: 1,
    color: 'black',
  },
  communityName: {
    fontSize: 22,
    lineHeight: 26,
    color: 'black',
    flex: 1,
  },
  subText: {
    fontSize: 12,
    lineHeight: 14.1,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
    paddingTop: 25,
  },
  title: {
    color: '#ffff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  card: {
    height: 300,
    backgroundColor: '#E6DDC4',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  subtitle: {
    color: '#181D31',
    fontWeight: 'bold',
  },
});

export default CommunityHeader;
