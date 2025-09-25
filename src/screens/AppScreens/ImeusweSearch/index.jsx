/* eslint-disable no-use-before-define */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import Axios from '../../../plugin/Axios';
import {getCategoryData} from '../../../store/apps/SearchResult';
import {
  setformDataStore,
  resetFormDataStore,
} from '../../../store/apps/SearchResult';
import Theme from '../../../common/Theme';
import {Dropdown} from 'react-native-element-dropdown';
// import CustomInput from '../../CustomTextInput';
import {Text, HelperText} from 'react-native-paper';
// import Dropdown from '../../../components/ImeusweSearch/Dropdown';
import {getPublicDataPlural} from '../../../store/apps/listPublicData';

import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import {Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {CustomInput} from '../../../components';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import {Track} from '../../../../App';
import NewTheme from '../../../common/NewTheme';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {ScrollView} from 'react-native-gesture-handler';
import ButtonSpinner from '../../../common/ButtonSpinner';
import GlobalHeader from '../../../components/ProfileTab/GlobalHeader';

const ImeusweSearch = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const [formData, setFormData] = useState({
    firstName: '',
    surName: '',
  });
  const {bottom} = useSafeAreaInsets();
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear();
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allPluralData, setAllPluralData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [errors, setErrors] = useState({});
  const [isFocusPrefix, setIsFocusPrefix] = useState(false);
  const [count, setCount] = useState(1);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  const ios = Platform.OS == 'ios';
  const {top} = useSafeAreaInsets();
  const formDataStoreResult = useSelector(
    state => state.searchResult.formDataStore,
  );
  const [showAll, setShowAll] = useState(false);
  const [hasInvalidCharacters, setHasInvalidCharacters] = useState(false);
  const [selectedTopCategoryIndex, setSelectedTopCategoryIndex] =
    useState(null);
  const userData = useSelector(state => state?.userInfo);
  const categoryDataFromStore = useSelector(
    state => state.getCategoryData.getCategory || [],
  );

  const dropdownData = [
    {label: 'All Categories', value: 'all'},
    ...(Array.isArray(categoryDataFromStore)
      ? categoryDataFromStore.map(category => ({
          label: category.categoryName,
          value: category.categoryCode,
        }))
      : []),
  ];

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

  const resetForm = useCallback(() => {
    const clearedFormData = defaultFields.reduce((acc, field) => {
      acc[field.fieldName] = '';
      return acc;
    }, {});
    setFormData(clearedFormData);
    setErrors({});
    setErrorMessage('');
    setDropdownValue('');
    setLoader(false);
    setSelectedCategory(null);
    setSelectedTopCategoryIndex(null);
    dispatch(resetFormDataStore());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
        resetForm();
      }
    });

    return unsubscribe;
  }, [navigation, resetForm]);

  const handleCategorySelect = index => {
    if (index !== null) {
      const selectedCategory = categoryDataFromStore[index];

      if (selectedCategory?.categoryCode === 'ALL') {
        setFormData(prevFormData => {
          return {
            ...prevFormData,
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
            ...prevFormData,
            ...updatedFormData,
            categories: selectedCategory?.categoryCode,
          };
        });
      }
      setSelectedCategory(selectedCategory);
      setDropdownValue(selectedCategory?.categoryCode);
    }
  };
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
      [filter.fieldName]: isTextInvalid
        ? 'Field cannot contain special characters or numbers.'
        : '',
    }));
    setFormData(prevFormData => ({
      ...prevFormData,
      [filter.fieldName]: text,
    }));
    if (isTextInvalid) {
      setHasInvalidCharacters(true);
    } else {
      const allValid = Object.entries({
        ...formData,
        [filter.fieldName]: text,
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

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await dispatch(getCategoryData()).unwrap();
      } catch (error) {}
    };

    fetchCategoryData();
  }, [dispatch]);

  useEffect(() => {
    if (categoryDataFromStore.length > 0) {
      const sortedCategories = [...categoryDataFromStore].sort(
        (a, b) => b.count - a.count,
      );
      setCategoryData(
        sortedCategories.map(item => ({
          name: item?.categoryData?.categoryName || item.categoryCode,
          count: item.count,
          categoryCode: item.categoryCode,
        })),
      );
    }
  }, [categoryDataFromStore]);

  useEffect(() => {
    setFormData(formDataStoreResult);
  }, [formDataStoreResult]);

  const goBack = () => {
    navigation.goBack();
    dispatch(resetFormDataStore());
  };

  const handleSearch = async () => {
    try {
      setLoader(true);
      const capitalizeEachWord = str => {
        if (!str) return str;
        return str
          .trim()
          .split(' ')
          .map(
            word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');
      };
      const capitalize = str => str?.trim()?.toUpperCase();
      const capitalizeFirstLetter = str =>
        str?.charAt(0).toUpperCase() + str?.trim()?.slice(1).toLowerCase();
      const capitalizedFormData = {
        ...formData,
        name: formData.name ? capitalize(formData.name) : formData.name,
        middleName: formData.middleName
          ? capitalize(formData.middleName)
          : formData.middleName,
        lastName: formData.lastName
          ? capitalize(formData.lastName)
          : formData.lastName,
        location: formData.location
          ? capitalizeEachWord(formData.location)
          : formData.location,
        spouse: formData.spouse
          ? capitalizeFirstLetter(formData.spouse)
          : formData.spouse,
        district: formData.district
          ? capitalize(formData.district)
          : formData.district,
        state: formData.state ? capitalize(formData.state) : formData.state,
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
      Track({
        cleverTapEvent: 'people_search',
        mixpanelEvent: 'people_search',
        userData,
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
      setAllPluralData(response.payload);
      setCount(1);
      dispatch(setformDataStore(formData));
      navigation.navigate('ImuwTailorSearch', {
        formData: formData,
      });
    } catch (error) {}
  };

  const handleClear = () => {
    const clearedFormData = defaultFields.reduce((acc, field) => {
      acc[field.fieldName] = '';
      return acc;
    }, {});
    setErrors({});
    setErrorMessage('');
    setFormData(clearedFormData);
    setDropdownValue('');
    setLoader(false);
    setSelectedCategory(null);
  };

  const handleTopCategoryClick = index => {
    const categoryIndex = categoryDataFromStore.findIndex(
      category => category.categoryCode === index.categoryCode,
    );
    handleCategorySelect(categoryIndex);
    setSelectedTopCategoryIndex(categoryIndex);
  };
  const handleChange = event => {
    const value = event.target;
    const index = categoryDataFromStore.findIndex(
      option => option.categoryCode === value,
    );
  };
  useEffect(() => {
    const {name, middleName, lastName} = formData;
    const filledFields = [name, middleName, lastName].filter(Boolean).length;
    if (
      selectedCategory?.categoryCode === 'IM' &&
      selectedCategory?.categoryName === 'Immigration Records'
    ) {
      setIsSearchEnabled(filledFields >= 1);
      return;
    }
    setIsSearchEnabled(filledFields >= 2);
  }, [formData]);

  const handleViewMore = () => {
    setVisibleCount(categoryData.length);
    setShowAll(true);
  };

  const handleViewLess = () => {
    setVisibleCount(5);
    setShowAll(false);
  };

  const formatCategoryName = (name, maxLength = 15) => {
    const words = name.split(' ');
    let formattedText = '';
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxLength) {
        formattedText += currentLine.trim() + '\n';
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    return formattedText + currentLine.trim();
  };

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        onBack={goBack}
        marginTop={35}
        heading={'Search iMeUsWe Records'}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />
      <SafeAreaView
        animationType="slide"
        transparent={false}
        visible={true}
        stule={{
          flex: 1,
          paddingBottom: Platform.OS === 'ios' ? 50 : bottom || 20,
        }}>
        <ScrollView>
          <>
            <ImageBackground
              source={{
                uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/searchImg.png',
              }}
              style={{
                width: '100%',
                resizeMode: 'cover',
                borderRadius: 10,
                display: 'flex',
                alignSelf: 'center',
                alignContent: 'center',
                alignItems: 'center',
                height: '84%',
              }}>
              <View style={{display: 'flex', alignItems: 'center'}}>
                <Text
                  variant="bold"
                  style={{fontSize: 28, color: 'white', marginTop: 15}}>
                  Search iMeUsWe Records
                </Text>
                <Text
                  style={{fontSize: 16, color: 'white', textAlign: 'center'}}>
                  Gain a more complete picture of your{'\n'} family history by
                  accessing a vast{'\n'} collection of historical records.
                </Text>
              </View>

              <View style={{alignItems: 'center', marginTop: 10}}>
                <View
                  style={{
                    backgroundColor: Theme.light.onBackground,
                    shadowColor: '#000',
                    borderRadius: 15,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}>
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 20,
                      fontWeight: '600',
                      textAlign: 'center',
                      padding: 10,
                      paddingHorizontal: '33%',
                    }}>
                    Search
                  </Text>

                  <View style={{padding: 10, paddingTop: '1%'}}>
                    <Dropdown
                      testID="prefix"
                      style={[
                        styles.dropdownOne,
                        isFocusPrefix && {
                          borderColor: 'rgba(47, 43, 61, 0.3)',
                          borderWidth: 1.2,
                        },
                      ]}
                      mode="auto"
                      onFocus={() => setIsFocusPrefix(true)}
                      data={dropdownData}
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
                        fontWeight: 400,
                        paddingLeft: 7,
                      }}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="All Categories"
                      // eslint-disable-next-line react/jsx-no-duplicate-props
                      placeholderStyle={{
                        color: 'black',
                        paddingHorizontal: 7,
                      }}
                      value={dropdownValue}
                      onChange={item => {
                        if (item) {
                          setDropdownValue(item.value);

                          if (item.value === 'all') {
                            handleCategorySelect(-1);
                          } else {
                            const index = categoryDataFromStore.findIndex(
                              category => category.categoryCode === item.value,
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
                            style={[styles.fieldContainer, {marginBottom: 12}]}>
                            {filter.fieldType === 'text' && (
                              <>
                                <CustomInput
                                  value={formData[filter.fieldName] || ''}
                                  label={filter.displayName}
                                  onChangeText={text =>
                                    handleChangeText(filter, text)
                                  }
                                  error={!!errors[filter.fieldName]}
                                  helperText={errors[filter.fieldName] || ''}
                                />
                                {errors[filter.fieldName] && (
                                  <HelperText
                                    style={{
                                      color: 'red',
                                      paddingHorizontal: -5,
                                    }}>
                                    {errors[filter.fieldName]}{' '}
                                    {/* Display error message below the field */}
                                  </HelperText>
                                )}
                              </>
                            )}

                            {filter.fieldType === 'dropdown' && (
                              <>
                                <View
                                  style={{marginBottom: -10, marginTop: -10}}>
                                  <Dropdown
                                    testID="dropdown"
                                    style={[
                                      styles.dropdownOne,
                                      isFocusPrefix && {borderWidth: 1.2},
                                    ]}
                                    mode="auto"
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
                                      color: 'rgba(51, 48, 60, 0.5)',
                                      fontWeight: 400,
                                      paddingLeft: 5,
                                    }}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    value={formData[filter.fieldName] || ''}
                                    onChange={item =>
                                      setFormData({
                                        ...formData,
                                        [filter.fieldName]: item.value,
                                      })
                                    }
                                  />
                                </View>
                              </>
                            )}

                            {filter.fieldType === 'calendar' && (
                              <>
                                <CustomInput
                                  label={filter.displayName}
                                  keyboardType="numeric"
                                  maxLength={4}
                                  value={formData[filter.fieldName] || ''}
                                  onChangeText={text =>
                                    handleYearChange(text, filter.fieldName)
                                  }
                                  error={!!errors[filter.fieldName]}
                                  helperText={errors[filter.fieldName] || ''}
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
                    {/* Clear Button */}
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClear}>
                      <Text variant="bold" style={styles.clearButtonText}>
                        Clear
                      </Text>
                    </TouchableOpacity>

                    {/* Search Button */}
                    <TouchableOpacity
                      style={[
                        styles.searchButton,
                        (!isSearchEnabled || loader || hasInvalidCharacters) &&
                          styles.disabledButton,
                      ]}
                      onPress={handleSearch}
                      disabled={
                        !isSearchEnabled || loader || hasInvalidCharacters
                      }>
                      {loader ? (
                        <ButtonSpinner
                          color={NewTheme.colors.primaryOrange}
                          style={{paddingHorizontal: 20}}
                        />
                      ) : (
                        <Text variant="bold" style={styles.searchButtonText}>
                          Search
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View
                style={{
                  alignItems: 'center',
                  marginTop: 20,
                  marginBottom: 40,
                }}>
                <View
                  style={{
                    backgroundColor: Theme.light.onBackground,
                    shadowColor: '#000',
                    borderRadius: 10,
                    shadowOffset: {width: 0, height: 1},
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3,
                    marginBottom: 80,
                    paddingVertical: 20,
                  }}>
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 20,
                      fontWeight: '600',
                      textAlign: 'center',
                      paddingBottom: 10,
                      padding: 95,
                      paddingTop: 5,
                    }}>
                    Top Categories
                  </Text>

                  {categoryData
                    .slice(0, visibleCount)
                    .map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          handleTopCategoryClick(
                            categoryData.find(
                              c => c.categoryCode === category.categoryCode,
                            ),
                          )
                        }
                        style={[
                          styles.categoryContainer,
                          category.categoryCode === dropdownValue &&
                            styles.selectedCategory,
                        ]}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            paddingVertical: 5,
                            paddingHorizontal: 20,
                          }}>
                          <Text
                            style={{
                              color:
                                category.categoryCode === dropdownValue
                                  ? 'rgba(231, 114, 55, 1)'
                                  : 'black',
                              fontSize: 16,
                              flex: 1,
                              flexWrap: 'wrap',
                            }}>
                            {formatCategoryName(category.name, 25)}
                          </Text>

                          <Text
                            style={{
                              color:
                                category.categoryCode === dropdownValue
                                  ? 'rgba(231, 114, 55, 1)'
                                  : 'black',
                              fontSize: 16,
                              flexWrap: 'wrap',
                              alignSelf: 'flex-start',
                            }}>
                            {category.count}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}

                  {categoryData.length > 5 && (
                    <TouchableOpacity
                      onPress={showAll ? handleViewLess : handleViewMore}
                      style={styles.viewMoreToggle}>
                      <Text style={styles.viewMoreText}>
                        {showAll ? 'View Less' : 'View More'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ImageBackground>
          </>
        </ScrollView>
      </SafeAreaView>

      {/* body ends */}
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 41,
  },
  modalContainer: {
    padding: 30,
    flex: 1,
    backgroundColor: Theme.light.onInfo,
  },
  dropdownOne: {
    height: 45,
    borderColor: 'rgba(47, 43, 61, 0.3)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    marginVertical: 10,
    zIndex: 10,
  },

  textInputBack: {
    backgroundColor: Theme.light.onWhite100,
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },
  itemTextStyle: {
    color: 'black',
    fontWeight: 400,
    flexWrap: 'wrap',
  },
  viewMoreText: {
    color: '#2892FF',
    fontSize: 14,
    textAlign: 'right',
    paddingRight: 20,
    paddingBottom: 15,
    paddingTop: 8,
  },
  container: {
    padding: 16,
  },
  fieldContainer: {
    // marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
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
    paddingHorizontal: 50,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ImeusweSearch;
