import {
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  // Modal,
} from 'react-native';
import React, {useState} from 'react';
import {Text, Modal} from 'react-native-paper';
import {
  IIconSuggestedInvite,
  ShareViaIcon,
  ExitIcon,
  CommunityDeleteIcon,
} from '../../../../images';
import DeleteIcon from '../../../../core/icon/connection-delete-icon';
import {useDispatch, useSelector} from 'react-redux';

import {useNavigation} from '@react-navigation/native';
import {useTheme, Portal} from 'react-native-paper';
import {exitCommunity} from '../../../../store/apps/createCommunity';
import Animated, {FadeInRight} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import Confirm from '../ConfirmCommunityPopup';
import {useQueryClient} from '@tanstack/react-query';

const ExitCommunityPopup = ({
  showOptions,
  closeOptions,
  communityDetails,
  communityOwnerId,
  loggedInMemberData,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );
  // const handleInviteMembers = () => {
  //   navigation.navigate('CommunityInviteScreen');
  //   onClose();
  // };
  // const handleCommunityDetails = () => {
  //   navigation.navigate('EditCommunity');
  //   onClose();
  // };

  const [openPopup, setOpenPopup] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);

  const exitCommunityButton = async () => {
    try {
      setExitLoading(true);
      await dispatch(exitCommunity(communityDetails?.data?._id)).unwrap();
      // To Update Community Details On Feed Pages
      queryClient.refetchQueries([
        'CommmunityDetail',
        communityDetails?.data?._id,
      ]),
        closeOptions();
      setExitLoading(false);
      Toast.show({
        type: 'success',
        text1: toastMessages?.['5007'],
      });
      setOpenPopup(false);

      setTimeout(() => {
        navigation.navigate('CommunityDetails', {
          randomNo: Math.random(),
          communityId: communityDetails?.data?._id,
        });
      }, 1500);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const handleOpenPopup = () => {
    setOpenPopup(true);
  };

  const closePopup = () => {
    setOpenPopup(false);
    closeOptions();
  };
  const isOwner = communityOwnerId === loggedInMemberData?.memberId;
  return (
    <Portal>
      {openPopup && (
        <Confirm
          title="Are you sure you want to exit?"
          subTitle="You’ll lose access to this community"
          discardCtaText="No, I want to stay"
          continueCtaText="Yes, I want to leave"
          onContinue={exitCommunityButton}
          onDiscard={() => {
            closePopup();
          }}
          loading={exitLoading}
          accessibilityLabel="confirm-popup-basic-fact"
          onCrossClick={closePopup}
        />
      )}
      <Modal
        visible={showOptions}
        onDismiss={closeOptions}
        contentContainerStyle={{
          padding: 0,
          margin: 0,
        }}
        style={styles.ModalStyles}>
        <TouchableOpacity testID="editStory" onPress={handleOpenPopup}>
          <Animated.View
            entering={FadeInRight.duration(300).damping(20)}
            style={[
              styles.ButtonOne,
              // {
              //   borderBottomLeftRadius: !isOwner ? 8 : 0,
              //   borderBottomRightRadius: !isOwner ? 8 : 0,
              // },
            ]}>
            <ExitIcon />
            <Text
              variant="bold"
              style={styles.ButtonText}
              accessibilityLabel={`Memory-Edit-Text`}>
              Exit Community
            </Text>
          </Animated.View>
        </TouchableOpacity>
        {/* This code is temporarily commented out and will be available in future development. */}
        {/* <View
          style={{
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: 'white',
          }}>
          <View style={styles.ModalItemdivider}></View>
        </View>
        <TouchableOpacity testID="deleteStory">
          <Animated.View
            entering={FadeInRight.duration(300).damping(20)}
            style={styles.ButtonTwo}>
            <CommunityDeleteIcon />
            <Text
              style={styles.ButtonText}
              variant="bold"
              accessibilityLabel={`Memory-Delete-Text`}>
              Delete Community
            </Text>
          </Animated.View>
        </TouchableOpacity> */}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingLeft: 70,
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    color: 'black',
    height: 25,
  },
  icon: {
    fontSize: 30,
    color: 'blue',
  },
  closeIconContainer: {
    alignItems: 'flex-end',
  },
  closeIcon: {
    fontSize: 24,
    color: 'gray',
  },
  ButtonTwo: {
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  ModalStyles: {
    marginBottom: 0,
    marginTop: 0,
    shadowColor: 'transparent',
    gap: 5,
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingTop: '18%',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  ButtonText: {fontSize: 18, color: '#FF0000'},
  ModalItemdivider: {borderBottomWidth: 1, borderColor: '#D2D2D2'},

  ButtonOne: {
    flexDirection: 'row',
    paddingRight: 40,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    // borderTopRightRadius: 8,
    // borderTopLeftRadius: 8,
    borderRadius: 8, //temporory till delete community feature is developed
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    borderWidth: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 14,
  },
});
export default ExitCommunityPopup;
