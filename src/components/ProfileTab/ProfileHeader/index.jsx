import React, {memo, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {DefaultImage} from '../../../core';
import {SettingIcon} from '../../../images';
import {Avatar, Text} from 'react-native-paper';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import ProgressBar from '../ProgressBar';
import {useTheme} from 'react-native-paper';
import {progressBarData} from '../../../store/apps/progressBar';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
 
import {getUserInfo} from '../../../store/apps/userInfo';
import Toast from 'react-native-toast-message';
import NewTheme from '../../../common/NewTheme';
import ProfileImage from '../../../common/ProfileImageViewer';
import {desanitizeInput} from '../../../utils/sanitizers';

const ProfileHeader = ({
  children,
  showIcon = true,
  showProgress = true,
  showContentCenter = false,
  isTop = 50,
  refresh,
}) => {
  const navigation = useNavigation();
  const userInfo = useSelector(state => state?.userInfo);
  // const userInfo?._id = useSelector(
  //   state => state?.fetchUserProfile?.data?.myProfile?._id,
  // );
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userInfo?._id]?.myProfile,
  );
  const percentage = useSelector(
    state => state?.apiProgressBar?.data?.profileProgresscount,
  );
 
  const dispatch = useDispatch();
  const progressPercent = parseInt(percentage, 10);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userInfo?._id) {
          await dispatch(getUserInfo()).unwrap();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching user info:',
          text2: error,
        });
      }
    };
 
    fetchUserData();
    if (userInfo?._id) {
      fetchProgressBarData();
    }
  }, [dispatch, userInfo?._id]);
 
  const fetchProgressBarData = async () => {
    try {
      setLoading(true);
      await dispatch(
        progressBarData({
          userId: userInfo?._id,
          clinkowner: null,
        }),
      ).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false); // Set loading to false after API call completes
    }
  };
 
  // useEffect(() => {
  //   try {
  //     const getUserDetails = async () => {
  //       await dispatch(fetchUserProfile(userInfo?._id)).unwrap();
  //     };
  //     if (userInfo?._id) {
  //       getUserDetails();
  //     }
  //   } catch (error) {
  //     Toast.show({
  //       type: 'error',
  //       text1: error.message,
  //     });
  //   }
  // }, []);
 
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const getUserDetails = async () => {
            await dispatch(fetchUserProfile(userInfo?._id)).unwrap();
          };
          if (userInfo?._id) {
            getUserDetails();
          }
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      };
 
      fetchData();
 
      /* customer io event chagnes  end */
    }, []),
  );
 
  const GotoAccountSettings = () => {
    navigation.navigate('AccountSettings');
  };
 
  const name = userInfo?.personalDetails?.name || '';
  const middleName = userInfo?.personalDetails?.middlename || '';
  const lastName = userInfo?.personalDetails?.lastname || '';
 
  const fullName = `${name}${middleName ? ` ${middleName}` : ''} ${lastName}`;
 
  const truncatedFullName =
    fullName.length > 18 ? `${fullName.slice(0, 18)}...` : fullName;
 
  const {top} = useSafeAreaInsets();
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={{
          paddingTop:
            Platform.OS === 'ios' ? 0 : top,
          backgroundColor: theme.colors.background,
        }}>
        <View
          style={[
            styles.header,
            showContentCenter
              ? {backgroundColor: theme.colors.background}
              : null,
          ]}>
          <View
            style={{
              // position: 'relative',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                justifyContent: showContentCenter ? 'center' : null,
              }}>
              {showProgress && (
                <View>
                  {userInfo?.personalDetails?.profilepic ? (
                    <View
                      style={{position: 'relative'}}
                      accessibilityLabel={`${userInfo?.personalDetails?.name}-profilepic`}>
                      {loading ? (
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                          style={styles.loader}
                        />
                      ) : (
                        <ProgressBar propercentage={progressPercent}>
                          <ProfileImage
                            uri={
                              userInfo?.personalDetails?.profilepic ||
                              basicInfo?.personalDetails?.profilepic
                            }
                            size={45}
                            style={{
                              borderWidth: 3,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'white',
                            }}
                          />
                        </ProgressBar>
                      )}
                    </View>
                  ) : (
                    <View style={{position: 'relative'}}>
                      {loading ? (
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                          style={styles.loader}
                        />
                      ) : (
                        <ProgressBar propercentage={progressPercent}>
                          <DefaultImage
                            size={64}
                            firstName={userInfo?.personalDetails?.name || ''}
                            lastName={userInfo?.personalDetails?.lastname || ''}
                            gender={userInfo?.personalDetails?.gender || ''}
                          />
                        </ProgressBar>
                      )}
                    </View>
                  )}
                </View>
              )}

              {!showProgress && (
                <View
                  accessibilityLabel={`${userInfo?.personalDetails?.name}-profilepic`}>
                  {userInfo?.personalDetails?.profilepic ? (
                    <Avatar.Image
                      size={45}
                      source={{uri: userInfo?.personalDetails?.profilepic}}
                      style={{
                        borderWidth: 3,
                        borderColor: 'rgb(41, 221, 69)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  ) : (
                    <DefaultImage
                      size={64}
                      firstName={userInfo?.personalDetails?.name}
                      lastName={userInfo?.personalDetails?.lastname}
                      gender={userInfo?.personalDetails?.gender}
                    />
                  )}
                </View>
              )}
              <View style={styles.userInfoContainer}>
                  <Text
                    style={styles.headerText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    accessibilityLabel={`fullname-${fullName}`}>
                    {desanitizeInput(fullName)}
                  </Text>
 
                  {showProgress && percentage && (
                    <Text
                      style={{
                        color: NewTheme.colors.secondaryLightBlue,
                        fontWeight: 700,
                        marginLeft: 16,
                      }}
                      accessibilityLabel={`${progressPercent}-Completion`}>
                      {`${progressPercent}%`} Completion
                    </Text>
                  )}
                {children}
              </View>
            </View>
            {showIcon && (
              <TouchableOpacity
                onPress={() => GotoAccountSettings()}
                activeOpacity={1}
                style={{position: 'absolute', right: 10}}>
                <SettingIcon
                  onPress={() => GotoAccountSettings()}
                  accessibilityLabel="SettingIcon"
                  style={{margin: 6}}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    // Padding to account for status bar on Android and iOS
    paddingTop: Platform.OS === 'ios' ? 0 :  0,
    // SafeAreaView does not automatically account for notch, so set this manually if needed
    paddingBottom: Platform.OS === 'ios' ? 10 : '1%',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  headerText: {
    color: 'black',
    fontSize: 20,
    marginLeft: 16,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flex: 1,
    paddingRight: 50,
    overflow: 'hidden',
  },
});
 
export default memo(ProfileHeader);