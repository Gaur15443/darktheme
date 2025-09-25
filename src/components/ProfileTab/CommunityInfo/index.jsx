import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {CustomButton} from '../../../core';
import {getAdduserProfiles} from '../../../store/apps/addUserProfile';

import {GlobalStyle} from '../../../core';
import {useTheme, Avatar, Text} from 'react-native-paper';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {useNavigation} from '@react-navigation/native';
import Confirm from '../../Confirm';
import {GlobalHeader, CustomInput} from '../../../components';
import {nameValidator} from '../../../utils/validators';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  getCommunities,
  getReligions,
  getScripts,
  getGothras,
} from '../../../store/apps/community';
import {useDispatch, useSelector} from 'react-redux';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import Toast from 'react-native-toast-message';
import CommunityList from '../CommunityHistoryList/CommunityList';
import { desanitizeInput } from '../../../utils/sanitizers';

const CommunityInfo = ({route}) => {
  const id = route.params ? route.params.id : undefined;

  const [selectedReligion, setSelectedReligion] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedSubCommunity, setSelectedSubCommunity] = useState('');
  const [selectedScript, setSelectedScript] = useState(null);
  const [selectedGothra, setSelectedGothra] = useState(null);
  const [selectedDeity, setSelectedDeity] = useState('');
  const [selectedPriest, setSelectedPriest] = useState('');
  const [priestNameError, setPriestNameError] = useState('');
  const [deityError, setDeityError] = useState('');
  const [subCommunityError, setSubCommunityError] = useState('');

  const [ancestralLocation, setancestralLocation] = useState(null);
  const navigation = useNavigation();
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const Religions = useSelector(state => state?.community?.religion?.data);
  const Communities = useSelector(state => state?.community?.community?.data);
  const Scripts = useSelector(state => state?.community?.scripts?.data);
  const Gothras = useSelector(state => state?.community?.gothra?.data);

  const [religionModalVisible, setReligionModalVisible] = useState(false);
  const [religionSearchQuery, setReligionSearchQuery] = useState('');
  const [searchReligionResults, setReligionSearchResults] = useState([]);

  const [communityModalVisible, setCommunityModalVisible] = useState(false);
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [searchCommunityResults, setCommunitySearchResults] = useState([]);

  const [scriptModalVisible, setScriptModalVisible] = useState(false);
  const [scriptSearchQuery, setScriptSearchQuery] = useState('');
  const [searchScriptResults, setScriptSearchResults] = useState([]);

  const [gothraModalVisible, setGothraModalVisible] = useState(false);
  const [gothraSearchQuery, setGothraSearchQuery] = useState('');
  const [searchGothraResults, setGothraSearchResults] = useState([]);

  const [isFocused, setIsFocused] = useState(false);
  const [createItemText, setCreateItemText] = useState('');
  const inputRef = useRef(null);
  const inputRefcom = useRef(null);
  const inputRefmot = useRef(null);
  const inputRefgot = useRef(null);

  useNativeBackHandler(handleBack);
  const theme = useTheme();
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state?.userInfo._id);

  const userId = id ? id : userInfo._id;

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );

  useEffect(() => {
    try {
      (async () => {
        await dispatch(getReligions()).unwrap();
        const cum = selectedReligion || 'No comment';
        const religiondata = {
          religion: cum,
        };
        await dispatch(getCommunities(religiondata)).unwrap();
        await dispatch(getScripts()).unwrap();
        await dispatch(getGothras()).unwrap();
      })();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, []);
  useEffect(() => {
    if (basicInfo && basicInfo.moreInfo) {
      setSelectedCommunity(basicInfo.moreInfo.community);
      setSelectedSubCommunity(basicInfo.moreInfo.subcommunity);
      setSelectedReligion(basicInfo.moreInfo.religion);
      setSelectedScript(basicInfo.moreInfo.motherTounge);
      setSelectedGothra(basicInfo.moreInfo.gothra);
      setSelectedDeity(basicInfo.moreInfo.deity);
      setancestralLocation(basicInfo.moreInfo.ancestorVillage);
      setSelectedPriest(basicInfo.moreInfo.priestName);
    }
  }, [basicInfo]);

  const styles = StyleSheet.create({
    textInputStyle: {
      border: '0px solid #ccc6c6',
      marginTop: 15,
    },
    textInputStyleModal: {
      border: '0px solid #ccc6c6',
      marginTop: 0,
    },
  });
  const handleClose = async () => {
    await dispatch(fetchUserProfile(userId)).unwrap();
    setLoading(false);

    navigation.goBack();
  };

  const handleSelectReligion = community => {
    setSelectedReligion(community.name); // Set the selected community
    setReligionSearchQuery(''); // Clear search query after selection
  };

  const handleReligionFocus = () => {
    Keyboard.dismiss(); // Close the keyboard
    // Navigate to Community selection screen
    navigation.navigate('ReligionList', {
      onSelectReligion: handleSelectReligion,
      religionSearchQuery,
    });
  };

  const handleSelectCommunity = community => {
    setSelectedCommunity(community.name); // Set the selected community
    setCommunitySearchQuery(''); // Clear search query after selection
  };

  const handleCommunityFocus = () => {
    Keyboard.dismiss(); // Close the keyboard
    // Navigate to Community selection screen
    navigation.navigate('CommunityList', {
      onSelectCommunity: handleSelectCommunity,
      communitySearchQuery,
    });
  };

  //for script
  const handleScriptSearch = text => {
    const results = Scripts.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase()),
    );
    setScriptSearchResults(results);
    setCreateItemText(text);

    if (results.length === 0 && text.trim() !== '') {
      setScriptSearchResults([{id: 'create', name: `Create "${text}"`}]);
    } else {
      setScriptSearchResults(results);
    }
  };
  const handleSelectScriptItem = item => {
    if (item.id === 'create') {
      setScriptSearchQuery(createItemText);
      setSelectedScript(
        createItemText.charAt(0).toUpperCase() +
          createItemText.slice(1).toLowerCase(),
      );
      setScriptSearchQuery(createItemText);
      inputRefmot.current.focus();
    } else {
      setSelectedScript(
        item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase(),
      );
      setScriptSearchQuery(item.name);
    }
    setScriptModalVisible(false);
    Keyboard.dismiss();
    setIsFocused(false);
  };
  const handleSelectScript = community => {
    setSelectedScript(
      community.name.charAt(0).toUpperCase() +
        community.name.slice(1).toLowerCase(),
    ); // Set the selected community
    setScriptSearchQuery(''); // Clear search query after selection
  };

  const handleScriptFocus = () => {
    Keyboard.dismiss(); // Close the keyboard
    // Navigate to Community selection screen
    navigation.navigate('ScriptList', {
      onSelectScript: handleSelectScript,
      scriptSearchQuery,
    });
  };

  const handleSelectGothra = community => {
    setSelectedGothra(
      community.name.charAt(0).toUpperCase() +
        community.name.slice(1).toLowerCase(),
    ); // Set the selected community
    setGothraSearchQuery(''); // Clear search query after selection
  };

  const handleGothraFocus = () => {
    Keyboard.dismiss(); // Close the keyboard
    navigation.navigate('GothraList', {
      onSelectGothra: handleSelectGothra,
      gothraSearchQuery,
    });
  };

  const handleSubmit = () => {
    try {
      setLoading(true);
      let allClinks = [];
      if (basicInfo?.cLink?.length > 0) {
        allClinks = basicInfo?.cLink.flatMap(link => link?.linkId);
        allClinks = [...allClinks, basicInfo?._id];
      }
      const formData = {
        moreInfo: {
          ancestorVillage: ancestralLocation,
          community: selectedCommunity,
          deity: selectedDeity,
          gothra: selectedGothra,
          motherTounge: selectedScript,
          priestName: selectedPriest,
          religion: selectedReligion,
          subcommunity: selectedSubCommunity,
        },
        cLinks: basicInfo?.cLink?.length ? allClinks : [],
        cloneOwner: basicInfo?.isClone
          ? basicInfo?.cLink?.[0]?.linkId?.[0]
          : null,
        clinkIsPresent: basicInfo?.cLink?.length > 0,
        userId,
      };
      dispatch(getAdduserProfiles(formData)).then(() => handleClose());
    } catch (error) {
      setLoading(false);

      // Validation failed, set error message
      if (error.path === 'priestName') {
        setPriestNameError(error.message);
      }
      if (error.path === 'deity') {
        setDeityError(error.message);
      }
      if (error.path === 'subcommunity') {
        setSubCommunityError(error.message);
      }
    }
  };
  function handleBack() {
    if (
      religionSearchQuery !== '' ||
      selectedReligion !== null ||
      selectedScript !== null ||
      selectedPriest !== null ||
      selectedSubCommunity !== null ||
      selectedGothra !== null ||
      selectedDeity !== null ||
      ancestralLocation !== null ||
      selectedCommunity !== null ||
      communitySearchQuery !== '' ||
      scriptSearchQuery !== '' ||
      gothraSearchQuery !== ''
    ) {
      seOpenConfirmPopup(true);
    } else {
      seOpenConfirmPopup(false);
      navigation.goBack();
    }
  }
  const handleTextInputChange = (field, value) => {
    if (field === 'priestName') {
      setSelectedPriest(value);
      // Perform validation for Priest Name while typing
      if (!nameValidator(value)) {
        setPriestNameError(
          'Field can not contain special characters and numbers',
        );
      } else {
        setPriestNameError('');
      }
    } else if (field === 'deity') {
      setSelectedDeity(value);
      if (!nameValidator(value)) {
        setDeityError('Field can not contain special characters and numbers');
      } else {
        setDeityError('');
      }
    } else if (field === 'subcommunity') {
      setSelectedSubCommunity(value);
      if (!nameValidator(value)) {
        setSubCommunityError(
          'Field can not contain special characters and numbers',
        );
      } else {
        setSubCommunityError('');
      }
    }
  };

  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Community Details'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
        <GlobalStyle>
          <View style={{flex: 1}}>
            {openConfirmPopup && (
              <Confirm
                accessibilityLabel="community-confirm-popup"
                title={'Are you sure you want to leave?'}
                subTitle={'If you discard, you will lose your changes.'}
                discardCtaText={'Discard'}
                continueCtaText={'Continue Editing'}
                onContinue={() => seOpenConfirmPopup(false)}
                onDiscard={() => {
                  navigation.goBack();
                }}
                onCrossClick={() => seOpenConfirmPopup(false)}
              />
            )}
            <View onTouchEnd={() => handleReligionFocus()}>
              <CustomInput
                ref={inputRef}
                accessibilityLabel="Religion"
                label="Religion"
                testID="Religion"
                clearable
                value={
                  selectedReligion ? selectedReligion : religionSearchQuery
                }
                editable={false}
                mode="outlined"
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                outlineColor={theme.colors.altoGray}
                showSoftInputOnFocus={false}
              />
            </View>
            <View onTouchEnd={() => handleCommunityFocus()}>
              <CustomInput
                accessibilityLabel="Community"
                label="Community"
                testID="Community"
                ref={inputRefcom}
                clearable
                value={
                  selectedCommunity ? selectedCommunity : communitySearchQuery
                } // Display selectedItem's name or searchQuery
                editable={false}
                mode="outlined"
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                outlineColor={theme.colors.altoGray}
                showSoftInputOnFocus={false}
              />
            </View>
            <View>
              <CustomInput
                accessibilityLabel="Sub-Community"
                label="Sub-Community"
                testID="Sub-Community"
                clearable
                value={desanitizeInput(selectedSubCommunity || '')} // Display selectedItem's name or searchQuery
                onChangeText={text =>
                  handleTextInputChange('subcommunity', text)
                }
                mode="outlined"
                error={subCommunityError && Boolean(subCommunityError)}
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                outlineColor={theme.colors.altoGray}
              />
            </View>
            <View onTouchEnd={() => handleScriptFocus()}>
              <CustomInput
                accessibilityLabel="Mother Tongue"
                label="Mother Tongue"
                testID="Mother Tongue"
                ref={inputRefmot}
                clearable
                value={selectedScript ? selectedScript : scriptSearchQuery} // Display selectedItem's name or searchQuery
                editable={false}
                mode="outlined"
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                outlineColor={theme.colors.altoGray}
                showSoftInputOnFocus={false}
              />
            </View>
            <View onTouchEnd={() => handleGothraFocus()}>
              <CustomInput
                accessibilityLabel="Gothra"
                label="Gothra"
                testID="Gothra"
                ref={inputRefgot}
                clearable
                value={selectedGothra ? selectedGothra : gothraSearchQuery} // Display selectedItem's name or searchQuery
                editable={false}
                mode="outlined"
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                outlineColor={theme.colors.altoGray}
                showSoftInputOnFocus={false}
              />
            </View>
            <View>
              <CustomInput
                accessibilityLabel="Deity"
                label="Deity"
                testID="Deity"
                value={desanitizeInput(selectedDeity || '')} // Display selectedItem's name or searchQuery
                clearable
                onChangeText={text => handleTextInputChange('deity', text)}
                error={deityError && Boolean(deityError)}
                mode="outlined"
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                outlineColor={theme.colors.altoGray}
              />
            </View>
            <View>
              <CustomInput
                accessibilityLabel="PriestName"
                label="Priest Name"
                testID="PriestName"
                clearable
                value={desanitizeInput(selectedPriest || '')} // Display selectedItem's name or searchQuery
                onChangeText={text => handleTextInputChange('priestName', text)}
                mode="outlined"
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                error={priestNameError && Boolean(priestNameError)}
                outlineColor={theme.colors.altoGray}
              />
            </View>
            <View>
              <CustomInput
                accessibilityLabel="AncestralVillage"
                label="Ancestral Village"
                testID="AncestralVillage"
                clearable
                value={desanitizeInput(ancestralLocation || '')} // Display selectedItem's name or searchQuery
                onChangeText={text => setancestralLocation(text)}
                mode="outlined"
                style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                outlineColor={theme.colors.altoGray}
              />
            </View>

            {/* for script */}
            <Modal
              animationType="slide"
              transparent={false}
              visible={scriptModalVisible}
              onRequestClose={() => setScriptModalVisible(false)}>
              <View style={{flex: 1, marginTop: '-8%'}}>
                <GlobalHeader
                  onBack={() => {
                    Keyboard.dismiss();
                    setScriptModalVisible(false);
                  }}
                  heading={''}
                  accessibilityLabel="global-header-script"
                />

                <View style={{flex: 1, marginHorizontal: 10, marginTop: 0}}>
                  <CustomInput
                    onChangeText={text => {
                      setScriptSearchQuery(text);
                      handleScriptSearch(text);
                    }}
                    accessibilityLabel="scriptSearchQuery"
                    clearable
                    testID="scriptSearchQuery"
                    label="Search..."
                    value={scriptSearchQuery}
                    mode="outlined"
                    style={[
                      styles.textInputStyleModal,
                      {backgroundColor: 'white', marginTop: 10},
                    ]}
                    outlineColor={theme.colors.altoGray}
                  />
                  <FlatList
                    accessibilityLabel="flatList-scriptSearchQuery"
                    data={searchScriptResults}
                    keyExtractor={item => item?.id?.toString()}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        testID="scriptItems"
                        accessibilityLabel="scriptItems"
                        onPress={() => handleSelectScriptItem(item)}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          padding: 10,
                        }}>
                        <Text>
                          {item.imgurl && (
                            <Avatar.Image
                              size={40}
                              accessibilityLabel="imgurl-scriptItems"
                              //   {...props}
                              source={{uri: item.imgurl}}
                            />
                          )}
                        </Text>

                        <Text
                          style={{
                            fontSize: 16,
                            paddingLeft: 12,
                            color: 'black',
                          }}>
                          <Text
                            style={{
                              fontSize: 16,
                              paddingLeft: 12,
                              color: 'black',
                            }}
                            accessibilityLabel={item.name}>
                            {item.name.charAt(0).toUpperCase() +
                              item.name.slice(1).toLowerCase()}
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </View>

          <View style={[styles.row, {paddingTop: 20, marginBottom: 100}]}>
            <View style={styles.column12}>
              <CustomButton
                accessibilityLabel="addMedicalBtn"
                testID="addMedicalBtn"
                className="addMedicalBtn"
                label={'Save'}
                onPress={() => handleSubmit()}
                loading={loading}
                disabled={
                  Boolean(deityError) ||
                  Boolean(priestNameError) ||
                  Boolean(subCommunityError) ||
                  loading
                }
              />
            </View>
          </View>
        </GlobalStyle>
      </KeyboardAwareScrollView>
    </>
  );
};

export default CommunityInfo;
