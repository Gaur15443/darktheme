import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {
  Button,
  Dialog,
  Paragraph,
  Portal,
  ActivityIndicator,
  Avatar,
  useTheme,
  Text,
} from 'react-native-paper';
import {View, TouchableOpacity} from 'react-native';
import {deleteMember, postDeleteMember} from '../../store/apps/deleteMember';
import {DefaultImage} from '../../core';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import {CloseIcon} from '../../images/Icons/ModalIcon';
import {ScrollView} from 'react-native-gesture-handler';

const DeleteCard = ({
  isClone = false,
  open,
  onClose,
  userId,
  treeId,
  name,
  dependentUser,
  canDelete,
  handleReloadWebView,
  cLink,
  isOwnersClink,
  rootClinksWithoutRootId,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const userDeleteInfo = useSelector(
    state => state.deleteMember.deleteMemberData,
  );
  useEffect(() => {
    if (!canDelete && open && dependentUser) {
      dispatch(deleteMember({dependentUser}));
    }
  }, [canDelete, open, dependentUser]);

  const handleDelete = async () => {
    try {
      let finalClinkArray = cLink;
      if (isClone) {
        await dispatch(
          postDeleteMember({userId, treeId, isClone: true}),
        ).unwrap();
      } else if (isOwnersClink) {
        finalClinkArray = rootClinksWithoutRootId;
      } else if (finalClinkArray?.length > 0) {
        const deletePromises = finalClinkArray.map(linkId => {
          return dispatch(
            postDeleteMember({
              userId: linkId,
              treeId,
              isOwnersClink: isOwnersClink ? true : '',
            }),
          ).unwrap();
        });
        await Promise.all(deletePromises);
      } else {
        await dispatch(postDeleteMember({userId, treeId})).unwrap();
      }
      onClose(finalClinkArray?.length > 0 ? finalClinkArray : userId);
      handleReloadWebView();
      Toast.show({
        type: 'success',
        text1: `${name} removed from the family tree`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
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
          maxHeight: 500,
        }}>
        <TouchableOpacity
          testID="close-dialog"
          onPress={onClose}
          style={{
            position: 'absolute',
            top: -35,
            right: -10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'lightgray',
            borderRadius: 5,
            elevation: 9,
          }}>
          <CloseIcon />
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!canDelete ? (
            <Dialog.Title
              style={{
                fontSize: 16,
                paddingHorizontal: 0,
                paddingVertical: 0,
                fontWeight: '700',
                color: 'black',
                flex: 1, // Ensures the text takes remaining space
                flexWrap: 'wrap',
              }}>
              Unable to delete this member as there are related members
              connected to this node. Please remove them first before proceeding
              with the deletion.
            </Dialog.Title>
          ) : (
            <Dialog.Title
              style={{
                fontSize: 18,
                marginTop: 30,
                textAlign: 'center',
                textAlignVertical: 'center',
                fontWeight: '700',
                color: 'black',
                lineHeight: 24,
              }}>
              Are you sure you're ready to say goodbye to this family member?
            </Dialog.Title>
          )}
          {userDeleteInfo?.dependentUser?.length > 0 && !canDelete && (
            <Dialog.Content>
              {userDeleteInfo?.dependentUser?.map((info, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}>
                  {info?.personalDetails?.profilepic?.length ? (
                    <Avatar.Image
                      size={50}
                      source={{uri: info?.personalDetails?.profilepic}}
                      style={{
                        borderWidth: 2,
                        borderColor: theme.colors.avatarBorder,
                        borderRadius: 25, // Half of the size to make it a perfect circle
                        overflow: 'hidden', // Ensure image doesn't overflow the border
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  ) : (
                    <DefaultImage
                      size={50}
                      firstName={info.personalDetails.name}
                      lastName={info.personalDetails.lastname}
                      gender={info.personalDetails.gender}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 14,
                      marginLeft: 10,
                      fontWeight: '500',
                      color: 'black',
                      flex: 1, // Ensures the text takes remaining space
                      flexWrap: 'wrap', // Ensures the text wraps to the next line
                    }}
                    numberOfLines={2} // Limits to 2 lines and truncates if necessary
                    ellipsizeMode="tail" // Adds "..." if the text exceeds 2 lines
                  >
                    {info.personalDetails.name} {info.personalDetails.lastname}
                  </Text>
                </View>
              ))}
            </Dialog.Content>
          )}

          <Dialog.Actions>
            {canDelete && (
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                <Button
                  testID="delete-card-button"
                  onPress={handleDelete}
                  style={{
                    width: '90%',
                    backgroundColor: theme.colors.primary,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    borderRadius: 8,
                  }}
                  labelStyle={{color: 'white'}}>
                  Delete
                </Button>
                <Button
                  testID="cancel"
                  style={{
                    width: '90%',
                    color: 'white',
                    borderWidth: 2,
                    borderColor: 'lightgrey',
                    marginVertical: 15,
                    borderRadius: 8,
                  }}
                  labelStyle={{
                    color: theme.colors.primary,
                  }}
                  onPress={onClose}>
                  Cancel
                </Button>
              </View>
            )}
          </Dialog.Actions>
        </ScrollView>
      </Dialog>
    </Portal>
  );
};

// Prop validation
DeleteCard.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string,
  treeId: PropTypes.string,
  name: PropTypes.string.isRequired,
  dependentUser: PropTypes.array.isRequired,
  canDelete: PropTypes.bool.isRequired,
  isClone: PropTypes.bool,
};

export default DeleteCard;
