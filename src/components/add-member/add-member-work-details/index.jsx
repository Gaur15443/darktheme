import React, {useState, useEffect, useRef} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Checkbox, useTheme, Divider, Text} from 'react-native-paper';
import {useFormik} from 'formik';
import Theme from '../../../common/Theme';
import DeleteIcon from '../../../core/icon/delete-icon';
import {
  daysInMonth,
  generateMonthList,
  getDateFromOffset,
} from '../../../utils/format';
import moment from 'moment';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import CustomInput from '../../CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalCheckBox from '../../../components/ProfileTab/GlobalCheckBox';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';
import {Dropdown} from 'react-native-element-dropdown';
import NewTheme from '../../../common/NewTheme';
import CustomDropdown from '../../customDropdown';

const AddMemberFormWorkDetails = ({onValidationChange, updateFormValues}) => {
  const initialFields = {
    company_name: '',
    company_role: '',
    dateOfFrom: '',
    dateOfTo: '',
    FD_Flag: '',
    TD_Flag: '',
    isAroundWorkStartDate: false,
    isAroundWorkEndDate: false,
    isPresentlyWorking: false,
  };

  const [toPresent, setToPresent] = useState([false]);
  const [onOrAroundStartDate, setOnOrAroundStartDate] = useState(['1']);
  const [onOrAroundEndDate, setOnOrAroundEndDate] = useState(['1']);
  const [formFields, setFormFields] = useState([initialFields]);
  const [minWorkDate, setMinWorkDate] = useState([]);
  const [maxWorkDate, setMaxWorkDate] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusFromPrefix, setIsFocusFromPrefix] = useState([false]);
  const [isFocusToPrefix, setIsFocusToPrefix] = useState([false]);
  const dataPrefix = [
    {label: 'On', value: '1'},
    {label: 'Around (~)', value: '2'},
  ];

  const theme = useTheme();

  // Work From Date Picker State
  const [isWorkFromDatePickerVisible, setWorkFromDatePickerVisibility] =
    useState(false);
  const [selectedWorkFromDate, setSelectedWorkFromDate] = useState([]);
  const workFromDateInputRef = useRef(null);
  // Lose Focus Of Custom Inputs
  const inputRefs = {
    company: useRef(null),
    role: useRef(null),
  };
  const blurInputs = () => {
    Object.keys(inputRefs).forEach(key => {
      if (inputRefs[key].current) {
        inputRefs[key].current.blur();
      }
    });
  };
  // Work To Date Picker State
  const [isWorkToDatePickerVisible, setWorkToDatePickerVisibility] =
    useState(false);
  const [selectedWorkToDate, setSelectedWorkToDate] = useState([]);
  const workToDateInputRef = useRef(null);

  // Work From Date Handler
  const handleWorkFromDateChange = (date, workIndex) => {
    const fullIsoWdFrom = new Date(date).toISOString();

    const updatedSelectedWorkFromDates = {
      ...selectedWorkFromDate,
      [workIndex]: moment(date).format('DD MMM YYYY'),
    };
    setSelectedWorkFromDate(updatedSelectedWorkFromDates);
    const updatedMinWorkDate = {
      ...minWorkDate,
      [workIndex]: date,
    };
    setMinWorkDate(updatedMinWorkDate);
    const updatedFormFields = [...formFields];

    updatedFormFields[workIndex] = {
      ...updatedFormFields[workIndex],
      dateOfFrom: fullIsoWdFrom,
      FD_Flag: 1,
    };
    setFormFields(updatedFormFields);
    formik.setFieldValue(`formFields[${workIndex}].dateOfFrom`, fullIsoWdFrom);
    formik.setFieldValue(`formFields[${workIndex}].FD_Flag`, 1);

    workFromDateInputRef.current.blur();
  };

  // Open Work From Date Picker
  const openWorkFromDatePicker = workIndex => {
    const updatedVisibility = {
      ...isWorkFromDatePickerVisible,
      [workIndex]: true,
    };
    setWorkFromDatePickerVisibility(updatedVisibility);
  };

  // Close Work From Date Picker
  const closeWorkFromDatePicker = workIndex => {
    const updatedVisibility = {
      ...isWorkFromDatePickerVisible,
      [workIndex]: false,
    };
    setWorkFromDatePickerVisibility(updatedVisibility);
    workFromDateInputRef.current.blur();
  };

  // Work To Date Handler
  const handleWorkToDateChange = (date, workIndex) => {
    const fullIsoWdTo = new Date(date).toISOString();

    const updatedSelectedWorkToDates = {
      ...selectedWorkToDate,
      [workIndex]: moment(date).format('DD MMM YYYY'),
    };
    setSelectedWorkToDate(updatedSelectedWorkToDates);
    const updatedMaxWorkDate = {
      ...maxWorkDate,
      [workIndex]: date,
    };
    setMaxWorkDate(updatedMaxWorkDate);
    const updatedFormFields = [...formFields];

    updatedFormFields[workIndex] = {
      ...updatedFormFields[workIndex],
      dateOfTo: fullIsoWdTo,
      TD_Flag: 1,
    };
    setFormFields(updatedFormFields);
    workToDateInputRef.current.blur();
    formik.setFieldValue(`formFields[${workIndex}].dateOfTo`, fullIsoWdTo);
    formik.setFieldValue(`formFields[${workIndex}].TD_Flag`, 1);
  };
  function handleFieldChange(index, fieldKey, value) {
    const updatedFormFields = [...formFields];

    if (fieldKey === 'dateOfFrom') {
      // Separate the year, month, and day values
      updatedFormFields[index].isAroundWorkStartDate =
        onOrAroundStartDate[index] !== 'On';
    } else if (fieldKey === 'dateOfTo') {
      // Separate the year, month, and day values
      updatedFormFields[index].isAroundWorkEndDate =
        onOrAroundEndDate[index] !== 'On';
    } else {
      updatedFormFields[index] = {
        ...updatedFormFields[index],
        [fieldKey]: value || '',
      };
    }

    setFormFields(updatedFormFields);
  }

  // Open Work To Date Picker
  const openWorkToDatePicker = workIndex => {
    const updatedVisibility = {
      ...isWorkToDatePickerVisible,
      [workIndex]: true,
    };
    setWorkToDatePickerVisibility(updatedVisibility);
  };

  // Close Work To Date Picker
  const closeWorkToDatePicker = workIndex => {
    const updatedVisibility = {
      ...isWorkToDatePickerVisible,
      [workIndex]: false,
    };
    setWorkToDatePickerVisibility(updatedVisibility);
    workToDateInputRef.current.blur();
  };

  // Formik
  const formik = useFormik({
    initialValues: {
      formFields,
    },
  });

  // Function to check if a form field object is empty
  const isEmptyField = field => {
    return !field.company_name && !field.company_role;
  };

  // Update and Validate Formik Values
  useEffect(() => {
    onValidationChange(formik.isValid);
    const filteredFormFields = formFields.filter(field => !isEmptyField(field));
    updateFormValues('workDetails', filteredFormFields);
  }, [formik.isValid, formik.values]);

  //  Add Fields
  function addFields() {
    const newFields = [...formFields, initialFields];
    let newOnOrAroundStartDates = [...onOrAroundStartDate, '1'];
    const newOnOrAroundEndDates = [...onOrAroundEndDate, '1'];

    formik.values.formFields = newFields;

    setFormFields(newFields);
    setIsFocusFromPrefix(prev => [...prev, false]);
    setIsFocusToPrefix(prev => [...prev, false]);
    setOnOrAroundStartDate(newOnOrAroundStartDates);
    setOnOrAroundEndDate(newOnOrAroundEndDates);
  }

  //  Delete Fields
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

  // To Present Handler
  const handleToPresent = workIndex => {
    const values = [...toPresent];
    values[workIndex] = !values[workIndex];
    setToPresent(values);

    const updatedSelectedWorkToDates = {
      ...selectedWorkToDate,
      [workIndex]: '',
    };
    setSelectedWorkToDate(updatedSelectedWorkToDates);
    const updatedFormFields = [...formFields];
    updatedFormFields[workIndex] = {
      ...updatedFormFields[workIndex],

      dateOfTo: null,
      TD_Flag: 1,
      isPresentlyWorking: true,
      isAroundWorkEndDate: false,
    };
    setFormFields(updatedFormFields);

    formik.setFieldValue(`formFields[${workIndex}].dateOfTo`, '');
    formik.setFieldValue(`formFields[${workIndex}].TD_Flag`, 1);
    formik.setFieldValue(`formFields[${workIndex}].isAroundWorkEndDate`, false);
    formik.setFieldValue(`formFields[${workIndex}].isPresentlyWorking`, true);
  };

  const [loadingData, setLoadingData] = useState(true);

  // Function to save data to AsyncStorage
  const saveData = async () => {
    try {
      const dataToSave = {
        ...formik.values,
        selectedWorkFromDate: selectedWorkFromDate,
        selectedWorkToDate: selectedWorkToDate,
        toPresent: toPresent,
      };
      await AsyncStorage.setItem('addMember_WD', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Function to load data from AsyncStorage
  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('addMember_WD');
      if (data !== null) {
        const parsedData = JSON.parse(data);
        const {
          selectedWorkFromDate,
          selectedWorkToDate,
          toPresent,
          ...formikValues
        } = parsedData;

        formik.setValues(formikValues);
        setFormFields(parsedData.formFields);
        setSelectedWorkFromDate(parsedData.selectedWorkFromDate);
        setSelectedWorkToDate(parsedData.selectedWorkToDate);
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
  }, [formik.values, selectedWorkFromDate, selectedWorkToDate, toPresent]);

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
      {formik.values.formFields.map((workField, workIndex) => (
        <View key={workIndex}>
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            testID={`company-name-${workIndex}`}
            mode="outlined"
            name="companyName"
            label="Company"
            value={workField.company_name}
            onChangeText={text => {
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);
              formik.setFieldValue(
                `formFields[${workIndex}].company_name`,
                capitalizedText,
              );
              handleFieldChange(workIndex, 'company_name', capitalizedText);
            }}
            ref={inputRefs.company}
            style={{backgroundColor: 'white', marginBottom: 8, marginTop: 20}}
            clearable
          />

          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={{backgroundColor: 'white'}}
            testID={`role-in-company-${workIndex}`}
            label="Role"
            name={'roleInCompany'}
            value={workField.company_role}
            onChangeText={text => {
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);
              formik.setFieldValue(
                `formFields[${workIndex}].company_role`,
                capitalizedText,
              );
              handleFieldChange(workIndex, 'company_role', capitalizedText);
            }}
            ref={inputRefs.role}
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
                        onOrAroundStartDate[workIndex] === '1'
                          ? 'On'
                          : 'Around (~)'
                      }
                      options={filteredData(onOrAroundStartDate[workIndex])}
                      value={
                        onOrAroundStartDate[workIndex] === '1'
                          ? 'On'
                          : 'Around (~)'
                      }
                      onOptionSelect={itemValue => {
                        const startDates = [...onOrAroundStartDate];
                        const updatedFormFields = [...formFields];

                        formik.setFieldValue(
                          `formFields[${workIndex}].isAroundWorkStartDate`,
                          itemValue.label === 'On' ? false : true,
                        );

                        startDates[workIndex] = itemValue.value;
                        updatedFormFields[workIndex].isAroundWorkStartDate =
                          itemValue.label === 'On' ? false : true;

                        setOnOrAroundStartDate(startDates);
                        setFormFields(updatedFormFields);
                      }}
                      onFocus={() => {
                        handleFocusFromPrefix(workIndex, true);
                        blurInputs();
                      }}
                      onBlur={() => handleFocusFromPrefix(workIndex, false)}
                      inputHeight={45}
                    />
                  </View>
                </View>
                <View style={[styles.column, styles.datePickerColumn]}>
                  <CustomInput
                    inputHeight={45}
                    autoCapitalize="none"
                    autoCorrect={false}
                    ref={workFromDateInputRef}
                    mode="outlined"
                    testID={`work-from-date-${workIndex}`}
                    style={styles.textInputStyle}
                    name="workFromDate"
                    label="Work Date"
                    value={
                      selectedWorkFromDate[workIndex]
                        ? selectedWorkFromDate[workIndex]
                        : ''
                    }
                    onFocus={() => openWorkFromDatePicker(workIndex)}
                    showSoftInputOnFocus={false}
                    disabled={!formFields[workIndex]?.company_role}
                  />

                  <ImuwDatePicker
                    testID="work-from-date-picker"
                    mode="date"
                    onClose={() => closeWorkFromDatePicker(workIndex)}
                    open={isWorkFromDatePickerVisible[workIndex]}
                    onDateChange={date => {
                      handleWorkFromDateChange(date, workIndex);
                    }}
                    maximumDate={maxWorkDate[workIndex]}
                    selectedDate={
                      maxWorkDate?.length === 0
                        ? new Date()
                        : maxWorkDate[workIndex]
                    }
                  />
                </View>
              </View>
            </View>
          </View>

          {!toPresent[workIndex] && (
            <>
              <View style={{marginTop: 20}}>
                <Text style={styles.labeText}>To</Text>
                <View style={styles.containerDate}>
                  <View style={[styles.column, styles.prefixColumn]}>
                    <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                      <CustomDropdown
                        testID="prefixTo"
                        label={
                          onOrAroundEndDate[workIndex] === '1'
                            ? 'On'
                            : 'Around (~)'
                        }
                        options={filteredData(onOrAroundEndDate[workIndex])}
                        value={
                          onOrAroundEndDate[workIndex] === '1'
                            ? 'On'
                            : 'Around (~)'
                        }
                        onOptionSelect={itemValue => {
                          const updatedFormFields = [...formFields];
                          updatedFormFields[workIndex].isAroundWorkEndDate =
                            itemValue.label === 'On' ? false : true;

                          formik.setFieldValue(
                            `formFields[${workIndex}].isAroundWorkEndDate`,
                            itemValue.label === 'On' ? false : true,
                          );

                          const endDates = [...onOrAroundEndDate];
                          endDates[workIndex] = itemValue.value;

                          setOnOrAroundEndDate(endDates);
                          setFormFields(updatedFormFields);
                        }}
                        onFocus={() => {
                          handleFocusToPrefix(workIndex, true);
                          blurInputs();
                        }}
                        onBlur={() => handleFocusToPrefix(workIndex, false)}
                        inputHeight={45}
                      />
                    </View>
                  </View>
                  <View style={[styles.column, styles.datePickerColumn]}>
                    <View>
                      <CustomInput
                        inputHeight={45}
                        autoCapitalize="none"
                        autoCorrect={false}
                        ref={workToDateInputRef}
                        mode="outlined"
                        testID={`work-To-date-${workIndex}`}
                        style={styles.textInputStyle}
                        name="workToDate"
                        label="Work Date"
                        value={
                          selectedWorkToDate[workIndex]
                            ? selectedWorkToDate[workIndex]
                            : ''
                        }
                        onFocus={() => openWorkToDatePicker(workIndex)}
                        showSoftInputOnFocus={false}
                        disabled={!formFields[workIndex]?.company_role}
                      />

                      <ImuwDatePicker
                        testID="work-to-date-picker"
                        mode="date"
                        onClose={() => closeWorkToDatePicker(workIndex)}
                        open={isWorkToDatePickerVisible[workIndex]}
                        onDateChange={date => {
                          handleWorkToDateChange(date, workIndex);
                        }}
                        minimumDate={minWorkDate[workIndex]}
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
                    <Text
                      style={{
                        color: 'black',
                      }}>
                      Present
                    </Text>
                  </View>
                  <GlobalCheckBox
                    checkBoxColor={NewTheme.colors.primaryOrange}
                    testID="add-member-wd-present-checkbox"
                    check={toPresent[workIndex]}
                    onCheck={() => handleToPresent(workIndex)}
                  />
                </View>
                <View>
                  {workIndex > 0 && (
                    <TouchableOpacity onPress={() => deleteField(workIndex)}>
                      <View style={{marginLeft: 10}}>
                        <ConnectionDeleteIcon />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
          {workIndex < formik.values.formFields.length - 1 && (
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
};

const styles = StyleSheet.create({
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labeText: {
    marginLeft: 4,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.light.scrim,
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

export default AddMemberFormWorkDetails;
