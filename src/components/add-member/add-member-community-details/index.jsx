import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {
  getCommunities,
  getGothras,
  getReligions,
  getScripts,
} from '../../../store/apps/community';
import BottomSheetModal from '../../bottomsheet-modal';
import CustomInput from '../../CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const AddMemberFormCommunityDetails = ({updateFormValues}) => {
  const [selectedValues, setSelectedValues] = useState({
    religion: '',
    community: '',
    subcommunity: '',
    motherTounge: '',
    gothra: '',
    deity: '',
    priestName: '',
    ancestorVillage: '',
  });

  const [state, setState] = useState({
    data: [],
    label: '',
    placeholder: '',
    field: '',
  });
  const dispatch = useDispatch();
  const [isModalVisible, setModalVisible] = useState(false);
  const religions = useSelector(state => state?.community?.religion?.data);
  const communities = useSelector(state => state?.community?.community?.data);
  const scripts = useSelector(state => state?.community?.scripts?.data);
  const gothras = useSelector(state => state?.community?.gothra?.data);
  const navigation = useNavigation();
  const goToSelector = state => {
    navigation.navigate('BottomSheetModalAddMember', {
      data: state?.data,
      label: state?.label,
      placeholder: state?.placeholder,
      handleSelectReligion,
      field: state?.field,
    });
  };

  // Lose Focus Of Custom Inputs
  const inputRefs = {
    religion: useRef(null),
    community: useRef(null),
    motherTounge: useRef(null),
    gothra: useRef(null),
  };
  const handleAutocompleteChange = (field, value) => {
    setSelectedValues(prevValues => ({
      ...prevValues,
      [field]: value || '',
    }));
  };

  // Input Handler
  const handleTextFieldChange = (field, event) => {
    setSelectedValues(prevValues => ({
      ...prevValues,
      [field]: event,
    }));
  };

  useEffect(() => {
    try {
      (async () => {
        await dispatch(getReligions()).unwrap();
        const data = selectedValues?.religion || 'No comment';

        const religionData = {
          religion: data,
        };
        await dispatch(getCommunities(religionData)).unwrap();
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

  // Update Formik Values
  useEffect(() => {
    updateFormValues('moreInfo', selectedValues);
  }, [selectedValues]);

  const [selectedReligion, setSelectedReligion] = useState('');

  // Selected Field
  const handleSelectReligion = (value, field) => {
    if (field === 'religion') {
      setSelectedValues(prevValues => ({
        ...prevValues,
        religion: value.name || '',
      }));
    } else if (field === 'communities') {
      setSelectedValues(prevValues => ({
        ...prevValues,
        community: value.name || '',
      }));
    } else if (field === 'mother-tongue') {
      setSelectedValues(prevValues => ({
        ...prevValues,
        motherTounge: value.name || '',
      }));
    } else if (field === 'gothras') {
      setSelectedValues(prevValues => ({
        ...prevValues,
        gothra: value.name || '',
      }));
    }
    // setSelectedReligion(religion.name);
    setModalVisible(false);
  };

  // Capitalize
  function capitalizeWords(str) {
    // Replace unwanted symbols with an empty string
    str = str.replace(/[^a-zA-Z\s]/g, '');

    // Capitalize the first letter of each word
    return str.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  }
  const [isMounted, setIsMounted] = useState(false);

  // Function to handle reading data from AsyncStorage
  const loadSelectedValues = async () => {
    try {
      const savedState = await AsyncStorage.getItem('addMember_CD');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setSelectedValues(parsedState);
      }
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
    }
    setIsMounted(true);
  };

  // Update AsyncStorage whenever selectedValues change
  useEffect(() => {
    if (isMounted) {
      AsyncStorage.setItem(
        'addMember_CD',
        JSON.stringify(selectedValues),
      ).catch(error => {
        console.error('Error saving to AsyncStorage:', error);
      });
    }
  }, [selectedValues]);

  // Load selectedValues from AsyncStorage when component mounts
  useEffect(() => {
    loadSelectedValues();
  }, []);

  const closeModal = () => {
    setModalVisible(false);
    // Reset focus of each CustomInput after modal closes
    Object.keys(inputRefs).forEach(key => {
      if (inputRefs[key].current) {
        inputRefs[key].current.blur();
      }
    });
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: 'white',
        marginTop: -50,
        paddingBottom: 30,
        paddingHorizontal: Platform.OS === 'ios' ? 20 : 0,
        gap: 10,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'space-between',
      }}>
      <View
        onTouchEnd={() => {
          setState({
            data: religions,
            label: 'Search Religion',
            placeholder: '',
            field: 'religion',
          }),
            goToSelector({
              data: religions,
              label: 'Search Religion',
              placeholder: '',
              field: 'religion',
            });
        }}
        style={[styles.inputWrapper]}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={styles.input}
          testID="religions"
          label="Religion"
          value={selectedValues?.religion}
          editable={false}
          ref={inputRefs.religion}
          showSoftInputOnFocus={false}
        />
      </View>
      <View
        onTouchEnd={() => {
          setState({
            data: communities,
            label: 'Search Community',
            placeholder: '',
            field: 'communities',
          });
          goToSelector({
            data: communities,
            label: 'Search Community',
            placeholder: '',
            field: 'communities',
          });
        }}
        style={styles.inputWrapper}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={styles.input}
          testID="Community"
          label="Community"
          name="Community"
          value={selectedValues?.community}
          editable={false}
          ref={inputRefs.community}
          showSoftInputOnFocus={false}
        />
      </View>
      <View style={styles.inputWrapper}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={styles.input}
          testID="Sub-Community"
          label="Sub-Community"
          name="Sub-Community"
          value={selectedValues?.subcommunity}
          onChangeText={event => {
            const capitalizedText =
              event.charAt(0).toUpperCase() + event.slice(1);
            handleTextFieldChange('subcommunity', capitalizedText);
          }}
          clearable
        />
      </View>
      <View
        onTouchEnd={() => {
          setState({
            data: scripts?.map(script => ({
              ...script,
              name: capitalizeWords(script?.name),
            })),
            label: 'Mother Tongue',
            placeholder: '',
            field: 'mother-tongue',
          });
          goToSelector({
            data: scripts?.map(script => ({
              ...script,
              name: capitalizeWords(script?.name),
            })),
            label: 'Mother Tongue',
            placeholder: '',
            field: 'mother-tongue',
          });
        }}
        style={styles.inputWrapper}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={{backgroundColor: 'white'}}
          testID="motherTounge"
          label="Mother Tongue"
          name="motherTounge"
          value={selectedValues?.motherTounge}
          editable={false}
          ref={inputRefs.motherTounge}
          showSoftInputOnFocus={false}
        />
      </View>

      <View
        onTouchEnd={() => {
          setState({
            data: gothras?.map(gothra => ({
              ...gothra,
              name: capitalizeWords(gothra?.name), // Capitalizing the first letter of each word
            })),
            label: 'Gothra',
            placeholder: '',
            field: 'gothras',
          });
          goToSelector({
            data: gothras?.map(gothra => ({
              ...gothra,
              name: capitalizeWords(gothra?.name), // Capitalizing the first letter of each word
            })),
            label: 'Gothra',
            placeholder: '',
            field: 'gothras',
          });
        }}
        style={styles.inputWrapper}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={{backgroundColor: 'white'}}
          testID="Gothra"
          label="Gothra"
          name="Gothra"
          value={selectedValues?.gothra}
          editable={false}
          ref={inputRefs.gothra}
          showSoftInputOnFocus={false}
        />
      </View>
      <View style={styles.inputWrapper}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={{backgroundColor: 'white'}}
          testID="Deity"
          label="Deity"
          name="Deity"
          value={selectedValues?.deity}
          onChangeText={event => {
            const capitalizedText =
              event.charAt(0).toUpperCase() + event.slice(1);
            handleTextFieldChange('deity', capitalizedText);
          }}
          clearable
        />
      </View>
      <View style={styles.inputWrapper}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={{backgroundColor: 'white'}}
          testID="priest-name"
          label="Priest Name"
          name="Priest Name"
          value={selectedValues?.priestName}
          onChangeText={event => {
            const capitalizedText =
              event.charAt(0).toUpperCase() + event.slice(1);
            handleTextFieldChange('priestName', capitalizedText);
          }}
          clearable
        />
      </View>
      <View style={styles.inputWrapper}>
        <CustomInput
          inputHeight={45}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          style={{backgroundColor: 'white'}}
          testID="ancestral-Village"
          label="Ancestral Village"
          name="ancestorVillage"
          value={selectedValues?.ancestorVillage}
          onChangeText={text => {
            const capitalizedText =
              text.charAt(0).toUpperCase() + text.slice(1);
            setSelectedValues(prevValues => ({
              ...prevValues,
              ancestorVillage: capitalizedText || '',
            }));
          }}
          clearable
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'white',
  },
  inputWrapper: {
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
});

export default AddMemberFormCommunityDetails;
