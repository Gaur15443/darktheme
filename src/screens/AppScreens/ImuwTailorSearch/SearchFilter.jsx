import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform,
} from 'react-native';
import Share from 'react-native-share';
import {
  ActivityIndicator,
  Icon,
  TextInput,
  Text,
  HelperText,
} from 'react-native-paper';
import Theme from '../../../common/Theme';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import CustomInput from '../../../components/CustomTextInput';
import NewTheme from '../../../common/NewTheme';
import {Dropdown} from 'react-native-element-dropdown';
import {getPublicDataPlural} from '../../../store/apps/listPublicData';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  setformDataStore,
  resetFormDataStore,
} from '../../../store/apps/SearchResult';
import {Track} from '../../../../App';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {ScrollView} from 'react-native-gesture-handler';

const SearchFilter = ({
  visible,
  onClose,
  invitedMemberDetails,
  onDataSubmit,
  initialFilters,
  playAnimation,
  animationRef,
}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const navigator = useNavigation();
  const [isFocusPrefix, setIsFocusPrefix] = useState(false);
  const [formData, setFormData] = useState({...initialFilters});
  const [dropdownValue, setDropdownValue] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loader, setLoader] = useState(false);
  const [allPluralData, setAllPluralData] = useState([]);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [hasInvalidCharacters, setHasInvalidCharacters] = useState(false);
  const [count, setCount] = useState(1);
  const [localFilters, setLocalFilters] = useState(initialFilters || {});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const currentYear = new Date().getFullYear();
  const defaultFields = [
    {
      fieldType: 'text',
      fieldName: 'name',
      displayName: 'First Name',
      isRequired: false,
    },
    {
      fieldType: 'text',
      fieldName: 'middleName',
      displayName: 'Middle Name',
      isRequired: false,
    },
    {
      fieldType: 'text',
      fieldName: 'lastName',
      displayName: 'Last Name',
      isRequired: false,
    },
    {
      fieldType: 'dropdown',
      fieldName: 'sex',
      displayName: 'Gender',
      isRequired: false,
      options: ['Male', 'Female'],
    },
    {
      fieldType: 'text',
      fieldName: 'location',
      displayName: 'Location',
      isRequired: false,
    },
    {
      fieldType: 'calendar',
      fieldName: 'dateOfBirth',
      displayName: 'Year of Birth (YYYY)',
      isRequired: false,
    },
  ];

  const handleChangeText = (filter, text) => {
    const regex = /^[a-zA-Z\s]*$/;
    const isTextInvalid =
      !regex.test(text) &&
      [
        'name',
        'middleName',
        'lastName',
        'spouse',
        'state',
        'district',
        'Village',
        'location',
      ].includes(filter?.fieldName);

    setErrors(prevErrors => ({
      ...prevErrors,
      [filter?.fieldName]: isTextInvalid
        ? 'Field cannot contain special characters or numbers.'
        : '',
    }));
    setFormData(prevFormData => ({
      ...prevFormData,
      [filter?.fieldName]: text,
    }));
    if (isTextInvalid) {
      setHasInvalidCharacters(true);
    } else {
      const allValid = Object.entries({
        ...formData,
        [filter?.fieldName]: text,
      }).every(([key, value]) => {
        if (
          [
            'name',
            'middleName',
            'lastName',
            'spouse',
            'state',
            'district',
            'Village',
            'location',
          ].includes(key)
        ) {
          return regex.test(value || '');
        }
        return true;
      });

      setHasInvalidCharacters(!allValid);
    }
  };

  // Listen for keyboard events to toggle the status bar color
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setIsKeyboardVisible(true); // Keyboard is visible, set creamy color on iOS
        },
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setIsKeyboardVisible(false); // Keyboard is hidden, set transparent on iOS
        },
      );

      // Cleanup listeners on unmount
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, []);
  const handleYearChange = (text, fieldName, value) => {
    const numericText = text.replace(/\D/g, '');

    const year = numericText ? parseInt(numericText, 10) : null;
    const newErrors = {...errors};

    if (year && year > currentYear) {
      newErrors[fieldName] =
        'Future dates are not accepted. Please enter \na past date.';
    } else {
      newErrors[fieldName] = '';
    }

    setErrors(newErrors);
    setFormData({...formData, [fieldName]: numericText});
  };
  const userInfo = useSelector(state => state?.userInfo ?? {});
  const categoryDataFromStore = useSelector(
    state => state?.getCategoryData?.getCategory || [],
  );

  const dropdownData = [
    {label: 'All Categories', value: 'all'},
    ...(Array.isArray(categoryDataFromStore)
      ? categoryDataFromStore?.map(category => ({
          label: category?.categoryName,
          value: category?.categoryCode,
        }))
      : []),
  ];
  const [inviteeName, setInviteeName] = useState(
    invitedMemberDetails
      ? invitedMemberDetails?.fname + ' ' + invitedMemberDetails?.lname
      : '',
  );
  const [isEnabled, setIsEnabled] = useState(
    invitedMemberDetails ? true : false,
  );

  const [error, setError] = useState('');
  const [groupData, setGroupData] = useState(null);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (field, value) => {
    setLocalFilters({
      ...localFilters,
      [field]: value,
    });
  };

  const handleTextChange = inputText => {
    const capitalizedText =
      inputText?.charAt(0)?.toUpperCase() + inputText?.slice(1)?.toLowerCase();
    setInviteeName(capitalizedText);
    setIsEnabled(capitalizedText?.trim().length > 0);
    if (capitalizedText?.trim() && error) {
      setError('');
    } else if (!capitalizedText?.trim()) {
      setError('This field is required');
    }
  };

  const handleClear = () => {
    dispatch(resetFormDataStore());
    const clearedFormData = defaultFields?.reduce((acc, field) => {
      acc[field?.fieldName] = '';
      return acc;
    }, {});
    setErrors({});
    setError();
    setFormData(clearedFormData);
    setDropdownValue('');
    setLoader(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    const {name, middleName, lastName} = formData;
    const filledFields = [name, middleName, lastName]?.filter(Boolean).length;
    if (
      selectedCategory?.categoryCode === 'IM' &&
      selectedCategory?.categoryName === 'Immigration Records'
    ) {
      setIsSearchEnabled(filledFields >= 1);
      return;
    }
    setIsSearchEnabled(filledFields >= 2);
  }, [formData]);

  const handleCategorySelect = index => {
    if (index !== null) {
      const selectedCategory = categoryDataFromStore?.[index];

      if (selectedCategory?.categoryCode === 'ALL') {
        setFormData(prevFormData => {
          const filteredFields = Object.keys(prevFormData)
            .filter(fieldName => {
              return ['name', 'lastName', 'middleName']?.includes(fieldName);
            })
            .reduce((acc, fieldName) => {
              acc[fieldName] = prevFormData[fieldName];
              return acc;
            }, {});

          return {
            ...filteredFields,
            categories: 'ALL',
          };
        });
      } else {
        setFormData(prevFormData => {
          const updatedFormData = selectedCategory?.filters?.reduce(
            (acc, filter) => {
              const fieldName = filter?.fieldName;
              if (prevFormData[fieldName] !== undefined) {
                acc[fieldName] = prevFormData[fieldName];
              }
              return acc;
            },
            {},
          );
          return {
            ...updatedFormData,
            categories: selectedCategory?.categoryCode,
          };
        });
      }
      setSelectedCategory(selectedCategory);
      setDropdownValue(selectedCategory?.categoryCode);
    }
  };
  const handleSearch = async () => {
    try {
      setLoader(true);
      const capitalizeEachWord = str => {
        if (!str) return str;
        return str
          .split(' ')
          .map(
            word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');
      };

      const capitalize = str => str?.toUpperCase();
      const capitalizeFirstLetter = str =>
        str?.charAt(0)?.toUpperCase() + str?.slice(1)?.toLowerCase();

      const capitalizedFormData = {
        ...formData,
        name: formData?.name ? capitalize(formData.name) : formData?.name,
        middleName: formData?.middleName
          ? capitalize(formData?.middleName)
          : formData?.middleName,
        lastName: formData?.lastName
          ? capitalize(formData?.lastName)
          : formData?.lastName,
        location: formData?.location
          ? capitalizeEachWord(formData?.location)
          : formData?.location,
        spouse: formData?.spouse
          ? capitalizeFirstLetter(formData?.spouse)
          : formData?.spouse,
        district: formData?.district
          ? capitalize(formData?.district)
          : formData?.district,
        state: formData?.state ? capitalize(formData?.state) : formData?.state,
      };

      /* customer io and mixpanel event changes  start */
      const props = {
        search_first_name: capitalizedFormData?.name,
        search_middle_name: capitalizedFormData?.middleName,
        search_last_name: capitalizedFormData?.lastName,
        search_location: capitalizedFormData?.location,
        search_state: capitalizedFormData?.state,
        search_district: capitalizedFormData?.district,
        search_spouse: capitalizedFormData?.spouse,
        search_gender: capitalizedFormData?.sex,
        search_date_of_birth: capitalizedFormData?.dateOfBirth,
        search_categories: capitalizedFormData?.categories,
      };
      Track?.({
        cleverTapEvent: 'altered_search',
        mixpanelEvent: 'altered_search',
        userInfo,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      /* clevertap and mixpanel events ---end****/

      const filteredFormData = Object.fromEntries(
        Object.entries(capitalizedFormData).filter(
          ([key, value]) =>
            value !== '' && value !== null && value !== undefined,
        ),
      );

      const data = {
        ...filteredFormData,
        pageNum: count,
        pageSize: 10,
      };
      const response = await dispatch(getPublicDataPlural({payload: data}));
      setLoader(false);

      if (response.payload?.length === 0) {
        return;
      }

      setAllPluralData(response?.payload);
      onDataSubmit(capitalizedFormData);
      setCount(1);
      onClose();
      dispatch(setformDataStore(formData));
      // eslint-disable-next-line no-catch-shadow
    } catch (error) {}
  };

  useEffect(() => {
    const selectedCategoryValues = (selectedCategory?.filters || []).reduce(
      (acc, filter) => {
        acc[filter?.fieldName] = formData[filter?.fieldName] || '';
        return acc;
      },
      {},
    );
    setFormData({...initialFilters, ...selectedCategoryValues});
    setDropdownValue(formData?.categories || '');
    const index = categoryDataFromStore?.findIndex(
      category => category?.categoryCode === formData?.categories,
    );
    if (index !== -1) {
      handleCategorySelect(index);
    }
  }, [initialFilters, selectedCategory]);

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView
              behavior="padding"
              style={{flex: 1, justifyContent: 'flex-end'}}>
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                }}
                keyboardShouldPersistTaps="handled">
                <View
                  style={{
                    height: insets?.top,
                    backgroundColor: isKeyboardVisible
                      ? '#FEF9F1'
                      : 'transparent',
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                />
                <TouchableWithoutFeedback
                  onPress={e => {
                    e.stopPropagation();
                    Keyboard.dismiss();
                  }}>
                  <View
                    style={{
                      backgroundColor: '#FEF9F1',
                      width: '100%',
                      padding: 20,
                      borderTopLeftRadius: 20,
                      borderTopRightRadius: 20,
                      alignSelf: 'center',
                      position: 'absolute',
                      bottom: 0,
                    }}>
                    <View style={styles.closeWrapper}>
                      <TouchableOpacity
                        testID="invite-close"
                        onPress={() => {
                          onClose();
                          setInviteeName('');
                          setIsEnabled(false);
                        }}
                        style={{
                          backgroundColor: 'lightgray',
                          marginTop: -20,
                          marginRight: -32,
                          borderRadius: 5,
                          elevation: 9,
                        }}></TouchableOpacity>
                    </View>
                    <View style={{alignItems: 'center', marginTop: 10}}>
                      <View
                        style={{
                          backgroundColor: Theme.light.onBackground,
                          shadowColor: '#000',
                          borderRadius: 10,
                          shadowOffset: {
                            width: 0,
                            height: 1,
                          },
                          shadowOpacity: 0.22,
                          shadowRadius: 2.22,
                          elevation: 3,
                          paddingRight: 10,
                          paddingLeft: 10,
                          paddingTop: 10,
                        }}>
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: 20,
                            fontWeight: '600',
                            textAlign: 'center',
                            padding: 10,
                            paddingHorizontal: '37%',
                          }}>
                          Search
                        </Text>

                        <View style={{padding: 10, paddingTop: '1%'}}>
                          <Dropdown
                            testID="prefix"
                            style={[
                              styles.dropdownOne,
                              isFocusPrefix && {
                                borderWidth: 1.2,
                              },
                            ]}
                            onFocus={() => setIsFocusPrefix(true)}
                            data={dropdownData}
                            mode="auto"
                            itemTextStyle={[
                              styles.itemTextStyle,
                              {
                                flexWrap: 'wrap',
                                fontSize: 14,
                                color: 'black',
                              },
                            ]}
                            selectedTextStyle={{
                              flexWrap: 'wrap',
                              fontSize: 14,
                              color: 'black',
                            }}
                            placeholderStyle={{
                              color: 'rgba(47, 43, 61, 0.6)',
                              fontWeight: '400',
                              paddingLeft: 7,
                            }}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="All Categories"
                            placeholderStyle={{
                              color: 'black',
                              paddingLeft: 7,
                            }}
                            value={dropdownValue ?? formData.categories ?? ''}
                            onChange={item => {
                              if (item) {
                                setDropdownValue(item?.value);

                                if (item.value === 'all') {
                                  handleCategorySelect(-1);
                                } else {
                                  const index =
                                    categoryDataFromStore?.findIndex(
                                      category =>
                                        category?.categoryCode === item?.value,
                                    );
                                  handleCategorySelect(index);
                                }
                              }
                            }}
                          />
                          {(selectedCategory?.filters || defaultFields).map(
                            filter => {
                              return (
                                <View
                                  style={[
                                    styles.fieldContainer,
                                    {marginBottom: 12},
                                  ]}
                                  key={filter.fieldName}>
                                  {filter?.fieldType === 'text' && (
                                    <>
                                      <CustomInput
                                        label={filter?.displayName}
                                        value={
                                          formData[filter?.fieldName] || ''
                                        }
                                        onChangeText={text =>
                                          handleChangeText(filter, text)
                                        }
                                        error={!!errors[filter?.fieldName]}
                                        helperText={
                                          errors[filter?.fieldName] || ''
                                        }
                                      />
                                      {errors[filter?.fieldName] && (
                                        <HelperText
                                          style={{
                                            color: 'red',
                                            paddingHorizontal: -5,
                                          }}>
                                          {errors[filter?.fieldName]}
                                        </HelperText>
                                      )}
                                    </>
                                  )}

                                  {filter?.fieldType === 'dropdown' && (
                                    <>
                                      <View
                                        style={{
                                          marginBottom: -10,
                                          marginTop: -10,
                                        }}>
                                        <Dropdown
                                          testID="dropdown"
                                          style={[
                                            styles.dropdownOne,
                                            isFocusPrefix && {borderWidth: 1.2},
                                          ]}
                                          onFocus={() => setIsFocusPrefix(true)}
                                          data={filter.options.map(option => ({
                                            label: option,
                                            value: option,
                                          }))}
                                          itemTextStyle={styles.itemTextStyle}
                                          placeholder={filter.displayName}
                                          selectedTextStyle={{
                                            color: 'black',
                                            paddingHorizontal: 7,
                                          }}
                                          placeholderStyle={{
                                            color: 'rgba(47, 43, 61, 0.6)',
                                            fontWeight: '400',
                                            paddingLeft: 5,
                                          }}
                                          maxHeight={300}
                                          labelField="label"
                                          valueField="value"
                                          value={
                                            formData[filter?.fieldName] || ''
                                          }
                                          mode="auto"
                                          onChange={item =>
                                            setFormData({
                                              ...formData,
                                              [filter.fieldName]: item?.value,
                                            })
                                          }
                                        />
                                      </View>
                                    </>
                                  )}

                                  {filter?.fieldType === 'calendar' && (
                                    <>
                                      <CustomInput
                                        label={filter?.displayName}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        value={
                                          formData[filter?.fieldName] || ''
                                        }
                                        onChangeText={text =>
                                          handleYearChange(
                                            text,
                                            filter?.fieldName,
                                          )
                                        }
                                        error={!!errors[filter?.fieldName]}
                                        helperText={
                                          errors[filter?.fieldName] || ''
                                        }
                                      />
                                      {errors[filter?.fieldName] && (
                                        <HelperText
                                          style={{
                                            color: 'red',
                                            paddingHorizontal: -5,
                                          }}>
                                          {errors[filter?.fieldName]}
                                        </HelperText>
                                      )}
                                    </>
                                  )}
                                </View>
                              );
                            },
                          )}
                        </View>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClear}>
                            <Text variant="bold" style={styles.clearButtonText}>
                              Clear
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.searchButton,
                              (!isSearchEnabled ||
                                loader ||
                                hasInvalidCharacters) &&
                                styles.disabledButton,
                            ]}
                            onPress={handleSearch}
                            disabled={
                              !isSearchEnabled || loader || hasInvalidCharacters
                            }>
                            {loader ? (
                              <ActivityIndicator
                                size="small"
                                color={NewTheme.colors.primaryOrange}
                                style={{paddingHorizontal: 12}}
                              />
                            ) : (
                              <Text
                                variant="bold"
                                style={styles.searchButtonText}>
                                Apply
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            // On Android, skip KeyboardAvoidingView and render directly
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                }}
                keyboardShouldPersistTaps="handled">
                {/* No custom status bar for Android */}
                <TouchableWithoutFeedback
                  onPress={e => {
                    e.stopPropagation(); // Prevent the touch event from reaching the backdrop
                    Keyboard.dismiss(); // Dismiss the keyboard when tapping inside the modal
                  }}>
                  <View
                    style={{
                      backgroundColor: '#FEF9F1',
                      width: '100%',
                      padding: 20,
                      borderTopLeftRadius: 20,
                      borderTopRightRadius: 20,
                      alignSelf: 'center',
                      position: 'absolute',
                      bottom: 0,
                    }}>
                    {/* Modal Content */}
                    <View style={styles.closeWrapper}>
                      <TouchableOpacity
                        testID="invite-close"
                        onPress={() => {
                          onClose();
                          setInviteeName('');
                          setIsEnabled(false);
                        }}
                        style={{
                          backgroundColor: 'lightgray',
                          marginTop: -20,
                          marginRight: -32,
                          borderRadius: 5,
                          elevation: 9,
                        }}></TouchableOpacity>
                    </View>
                    <View style={{alignItems: 'center', marginTop: 10}}>
                      <View
                        style={{
                          backgroundColor: Theme.light.onBackground,
                          shadowColor: '#000',
                          borderRadius: 10,
                          shadowOffset: {
                            width: 0,
                            height: 1,
                          },
                          shadowOpacity: 0.22,
                          shadowRadius: 2.22,
                          elevation: 3,
                          paddingRight: 10,
                          paddingLeft: 10,
                          paddingTop: 10,
                        }}>
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: 20,
                            fontWeight: '600',
                            textAlign: 'center',
                            padding: 10,
                            paddingHorizontal: '37%',
                          }}>
                          Search
                        </Text>

                        <View style={{padding: 10, paddingTop: '1%'}}>
                          <Dropdown
                            testID="prefix"
                            style={[
                              styles.dropdownOne,
                              isFocusPrefix && {
                                borderWidth: 1.2,
                              },
                            ]}
                            onFocus={() => setIsFocusPrefix(true)}
                            data={dropdownData}
                            mode="auto"
                            itemTextStyle={[
                              styles.itemTextStyle,
                              {
                                flexWrap: 'wrap',
                                fontSize: 14,
                                color: 'black',
                              },
                            ]}
                            selectedTextStyle={{
                              flexWrap: 'wrap',
                              fontSize: 14,
                              color: 'black',
                            }}
                            placeholderStyle={{
                              color: 'rgba(47, 43, 61, 0.6)',
                              fontWeight: '400',
                              paddingLeft: 7,
                            }}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="All Categories"
                            placeholderStyle={{
                              color: 'black',
                              paddingLeft: 7,
                            }}
                            value={dropdownValue || formData.categories || ''}
                            onChange={item => {
                              if (item) {
                                setDropdownValue(item?.value);

                                if (item.value === 'all') {
                                  handleCategorySelect(-1);
                                } else {
                                  const index =
                                    categoryDataFromStore?.findIndex(
                                      category =>
                                        category.categoryCode === item?.value,
                                    );
                                  handleCategorySelect(index);
                                }
                              }
                            }}
                          />
                          {(selectedCategory?.filters || defaultFields).map(
                            filter => {
                              return (
                                <View
                                  style={[
                                    styles.fieldContainer,
                                    {marginBottom: 12},
                                  ]}
                                  key={filter.fieldName}>
                                  {filter.fieldType === 'text' && (
                                    <>
                                      <CustomInput
                                        label={filter.displayName}
                                        value={
                                          formData[filter?.fieldName] || ''
                                        }
                                        onChangeText={text =>
                                          handleChangeText(filter, text)
                                        }
                                        error={!!errors[filter?.fieldName]}
                                        helperText={
                                          errors[filter?.fieldName] || ''
                                        }
                                      />
                                      {errors[filter?.fieldName] && (
                                        <HelperText
                                          style={{
                                            color: 'red',
                                            paddingHorizontal: -5,
                                          }}>
                                          {errors[filter?.fieldName]}
                                        </HelperText>
                                      )}
                                    </>
                                  )}

                                  {filter?.fieldType === 'dropdown' && (
                                    <>
                                      <View
                                        style={{
                                          marginBottom: -10,
                                          marginTop: -10,
                                        }}>
                                        <Dropdown
                                          testID="dropdown"
                                          style={[
                                            styles.dropdownOne,
                                            isFocusPrefix && {borderWidth: 1.2},
                                          ]}
                                          onFocus={() => setIsFocusPrefix(true)}
                                          data={filter.options.map(option => ({
                                            label: option,
                                            value: option,
                                          }))}
                                          itemTextStyle={styles.itemTextStyle}
                                          placeholder={filter.displayName}
                                          selectedTextStyle={{
                                            color: 'black',
                                            paddingHorizontal: 7,
                                          }}
                                          placeholderStyle={{
                                            color: 'rgba(47, 43, 61, 0.6)',
                                            fontWeight: '400',
                                            paddingLeft: 5,
                                          }}
                                          maxHeight={300}
                                          labelField="label"
                                          valueField="value"
                                          value={
                                            formData[filter.fieldName] || ''
                                          }
                                          mode="auto"
                                          onChange={item =>
                                            setFormData({
                                              ...formData,
                                              [filter.fieldName]: item?.value,
                                            })
                                          }
                                        />
                                      </View>
                                    </>
                                  )}

                                  {filter?.fieldType === 'calendar' && (
                                    <>
                                      <CustomInput
                                        label={filter.displayName}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        value={
                                          formData[filter?.fieldName] || ''
                                        }
                                        onChangeText={text =>
                                          handleYearChange(
                                            text,
                                            filter.fieldName,
                                          )
                                        }
                                        error={!!errors[filter.fieldName]}
                                        helperText={
                                          errors[filter.fieldName] || ''
                                        }
                                      />
                                      {errors[filter.fieldName] && (
                                        <HelperText
                                          style={{
                                            color: 'red',
                                            paddingHorizontal: -5,
                                          }}>
                                          {errors[filter.fieldName]}
                                        </HelperText>
                                      )}
                                    </>
                                  )}
                                </View>
                              );
                            },
                          )}
                        </View>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClear}>
                            <Text variant="bold" style={styles.clearButtonText}>
                              Clear
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.searchButton,
                              (!isSearchEnabled ||
                                loader ||
                                hasInvalidCharacters) &&
                                styles.disabledButton,
                            ]}
                            onPress={handleSearch}
                            disabled={
                              !isSearchEnabled || loader || hasInvalidCharacters
                            }>
                            {loader ? (
                              <ActivityIndicator
                                size="small"
                                color={NewTheme.colors.primaryOrange}
                                style={{paddingHorizontal: 12}}
                              />
                            ) : (
                              <Text
                                variant="bold"
                                style={styles.searchButtonText}>
                                Apply
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </ScrollView>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    justifyContent: 'center',
    color: 'black',
  },
  closeWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: -20,
    padding: 10,
    marginRight: -10,
    color: 'black',
  },
  tabWrapper: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    gap: 6,
    color: 'black',
  },
  image: {
    width: 30,
    height: 30,
    flex: 1,
  },
  text: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: 'black',
  },
  input: {
    backgroundColor: Theme.light.onSecondary,
    height: 50,
    width: '100%',
    marginBottom: 5,
    marginTop: 20,
    color: 'black',
  },
  button: {
    width: '80%',
    backgroundColor: NewTheme.colors.primaryOrange,
    padding: 9,
    borderRadius: 9,
    marginBottom: 20,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  enabledButton: {
    opacity: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonOpacity: {
    pointerEvents: 'none',
  },
  toggleButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textgray: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#888888',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    marginBottom: 20,
    justifyContent: 'space-between',
    marginRight: '5%',
    marginLeft: 10,
  },
  clearButton: {
    backgroundColor: '#FFDBC9',
    borderWidth: 1,
    borderColor: '#FFDBC9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: 'rgba(231, 114, 55, 1)',
  },
  searchButton: {
    backgroundColor: 'rgba(231, 114, 55, 1)',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
  },
  dropdownOne: {
    height: 45,
    borderColor: 'rgba(51, 48, 60, 0.3)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    marginVertical: 10,
    zIndex: 10,
  },
  itemTextStyle: {
    color: 'black',
    fontWeight: '400',
    flexWrap: 'wrap',
  },
});

SearchFilter.propTypes = {
  familyName: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.any,
  invitedMemberDetails: PropTypes.object,
  invitedType: PropTypes.string,
  inviteEvent: PropTypes.string,
};

export default SearchFilter;
