import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextInput, Text } from 'react-native-paper';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { GlobalStyle } from '../../../../core';
import {
  getAllSubGroup,
  getUserAllgroups,
  createUserSubgroups,
  getSubGroupById,
  deleteUserSubgroups,
  editUserSubgroups,
  getMySubgroups,
} from '../../../../store/apps/memberDirectorySlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DefaultImage from '../../DefaultImage';
import { useNavigation } from '@react-navigation/native';
import {
  setEditGroup,
  resetEditGroup,
  resetGroupMem,
  setGroupMem,
} from '../../../../store/apps/story';
import { setGroupName, resetGroupName } from '../../../../store/apps/story';
import { CreateSubGroupEmptyState, CrossIcon } from '../../../../images';
import { EditGroupHeader } from '../../../../components';
import Toast from 'react-native-toast-message';
import Confirm from '../../../Confirm';
import { colors } from '../../../../common/NewTheme';
import Spinner from '../../../../common/Spinner';
import FastImage from '@d11/react-native-fast-image';

import {SafeAreaView} from 'react-native-safe-area-context';
// import _ from 'lodash';
export default function EditGroup({ route }) {
  const styles = createStyles();
  const [open, setOpen] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const dispatch = useDispatch();
  const _id = useSelector(state => state.userInfo._id);
  const [showDialogContent, setShowDialogContent] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFamily] = useState(null);
  const [, setSelectMember] = useState('');
  const [discardPopUp, setDiscardPopUp] = useState(false);
  const [boxSelection, setBoxSelection] = useState([]);
  const [selectedMember, setSelectedMember] = useState([]);
  const [selectedmemberById, setSelectedMemberById] = useState([]);
  const [selectedMemData, setSelectedMemData] = useState([]);
  const [, setImageShown] = useState(false);
  const [edit, setEdit] = useState(false);
  const [subGroupId, setSubGroupId] = useState(null);
  const navigator = useNavigation();
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef('Creating...');
  const transparentRef = useRef(true);

  const formik = useFormik({
    initialValues: {
      subGroupName: '',
    },
    validationSchema: Yup.object().shape({
      subGroupName: Yup.string()
        .required('Add a group name')
        .max(15, 'Length cannot be more than 15'),
    }),
  });

  useEffect(() => {
    try {
      if (route?.params?.save) {
        loadingRef.current = 'Creating...';
        createSubGroup();
      }
      if (route?.params?.delete) {
        loadingRef.current = 'Deleting...';
        handleDeleteGroup();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [route]);

  useEffect(() => {
    dispatch(setGroupMem(selectedMemData.length));
  }, [selectedMemData]);

  useEffect(() => {
    return () => {
      dispatch(resetGroupName());
      dispatch(resetGroupMem());
    };
  }, []);

  const confirmationTitle = `"${formik.values.subGroupName} family?"`;

  // fetch all the created subgroup of user
  const membersAllSubGroups = useSelector(
    state => state.memberDirectory.membersAllSubGroups,
  );

  // fetch all the families of user
  const membersAllFamilies = useSelector(
    state => state.memberDirectory.membersAllGroups,
  );

  const userId = useSelector(state => state.userInfo._id);

  const uniqueMemberIds = new Set(); // Set to store unique member IDs

  const filteredMembers = membersAllFamilies.filter(member => {
    // Exclude the owner from the filtered members
    if (member.recever.personalDetails.userId === _id) {
      return false;
    }

    // Check if the member ID is already in the set
    if (selectedGroup === 1) {
      if (uniqueMemberIds.has(member.recever.personalDetails.userId)) {
        return false; // Skip duplicates
      }
    }

    // Add the member ID to the set for tracking
    uniqueMemberIds.add(member.recever.personalDetails.userId);

    // Include the member if it's part of the selected family or no family is selected
    return selectedFamily === null || member.groupId === selectedFamily;
  });

  // get all the unique families based on group ID and created new array
  const getUniqueFamilyName = [
    ...new Map(membersAllFamilies?.map(m => [m.groupId, m])).values(),
  ];

  // added All group to the group name at the first position of all families
  getUniqueFamilyName.unshift({ groupId: 1, groupName: 'All' });

  const toggleGroup = groupId => {
    if (selectedGroup === groupId) {
      setSelectedGroup(groupId); // Deselect the group if it's already active
    } else {
      setSelectedGroup(groupId); // Set the clicked group as active
    }
  };

  const createSubGroup = async () => {
    try {
      transparentRef.current = true;
      setLoading(true);
      if (!edit) {
        const createSubGroupData = {
          groupName: formik.values.subGroupName,
          ownerId: _id,
          InvitedMembers: selectedmemberById,
          groupType: {
            groupType1: 'SG',
            groupType2: 4,
          },
        };

        await dispatch(createUserSubgroups(createSubGroupData)).unwrap();
        const dataa = await dispatch(getAllSubGroup()).unwrap();

        if (dataa.length) {
          setShowDialogContent(true);
        } else {
          setShowDialogContent(false);
        }
        // formik.resetForm();
        setBoxSelection([]);
        setSelectedMember([]);
        setSelectedMemberById([]);
        setSelectedMemData([]);
        setOpenCreateDialog(false); // Close the current dialog
        setOpen(false);

        // Reset formik values and selected members state
      } else {
        const newAddedUserId = [];
        selectedMemData.forEach(e => {
          newAddedUserId.push(e.userId);
        });
        const updateSubGroupData = {
          InvitedMembers: newAddedUserId,
          subGroupName: formik.values.subGroupName,
          id: subGroupId,
        };

        // Dispatch the action to edit the subgroup
        await dispatch(
          editUserSubgroups(updateSubGroupData, _id.toString()),
        ).unwrap();
        setOpenCreateDialog(false); // Close the current dialog

        // Optionally, you may want to refresh the subgroup list after editing
        await dispatch(getAllSubGroup()).unwrap();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      dispatch(resetEditGroup());
      dispatch(getMySubgroups()).unwrap();
      navigator.goBack();
    }
  };

  const vrowRef = useRef(null);

  const handleSelectedMember = (index, value, groupId, memData) => {

    const exists = boxSelection.includes(value);
    setImageShown(true);

    if (exists) {
      const idx = boxSelection.indexOf(value);
      setBoxSelection(prevBoxSelection => [
        ...prevBoxSelection.slice(0, idx),
        ...prevBoxSelection.slice(idx + 1),
      ]);
      setSelectedMember(prevSelectedMember => [
        ...prevSelectedMember.slice(0, idx),
        ...prevSelectedMember.slice(idx + 1),
      ]);
      setSelectedMemberById(prevSelectedmemberById => [
        ...prevSelectedmemberById.slice(0, idx),
        ...prevSelectedmemberById.slice(idx + 1),
      ]);
      setSelectedMemData(prevSelectedMemData => [
        ...prevSelectedMemData.slice(0, idx),
        ...prevSelectedMemData.slice(idx + 1),
      ]);
    } else {
      setBoxSelection(prevBoxSelection => [...prevBoxSelection, value]);
      setSelectedMember(prevSelectedMember => [...prevSelectedMember, groupId]);
      setSelectedMemberById(prevSelectedmemberById => [
        ...prevSelectedmemberById,
        value,
      ]);
      setSelectedMemData(prevSelectedMemData => [
        ...prevSelectedMemData,
        memData,
      ]);
      // console.log(selectedMember);
    }
  };

  const handleCreateGroup = async () => {
    // Set the selectedGroup state to the ID of the "All" group
    setSelectedGroup(1);
    // Reset other state variables
    setBoxSelection([]);
    setSelectedMember([]);
    setSelectedMemberById([]);
    setSelectedMemData([]);
    setOpenCreateDialog(true);

    // Fetch all subgroups and update the showDialogContent state
    const data = await dispatch(getAllSubGroup()).unwrap();
  };

  const handleGroupEdit = async (name, groupId) => {
    try {
      transparentRef.current = false;
      setLoading(true);
      dispatch(setEditGroup());
      setSelectedGroup(1);
      setSubGroupId(groupId);
      setOpenCreateDialog(true);
      setEdit(true);
      dispatch(setGroupName(name));
      formik.values.subGroupName = name;

      // Fetch information about the selected subgroup
      const subgroupInfo = await dispatch(getSubGroupById(groupId));

      // Extract the InvitedMembers (selected members) from subgroupInfo
      const invitedMembers = subgroupInfo?.payload?.Data?.personalDetails || [];

      // Initialize state variables with the previously selected members
      setBoxSelection(invitedMembers.map(member => member.userId));
      setSelectedMember(invitedMembers.map(member => member.groupId));
      setSelectedMemberById(invitedMembers.map(member => member.userId));
      setSelectedMemData(subgroupInfo.payload?.Data?.personalDetails || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      // console.log(error);
    }
    // console.log('here');
    // console.log(route);
  };

  const handleDeleteGroup = async () => {
    setDiscardPopUp(false);
    transparentRef.current = true;
    setLoading(true);
    const data = {
      userId,
      subGroupId,
    };
    await dispatch(deleteUserSubgroups(data)).unwrap();
    const dataa = await dispatch(getAllSubGroup()).unwrap();

    if (dataa.length) {
      setShowDialogContent(true);
    } else {
      setShowDialogContent(false);
    }
    setOpenDeleteDialog(false);
    setOpenCreateDialog(false);
    // formik.resetForm();
    setBoxSelection([]);
    setSelectedMember([]);
    setSelectedMemberById([]);
    setSelectedMemData([]);
    try {
      await dispatch(getAllSubGroup()).unwrap();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      dispatch(resetEditGroup());
      navigator.goBack();
    }
  };
  useEffect(() => {
    if (!openCreateDialog) {
      formik.values.subGroupName = '';
    }
  }, [openCreateDialog]);

  // getAllSubgroup and getAlluserGroup API call
  useEffect(() => {
    try {
      setLoading(true);
      transparentRef.current = false;
      loadingRef.current = 'Loading...';
      setSelectedGroup(1);
      if (!_id) {
        setLoading(false);
        return;
      }
      if (membersAllFamilies.length > 0) {
        setLoading(false);
        return;
      }
      (async () => {
        const data = await dispatch(getAllSubGroup()).unwrap();
        await dispatch(getUserAllgroups()).unwrap();

        if (data.length) {
          setShowDialogContent(true);
        } else {
          setShowDialogContent(false);
        }
      })();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [_id]);

  useEffect(() => {
    setLoading(true);
    loadingRef.current = 'Loading...';
    if (!route?.params?.GroupId?._id) {
      setLoading(false);
      return;
    }
    handleGroupEdit(
      route?.params?.GroupId?.groupName,
      route?.params?.GroupId?._id,
    );
  }, []);

  function handleBack() {
    if (route?.name === 'EditGroup') {
    }
  }

  return (
    <>
      <EditGroupHeader
        onDelete={() => setDiscardPopUp(true)}
        onSave={() => navigator.navigate('EditGroup', { save: true })}
      />
      <SafeAreaView>
        {discardPopUp === true && (
          <Confirm
            title={'Are you sure you want to delete this group?'}
            subTitle={''}
            discardCtaText={'Cancel'}
            continueCtaText={'Delete'}
            onContinue={() => navigator.navigate('EditGroup', { delete: true })}
            onDiscard={() => setDiscardPopUp(false)}
            onCrossClick={() => setDiscardPopUp(false)}
            onBackgroundClick={() => setDiscardPopUp(false)}
          />
        )}
        <Modal visible={loading} transparent={transparentRef.current}>
          <View style={styles.loaderWrapper}>
            <View style={styles.indicatorContainer}>
              <Spinner />
            </View>
          </View>
        </Modal>
        <GlobalStyle>
          {membersAllFamilies.length <= 0 ? (
            <View style={styles.emptyStateContainer}>
              <CreateSubGroupEmptyState />
              <Text style={styles.emptyStateText}>
                You don't have any members in your tree yet.
              </Text>
            </View>
          ) : (
            <>
              {/* from text field to count */}
              <View style={{ marginTop: 10, marginHorizontal: 20 }}>
                <TextInput
                  testID="groupNameInput"
                  label="Enter Group name"
                  style={{ paddingHorizontal: 0, backgroundColor: 'transparent' }}
                  value={formik.values.subGroupName}
                  error={
                    formik.touched.name && Boolean(formik.errors.subGroupName)
                  }
                  right={
                    <TextInput.Affix
                      text={`${formik.values.subGroupName?.length}/15`}
                    />
                  }
                  onChangeText={name => {
                    if (name?.length <= 15) {
                      dispatch(setGroupName(name));
                      formik.handleChange('subGroupName')(name);
                    }
                  }}
                />

                <Text variant="bold" style={styles.selectedCount}>
                  {selectedMemData?.length} selected
                </Text>
              </View>
              {/* textfield and counting ends */}

              {/* selected member profilepics */}
              {selectedMemData.length > 0 && (
                <View style={styles.selectedMembersView}>
                  {selectedMemData?.map((member, index) => (
                    <View key={member.userId} style={styles.selectedUser}>
                      {!member?.profilepic ? (
                        <View>
                          <DefaultImage
                            fontSize={15}
                            borderRadius={50}
                            height={50}
                            width={50}
                            firstName={member.name}
                            lastName={member.lastname}
                            gender={member.gender}
                          />
                        </View>
                      ) : (
                        <FastImage
                          style={styles.selectedUserImage}
                          source={{
                            uri:
                              member?.profilepic?.length >
                                (member?.img?.length || 0)
                                ? member?.profilepic
                                : member?.img,
                          }}
                        />
                      )}
                      <TouchableOpacity
                        testID="crossClickSelectedMember"
                        style={styles.removeSelectionButton}
                        onPress={() => {
                          handleSelectedMember(
                            index,
                            member.userId,
                            selectedMember[index],
                            member,
                          );
                        }}>
                        <View style={styles.removeSelectionIcon}>
                          <CrossIcon
                            fill={'white'}
                            width={'10'}
                            height={'10'}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>

                    // <Text>{member.img}</Text>
                  ))}
                </View>
              )}
              {/* selected member profilepics ends*/}

              {/* the tab icons */}
              <View style={styles.tabsView}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  {getUniqueFamilyName.length > 0 &&
                    getUniqueFamilyName.map((group, groupIndex) => (
                      <TouchableOpacity
                        testID="toggleGroup"
                        onPress={() => {
                          toggleGroup(group.groupId);
                        }}
                        style={[
                          styles.tab,
                          {
                            marginLeft: groupIndex !== 0 ? 10 : 0,
                            opacity: selectedGroup === group.groupId ? 1 : 0.5,
                          },
                        ]}
                        key={group.groupId}>
                        <View>
                          <Text variant="bold" style={[styles.groupName]}>
                            {group.groupName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
              {/* tab icons ends */}

              {/* list of groups */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {getUniqueFamilyName?.length > 0 &&
                  getUniqueFamilyName.map(group => (
                    <View
                      key={group.groupId}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                      }}>
                      {selectedGroup === group.groupId &&
                        selectedGroup !== 1 && (
                          <View style={[styles.groupsContainer]}>
                            {/* Map and display members for each group */}
                            {filteredMembers
                              .filter(item => item.groupId === group.groupId)
                              .map((member, memberIndex) => (
                                <TouchableOpacity
                                  key={member.groupId}
                                  testID="toggleMember"
                                  style={{ borderRadius: 10, width: 150 }}
                                  ref={vrowRef}
                                  onPress={() => {
                                    handleSelectedMember(
                                      memberIndex,
                                      member?.recever?.personalDetails?.userId,
                                      member?.groupId,
                                      member?.recever?.personalDetails,
                                    );
                                  }}>
                                  <View>
                                    <TouchableOpacity
                                      testID="toggleMember1"
                                      style={{
                                        borderRadius: 10,
                                        borderWidth: boxSelection?.includes(
                                          member.recever.personalDetails.userId,
                                        )
                                          ? 2
                                          : 0,
                                        borderColor: boxSelection?.includes(
                                          member.recever.personalDetails.userId,
                                        )
                                          ? colors.primaryOrange
                                          : 'transparent',
                                        overflow: 'hidden',
                                      }}
                                      onPress={() => {
                                        handleSelectedMember(
                                          memberIndex,
                                          member?.recever?.personalDetails
                                            ?.userId,
                                          member?.groupId,
                                          member?.recever?.personalDetails,
                                        );
                                      }}>
                                      <View style={{ marginRight: 'auto' }}>
                                        {member.recever.personalDetails.img ? (
                                          <FastImage
                                            loading="lazy"
                                            style={{
                                              height: 150,
                                              width: 150,
                                              borderRadius: 8,

                                              color: boxSelection?.includes(
                                                member.recever.personalDetails
                                                  .userId,
                                              )
                                                ? colors.primaryOrange
                                                : 'none',
                                            }}
                                            source={{
                                              uri: member.recever
                                                .personalDetails.img,
                                            }}
                                          />
                                        ) : (
                                          <View>
                                            <DefaultImage
                                              fontSize={45}
                                              borderRadius={8}
                                              height={150}
                                              width={150}
                                              firstName={
                                                member.recever.personalDetails
                                                  .name
                                              }
                                              lastName={
                                                member.recever.personalDetails
                                                  .lastname
                                              }
                                              gender={
                                                member.recever.personalDetails
                                                  .gender
                                              }
                                              textStyles={{
                                                color: boxSelection?.includes(
                                                  member.recever.personalDetails
                                                    .userId,
                                                )
                                                  ? colors.primaryOrange
                                                  : 'black',
                                              }}
                                            />
                                          </View>
                                        )}
                                        {/* Display member's details */}
                                        <View
                                          style={{
                                            borderRadius: 10,
                                            color: boxSelection?.includes(
                                              member.recever.personalDetails
                                                .userId,
                                            )
                                              ? colors.primaryOrange
                                              : 'black',
                                          }}>
                                          <Text
                                            style={{
                                              fontWeight: 600,
                                              color: boxSelection?.includes(
                                                member.recever.personalDetails
                                                  .userId,
                                              )
                                                ? colors.primaryOrange
                                                : 'grey',
                                              textAlign: 'center',
                                              marginVertical: 6,
                                              fontSize: 15,
                                              paddingHorizontal: 4,
                                            }}>
                                            {
                                              member.recever.personalDetails
                                                .name
                                            }{' '}
                                            {
                                              member.recever.personalDetails
                                                .lastname
                                            }
                                          </Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                  </View>
                                </TouchableOpacity>
                              ))}
                          </View>
                        )}

                      {/* for all filter */}
                      {selectedGroup === group.groupId &&
                        selectedGroup === 1 && (
                          <View style={styles.groupsContainer}>
                            {/* Map and display members for each group */}
                            {filteredMembers.map((member, memberIndex) => (
                              <TouchableOpacity
                                key={member.groupId}
                                ref={vrowRef}
                                style={{ borderRadius: 10, width: 150 }}
                                testID="selectMember"
                                onPress={() => {
                                  handleSelectedMember(
                                    memberIndex,
                                    member?.recever?.personalDetails?.userId,
                                    member?.groupId,
                                    member?.recever?.personalDetails,
                                  );
                                }}>
                                <View>
                                  <TouchableOpacity
                                    style={{
                                      borderWidth: boxSelection?.includes(
                                        member.recever.personalDetails.userId,
                                      )
                                        ? 2
                                        : 0,
                                      borderColor: boxSelection?.includes(
                                        member.recever.personalDetails.userId,
                                      )
                                        ? colors.primaryOrange
                                        : 'transparent',
                                      borderRadius: 10,
                                      overflow: 'hidden',
                                    }}
                                    testID="selectMember1"
                                    id={member.recever.personalDetails.userId}
                                    onPress={() => {
                                      handleSelectedMember(
                                        memberIndex,
                                        member?.recever?.personalDetails
                                          ?.userId,
                                        member?.groupId,
                                        member?.recever?.personalDetails,
                                      );
                                    }}>
                                    <View style={{ borderRadius: 10 }}>
                                      {member?.recever?.personalDetails?.img ? (
                                        <FastImage
                                          source={{
                                            uri: member.recever.personalDetails
                                              .img,
                                          }}
                                          loading="lazy"
                                          style={{
                                            height: 150,
                                            width: 150,
                                            borderRadius: 8,
                                          }}
                                        />
                                      ) : (
                                        <View>
                                          <DefaultImage
                                            fontSize={45}
                                            borderRadius={8}
                                            height={150}
                                            width={150}
                                            firstName={
                                              member.recever.personalDetails
                                                .name
                                            }
                                            lastName={
                                              member.recever.personalDetails
                                                .lastname
                                            }
                                            gender={
                                              member.recever.personalDetails
                                                .gender
                                            }
                                          // textStyles={{
                                          //   color: boxSelection?.includes(
                                          //     member.recever.personalDetails
                                          //       .userId,
                                          //   )
                                          //     ? colors.primaryOrange
                                          //     : 'black',
                                          // }}
                                          />
                                        </View>
                                      )}
                                      {/* Display member's details */}
                                      <View>
                                        <Text
                                          variant="bold"
                                          style={{
                                            fontWeight: 600,
                                            color: boxSelection?.includes(
                                              member.recever.personalDetails
                                                .userId,
                                            )
                                              ? colors.primaryOrange
                                              : 'grey',
                                            textAlign: 'center',
                                            marginVertical: 6,
                                            fontSize: 15,
                                            paddingHorizontal: 4,
                                          }}>
                                          {member.recever.personalDetails.name}{' '}
                                          {
                                            member.recever.personalDetails
                                              .lastname
                                          }
                                        </Text>
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                    </View>
                  ))}
              </ScrollView>
              {/* list ends */}
            </>
          )}
        </GlobalStyle>
      </SafeAreaView>
    </>
  );
}

function createStyles() {
  return StyleSheet.create({
    loaderWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    indicatorContainer: {
      backgroundColor: 'transparent',
      width: 150,
      height: 150,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderText: {
      color: 'black',
      fontWeight: 500,
      fontSize: 15,
      marginTop: 10,
    },
    groupsContainer: {
      borderRadius: 10,
      marginTop: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
      width: 330,
      marginBottom: 500,
    },
    emptyStateContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '30%',
    },
    emptyStateText: {
      marginHorizontal: 30,
      textAlign: 'center',
      marginVertical: 10,
      fontWeight: 'bold',
      color: 'black',
      fontSize: 24,
    },
    selectedCount: {
      color: colors.secondaryLightBlue,
      fontWeight: 500,
      fontSize: 16,
      marginBottom: 10,
    },
    selectedMembersView: {
      flexDirection: 'row',
      gap: 10,
      marginHorizontal: 10,
      marginBottom: 10,
    },
    selectedUser: { position: 'relative' },
    selectedUserImage: {
      width: 50,
      height: 50,
      borderRadius: 50,
      borderColor: 'black',
    },
    removeSelectionButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: 'grey',
      borderRadius: 50,
    },
    removeSelectionIcon: { padding: 5 },
    tabsView: { marginLeft: 10, paddingBottom: 10 },
    tab: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: colors.primaryOrange,
    },
    groupName: {
      fontSize: 15,
      fontWeight: 600,
      textAlign: 'center',
      color: '#fff',
    },
  });
}
