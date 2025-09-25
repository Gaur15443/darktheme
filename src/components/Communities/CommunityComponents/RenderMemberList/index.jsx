import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme, Text} from 'react-native-paper';
import CustomCheckBox from '../../../stories/CustomCheckBox';
import {CustomButton, DefaultImage} from '../../../../core';
import {Dropdown} from 'react-native-element-dropdown';
import {
  VerticalThreeDots,
  GreenCheckMarkButton,
  RedCrossIcon,
  NewVerticalThreeDots,
} from '../../../../images';
import theme from '../../../../common/NewTheme';
import {useSelector} from 'react-redux';

const RenderMemberList = ({
  item,
  setSelectedMembers,
  selectedMembers,
  screenType = 'initialInvite',
  onRoleChange,
  onButtonPress,
  onRemoveMember,
  handleAcceptDecline,
  setRole,
  loggedInMember,
  handleTreeMemberSelection = () => {},
}) => {
  const currentMemberRole = item?.memberRole;
  const [selectionOption, setSelectionOption] = useState(currentMemberRole);
  const communityOwnerId = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data?.owner?._id,
  );
  const [buttonLabel, setButtonLabel] = useState('Invite');
  const name =
    item?.recever?.personalDetails?.name ||
    item?.member?.personalDetails?.name ||
    item?.personalDetails?.name ||
    item.name;
  const lastName =
    item?.recever?.personalDetails?.lastname ||
    item?.member?.personalDetails?.lastname ||
    item?.personalDetails?.lastname;
  const imgUrl =
    item?.recever?.personalDetails?.img ||
    item?.recever?.personalDetails?.profilepic ||
    item?.image ||
    item?.member?.personalDetails?.profilepic ||
    item?.personalDetails?.profilepic;
  const gender =
    item?.recever?.personalDetails?.gender ||
    item?.member?.personalDetails?.gender ||
    item?.personalDetails?.gender;
  const roles = [
    {label: 'Admin', value: 'Admin'},
    {label: 'Member', value: 'Member'},
  ];
  useEffect(() => {
    if (currentMemberRole) setSelectionOption(currentMemberRole);
  }, [currentMemberRole]);

  const email =
    item?.email || item?.member?.email || item?.recever?.email || null;
  // To Select Members To Invite
  const handleSelect = member => {
    if (selectedMembers.includes(member?.recever?.personalDetails?.userId)) {
      setSelectedMembers(
        selectedMembers.filter(
          id => id !== member?.recever?.personalDetails?.userId,
        ),
      );
    } else {
      setSelectedMembers([
        ...selectedMembers,
        member?.recever?.personalDetails?.userId,
      ]);
    }
  };

  // For Role CHange Member
  const handleRoleChange = item => {
    setSelectionOption(item.label);
    if (onRoleChange) {
      onRoleChange(item.value, item?.recever?.personalDetails?.userId);
    }
  };

  const selectOption = (role, name, lastName, item) => {
    setRole(role, name, lastName, item);
  };

  // On Button Press
  const onPress = () => {
    if (buttonLabel === 'Invite') {
      setButtonLabel('Cancel');
      onButtonPress('Invite', item);
      setTimeout(() => {
        setButtonLabel('Invite');
      }, 10000);
    }
    if (buttonLabel === 'Cancel') {
      setButtonLabel('Invite');
      onButtonPress('Cancel', item);
    }
  };

  const filteredRoles = roles.filter(role => role.label !== selectionOption);

  const isAlreadyJoined =
    item?.communityMemberStatus && item?.communityMemberStatus === 'ACTIVE';
  const isAlreadyAccepted =
    screenType === 'inviteScreen' &&
    item?.recever?.communityMemberStatus &&
    item?.recever?.communityMemberStatus === 'ACTIVE';
  const isCommunityOwner = item.memberId === communityOwnerId;

  const Wrapper =
    (screenType === 'initialInvite' ||
      screenType === 'inviteScreen' ||
      screenType === 'iMeUsWeinviteScreen') &&
    !isAlreadyJoined &&
    !isAlreadyAccepted
      ? TouchableOpacity
      : View;

  return (
    <Wrapper
      key={item?._id}
      onPress={() =>
        screenType === 'inviteScreen' || screenType === 'iMeUsWeinviteScreen'
          ? handleTreeMemberSelection(item)
          : handleSelect(item)
      }
      accessibilityLabel={`List-item-for-${name}-${lastName}`}
      style={{
        height: 60,
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 7,
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'center',
      }}>
      <View style={{flex: 1, paddingRight: 20}}>
        {imgUrl ? (
          <Image
            style={{
              width: 56,
              height: 56,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel={`${name} ${lastName}'s profile picture`}
            source={{uri: imgUrl}}
          />
        ) : (
          <View
            style={{marginRight: 4}}
            accessibilityLabel={`Default-image-for-${name}-${lastName}`}>
            <DefaultImage
              gender={gender}
              size={56}
              firstName={name}
              lastName={lastName}
            />
          </View>
        )}
      </View>
      {/* Notification content */}
      <View
        style={{
          flex: 5.8,
          justifyContent: 'flex-start',
          flexDirection:
            // isAlreadyJoined ||
            // isAlreadyAccepted ||
            // screenType === 'initialInvite'
            // ?
            'column',
          // : 'row',
        }}>
        {/* TOdo: inter FontFamily */}
        <Text
          accessible={true}
          accessibilityLabel={`${name} ${lastName}'s name`}
          style={{
            fontSize: 18,
            lineHeight: 20,
            color: theme.colors.darkText,
            paddingLeft: 15,
          }}
          numberOfLines={2}>
          {name} {lastName}
        </Text>
        {isAlreadyJoined || isAlreadyAccepted ? (
          <Text
            style={{
              fontSize: 10,
              lineHeight: 20,
              color: theme.colors.darkText,
              paddingLeft: 15,
            }}>
            Already a part of this Community
          </Text>
        ) : (
          email && (
            <Text
              style={{
                fontSize: 10,
                lineHeight: 20,
                color: theme.colors.darkText,
                paddingLeft: 15,
              }}>
              {email}
            </Text>
          )
        )}
      </View>
      {screenType === 'initialInvite' && (
        <View style={styles.checkboxContainer}>
          <CustomCheckBox
            color={theme.colors.primaryOrange}
            accessibilityLabel="check-box"
            check={selectedMembers?.includes(
              item?.recever?.personalDetails?.userId,
            )}
          />
        </View>
      )}
      {screenType === 'editCommunity' && (
        <View style={{flex: 1.5, flexDirection: 'row'}}>
          {currentMemberRole && (
            <Text
              style={styles.ShowSelection}
              accessibilityLabel={`${name} ${lastName}'s role is ${currentMemberRole}`}>
              {currentMemberRole === 'Admin' && currentMemberRole}
            </Text>
          )}
          {loggedInMember === 'Admin' && !isCommunityOwner && (
            <TouchableOpacity
              style={{width: 20}}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}
              accessibilityLabel={`More options for ${name} ${lastName}`}
              onPress={() =>
                selectOption(selectionOption, name, lastName, item)
              }>
              <NewVerticalThreeDots />
            </TouchableOpacity>
          )}
          {loggedInMember === 'Admin' && isCommunityOwner && (
            <View style={{width: 20}} />
          )}
        </View>
      )}
      {screenType === 'inviteScreen' &&
      !isAlreadyJoined &&
      !isAlreadyAccepted ? (
        <View style={[styles.checkboxContainer]}>
          <CustomCheckBox
            color={theme.colors.primaryOrange}
            accessibilityLabel="check-box"
            check={selectedMembers?.includes(item?.recever?._id)}
          />
        </View>
      ) : (
        screenType === 'inviteScreen' && <View style={{width: 35}} />
      )}
      {screenType === 'iMeUsWeinviteScreen' &&
      !isAlreadyJoined &&
      !isAlreadyAccepted ? (
        <View style={[styles.checkboxContainer]}>
          <CustomCheckBox
            color={theme.colors.primaryOrange}
            accessibilityLabel="check-box"
            check={selectedMembers?.includes(item?._id)}
          />
        </View>
      ) : (
        screenType === 'iMeUsWeinviteScreen' && <View style={{width: 35}} />
      )}
      {screenType === 'CommunityJoiningRequests' && (
        <View style={{gap: 10, flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => handleAcceptDecline('accept', item)}
            accessibilityLabel={`Accept ${name} ${lastName}'s request`}>
            <GreenCheckMarkButton />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={`Decline ${name} ${lastName}'s request`}
            onPress={() => handleAcceptDecline('decline', item)}>
            <RedCrossIcon />
          </TouchableOpacity>
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    marginLeft: 'auto',
    pointerEvents: 'none',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 6,
    borderWidth: 1,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  display: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mainDisplay: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 10,
  },
  checkedBox: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.primaryOrange,
    borderRadius: 3,
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
  },
  ShowSelection: {
    color: theme.colors.primaryOrange,
    minWidth: 49,
  },
  dropdown: {
    borderColor: '#C3C3C3',
    borderRadius: 5,
    backgroundColor: 'white',
    height: 30,
    width: 100,
    color: 'red',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowColor: '#000',
    elevation: 4,
  },
  dropdownItems: {
    fontSize: 16,

    color: theme.colors.primaryOrange,
    fontWeight: 400,
    marginVertical: -10,
  },
  dropdownSelectedText: {
    color: theme.colors.primaryOrange,
    paddingLeft: 10,
    fontSize: 16,
    lineHeight: 26,
  },
  dropdownPlaceholderText: {
    color: theme.colors.primaryOrange,
    paddingLeft: 10,
    fontSize: 16,
    lineHeight: 26,
  },
});

export default RenderMemberList;
