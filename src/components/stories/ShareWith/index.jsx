import React, {useState, useRef, useMemo, useEffect, memo} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {VisibilityIcon} from '../../../images';
import {CustomCheckBox} from '../../../components';

import {
  removeSelectedSubgroupTree,
  removeSelectedTree,
  setSelectedSubgroupTrees,
  setSelectedTrees,
} from '../../../store/apps/story';
import {
  getGroupData,
  getAllSubGroup,
} from '../../../store/apps/memberDirectorySlice';
import Toast from 'react-native-toast-message';
import CustomScrollView from '../../../common/CustomScrollView';

function ShareWith({onViewSubGroups, isCreateStory = false}) {
  const [Container, setContainer] = useState(
    isCreateStory ? View : CustomScrollView,
  );
  const styles = createStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  // selectors
  const groupList = useSelector(
    state => state?.memberDirectory?.memberGroupDetails,
  );
  const userId = useSelector(state => state?.userInfo?._id);

  const getSelectedFamilyGroups = useSelector(
    state => state.story.currentlyWritten?.familyGroupId,
  );
  const getSelectedFamilySubGroups = useSelector(
    state => state.story.currentlyWritten?.familySubGroupId,
  );
  const subGroups = useSelector(
    state => state?.memberDirectory?.membersAllSubGroups,
  );

  const [, setInitialGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedGroups = useRef([]);
  const selectedSubGroups = useRef([]);
  const familyName = useSelector(state => state?.Tree?.familyName);

  const displayName = familyName?.toLowerCase().includes('family')
    ? familyName
    : `${familyName} Family`;

  const allFamilyExist = useMemo(() => {
    let result = false;
    for (let index = 0; index < groupList?.length; index += 1) {
      result = selectedGroups?.current?.includes(groupList[index]?._id);
      if (!result) {
        break;
      }
    }
    return result;
  }, [groupList, () => selectedGroups?.current]);

  function toggleSelectGroup(groupId) {
    if (selectedSubGroups.current.length) {
      selectedSubGroups.current.forEach(id => {
        dispatch(removeSelectedSubgroupTree(id));
      });
      selectedSubGroups.current = [];
    }

    if (groupId === 'everyone') {
      if (allFamilyExist) {
        selectedGroups.current.forEach(id => {
          dispatch(removeSelectedTree(id));
        });

        selectedGroups.current = [];
      } else {
        selectedGroups.current = groupList.map(group => group._id);

        selectedGroups.current.forEach(id => {
          dispatch(setSelectedTrees(id));
        });
      }
    } else if (selectedGroups.current.includes(groupId)) {
      selectedGroups.current = selectedGroups.current.filter(
        id => id !== groupId,
      );
      dispatch(removeSelectedTree(groupId));
    } else {
      selectedGroups.current.push(groupId);
      selectedGroups.current.forEach(id => {
        dispatch(setSelectedTrees(id));
      });
    }
  }
  const allSubGroupExist = useMemo(() => {
    let result = false;

    for (let index = 0; index < subGroups?.length; index += 1) {
      result = selectedSubGroups?.current?.includes(subGroups[index]?._id);
      if (!result) {
        break;
      }
    }

    return result;
  }, []);

  function toggleSelectSubGroup(groupId) {
    if (selectedGroups.current.length) {
      selectedGroups.current.forEach(id => {
        dispatch(removeSelectedTree(id));
      });

      selectedGroups.current = [];
    }

    if (groupId === 'everyone') {
      if (allSubGroupExist) {
        selectedSubGroups.current.forEach(id => {
          dispatch(removeSelectedSubgroupTree(id));
        });
        selectedSubGroups.current = [];
      } else {
        selectedSubGroups.current = subGroups.map(group => group._id);

        selectedSubGroups.current.forEach(id => {
          dispatch(setSelectedSubgroupTrees(id));
        });
      }
    } else if (selectedSubGroups.current.includes(groupId)) {
      selectedSubGroups.current = selectedSubGroups.current.filter(
        id => id !== groupId,
      );
      dispatch(removeSelectedSubgroupTree(groupId));
    } else {
      selectedSubGroups.current = [...selectedSubGroups.current, groupId];

      selectedSubGroups.current.forEach(id => {
        dispatch(setSelectedSubgroupTrees(id));
      });
    }
  }

  const sortSubGroupName = useMemo(() => {
    if (loading) {
      return [];
    }

    const result = Array.isArray(subGroups)
      ? subGroups
          .map(arr => arr)
          .sort((a, b) =>
            a?.groupName
              ?.toLowerCase()
              ?.localeCompare(b?.groupName?.toLowerCase()),
          )
      : [];
    return result;
  }, [() => subGroups, loading]);

  useEffect(() => {
    try {
      setLoading(true);
      if (getSelectedFamilyGroups) {
        setInitialGroups(prev => [...prev, ...getSelectedFamilyGroups]);
        selectedGroups.current.push(...getSelectedFamilyGroups);
      }
      (async () => {
        if (!groupList?.length) {
          await dispatch(getGroupData()).unwrap();
        }
        if (!subGroups?.length) {
          await dispatch(getAllSubGroup(userId)).unwrap();
        }
      })();
      selectedSubGroups.current = getSelectedFamilySubGroups || [];
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <View
        style={[
          {
            width: '100%',
          },
          isCreateStory ? {} : {height: '100%'},
        ]}>
        <View style={styles.miniTitleContainer}>
          <VisibilityIcon fill={theme.colors.orange} />
          <Text style={styles.miniTitle}>Visibility</Text>
        </View>
        <Container
          style={[
            {
              paddingLeft: 8,
              // flex: 1,
            },
            isCreateStory
              ? {
                  flex: 1,
                }
              : {},
          ]}
          accessibilityLabel="visibilityScroll">
          <View style={isCreateStory ? {} : {marginBottom: 60}}>
            <View>
              {/* family tree starts */}
              <Text
                style={[
                  styles.subTitle,
                  {
                    color: theme.colors.primary,
                  },
                ]}>
                Post will be published in the '{displayName}'
              </Text>
              {/* <View style={{marginTop: 10}}>
                <View style={styles.listItemContainer}>
                  <View>
                    <CustomCheckBox
                      check={allFamilyExist}
                      onCheck={() => toggleSelectGroup('everyone')}
                      accessibilityLabel="everyoneCheckbox"
                    />
                  </View>
                  <TouchableOpacity
                    accessibilityLabel="everyone"
                    onPress={toggleSelectGroup.bind(null, 'everyone')}>
                    <Text style={styles.listItemName}>Everyone</Text>
                  </TouchableOpacity>
                </View>
                {groupList.map((group, index) => (
                  <View key={index} style={styles.listItemContainer}>
                    <View>
                      <CustomCheckBox
                        check={selectedGroups?.current?.includes(group?._id)}
                        onCheck={() => toggleSelectGroup(group._id)}
                        accessibilityLabel={`${group.groupName}-checkbox`}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleSelectGroup(group._id)}
                      accessibilityLabel={group.groupName}>
                      <Text key={index} style={styles.listItemName}>
                        {group?.groupName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View> */}
            </View>
            {/* family tree ends */}

            {/* subgroups starts */}
            <View>
              {/* <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                {sortSubGroupName.length > 0 && (
                  <Text
                    style={[
                      styles.subTitle,
                      {
                        color: theme.colors.primary,
                      },
                    ]}>
                    Your Groups
                  </Text>
                )} */}
                {/* <TouchableOpacity
                  accessibilityLabel="goToManageGroups"
                  onPress={() => {
                    onViewSubGroups();
                  }}>
                  <Text style={[styles.subTitle, {color: theme.colors.orange}]}>
                    {sortSubGroupName.length > 0
                      ? 'Manage Groups'
                      : 'Create Group'}
                  </Text>
                </TouchableOpacity> */}
              {/* </View> */}
              {/* <View style={{marginTop: 10}}>
                {sortSubGroupName.map((group, index) => (
                  <View key={index} style={styles.listItemContainer}>
                    <View>
                      <CustomCheckBox
                        accessibilityLabel={`${group?.groupName}-checkbox`}
                        check={selectedSubGroups?.current?.includes(group?._id)}
                        onCheck={() => toggleSelectSubGroup(group?._id)}
                      />
                    </View>
                    <TouchableOpacity
                      accessibilityLabel={group.groupName}
                      onPress={() => toggleSelectSubGroup(group?._id)}>
                      <Text key={index} style={styles.listItemName}>
                        {group?.groupName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View> */}
            </View>
            {/* subgroup ends */}
          </View>
        </Container>
      </View>
    </>
  );
}

ShareWith.displayName = 'ShareWith';

export default memo(ShareWith);

function createStyles() {
  return StyleSheet.create({
    miniTitle: {
      fontWeight: '600',
      color: 'black',
      fontSize: 18,
      paddingBottom: 10,
    },
    subTitle: {
      fontWeight: '700',
      fontSize: 16,
    },
    miniTitleContainer: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 20,
    },
    listItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      justifyContent: 'flex-start',
      marginBottom: 5,
    },
    listItemName: {
      fontWeight: '600',
      color: 'black',
      fontSize: 16,
    },
  });
}
