import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Avatar, useTheme, Text } from 'react-native-paper';
import { BasicInfo } from '../../../screens';
import Memories from './Memories';
import Lifestory from './Lifestory';
import { BackIcon } from '../../../images';
import { DefaultImage } from '../../../core';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { progressBarData } from '../../../store/apps/progressBar';
import Toast from 'react-native-toast-message';
import ProgressBar from '../../../components/ProfileTab/ProgressBar';
import { fetchUserProfile } from '../../../store/apps/fetchUserProfile';
import useNativeBackHandler from '../../../hooks/useBackHandler';
import NewTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';
import { resetMemoriesApiDta } from '../../../store/apps/viewMemory';
import Notes from './Notes';
import { SafeAreaView } from 'react-native-safe-area-context';
const ViewMemberDetailsHeader = ({
  selectedMemberData,
  currentTreeDetails,
  reloadTreeCallback,
  fromMemberTab,
  treeId,
  id,
}) => {
  useNativeBackHandler(fromMemberTab ? goBackToMemberTab : goBack);
  const navigation = useNavigation();
  const theme = useTheme();
  const percentage = useSelector(
    state => state?.apiProgressBar?.data?.profileProgresscount,
  );
  const userId = useSelector(state => state?.userInfo?._id);

  const dispatch = useDispatch();

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[id]?.myProfile,
  );
  console.log('basicInfo from viemember details', basicInfo, id);

  const name =
    basicInfo?.personalDetails?.name || selectedMemberData?.data?.name || '';
  const middleName =
    basicInfo?.personalDetails?.middlename ||
    selectedMemberData?.data?.middlename ||
    '';
  const lastName =
    basicInfo?.personalDetails?.lastname ||
    selectedMemberData?.data?.lastname ||
    '';

  const fullName = `${name}${middleName ? ` ${middleName}` : ''} ${lastName}`;
  const truncatedFullName =
    fullName.length > 18 ? `${fullName.slice(0, 18)}...` : fullName;

  const progressPercent = parseInt(percentage, 10);
  const fetchData = async () => {
    try {
      let cloneOwner = null;
      if (basicInfo?.isClone) {
        cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
          ?.linkId?.[0];
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
      }
      await dispatch(
        progressBarData({
          userId: selectedMemberData._id,
          clinkowner: cloneOwner,
        }),
      ).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };
  useEffect(() => {
    if (selectedMemberData?._id) {
      fetchData();
    }
  }, [dispatch, selectedMemberData?._id, basicInfo]);

  useEffect(() => {
    try {
      const getUserDetails = async () => {
        await dispatch(fetchUserProfile(selectedMemberData?._id)).unwrap();
      };
      if (selectedMemberData?._id) {
        getUserDetails();
      }
    } catch (error) { }
  }, []);

  function goBack() {
    dispatch(resetMemoriesApiDta()); // Reset Redux state to allow re-fetch
    const marraigeRelationshipData = {
      _id: basicInfo?._id,
      divorced: [],
    };
    const invidualMarriageRelation = basicInfo?.marriageDetails.map(item => {
      if (item?.relationship !== 'Married') {
        marraigeRelationshipData.divorced.push(item?.spouseId?._id);
        return {
          _id: item?.spouseId?._id,
          divorced: [marraigeRelationshipData?._id],
        };
      } else {
        return {
          _id: item?.spouseId?._id,
          divorced: [],
        };
      }
    });
    invidualMarriageRelation.push(marraigeRelationshipData);
    navigation.navigate('TreeScreen', {
      family: currentTreeDetails?.tree?.name,
      currentTreeDetails: currentTreeDetails,
      role: currentTreeDetails.user.role,
      name: !basicInfo?.personalDetails?.showNickname
        ? basicInfo?.personalDetails?.name +
        ' ' +
        basicInfo?.personalDetails?.lastname
        : basicInfo?.personalDetails?.nickname,
      photo: basicInfo?.personalDetails?.profilepic,
      dateRange: `${basicInfo?.birthDetails?.dob ? new Date(basicInfo?.birthDetails?.dob).getFullYear() : ''} - ${basicInfo?.birthDetails?.dod ? new Date(basicInfo?.birthDetails?.dod).getFullYear() : ''}`,
      reloadTree: false,
      from: 'viewmember',
      marriageData: invidualMarriageRelation,
    });
  }
  const goBackToMemberTab = async () => {
    await dispatch(resetMemoriesApiDta()); // Reset Redux state to allow re-fetch
    navigation.goBack();
  };
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            onPress={fromMemberTab ? goBackToMemberTab : goBack}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            {selectedMemberData?.personalDetails?.profilepic ||
              basicInfo?.personalDetails?.profilepic ? (
              <ProgressBar propercentage={progressPercent}>
                <Avatar.Image
                  size={45}
                  source={{
                    uri:
                      basicInfo?.personalDetails?.profilepic ||
                      selectedMemberData?.personalDetails?.profilepic,
                  }}
                  style={{
                    borderWidth: 3,
                    borderColor: 'rgb(41, 221, 69)',
                    // marginLeft: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </ProgressBar>
            ) : (
              <ProgressBar propercentage={progressPercent}>
                <DefaultImage
                  size={54}
                  firstName={
                    basicInfo?.personalDetails?.name ||
                    selectedMemberData?.personalDetails?.name
                  }
                  lastName={
                    basicInfo?.personalDetails?.lastname ||
                    selectedMemberData?.personalDetails?.lastname
                  }
                  gender={
                    basicInfo?.personalDetails?.gender ||
                    selectedMemberData?.personalDetails?.gender
                  }
                />
              </ProgressBar>
            )}
            <View>
              <Text style={[styles.headerText, { color: theme.colors.text }]}>
                {truncatedFullName}
              </Text>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: 700,
                  marginLeft: 16,
                }}>
                {`${progressPercent}%`} Completion
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const ViewMemberDetails = ({ route }) => {
  const storeId = useSelector(state => state?.userInfo._id);
  const storeTreeId = useSelector(state => state?.userInfo?.treeIdin?.[0]);
  const id = route.params?.id || storeId;
  const treeId = route.params?.treeId || storeTreeId;

  const permission =
    route.params?.permission !== undefined ? route.params.permission : true;

  const [selectedTab, setSelectedTab] = useState('Lifestory');
  const { width } = Dimensions.get('window');

  const renderContent = () => {
    switch (selectedTab) {
      case 'BasicInfo':
        return <BasicInfo id={id} permission={permission} />;
      case 'Memories':
        return <Memories id={id} treeId={treeId} permission={permission} />;
      case 'Lifestory':
        return <Lifestory id={id} treeId={treeId} permission={permission} />;
      case 'Notes':
        return <Notes id={id} treeId={treeId} permission={permission} />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary.Screen>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View>
            <View
              style={{
                flex: 1,
                width: width - 15,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingVertical: 15,
                  width: '100%',
                  alignSelf: 'center',
                }}>
                {/* Lifestory Tab */}
                <View
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    marginHorizontal: 5,

                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                  }}>
                  <TouchableOpacity
                    testID="view-lifestory"
                    onPress={() => setSelectedTab('Lifestory')}
                    style={{
                      flex: 1,
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                    activeOpacity={1}>
                    <Text
                      variant={
                        selectedTab === 'Lifestory' ? 'bold' : 'labelMedium'
                      }
                      style={{
                        textAlign: 'center',
                        textAlignVertical: 'center',

                        color:
                          selectedTab === 'Lifestory'
                            ? NewTheme.colors.backgroundWhite
                            : NewTheme.colors.primaryOrange,
                        backgroundColor:
                          selectedTab === 'Lifestory'
                            ? NewTheme.colors.primaryOrange
                            : NewTheme.colors.secondaryLightPeach,
                        paddingVertical: 10,
                        borderRadius: 6,
                      }}>
                      Lifestory
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Basic Info Tab */}
                <View
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    marginHorizontal: 5,

                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                  }}>
                  <TouchableOpacity
                    testID="view-basicinfo"
                    onPress={() => setSelectedTab('BasicInfo')}
                    style={{
                      flex: 1,
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                    activeOpacity={1}>
                    <Text
                      // variant={
                      //   selectedTab === 'BasicInfo' ? 'bold' : 'labelMedium'
                      // }
                      style={{
                        textAlign: 'center',
                        textAlignVertical: 'center',

                        color:
                          selectedTab === 'BasicInfo'
                            ? NewTheme.colors.backgroundWhite
                            : NewTheme.colors.primaryOrange,
                        backgroundColor:
                          selectedTab === 'BasicInfo'
                            ? NewTheme.colors.primaryOrange
                            : NewTheme.colors.secondaryLightPeach,
                        paddingVertical: 10,
                        borderRadius: 6,
                      }}>
                      Info
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Memories Tab */}
                <View
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    marginHorizontal: 5,

                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                  }}>
                  <TouchableOpacity
                    testID="view-memories"
                    onPress={() => setSelectedTab('Memories')}
                    style={{
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                    activeOpacity={1}>
                    <Text
                      // variant={
                      //   selectedTab === 'Memories' ? 'bold' : 'labelMedium'
                      // }
                      style={{
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        color:
                          selectedTab === 'Memories'
                            ? NewTheme.colors.backgroundWhite
                            : NewTheme.colors.primaryOrange,
                        backgroundColor:
                          selectedTab === 'Memories'
                            ? NewTheme.colors.primaryOrange
                            : NewTheme.colors.secondaryLightPeach,
                        paddingVertical: 10,
                        borderRadius: 6,
                      }}>
                      Memories
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Notes Tab */}
                <View
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    marginHorizontal: 5,

                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                  }}>
                  <TouchableOpacity
                    testID="notes"
                    onPress={() => setSelectedTab('Notes')}
                    style={{
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                    activeOpacity={1}>
                    <Text
                      style={{
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        color:
                          selectedTab === 'Notes'
                            ? NewTheme.colors.backgroundWhite
                            : NewTheme.colors.primaryOrange,
                        backgroundColor:
                          selectedTab === 'Notes'
                            ? NewTheme.colors.primaryOrange
                            : NewTheme.colors.secondaryLightPeach,
                        paddingVertical: 10,
                        borderRadius: 6,
                      }}>
                      Note
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {renderContent()}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: NewTheme.colors.backgroundCreamy,
    // Padding to account for status bar on Android and iOS
    // SafeAreaView does not automatically account for notch, so set this manually if needed
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  container: {
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : '10%',
    paddingBottom: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerText: { fontSize: 20, marginLeft: 16, fontWeight: 'bold' },
  profileProgress: {
    width: '95%',
  },
});

export { ViewMemberDetails, ViewMemberDetailsHeader };
