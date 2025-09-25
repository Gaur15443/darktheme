import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import GlobalHeader from '../../../ProfileTab/GlobalHeader';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import NewTheme from '../../../../common/NewTheme';
import InviteSearchScreen from '../../CommunityComponents/InviteSearchScreen';
import InviteImeusweUsers from '../../CommunityComponents/InviteImeusweUsers';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';

const {width} = Dimensions.get('window');

const InviteIntialCommunityMembers = ({route}) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0);
  const [formChanged, setFormChanged] = useState(false);
  const [deepSearchformChanged, setdeepSearchformChanged] = useState(false);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [openConfirmPopupImeusweUsers, SetOpenConfirmPopupImeusweUsers] =
    useState(false);
  const [openConfirmPopupFamilyMembers, setOpenConfirmPopupFamilyMembers] =
    useState(false);

  const inviteSearchRef = useRef();
  const imeusweSearchRef = useRef();
  const showGlobalHeader =
    route?.params?.item?.fromScreen !== 'createCommunity';

  const onBack = () => {
    if (formChanged || deepSearchformChanged) {
      seOpenConfirmPopup(true);
    } else {
      if (showGlobalHeader) {
        navigation.goBack();
      } else {
        navigation.navigate('CommunityDetails', {
          item: {_id: route?.params?.item?._id},
        });
      }
    }
  };
  const onDiscardPopup = () => {
    if (showGlobalHeader) {
      navigation.goBack();
    } else {
      navigation.navigate('CommunityDetails', {
        item: {_id: route?.params?.item?._id},
      });
    }
  };

  return (
    <>
      {!showGlobalHeader ? (
        <GlobalHeader
          onSkip={onBack}
          hideDefaultseparator={true}
          hideBackButton={true}
          showSkipButton={true}
          heading={'Invite to Community'}
          backgroundColor={NewTheme.colors.backgroundCreamy}
        />
      ) : (
        <GlobalHeader
          onBack={onBack}
          heading={'Invite to Community'}
          backgroundColor={NewTheme.colors.backgroundCreamy}
        />
      )}

      <ErrorBoundary.Screen>
        <View style={styles.container}>
          {/* Custom Tabs */}
          <View
            style={[
              styles.tabContainer,
              {marginTop: showGlobalHeader ? 20 : 10},
            ]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 0 && styles.activeTabButton,
              ]}
              onPress={() => {
                if (deepSearchformChanged) {
                  setOpenConfirmPopupFamilyMembers(true);
                } else {
                  setActiveTab(0);
                }
              }}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 0 && styles.activeTabText,
                ]}>
                Family Members
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 1 && styles.activeTabButton,
              ]}
              onPress={() => {
                if (formChanged) {
                  SetOpenConfirmPopupImeusweUsers(true);
                } else {
                  setActiveTab(1);
                }
              }}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 1 && styles.activeTabText,
                ]}>
                iMeUsWe Users
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.contentContainer}>
            {activeTab === 0 ? (
              <InviteSearchScreen
                setFormChanged={setFormChanged}
                community_Id={route?.params?.item?._id || null}
                fromScreen={route?.params?.item?.fromScreen}
              />
            ) : (
              <InviteImeusweUsers
                setdeepSearchformChanged={setdeepSearchformChanged}
                community_Id={route?.params?.item?._id || null}
                fromScreen={route?.params?.item?.fromScreen}
              />
            )}
          </View>
        </View>
        {openConfirmPopup && (
          <Confirm
            title={'Are you sure you want to leave?'}
            subTitle={'If you discard, you will lose your changes.'}
            discardCtaText={'Continue Editing'}
            continueCtaText={'Discard Changes'}
            onContinue={onDiscardPopup}
            onBackgroundClick={() => seOpenConfirmPopup(false)}
            onDiscard={() => {
              seOpenConfirmPopup(false);
            }}
            accessibilityLabel="confirm-popup-basic-fact"
            onCrossClick={() => {
              seOpenConfirmPopup(false);
            }}
          />
        )}
        {openConfirmPopupImeusweUsers && (
          <Confirm
            title={'Are you sure you want to leave?'}
            subTitle={'If you discard, you will lose your changes.'}
            discardCtaText={'Continue Editing'}
            continueCtaText={'Discard Changes'}
            onContinue={() => {
              setActiveTab(1);
              SetOpenConfirmPopupImeusweUsers(false);
              setFormChanged(false);
            }}
            onBackgroundClick={() => SetOpenConfirmPopupImeusweUsers(false)}
            onDiscard={() => {
              SetOpenConfirmPopupImeusweUsers(false);
            }}
            accessibilityLabel="confirm-popup-basic-fact"
            onCrossClick={() => {
              SetOpenConfirmPopupImeusweUsers(false);
            }}
          />
        )}
        {openConfirmPopupFamilyMembers && (
          <Confirm
            title={'Are you sure you want to leave?'}
            subTitle={'If you discard, you will lose your changes.'}
            discardCtaText={'Continue Editing'}
            continueCtaText={'Discard Changes'}
            onContinue={() => {
              setActiveTab(0);
              setOpenConfirmPopupFamilyMembers(false);
              setdeepSearchformChanged(false);
            }}
            onBackgroundClick={() => setOpenConfirmPopupFamilyMembers(false)}
            onDiscard={() => {
              setOpenConfirmPopupFamilyMembers(false);
            }}
            accessibilityLabel="confirm-popup-basic-fact"
            onCrossClick={() => {
              setOpenConfirmPopupFamilyMembers(false);
            }}
          />
        )}
      </ErrorBoundary.Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NewTheme.colors.backgroundCreamy,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 9,
    marginHorizontal: 12,
    marginBottom: 5,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 1},
    // shadowOpacity: 0.22,
    // shadowRadius: 2.22,
    // elevation: 6,
    borderWidth: 1.3,
    borderColor: '#dbdbdb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: NewTheme.colors.primaryOrange,
  },
  tabText: {
    fontSize: 15,
    color: 'black',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
});

export default InviteIntialCommunityMembers;
