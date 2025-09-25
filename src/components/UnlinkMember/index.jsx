import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Dialog, Portal, useTheme, Text} from 'react-native-paper';
import {View, TouchableOpacity} from 'react-native';
import {unLinkMember, RoleConformation} from '../../store/apps/tree';
import Toast from 'react-native-toast-message';
import {CloseIcon} from '../../images/Icons/ModalIcon';

const UnlinkMember = ({
  open,
  onClose,
  userId,
  treeId,
  name,
  handleReloadWebView,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [isRoleConfirmation, setRoleConfirmation] = useState({});
  const groupId = useSelector(state => state.userInfo.linkedGroup);
  const UserRole = isRoleConfirmation?.tree?.role;
  useEffect(() => {
    if (userId && treeId) {
      getRoleConformation(userId, treeId);
    }
  }, []);
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Trees,
  );
  const formatMessage = (template, replacements) => {
    return template.replace(/{(\w+)}/g, (_, key) => replacements[key] || '');
  }

  const getRoleConformation = async (userId, treeId) => {
    const apiUrl = `/getRoleConformation/${userId}/${treeId}`;
    const axiosConfig = {};
    const res = await dispatch(RoleConformation(apiUrl, axiosConfig));
    if (res.payload) {
      setRoleConfirmation(res.payload.roleConformation);
    }
    return res.payload?.roleConformation;
  };

  const handleUnlink = async () => {
    try {
      const data = {
        activeMember: userId,
        treeId: treeId,
        groupId: groupId?.[0],
        role: UserRole,
      };
      const res = await dispatch(
        unLinkMember({
          payload: data,
        }),
      ).unwrap();
      onClose();
      if (res.data) {
        handleReloadWebView();
      }
      const messageTemplate = toastMessages[3004];
      const replacements = {
        name: name,
      };
      const formattedMessage = formatMessage(messageTemplate, replacements);
      
      Toast.show({
        type: 'success',
        text1: formattedMessage,
      });
    } catch (error) {
      // Handle error if needed
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error unlinking member. Please try again later.',
      });
    }
  };

  return (
    <Portal>
      <Dialog
        visible={open}
        onDismiss={onClose}
        style={{
          backgroundColor: 'white',
          marginHorizontal: 50,
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
            fontSize: 20,
            textAlign: 'center',
            paddingHorizontal: 15,
            fontWeight: '700',
            color: 'black',
          }}>
          Unlink from card
        </Dialog.Title>

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
                textAlignVertical: 'center',
                textAlign: 'center',
                fontWeight: '500',
                color: 'black',
              }}>
              Information saved by the member will not be retained on the card
              after unlinking.
            </Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}>
            <Button
              testID="unlink-button"
              onPress={handleUnlink}
              style={{
                width: '94%',
                backgroundColor: theme.colors.primary,
                borderWidth: 2,
                borderColor: theme.colors.primary,
                borderRadius: 8,
              }}
              labelStyle={{color: 'white', textTransform: 'capitalize'}}>
              Unlink
            </Button>
            <Button
              testID="cancel"
              style={{
                width: '94%',
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
              Cancel
            </Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

UnlinkMember.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  treeId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default UnlinkMember;
