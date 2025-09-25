import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Dialog, Portal, useTheme, Text} from 'react-native-paper';
import {View, TouchableOpacity} from 'react-native';
import {
  MakeContributor,
  RoleConformation,
  RemoveContributor,
} from '../../store/apps/tree';
import {getUserInfo} from '../../store/apps/userInfo';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import {CloseIcon} from '../../images/Icons/ModalIcon';

const MakeRemoveContributor = ({
  open,
  onClose,
  userId,
  treeId,
  name,
  lastname,
  treename,
  isMakeContributor,
  setIsContributorModal,
  handleMembersTabRefresh,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const senderId = useSelector(state => state?.userInfo?._id);
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Trees,
  );
  const formatMessage = (template, replacements) => {
    return template.replace(/{(\w+)}/g, (_, key) => replacements[key] || '');
  }

  useEffect(() => {
    if (userId && treeId) {
      getRoleConformation(userId, treeId);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!senderId) {
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
  }, [dispatch, senderId]);

  const getRoleConformation = async (userId, treeId) => {
    const apiUrl = `/getRoleConformation/${userId}/${treeId}`;
    const axiosConfig = {};
    const res = await dispatch(RoleConformation(apiUrl, axiosConfig)).unwrap();
    // if (res.payload) {
    //   setRoleConfirmation(res.payload.roleConformation);
    // }
    return res.payload?.roleConformation;
  };

  const makeTreeContributor = async () => {
    try {
      const data = {
        userId: userId,
        treeId: treeId,
      };

      await dispatch(
        MakeContributor({
          payload: data,
        }),
      );
      setIsContributorModal(false);
      if (handleMembersTabRefresh) {
        handleMembersTabRefresh();
      }
      const messageTemplate = toastMessages[3006];
        const replacements = {
          name: name,
          lastname: lastname,
        };
        const formattedMessage = formatMessage(messageTemplate, replacements);        
        Toast.show({
          type: 'success',
          text1: formattedMessage,
        });
    } catch (__error) {}
  };

  const removeTreeContributor = async () => {
    const dataPayload = {
      recieverId: userId,
      sendertreeId: treeId,
      notificationType: 'treeCollabration',
      senderId,
      removeAcess: false,
    };
    await dispatch(
      RemoveContributor({
        payload: dataPayload,
      }),
    );

    setIsContributorModal(false);
    if (handleMembersTabRefresh) {
      handleMembersTabRefresh();
    }
    const messageTemplate = toastMessages[3007];
        const replacements = {
          name: name,
          lastname: lastname,
          Surname: treename,
        };
        const formattedMessage = formatMessage(messageTemplate, replacements);        
        Toast.show({
          type: 'success',
          text1: formattedMessage,
        });
  };
  return (
    <Portal>
      <Dialog
        visible={open}
        onDismiss={onClose}
        style={{
          backgroundColor: 'white',
          marginHorizontal: 50,
          paddingHorizontal: 10,
          borderRadius: 8,
        }}>
        {/* Button */}
        <TouchableOpacity
          testID="close-dialog"
          onPress={onClose}
          style={{
            position: 'absolute',
            top: -35,
            right: -6,
            backgroundColor: 'lightgray',

            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            elevation: 9,
          }}>
          <CloseIcon />
        </TouchableOpacity>
        <Dialog.Title
          style={{
            fontSize: 18,
            marginLeft: 10,
            marginTop: 30,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontWeight: '700',
            color: 'black',
            lineHeight: 24,
          }}>
          {isMakeContributor
            ? `Are you sure you want to make ${name} ${lastname} as a contributor to the ${treename} Tree?`
            : `Are you sure you want to remove ${name} ${lastname} as a contributor to the ${treename} Tree?`}
        </Dialog.Title>
        {isMakeContributor && (
          <Dialog.Content>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 10,
                  marginTop: -10,
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  fontWeight: '500',
                  color: 'black',
                  lineHeight: 24,
                }}>
                Contributors are able to edit the family tree
              </Text>
            </View>
          </Dialog.Content>
        )}
        <Dialog.Actions>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}>
            <Button
              testID="confirm"
              onPress={
                isMakeContributor ? makeTreeContributor : removeTreeContributor
              }
              style={{
                width: '96%',
                backgroundColor: theme.colors.primary,
                borderWidth: 2,
                borderColor: theme.colors.primary,
                borderRadius: 8,
              }}
              labelStyle={{color: 'white', textTransform: 'capitalize'}}>
              Yes
            </Button>
            <Button
              testID="cancel"
              style={{
                width: '96%',
                color: 'white',
                borderWidth: 2,
                borderColor: 'lightgrey',
                marginVertical: 15,
                borderRadius: 8,
              }}
              labelStyle={{
                color: theme.colors.primary,
                textTransform: 'capitalize',
              }}
              onPress={onClose}>
              No
            </Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

// Prop validation
MakeRemoveContributor.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleMembersTabRefresh: PropTypes.func,
  userId: PropTypes.string.isRequired,
  treeId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  lastname: PropTypes.string.isRequired,
  treename: PropTypes.string.isRequired,
  isMakeContributor: PropTypes.bool.isRequired,
};

export default MakeRemoveContributor;
