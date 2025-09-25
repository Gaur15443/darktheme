import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import moment from 'moment';
import {useFormik} from 'formik';
import Theme from '../../../common/Theme';
import {useTheme, Divider, Text} from 'react-native-paper';
import {
  daysInMonth,
  generateMonthList,
  getDateFromOffset,
} from '../../../utils/format';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import CustomInput from '../../CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalCheckBox from '../../../components/ProfileTab/GlobalCheckBox';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';
import {Dropdown} from 'react-native-element-dropdown';
import NewTheme from '../../../common/NewTheme';
import CustomDropdown from '../../customDropdown';

export default function AddMemberFormEducationDetails({
  onValidationChange,
  updateFormValues,
}) {
  const initialFields = {
    degree: '',
    address: '',
    name: '',
    location: '',
    search_data: [],
    dateOfFrom: '',
    dateOfTo: '',
    FD_Flag: '',
    TD_Flag: '',
    isAroundEducationStartDate: false,
    isAroundEducationEndDate: false,
    isPresentlyStudying: false,
  };

  const [formFields, setFormFields] = useState([initialFields]);
  const dataPrefix = [
    {label: 'On', value: '1'},
    {label: 'Around (~)', value: '2'},
  ];

  const filteredData = value => {
    if (value === '1') {
      // If prefix field is set to "On", filter out "On" from the data
      return dataPrefix.filter(item => item.value !== '1');
    } else if (value === '2') {
      // If prefix field is set to "Around", filter out "Around" from the data
      return dataPrefix.filter(item => item.value !== '2');
    } else {
      return dataPrefix;
    }
  };

  const [monthLists, setMonthLists] = useState([]);
  const [toMonthLists, setToMonthLists] = useState([]);
  const [dateLists, setDatesLists] = useState([]);
  const [toDateLists, setToDatesLists] = useState([]);
  const [onOrAroundStartDate, setOnOrAroundStartDate] = useState(['1']);
  const [onOrAroundEndDate, setOnOrAroundEndDate] = useState(['1']);
  const [toPresent, setToPresent] = useState([false]);
  const [minDate, setMinDate] = useState([]);
  const [maxDate, setMaxDate] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusFromPrefix, setIsFocusFromPrefix] = useState([false]);
  const [isFocusToPrefix, setIsFocusToPrefix] = useState([false]);
  const theme = useTheme();
  // Education From Date Picker State
  const [
    isEducationFromDatePickerVisible,
    setEducationFromDatePickerVisibility,
  ] = useState(false);
  const [selectedEducationFromDate, setSelectedEducationFromDate] = useState(
    [],
  );
  const educationFromDateInputRef = useRef(null);
  // Lose Focus Of Custom Inputs
  const inputRefs = {
    degree: useRef(null),
    institutionName: useRef(null),
    institutionLocation: useRef(null),
  };
  const blurInputs = () => {
    Object.keys(inputRefs).forEach(key => {
      if (inputRefs[key].current) {
        inputRefs[key].current.blur();
      }
    });
  };
  // Education To Date Picker State
  const [isEducationToDatePickerVisible, setEducationToDatePickerVisibility] =
    useState(false);
  const [selectedEducationToDate, setSelectedEducationToDate] = useState([]);
  const educationToDateInputRef = useRef(null);

  // Education From Date Handler
  const handleEducationFromDateChange = (date, educationIndex) => {
    const fullIsoEdFrom = new Date(date).toISOString();

    const updatedMinDates = {
      ...minDate,
      [educationIndex]: date,
    };
    setMinDate(updatedMinDates);

    const updatedSelectedEducationFromDates = {
      ...selectedEducationFromDate,
      [educationIndex]: moment(date).format('DD MMM YYYY'),
    };
    const updatedFormFields = [...formFields];

    updatedFormFields[educationIndex] = {
      ...updatedFormFields[educationIndex],
      dateOfFrom: fullIsoEdFrom,
      FD_Flag: 1,
    };
    setFormFields(updatedFormFields);

    setSelectedEducationFromDate(updatedSelectedEducationFromDates);

    formik.setFieldValue(
      `formFields[${educationIndex}].dateOfFrom`,
      fullIsoEdFrom,
    );
    formik.setFieldValue(`formFields[${educationIndex}].FD_Flag`, 1);
    educationFromDateInputRef.current.blur();
  };

  // Open Education From Date Picker
  const openEducationFromDatePicker = educationIndex => {
    const updatedVisibility = {
      ...isEducationFromDatePickerVisible,
      [educationIndex]: true,
    };
    setEducationFromDatePickerVisibility(updatedVisibility);
  };

  // Close Education From Date Picker
  const closeEducationFromDatePicker = educationIndex => {
    const updatedVisibility = {
      ...isEducationFromDatePickerVisible,
      [educationIndex]: false,
    };
    setEducationFromDatePickerVisibility(updatedVisibility);
    educationFromDateInputRef.current.blur();
  };

  // Education To Date Handler
  const handleEducationToDateChange = (date, educationIndex) => {
    const fullIsoEdTo = new Date(date).toISOString();

    const updatedSelectedEducationToDates = {
      ...selectedEducationToDate,
      [educationIndex]: moment(date).format('DD MMM YYYY'),
    };
    const updatedFormFields = [...formFields];

    updatedFormFields[educationIndex] = {
      ...updatedFormFields[educationIndex],
      dateOfTo: fullIsoEdTo,
      TD_Flag: 1,
    };
    setFormFields(updatedFormFields);
    const updatedMaxDates = {
      ...maxDate,
      [educationIndex]: date,
    };
    setMaxDate(updatedMaxDates);
    setSelectedEducationToDate(updatedSelectedEducationToDates);
    formik.setFieldValue(`formFields[${educationIndex}].dateOfTo`, fullIsoEdTo);
    formik.setFieldValue(`formFields[${educationIndex}].TD_Flag`, 1);
    educationToDateInputRef.current.blur();
  };

  // Open Education To Date Picker
  const openEducationToDatePicker = educationIndex => {
    const updatedVisibility = {
      ...isEducationToDatePickerVisible,
      [educationIndex]: true,
    };
    setEducationToDatePickerVisibility(updatedVisibility);
  };

  // Close Education To Date Picker
  const closeEducationToDatePicker = educationIndex => {
    const updatedVisibility = {
      ...isEducationToDatePickerVisible,
      [educationIndex]: false,
    };
    setEducationToDatePickerVisibility(updatedVisibility);
    educationToDateInputRef.current.blur();
  };

  // Formik
  const formik = useFormik({
    initialValues: {
      formFields,
    },
  });

  // Function to check if a form field object is empty
  const isEmptyField = field => {
    return !field.degree && !field.name && !field.address;
  };

  // Update Formik Values
  useEffect(() => {
    const filteredFormFields = formFields.filter(field => !isEmptyField(field));
    updateFormValues('educationDetails', {college: filteredFormFields});
  }, [formik.values]);

  // Validate Formik Values
  useEffect(() => {
    onValidationChange(formik.isValid);
  }, [formik.isValid]);

  // Add New Fields
  function addFields() {
    const newFields = [...formFields, initialFields];
    let newOnOrAroundStartDates = [...onOrAroundStartDate, '1'];
    let newOnOrAroundEndDates = [...onOrAroundEndDate, '1'];
    formik.values.formFields = newFields;
    setFormFields(newFields);
    setIsFocusFromPrefix(prev => [...prev, false]);
    setIsFocusToPrefix(prev => [...prev, false]);
    setOnOrAroundStartDate(newOnOrAroundStartDates);
    setOnOrAroundEndDate(newOnOrAroundEndDates);
    const presentValues = [...toPresent, false];

    setToPresent(presentValues);
  }

  // Delete The Fields
  function deleteField(index) {
    const newFields = [...formFields];
    let newOnOrAroundStartDates = [...onOrAroundStartDate];
    let newOnOrAroundEndDates = [...onOrAroundEndDate];
    newFields.splice(index, 1);

    newOnOrAroundStartDates.splice(index, 1);
    newOnOrAroundEndDates.splice(index, 1);

    formik.values.formFields = newFields;
    setIsFocusFromPrefix(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setIsFocusToPrefix(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setFormFields(newFields);
    setOnOrAroundStartDate(newOnOrAroundStartDates);
    setOnOrAroundEndDate(newOnOrAroundEndDates);

    const presentValues = [...toPresent];
    presentValues.splice(index, 1);

    setToPresent(presentValues);
  }

  // Input Handler
  function handleFieldChange(index, fieldKey, value) {
    const updatedFormFields = [...formFields];

    if (fieldKey === 'dateOfFrom') {
      updatedFormFields[index].isAroundEducationStartDate =
        onOrAroundStartDate[index] !== 'On';
    } else if (fieldKey === 'dateOfTo') {
      updatedFormFields[index].isAroundEducationEndDate =
        onOrAroundEndDate[index] !== 'On';
    } else if (fieldKey === 'address' || fieldKey === 'location') {
      updatedFormFields[index][fieldKey] = value;
    } else {
      updatedFormFields[index] = {
        ...updatedFormFields[index],
        [fieldKey]: value || '',
      };
    }

    setFormFields(updatedFormFields);
  }

  // To Present Handler
  const handleToPresent = educationIndex => {
    const values = [...toPresent];
    values[educationIndex] = !values[educationIndex];
    setToPresent(values);

    const updatedSelectedEducationToDates = {
      ...selectedEducationToDate,
      [educationIndex]: '',
    };
    const updatedFormFields = [...formFields];

    updatedFormFields[educationIndex] = {
      ...updatedFormFields[educationIndex],
      dateOfTo: null,
      TD_Flag: 1,
      isAroundEducationEndDate: false,
      isPresentlyStudying: true,
    };
    setFormFields(updatedFormFields);
    setSelectedEducationToDate(updatedSelectedEducationToDates);
    formik.setFieldValue(`formFields[${educationIndex}].dateOfTo`, '');
    formik.setFieldValue(`formFields[${educationIndex}].TD_Flag`, 1);
    formik.setFieldValue(
      `formFields[${educationIndex}].isAroundEducationEndDate`,
      false,
    );
    formik.setFieldValue(
      `formFields[${educationIndex}].isPresentlyStudying`,
      true,
    );
  };

  // Loading State
  const [loadingData, setLoadingData] = useState(true);

  // Function to save data to AsyncStorage
  const saveData = async () => {
    try {
      const dataToSave = {
        ...formik.values,
        selectedEducationFromDate: selectedEducationFromDate,
        selectedEducationToDate: selectedEducationToDate,
        toPresent: toPresent,
      };
      await AsyncStorage.setItem('addMember_ED', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Function to load data from AsyncStorage
  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('addMember_ED');
      if (data !== null) {
        const parsedData = JSON.parse(data);
        const {
          selectedEducationFromDate,
          selectedEducationToDate,
          toPresent,
          ...formikValues
        } = parsedData;

        formik.setValues(formikValues);
        setFormFields(parsedData.formFields);
        setSelectedEducationFromDate(parsedData.selectedEducationFromDate);
        setSelectedEducationToDate(parsedData.selectedEducationToDate);
        setToPresent(parsedData.toPresent);
      }
      setLoadingData(false);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // useEffect to save data whenever formFields changes, but only if it's not due to loading data
  useEffect(() => {
    if (!loadingData) {
      saveData();
    }
  }, [
    formik.values,
    selectedEducationFromDate,
    selectedEducationToDate,
    toPresent,
  ]);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const handleFocusFromPrefix = (index, value) => {
    setIsFocusFromPrefix(prevState => {
      const updatedState = [...prevState];
      updatedState[index] = value;
      return updatedState;
    });
  };
  const handleFocusToPrefix = (index, value) => {
    setIsFocusToPrefix(prevState => {
      const updatedState = [...prevState];
      updatedState[index] = value;
      return updatedState;
    });
  };

  useEffect(() => {
    const updatedFormFields = formFields.map(field => {
      const {dateOfFrom, dateOfTo} = field;
      if (dateOfFrom || dateOfTo) {
        return {
          ...field,
          dateOfFrom,
          FD_Flag: 1,
          dateOfTo,
          TD_Flag: 1,
        };
      }

      return field;
    });
    setFormFields(updatedFormFields);
  }, [formik.values]);

  return (
    <View
      style={{
        backgroundColor: 'white',
        marginTop: -50,
        paddingBottom: 30,
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      }}>
      {formik.values.formFields.map((educationField, educationIndex) => (
        <View key={educationIndex}>
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInput}
            testID="degree"
            label="Degree"
            name={`formFields[${educationIndex}].degree`}
            value={educationField.degree}
            onChangeText={text => {
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);
              formik.setFieldValue(
                `formFields[${educationIndex}].degree`,
                capitalizedText,
              );
              handleFieldChange(educationIndex, 'degree', capitalizedText);
            }}
            ref={inputRefs.degree}
            clearable
          />
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInput}
            testID="institution-name"
            label="Institution Name"
            name={'institutionName'}
            value={educationField.name}
            onChangeText={text => {
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);
              formik.setFieldValue(
                `formFields[${educationIndex}].name`,
                capitalizedText,
              );
              handleFieldChange(educationIndex, 'name', capitalizedText);
            }}
            ref={inputRefs.institutionName}
            clearable
          />
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.textInput}
            testID={`education-place-${educationIndex}`}
            label="Institution Location"
            name={`formFields[${educationIndex}].address`}
            value={formFields[educationIndex]?.address ?? ''}
            onChangeText={text => {
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);
              const formattedAddress = capitalizedText ?? '';
              formik.setFieldValue(
                `formFields[${educationIndex}].address`,
                formattedAddress,
              );
              handleFieldChange(educationIndex, 'address', formattedAddress);
            }}
            ref={inputRefs.institutionLocation}
            clearable
          />
          <View style={{marginTop: 20}}>
            <Text style={styles.labeText}>From</Text>
            <View>
              <View style={styles.containerDate}>
                <View style={[styles.column, styles.prefixColumn]}>
                  <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                    <CustomDropdown
                      testID="prefix"
                      label={
                        onOrAroundStartDate[educationIndex] === '1'
                          ? 'On'
                          : 'Around (~)'
                      }
                      options={filteredData(
                        onOrAroundStartDate[educationIndex],
                      )}
                      value={
                        onOrAroundStartDate[educationIndex] === '1'
                          ? 'On'
                          : 'Around (~)'
                      }
                      onOptionSelect={itemValue => {
                        const startDates = [...onOrAroundStartDate];
                        const updatedFormFields = [...formFields];

                        startDates[educationIndex] = itemValue.value;
                        updatedFormFields[
                          educationIndex
                        ].isAroundEducationStartDate =
                          itemValue.label === 'On' ? false : true;

                        `formFields[${educationIndex}].isAroundEducationStartDate`,
                          formik.setFieldValue,
                          itemValue.label === 'On' ? false : true,
                          setOnOrAroundStartDate(startDates);
                        setFormFields(updatedFormFields);
                      }}
                      onFocus={() => {
                        handleFocusFromPrefix(educationIndex, true);
                        blurInputs();
                      }}
                      onBlur={() =>
                        handleFocusFromPrefix(educationIndex, false)
                      }
                      inputHeight={45}
                    />
                  </View>
                </View>
                <View style={[styles.column, styles.datePickerColumn]}>
                  <CustomInput
                    inputHeight={45}
                    autoCapitalize="none"
                    autoCorrect={false}
                    ref={educationFromDateInputRef}
                    mode="outlined"
                    testID="education-from-date"
                    style={styles.textInputStyle}
                    name="educationFromDate"
                    label="Education Date"
                    value={
                      selectedEducationFromDate[educationIndex]
                        ? selectedEducationFromDate[educationIndex]
                        : ''
                    }
                    onFocus={() => openEducationFromDatePicker(educationIndex)}
                    showSoftInputOnFocus={false}
                    disabled={
                      !formFields[educationIndex]?.address &&
                      !formFields[educationIndex]?.degree
                    }
                  />

                  <ImuwDatePicker
                    testID="education-from-date-picker"
                    mode="date"
                    onClose={() => closeEducationFromDatePicker(educationIndex)}
                    open={isEducationFromDatePickerVisible[educationIndex]}
                    onDateChange={date =>
                      handleEducationFromDateChange(date, educationIndex)
                    }
                    maximumDate={maxDate[educationIndex]}
                    selectedDate={
                      maxDate?.length === 0
                        ? new Date()
                        : maxDate[educationIndex]
                    }
                  />
                </View>
              </View>
            </View>
          </View>
          {!toPresent[educationIndex] && (
            <>
              <View style={{marginTop: 20}}>
                <Text style={styles.labeText}>To</Text>
                <View>
                  <View style={styles.containerDate}>
                    <View style={[styles.column, styles.prefixColumn]}>
                      <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                        <CustomDropdown
                          testID="prefixTo"
                          label={
                            onOrAroundEndDate[educationIndex] === '1'
                              ? 'On'
                              : 'Around (~)'
                          }
                          options={filteredData(
                            onOrAroundEndDate[educationIndex],
                          )}
                          value={
                            onOrAroundEndDate[educationIndex] === '1'
                              ? 'On'
                              : 'Around (~)'
                          }
                          onOptionSelect={itemValue => {
                            const updatedFormFields = [...formFields];
                            updatedFormFields[
                              educationIndex
                            ].isAroundEducationEndDate =
                              itemValue.label === 'On' ? false : true;

                            formik.setFieldValue(
                              `formFields[${educationIndex}].isAroundEducationEndDate`,
                              itemValue.label === 'On' ? false : true,
                            );

                            const endDates = [...onOrAroundEndDate];
                            endDates[educationIndex] = itemValue.value;

                            setOnOrAroundEndDate(endDates);
                            setFormFields(updatedFormFields);
                          }}
                          onFocus={() => {
                            handleFocusToPrefix(educationIndex, true);
                            blurInputs();
                          }}
                          onBlur={() =>
                            handleFocusToPrefix(educationIndex, false)
                          }
                          inputHeight={45}
                        />
                      </View>
                    </View>
                    <View style={[styles.column, styles.datePickerColumn]}>
                      <CustomInput
                        inputHeight={45}
                        autoCapitalize="none"
                        autoCorrect={false}
                        ref={educationToDateInputRef}
                        mode="outlined"
                        testID="education-To-date"
                        style={styles.textInputStyle}
                        name="educationToDate"
                        label="Education Date"
                        value={
                          selectedEducationToDate[educationIndex]
                            ? selectedEducationToDate[educationIndex]
                            : ''
                        }
                        onFocus={() =>
                          openEducationToDatePicker(educationIndex)
                        }
                        showSoftInputOnFocus={false}
                        disabled={
                          !formFields[educationIndex]?.address &&
                          !formFields[educationIndex]?.degree
                        }
                      />
                      <ImuwDatePicker
                        testID="education-To-date-picker"
                        mode="date"
                        onClose={() =>
                          closeEducationToDatePicker(educationIndex)
                        }
                        open={isEducationToDatePickerVisible[educationIndex]}
                        onDateChange={date => {
                          if (date) {
                            handleEducationToDateChange(date, educationIndex);
                          }
                        }}
                        minimumDate={minDate[educationIndex]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            <View style={{display: 'flex', width: '100%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 15,
                  }}>
                  <View>
                    <Text style={{color: 'black'}}>Present</Text>
                  </View>
                  <GlobalCheckBox
                    checkBoxColor={NewTheme.colors.primaryOrange}
                    testID="add-member-ed-present-checkbox"
                    check={toPresent[educationIndex]}
                    onCheck={() => handleToPresent(educationIndex)}
                  />
                </View>
                <View>
                  {educationIndex > 0 && (
                    <TouchableOpacity
                      onPress={() => deleteField(educationIndex)}>
                      <View style={{marginLeft: 10}}>
                        <ConnectionDeleteIcon />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {educationIndex < formik.values.formFields.length - 1 && (
                <Divider
                  bold
                  style={{
                    borderColor: '#B4B4B4',
                    borderWidth: 1,
                    marginVertical: 10,
                  }}
                />
              )}
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={addFields}>
        <Text
          variant="bold"
          style={{
            fontSize: 18,
            marginTop: 7,
            color: NewTheme.colors.primaryOrange,
          }}>
          Add More
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labeText: {
    marginLeft: 4,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: Theme.light.scrim,
  },

  itemTextStyle: {
    color: 'black',
    fontWeight: 400,
    left: -5,
  },
  containerDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  prefixColumn: {
    flex: 1,
    paddingTop: 4,
  },
  datePickerColumn: {
    flex: 1.5,
    marginLeft: 5,
  },
  dropdown: {
    width: '162%',
    backgroundColor: 'white',
    height: 40,
    borderColor: 'rgba(51, 48, 60, 0.3)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  text: {
    marginLeft: 3,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.light.scrim,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  column4: {
    flex: 1,
    margin: 4,
  },
  column2: {
    flex: 1,
    marginRight: 10,
  },
  picker: {
    backgroundColor: 'white',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tab: {
    borderColor: '#C3C3C3',
    borderWidth: 1,
    width: '90%',
    height: '30px',
    borderRadius: 10,
    marginLeft: 20,
  },
  pickerview: {
    height: 50,
    maxHeight: 50,
    minHeight: 50,
    borderColor: '#ccc6c6',
    borderRadius: 4,

    width: '100%',
    maxWidth: '100%',
    minWidth: '100%',
    borderWidth: 1,
    paddingTop: 0,
    marginTop: 5,
    backgroundColor: 'white',

    border: '1px solid #ccc6c6',
  },
  mediaIcon: {
    marginTop: 7,
    marginLeft: 5,
  },
  textInputStyle: {
    marginTop: 4,
    borderColor: '#C3C3C3',
    height: 50,
    borderRadius: 5,
  },
  location: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 17,
    color: 'black',
    paddingLeft: 15,
    borderColor: '#ccc6c6',
    borderWidth: 1,
  },
  column12: {
    border: 0,
  },
  textInput: {
    backgroundColor: Theme.light.onWhite100,
    marginVertical: 5,
  },
  description: {},
  additionalContent: {
    height: 50,
    backgroundColor: 'blue',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderRadius: 4,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginBottom: 20,
  },
  addtext: {
    marginTop: 20,
    marginLeft: 20,
    fontSize: 18,
    color: Theme.light.primary,
  },
  placeholder: {
    borderRadius: 100,
    marginBottom: 20,
  },
});
