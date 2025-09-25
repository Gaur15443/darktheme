/* eslint-disable react/no-unstable-nested-components */
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import React, {memo, useEffect, useMemo, useState} from 'react';
import {useTheme, Text, Appbar, Button, List, Divider,} from 'react-native-paper';
import CustomTextInput from '../../CustomTextInput';
import { DefaultImage, GlobalStyle } from '../../../core';
import Constants from './../../../common/Constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomCheckBox from '../CustomCheckBox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  fetchFamilyTags,
  mentionUsers,
} from './../../../store/apps/tagSlice/index';
import Toast from 'react-native-toast-message';
import Spinner from '../../../common/Spinner';
import { StyleSheet } from 'react-native';
import { pluralize } from '../../../utils/format';
import ThinkingArtwork from '../../../images/Icons/ThinkingArtwork';
import HeaderSeparator from '../../../common/HeaderSeparator';
import { BackArrowIcon } from '../../../images';
import { useNavigation } from '@react-navigation/native';
import { setSelectedFeatureTags } from '../../../store/apps/story';
import DropdownAnimation from '../../../common/DropdownAnimation';
import Confirm from '../../Confirm';
import useNativeBackHandler from '../../../hooks/useBackHandler';

function AddTagging() {
  const theme = useTheme();
  const navigator = useNavigation();
  useNativeBackHandler(handleBack);
  const dispatch = useDispatch();
  const { top, bottom } = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMembersId, setSelectedMembersId] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [discardPopUp, setDiscardPopUp] = useState(false);

  const currentlyWritten = useSelector(state => state.story.currentlyWritten);

  const allFamilyTags = useSelector(state => state.tag.allFamilyTags);

  useEffect(() => {
    if (Array.isArray(currentlyWritten?.featureTags)) {
      setSelectedMembersId(currentlyWritten.featureTags);
    }
  }, [allFamilyTags]);

  const selectedMembersInfo = useMemo(() => {
    const allMembers =
      allFamilyTags?.allGroups?.flatMap?.(group => group.groupMembers) || [];

    return selectedMembersId.map(id => {
      return allMembers.find(member => member._id === id) || {};
    });
  }, [selectedMembersId, allFamilyTags]);
  const groupId = useSelector(state => state.Tree.groupId);

  useEffect(() => {
    try {
      dispatch(fetchFamilyTags(groupId))
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
      /**
       * No toast needed
       */
    }
  }, []);

  useEffect(() => {
    try {
      if (searchTerm) {
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
      (async () => {
        if (searchTerm?.length) {
          const payload = {
            searchTerm,
            groupId,
          };
          const result = await dispatch(mentionUsers(payload)).unwrap();
          setSearchResults(result);
        }
      })();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [searchTerm]);

  function handleBack() {
    if (JSON.stringify(currentlyWritten?.featureTags || []) !== JSON.stringify(selectedMembersId || [])) {
      setDiscardPopUp(true);
    }
    else {
      onAddTagClose();
    }
  }

  function onAddTagClose() {
    navigator.goBack();
  }

  function handleToggleCheckbox(id) {
    setSelectedMembersId(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  const styles = StyleSheet.create({
    spinner: {
      marginTop: top,
    },
    scrollView: {
      height: '100%',
      marginTop: 20,
    },
    main: {
      backgroundColor: '#FFF3ED',
      flex: 1,
      height: Constants.Dimension.ScreenHeight(),
      paddingBottom: bottom,
      paddingTop: top,
    },
    selectedUsersContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    selectedUser: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: '#FFF',
      borderRadius: 8,
      flexDirection: 'row',
      padding: 8,
      gap: 6,
      borderWidth: 1,
      borderColor: '#D9D9D9',
    },
    searchContainer: {
      marginTop: 10,
    },
    searchUserButton: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 6,
    },
    searchUserContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    searchUserDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

  return (
    <>
      {discardPopUp && <Confirm
        title={'Are you sure you want to leave?'}
        subTitle={'If you discard, you will lose your changes.'}
        discardCtaText={'Discard'}
        continueCtaText={'Continue Editing'}
        onContinue={() => setDiscardPopUp(false)}
        onDiscard={() => onAddTagClose()}
        onCrossClick={() => setDiscardPopUp(false)}
      />}
      <View
        style={{
          backgroundColor: '#FFF3ED',
          height: Constants.Dimension.ScreenHeight(),
          flex: 1,
        }}>
        <View style={styles.main}>
          <Appbar.Header
            statusBarHeight={0}
            style={{
              backgroundColor: '#FFF3ED',
              paddingHorizontal: 10,
            }}>
            <Pressable accessibilityLabel="back arrow" onPress={handleBack}>
              <BackArrowIcon />
            </Pressable>
            <Appbar.Content
              title="Tag Members"
              titleStyle={{ textAlign: 'center', fontSize: 20, fontWeight: 800 }}
            />
            <View
              style={{ opacity: allFamilyTags?.allGroups?.length > 0 ? 1 : 0 }}>
              <Button
                mode="contained"
                onPress={() => {
                  dispatch(setSelectedFeatureTags(selectedMembersId));
                  onAddTagClose();
                }}
                textColor={theme.colors.onBackground}
                disabled={
                  allFamilyTags?.allGroups?.length < 1 ||
                  selectedMembersId?.length < 1
                }
                accessibilityLabel="save tags"
                buttonColor={theme.colors.orange}
                style={{
                  borderRadius: theme.roundness,
                  opacity: selectedMembersId?.length > 0 ? 1 : 0.5,
                  color: '#fff',
                  backgroundColor: theme.colors.orange,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#fff',
                  }}>
                  Done
                </Text>
              </Button>
            </View>
          </Appbar.Header>
          <HeaderSeparator style={{ backgroundColor: '#FFF3ED' }} />
          {isLoading && (
            <View style={styles.spinner}>
              <Spinner />
            </View>
          )}
          {!isLoading && allFamilyTags?.allGroups?.length > 0 && (
            <ScrollView
              style={styles.scrollView}
              keyboardShouldPersistTaps="always">
              <GlobalStyle>
                <View
                  style={{
                    marginTop: Platform.OS === 'android' ? 6 : 8,
                  }}>
                  <CustomTextInput
                    label="Search"
                    accessibilityLabel="search members"
                    value={searchTerm}
                    onChangeText={e => {
                      setSearchTerm(e);
                    }}
                    clearable
                    customTheme={{
                      colors: {
                        primary: theme.colors.orange,
                      },
                    }}
                  />
                </View>
                {selectedMembersId.length < 1 && (
                  <Text
                    style={{
                      textAlign: 'center',
                      paddingVertical: 10,
                    }}>
                    Tagged members will be able to view the {'\n'} post in their
                    Profile under Memories
                  </Text>
                )}
                <View>
                  {selectedMembersId.length > 0 && (
                    <Text
                      accessibilityLabel="selected count"
                      style={{
                        textAlign: 'center',
                        paddingVertical: 10,
                      }}>
                      {pluralize(selectedMembersId.length, 'member')} tagged
                    </Text>
                  )}
                  {selectedMembersInfo?.length > 0 && (
                    <GlobalStyle>
                      <View style={styles.selectedUsersContainer}>
                        {selectedMembersInfo.map(_selectedMember => (
                          <View
                            key={_selectedMember._id}
                            style={styles.selectedUser}>
                            {_selectedMember?.personalDetails?.profilepic
                              ?.length > 0 ? (
                              <Image
                                source={{
                                  uri: _selectedMember.personalDetails
                                    .profilepic,
                                }}
                                width={24}
                                height={24}
                                style={{
                                  borderRadius: 12,
                                }}
                              />
                            ) : (
                              <DefaultImage
                                firstName={_selectedMember.personalDetails.name}
                                lastName={
                                  _selectedMember.personalDetails.lastname
                                }
                                gender={_selectedMember.personalDetails.gender}
                                size={24}
                              />
                            )}
                            <Text>
                              {_selectedMember?.personalDetails?.name}{' '}
                              {_selectedMember?.personalDetails?.lastname}
                            </Text>
                            <Icon
                              onPress={handleToggleCheckbox.bind(
                                this,
                                _selectedMember._id,
                              )}
                              name="close"
                              color={'#000'}
                              size={20}
                            />
                          </View>
                        ))}
                      </View>
                    </GlobalStyle>
                  )}
                </View>
              </GlobalStyle>

              {showSearchResults && (
                <GlobalStyle>
                  <View style={styles.searchContainer}>
                    {searchResults?.length > 0 &&
                      searchResults.map(_result => (
                        <TouchableOpacity
                          key={_result.id}
                          accessibilityLabel={_result.name}
                          onPress={() => {
                            handleToggleCheckbox(_result.id);
                          }}
                          style={styles.searchUserButton}>
                          <View style={styles.searchUserContent}>
                            <View style={styles.searchUserDetails}>
                              <View style={{ marginRight: 10 }}>
                                {_result.personalDetails?.profilepic?.length >
                                  0 ? (
                                  <Image
                                    source={{
                                      uri: _result.personalDetails.profilepic,
                                    }}
                                    width={40}
                                    height={40}
                                    style={{
                                      borderRadius: 20,
                                    }}
                                  />
                                ) : (
                                  <DefaultImage
                                    gender={_result.personalDetails.gender}
                                    size={40}
                                    firstName={_result.personalDetails.name}
                                    lastName={_result.personalDetails.lastname}
                                  />
                                )}
                              </View>
                              <Text>{_result.name}</Text>
                            </View>
                            <CustomCheckBox
                              disabled
                              color={theme.colors.orange}
                              check={selectedMembersId.includes(_result.id)}
                            />
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                </GlobalStyle>
              )}
              <Divider style={{backgroundColor: '#DADADA', height: 1}} />

              {!showSearchResults && (
                <List.Section>
                  {allFamilyTags?.allGroups?.length > 0 &&
                    allFamilyTags.allGroups.map(group =>
                      group.groupMembers.map(member => (
                        <GlobalStyle key={member._id}>
                            <List.Item
                              onPress={handleToggleCheckbox.bind(
                                this,
                                member._id,
                              )}
                              accessibilityLabel={`${member.personalDetails.name} ${member.personalDetails.lastname}`}
                              title={`${member.personalDetails.name} ${member.personalDetails.lastname}`}
                              // key={`group-${member}-${index}`}
                              left={() => (
                                <View
                                  style={{
                                    borderWidth: 2,
                                    borderRadius: 22,
                                    borderColor: '#5CE371',
                                    backgroundColor: '#5CE371',
                                  }}>
                                  {member.personalDetails?.profilepic?.length >
                                    0 ? (
                                    <Image
                                      source={{
                                        uri: member.personalDetails.profilepic,
                                      }}
                                      width={40}
                                      height={40}
                                      style={{
                                        borderRadius: 20,
                                      }}
                                    />
                                  ) : (
                                    <DefaultImage
                                      gender={member.personalDetails.gender}
                                      size={40}
                                      firstName={member.personalDetails.name}
                                      lastName={member.personalDetails.lastname}
                                    />
                                  )}
                                </View>
                              )}
                              right={() => (
                                <View
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <CustomCheckBox
                                    accessibilityLabel="checkbox"
                                    disabled
                                    color={theme.colors.orange}
                                    check={selectedMembersId.includes(
                                      member._id,
                                    )}
                                  />
                                </View>
                              )}
                            />
                          </GlobalStyle>
                        )),
                    )}
                </List.Section>
              )}
              {/* </GlobalStyle> */}
            </ScrollView>
          )}
          {!isLoading && Object.keys(allFamilyTags || {})?.length < 1 && (
            <View
              style={{
                paddingHorizontal: 10,
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                // minus header height
                marginTop: -60,
              }}>
              <ThinkingArtwork width="100%" />
              <Text
                variant="bold"
                style={{
                  fontSize: 20,
                  textAlign: 'center',
                }}>
                No members
              </Text>
              <Text
                variant="bold"
                style={{
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                Please start by adding relatives to your tree
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

export default memo(AddTagging);

AddTagging.displayName = 'AddTagging';
