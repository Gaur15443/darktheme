import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useDispatch,useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {removeActiveMember} from '../../store/apps/removeActiveMember';
import {CustomDialog} from '../../core';
import {RemoveMemberIcon} from '../../images';

const RemoveMemberFamily = ({member, groupId, onMemberRemoved}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [dialogVisible, setDialogVisible] = useState(false); // State to manage dialog visibility
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Trees,
  );

  // Function To Remove Member From Family
  const handleRemoveMember = () => {
    setDialogVisible(true); // Show the dialog
  };

  // Function to confirm removal of member
  const confirmRemoveMember = async () => {
    try {
      const requestData = {
        activeMember: member?._id,
        groupId: groupId[0],
      };
      await dispatch(removeActiveMember(requestData));
      // Handle success if needed
      onMemberRemoved();
      Toast.show({
        type: 'success',
        text1: toastMessages?.['3005'],
      });
    } catch (error) {
      // Handle error if needed
      Toast.show({
        type: 'error',
        text1: 'Error removing member. Please try again later.',
      });
    }
    setDialogVisible(false); // Hide the dialog after action
  };

  // Function to cancel removal of member
  const cancelRemoveMember = () => {
    setDialogVisible(false); // Hide the dialog
  };

  return (
    <>
      <TouchableOpacity
        testID="remove-member"
        onPress={handleRemoveMember}
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 74,
        }}>
        {/* Use Image component instead of text */}
        <RemoveMemberIcon />
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 8,
          }}>
          <Text style={{color: theme.colors.text}}>Remove</Text>
          <Text style={{color: theme.colors.text}}>Member</Text>
        </View>
      </TouchableOpacity>
      <CustomDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title="Remove Member"
        message="Are you sure you want to remove this member?"
        onConfirm={confirmRemoveMember}
        onCancel={cancelRemoveMember}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    borderRadius: 8,
    padding: 10,
    width: 52,
    height: 70,
  },
  image: {
    width: 51,
    height: 69,
  },
});

RemoveMemberFamily.propTypes = {
  member: PropTypes.object.isRequired,
  groupId: PropTypes.array.isRequired,
  onMemberRemoved: PropTypes.func.isRequired,
};

export default RemoveMemberFamily;
