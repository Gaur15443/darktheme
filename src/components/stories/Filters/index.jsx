import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {View, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import CustomCheckBox from '../CustomCheckBox';
import {
  getGroupData,
  getMySubgroups,
} from '../../../store/apps/memberDirectorySlice';
import {StoryFilterIcon} from '../../../images';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {navigatedStack} from '../../../../AppChild';
import CustomBottomSheet from './../../CustomBottomSheet/index';
import {resetSingleStory} from '../../../store/apps/story';
import Toast from 'react-native-toast-message';
import {colors} from '../../../common/NewTheme';
import {resetIsStoryReset} from '../../../store/apps/story';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { getFilterData } from '../../../store/apps/home';

export default function Filters({open, onClose, onApply, route}) {
  const {bottom} = useSafeAreaInsets();
  const styles = createStyles();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [displayFilters, setDisplayFilters] = useState([
    // {
    //   name: 'Public_Stories',
    //   label: 'Public Stories',
    //   check: true,
    //   id: 11,
    //   detector: 'Public_Stories',
    // },
    {
      name: 'My_posts',
      label: 'My Posts',
      check: false,
      id: 12,
      detector: 'My_posts',
    },
    {
      name: 'line',
      id: 23,
    },
    {name: 'Saved', label: 'Saved', check: false, id: 17, detector: 'Saved'},
    {
      name: 'Drafts',
      label: 'Drafts',
      check: false,
      id: 18,
      detector: 'Drafts',
    },
    {},
  ]);
  const [enableFilterButton, setEnableFilterButton] = useState(false);

  const userId = useSelector(state => state.userInfo._id);
  const groupList = useSelector(
    state => state.memberDirectory.memberGroupDetails,
  );
  const getAllFamilySubGroups = useSelector(
    state => state?.memberDirectory?.allMySubGroups,
  );
  const isStoryReset = useSelector(state => state?.story?.isStoryReset);

  const handleCheckboxChange = event => {
    const name = event?.name?.toString();
    let finalFilters = [];
    if (!name) {
      return;
    }
    if (name === 'Saved' || name === 'Drafts' || name === 'My_posts') {
      finalFilters = displayFilters;
      finalFilters = finalFilters.map(filter => ({
        ...filter,
        check: filter?.name === name,
      }));
      setDisplayFilters(finalFilters);
    } else {
      finalFilters = displayFilters;
      finalFilters = finalFilters.map(filter => {
        // Check if the filter's name matches the given name
        if (filter.name === name) {
          return {
            ...filter,
            check: !filter.check,
          };
        }

        // If name is 'everyone' and event.check is false, update 'family' detectors
        if (name?.toLowerCase() === 'everyone' && !event.check) {
          if (filter.detector === 'family') {
            return {
              ...filter,
              check: true,
            };
          }
        }

        // For other filters, handle the 'Saved', 'Drafts', and 'My_posts' cases
        if (
          filter.name === 'Saved' ||
          filter.name === 'Drafts' ||
          filter.name === 'My_posts'
        ) {
          return {
            ...filter,
            check: false,
          };
        }
        return filter;
      });
      setDisplayFilters(finalFilters);

      if (event.detector === 'family' && event.check) {
        finalFilters = finalFilters.map(filter => {
          // If the filter's name is 'Everyone', uncheck it
          if (filter.name === 'Everyone') {
            return {
              ...filter,
              check: false,
            };
          }

          // Return the filter unchanged if it’s not the one being updated
          return filter;
        });
        setDisplayFilters(finalFilters);
      }

      if (event?.detector === 'family' && event?.name !== 'Everyone') {
        selectEveryone(finalFilters);
      }
    }
  };

  function selectEveryone(array) {
    const allFamiliesSelected = array
      .filter(
        filter => filter.detector === 'family' && filter.name !== 'Everyone',
      )
      .map(filter => filter.check)
      .every(filter => filter === true);
    if (allFamiliesSelected) {
      setDisplayFilters(prevFilters => {
        return prevFilters.map(filter => {
          if (filter.name === 'Everyone') {
            return {
              ...filter,
              check: true,
            };
          }
          return filter;
        });
      });
    }
  }
  async function getStoryByFilter() {
    const arr = [];
    displayFilters.forEach(e => {
      if (e.check === true && e.name && e.name !== 'line') {
        arr.push(e.name);
      }
    });
    const allFilters = displayFilters.filter(
			(e) =>
				e.detector === 'Public_Stories' ||
				e.detector === 'familySubGroup' ||
				e.detector === 'family'
		);
    const equal = arr.length === allFilters.length;
    await dispatch(getFilterData(equal)).unwrap();
    onApply(arr);
    onClose();
  }
  const [evaluate, setEvaluate] = useState(0);
  const draftReset = useRef(false);

  useFocusEffect(
    useCallback(() => {
      function triggerFilter() {
        try {
          setEvaluate(evaluate + 1);
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        } finally {
          dispatch(resetIsStoryReset());
        }
      }
      if (isStoryReset) {
        triggerFilter();
      }
    }, [isStoryReset]),
  );

  useMemo(() => {
    if (route?.params?.fromDraft) {
      setEvaluate(evaluate + 1);
      draftReset.current = true;
      navigation.setParams({
        fromDraft: false,
      });
      return;
    } else {
      if (!draftReset.current) {
        setEvaluate(evaluate + 1);
        return;
      }
      draftReset.current = false;
      return;
    }
  }, [route, groupList]);

  useMemo(() => {
    if (route?.params?.isClevertapPushNotification) {
      onApply(['Public_Stories']);
      return;
    }
    if (!groupList?.length) {
      return;
    } else if (
      groupList.length ||
      (route?.params?.fromDraft && !draftReset.current)
    ) {
      const preFilters = addGroupsToFilters();
      const familyFilters = preFilters
        .filter(e => e.detector === 'family')
        .map(e => e);
      const familySubGroupFilters = getAllFamilySubGroups.map(family => ({
        name: family._id,
        label: family.groupName,
        check: true,
        id: family._id,
        detector: 'familySubGroup',
      }));
      const isFamPresent = familyFilters.some(e => e.detector === 'family');
      dispatch(resetSingleStory());

      let resetFilters = displayFilters.map(filter => {
        if (route?.params?.fromDraft) {
          navigation.setParams({
            fromDraft: false,
          });
          return {
            ...filter,
            check: filter.label === 'Drafts',
          };
        } else {
          if (
            filter.label !== 'Saved' &&
            filter.label !== 'Drafts' &&
            filter.label !== 'My Posts'
          ) {
            return {
              ...filter,
              check: true,
            };
          } else {
            return {
              ...filter,
              check: false,
            };
          }
        }
      });
      resetFilters = [
        ...resetFilters,
        ...familyFilters,
        ...familySubGroupFilters,
        // {
        //   name: 'line',
        //   id: 45,
        // },
      ];
      const pullSavedAndDrafts = resetFilters.filter(
        filter =>
          filter.label === 'Saved' ||
          filter.label === 'Drafts' ||
          filter.label === 'My Posts',
      );
      const otherFilters = resetFilters.filter(
        filter =>
          filter.label !== 'Saved' &&
          filter.label !== 'Drafts' &&
          filter.label !== 'My Posts',
      );
      let filtered = filterUniqueObjectsByProperty([
        ...otherFilters,
        ...familyFilters,
        {
          name: 'line',
          id: 25,
        },
        ...familySubGroupFilters,
        // {
        //   name: 'line',
        //   id: 45,
        // },
        ...pullSavedAndDrafts,
      ]);
      setDisplayFilters(filterUniqueObjectsByProperty(filtered));
      let arr = [];
      resetFilters.forEach(e => {
        if (e.check === true && e.name && e.name !== 'line') {
          arr.push(e.name);
        }
      });

      if (navigatedStack[navigatedStack?.length - 2] === 'CreateStory') {
        onApply(
          arr,
          navigatedStack[navigatedStack?.length - 2] === 'CreateStory',
        );
        return;
      } else {
        if (isFamPresent) {
          onApply(
            arr,
            navigatedStack[navigatedStack?.length - 2] === 'CreateStory',
          );
          return;
        } else {
          preFilters?.forEach(e => {
            if (e.check === true && e.name && e.name !== 'line') {
              arr.push(e.name);
            }
          });
          onApply(
            arr,
            navigatedStack[navigatedStack?.length - 2] === 'CreateStory',
          );
          return;
        }
      }
    }
  }, [evaluate]);

  // useMemo(
  useEffect(() => {
    try {
      // TODO: Find why it's resetting after create story.
      // if (groupList?.length > 0) return;
      (async () => {
        await Promise.all([
          dispatch(getGroupData()).unwrap(),
          dispatch(getMySubgroups()).unwrap(),
        ]);
      })();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, []);
  // );

  useFocusEffect(
    useCallback(() => {
      const filterNames = [];

      displayFilters.forEach(f => {
        if (f.check) {
          filterNames.push(f.detector);
        }
      });
      const filterNameSet = new Set(filterNames);
      const enableButton =
        ((filterNameSet.has('Stories') ||
          filterNameSet.has('Audios') ||
          filterNameSet.has('Quotes') ||
          filterNameSet.has('Moments')) &&
          (filterNameSet.has('All') ||
            filterNameSet.has('Public_Stories') ||
            filterNameSet.has('My_posts') ||
            filterNameSet.has('family'))) ||
        filterNameSet.has('My_posts') ||
        filterNameSet.has('Public_Stories') ||
        filterNameSet.has('Drafts') ||
        filterNameSet.has('Saved') ||
        filterNameSet.has('family') ||
        filterNameSet.has('familySubGroup');
      setEnableFilterButton(!enableButton);
    }, [displayFilters]),
  );

  function addGroupsToFilters() {
    if (groupList && groupList?.length > 0) {
      const ownerGroup = groupList?.find?.(
        data => data?.ownerId?._id?._id === userId,
      );
      const pullSavedAndDrafts = displayFilters.filter(
        filter => filter.label === 'Saved' || filter.label === 'Drafts',
      );

      const otherFilters = displayFilters.filter(
        filter => filter.label !== 'Saved' && filter.label !== 'Drafts',
      );
      const familyFilters = groupList
        .filter(data => data?.ownerId?._id?._id !== userId)
        .map(family => ({
          name: family._id,
          label: /(family)$/i.test(family.groupName)
            ? family.groupName
            : `${family.groupName} family`,
          check: !route?.params?.fromDraft,
          id: family._id,
          detector: 'family',
        }));

      if (ownerGroup) {
        familyFilters.unshift({
          name: ownerGroup._id,
          label: /(family)$/i.test(ownerGroup.groupName)
            ? ownerGroup.groupName
            : `${ownerGroup.groupName} family`,
          check: !route?.params?.fromDraft,
          id: ownerGroup._id,
          detector: 'family',
        });
      }
      if (familyFilters.length) {
        familyFilters.unshift({
          name: 'Everyone',
          label: 'Everyone',
          check: true,
          id: 35,
          detector: 'family',
        });
      }
      const familySubGroupFilters = getAllFamilySubGroups.map(family => ({
        name: family._id,
        label: family.groupName,
        check: true,
        id: family._id,
        detector: 'familySubGroup',
      }));
      const filtered = filterUniqueObjectsByProperty([
        ...otherFilters,
        ...familyFilters,
        {
          name: 'line',
          id: 25,
        },
        ...familySubGroupFilters,
        // {
        //   name: 'line',
        //   id: 45,
        // },
        ...pullSavedAndDrafts,
      ]);
      setDisplayFilters(filtered);
      return filtered;
    }
  }

  useMemo(() => {
    const familySubGroupFilters = getAllFamilySubGroups.map(family => ({
      name: family._id,
      label: family.groupName,
      check: true,
      id: family._id,
      detector: 'familySubGroup',
    }));
    const isolatedFilters = displayFilters.filter(
      _filter =>
        _filter.name === 'My_posts' ||
        _filter.name === 'Saved' ||
        _filter.name === 'Drafts',
    );
    const remainingFilters = displayFilters.filter(
      _filter =>
        _filter.name !== 'My_posts' ||
        _filter.name !== 'Saved' ||
        _filter.name !== 'Drafts',
    );
    setDisplayFilters(prevFilters => {
      return filterUniqueObjectsByProperty([
        ...prevFilters.filter(
          (_filter, _idx) =>
            _filter.name !== 'My_posts' &&
            _filter.name !== 'Saved' &&
            _filter.name !== 'Drafts' &&
            _filter.id !== 25,
        ),
        ...familySubGroupFilters,
        {
          name: 'line',
          id: 25,
        },
        ...isolatedFilters,
      ]);
    });
  }, [getAllFamilySubGroups]);

  // useMemo(() => {
  //   addGroupsToFilters();
  // }, [groupList]);

  function filterUniqueObjectsByProperty(arr, propName = 'id') {
    return arr.filter(
      (item, index, self) =>
        index === self.findIndex(t => t[propName] === item[propName]),
    );
  }

  return (
    <>
      {open && (
        <CustomBottomSheet
          useScrollView
          onClose={onClose}
          // snapPoints={['49%']}
          maxDynamicContentSize={650}
          contentStyle={{
            minHeight: 350,
            height: 'auto',
            paddingBottom: bottom,
          }}>
          <View style={styles.container}>
            <>
              <View style={styles.bottomSheet}>
                <View style={styles.headingWrapper}>
                  <StoryFilterIcon />
                  <Text style={[styles.heading]}>Filter By</Text>
                </View>
                <ScrollView style={styles.filterWrapper}>
                  {displayFilters.map((title, index) => (
                    <>
                      {title.name !== 'line' && (
                        <>
                          {title.id && (
                            <View
                              key={title?.id}
                              style={styles.individualFilters}>
                              <CustomCheckBox
                                testID={title?.label}
                                check={title?.check}
                                onCheck={() => handleCheckboxChange(title)}
                                useRadioButton={
                                  title.name === 'Saved' ||
                                  title.name === 'Drafts' ||
                                  title.name === 'My_posts'
                                }
                              />
                              <TouchableOpacity
                                onPress={() => handleCheckboxChange(title)}>
                                <Text style={styles.filterText}>
                                  {title?.label}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      )}
                      {(title.name === 'line' ||
                        displayFilters[index + 1]?.detector === 'My_posts') && (
                        <View
                          key={title?.id}
                          style={{
                            borderWidth: 1,
                            borderColor: 'lightgrey',
                            width: '100%',
                            height: 2,
                            marginBottom: 10,
                            marginTop: 5,
                          }}
                        />
                      )}
                    </>
                  ))}
                </ScrollView>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    testID="submitFilter"
                    style={[
                      styles.Button,
                      {opacity: enableFilterButton ? 0.5 : 1},
                    ]}
                    disabled={enableFilterButton}
                    onPress={() => getStoryByFilter()}>
                    <Text style={styles.buttonText}>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          </View>
        </CustomBottomSheet>
      )}
    </>
  );
}

function createStyles() {
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
      backgroundColor: 'white',
    },
    bottomSheet: {
      height: '100%',
      backgroundColor: 'white',
      width: '100%',
    },
    filterWrapper: {
      margin: 20,
      marginBottom: 90,
    },
    individualFilters: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      marginBottom: 5,
    },
    filterText: {
      fontWeight: '600',
      color: 'black',
      fontSize: 18,
    },
    buttonText: {
      textAlign: 'center',
      padding: 12,
      fontWeight: '600',
      color: 'white',
      fontSize: 18,
    },
    Button: {
      backgroundColor: theme.colors.primary,
      width: '100%',
      borderRadius: 13,
    },
    buttonContainer: {
      marginHorizontal: 20,
      paddingBottom: 20,
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
    },
    heading: {
      fontWeight: 600,
      fontSize: 22,
      color: colors.secondaryDarkBlue,
    },
    headingWrapper: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 20,
    },
  });
}
