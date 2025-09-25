import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Confirm from '../../Confirm';
import Animated, {SlideInDown} from 'react-native-reanimated';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import {useTheme, Text, Divider} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';

import {useDispatch, useSelector} from 'react-redux';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';

import {getAdduserProfiles} from '../../../store/apps/addUserProfile';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {useNavigation} from '@react-navigation/native';
import {CustomButton} from '../../../core';
import {GlobalHeader, CustomInput, GlobalCheckBox} from '../../../components';

import moment from 'moment';
import _ from 'lodash';
import {useFormik} from 'formik';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import NewTheme from '../../../common/NewTheme';
import { desanitizeInput } from '../../../utils/sanitizers';

const WorkInfo = ({route}) => {
  const id = route.params ? route.params.id : undefined;
  const dataPrefix = [
    {label: 'On', value: '1'},
    {label: 'Around (~)', value: '2'},
  ];
  useNativeBackHandler(handleBack);
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const initialFields = {
    company_name: '',
    isPresentlyWorking: false,
    selectedFromDate: null,
    selectedToDate: null,
    company_role: '',
    isAroundWorkStartDate: 'On',
    isAroundWorkEndDate: 'On',
    dateOfFrom: '',
    dateOfTo: '',
    FD_Flag: '',
    TD_Flag: '',
  };
  const [formFields, setFormFields] = useState([initialFields]);
  const [loading, setLoading] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [isFocusFromPrefix, setIsFocusFromPrefix] = useState([false]);
  const [isFocusToPrefix, setIsFocusToPrefix] = useState([false]);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const userInfo = useSelector(state => state?.userInfo);
  const userId = id ? id : userInfo?._id;
  const [showDatePicker, setShowDatePicker] = useState([false]);
  const [selectedFromDates, setSelectedFromDates] = useState([null]);
  const [selectedToDates, setSelectedToDates] = useState([null]);
  const [showDatePickerToDate, setShowDatePickerToDate] = useState([false]);
  const theme = useTheme();

  const dateInputRef = useRef(null);
  const dateInputRefToDate = useRef(null);

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Info_Tab?.basic_facts_error,
  );

  const handleFieldChange = (index, field, value) => {
    const updatedFormFields = [...formFields];
    updatedFormFields[index] = {
      ...updatedFormFields[index],
      [field]: value,
    };
    if (field === 'isPresentlyWorking' && value) {
      updatedFormFields[index] = {
        ...updatedFormFields[index],
        selectedToDate: '',
        isAroundWorkEndDate: 'On',
      };
      // Clear the specific index in selectedToDates array
      setSelectedToDates(prev => {
        const newDates = [...prev];
        newDates[index] = null;
        return newDates;
      });
    }
    setFormFields(updatedFormFields);
  };

  const [isPresent, setIsPresent] = useState([false]);

  const handleDateChange = index => {
    return function (date) {
      // Update the specific index in the array
      setSelectedFromDates(prev => {
        const newDates = [...prev];
        newDates[index] = date;
        return newDates;
      });
      
      dateInputRef.current.blur();
      if (date) {
        formFields[index].isAroundWorkStartDate = formFields[index]
          .isAroundWorkStartDate
          ? formFields[index].isAroundWorkStartDate
          : 'On';
      }
      // Check if field is defined before accessing its properties
      if (formFields[index]) {
        const updatedFormFields = [...formFields];
        updatedFormFields[index].selectedFromDate = date;
        setFormFields(updatedFormFields);
        dateInputRef.current.blur();
        Keyboard.dismiss();
      }
      const allValues = [...showDatePicker];
      allValues[index] = false;
      setShowDatePicker(allValues);
      dateInputRef.current.blur();
    };
  };
  const handleDateChangeToDate = index => date => {
    setSelectedToDates(prev => {
      const newDates = [...prev];
      newDates[index] = date;
      return newDates;
    });

    const updatedFormFields = [...formFields];
    if (updatedFormFields[index]) {
      updatedFormFields[index] = {
        ...updatedFormFields[index],
        selectedToDate: date,
        isAroundWorkEndDate: updatedFormFields[index].isAroundWorkEndDate || 'On',
      };
    }
    setFormFields(updatedFormFields);

    Keyboard.dismiss();

    const allValues = [...showDatePickerToDate];
    allValues[index] = false; // always close picker after confirm
    setShowDatePickerToDate(allValues);
  };

  const handleClose = async () => {
    await dispatch(fetchUserProfile(userId)).unwrap();
    setLoading(false);

    navigation.goBack();
  };

  const formik = useFormik({
    initialValues: {
      formFields,
    },

    onSubmit: () => {
      try {
        setLoading(true);
        let allClinks = [];
        if (basicInfo?.cLink?.length > 0) {
          allClinks = basicInfo?.cLink.flatMap(link => link?.linkId);
          allClinks = [...allClinks, basicInfo?._id];
        }
        const nonEmptyFormFields = formFields.filter(field =>
          Object.entries(field).some(
            ([key, value]) =>
              key !== 'isPresentlyWorking' &&
              value &&
              value?.trim?.() !== '' &&
              (field?.company_name?.trim?.() !== '' ||
                field?.company_role?.trim?.() !== ''),
          ),
        );
        const workDetails = nonEmptyFormFields?.map((field, index) => {
          field.FD_Flag = 1;

          field.TD_Flag = 1;

          field.dateOfFrom = field.selectedFromDate || null;
          field.dateOfTo = field.selectedToDate || null;

          field.address = field.instalocation;
          if (field.selectedFromDate) {
            field.isAroundWorkStartDate = !(
              field.isAroundWorkStartDate === 'On' || ''
            );
          } else {
            field.isAroundWorkStartDate = false;
          }

          if (field.selectedToDate) {
            field.isAroundWorkEndDate = !(
              field.isAroundWorkEndDate === 'On' || ''
            );
          } else {
            field.isAroundWorkEndDate = false;
          }
          field.dowMediaIds =
            basicInfo?.workDetails?.[index]?.dowMediaIds || [];
          return field;
        });

        const formData = {
          workDetails,
          userId,
          cLinks: basicInfo?.cLink?.length ? allClinks : [],
          cloneOwner: basicInfo?.isClone
            ? basicInfo?.cLink?.[0]?.linkId?.[0]
            : null,
          clinkIsPresent: basicInfo?.cLink?.length > 0 ? true : false,
        };
        dispatch(getAdduserProfiles(formData)).then(() => handleClose());
      } catch (error) {
         Toast.show({
          type: 'error',
          text1: toastMessages?.['12005'],
        });
      }
    },
    enableReinitialze: true,
  });

  const addFormField = () => {
    const newFields = [...formFields, initialFields];

    formik.values.formFields = newFields;
    setFormFields(newFields);

    setIsPresent(prev => [...prev, false]);
    setIsFocusFromPrefix(prev => [...prev, false]);
    setIsFocusToPrefix(prev => [...prev, false]);    
    setSelectedFromDates(prev => [...prev, null]);
    setSelectedToDates(prev => [...prev, null]);
    setShowDatePicker(prev => [...prev, false]);
    setShowDatePickerToDate(prev => [...prev, false]);
  };
  const removeFormField = index => {
    setFormFields(prevFormFields => {
      const newFields = [...prevFormFields];
      newFields.splice(index, 1);
      formik.setFieldValue('formFields', newFields);
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
      
      setIsPresent(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      // Remove from date arrays
      setSelectedFromDates(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      setSelectedToDates(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      setShowDatePicker(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      setShowDatePickerToDate(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      return newFields;
    });
  };

  useEffect(() => {
    setLoadingDefault(true);

    const field = [];

    if (basicInfo && basicInfo.workDetails) {
      const presentFields = [];
      const showVisibleField = [];
      const showVisibleFieldToDate = [];
      const fromDates = [];
      const toDates = [];

      basicInfo.workDetails.forEach((item, index) => {
        if (
          basicInfo.workDetails[index].dateOfFrom &&
          basicInfo.workDetails[index].isPresentlyWorking === true
        ) {
          presentFields.push(item.isPresentlyWorking || true);
          isPresent[index] = true;
        }
        showVisibleField.push(false);
        showVisibleFieldToDate.push(false);
        
        // Convert dates to proper Date objects or null
        const fromDate = item.fromDate || item.dateOfFrom;
        const toDate = item.toDate || item.dateOfTo;
        
        fromDates.push(fromDate ? new Date(fromDate) : null);
        toDates.push(toDate ? new Date(toDate) : null);

        field.push({
          company_name: item.company_name,
          company_role: item.company_role,
          isPresentlyWorking: item.isPresentlyWorking || false,
          isAroundWorkStartDate:
            item.isAroundWorkStartDate === false ? 'On' : 'Around (~)',
          isAroundWorkEndDate:
            item.isAroundWorkEndDate === false ? 'On' : 'Around (~)',
          selectedFromDate: fromDate ? new Date(fromDate) : null,
          selectedToDate: toDate ? new Date(toDate) : null,
        });
      });

      setFormFields(field);
      setIsPresent(presentFields);
      setShowDatePicker(showVisibleField);
      setShowDatePickerToDate(showVisibleFieldToDate);
      setSelectedFromDates(fromDates);
      setSelectedToDates(toDates);
    } else {
      // Initialize with default values if no existing data
      setFormFields([initialFields]);
      setIsPresent([false]);
      setShowDatePicker([false]);
      setShowDatePickerToDate([false]);
      setSelectedFromDates([null]);
      setSelectedToDates([null]);
    }
    
    formik.values.formFields = basicInfo?.workDetails || [initialFields];
    setLoadingDefault(false);
  }, [basicInfo]);
  useEffect(() => {
    if (!loadingDefault) {
      formik.setFieldValue('formFields', formFields);
      if (!formFields.length) {
        setFormFields([initialFields]);

        formik.setFieldValue('formFields', [initialFields]);
      }
    }
  }, [loadingDefault]);
  function handleBack() {
    let isFilled = formFields.some(field => {
      return (
        field.company_name ||
        field.company_role ||
        field.fromDate ||
        field.toDate
      );
    });
    if (isFilled) {
      seOpenConfirmPopup(true);
    } else {
      seOpenConfirmPopup(false);
      navigation.goBack();
    }
  }
  const handleSelectionChange = (label, setFieldValue, name) => {
    setFieldValue(name, label);
  };
  const filteredData = value => {
    return dataPrefix.filter(item => item.label !== value);
  };
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

  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Work History'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          <View style={styles.container}>
            {openConfirmPopup && (
              <Confirm
                accessibilityLabel="Work-confirm-popup"
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

            {/* Form Fields */}
            {formik?.values?.formFields?.map((field, _index) => (
              <View key={`formfield-${_index}`}>
                <View style={styles.formFieldContainer}>
                  {/* Company Name */}
                  <CustomInput
                    label="Company"
                    accessibilityLabel={`formFields[${_index}].company_nameId`}
                    name={`formFields[${_index}].company_name`}
                    testID={`formFields[${_index}].company_nameId`}
                    value={desanitizeInput(field.company_name)}
                    onChangeText={text => {
                      formik.setFieldValue(
                        `formFields[${_index}].company_name`,
                        text,
                      );
                      handleFieldChange(_index, 'company_name', text);
                    }}
                    clearable
                    mode="outlined"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                  />

                  {/* Company Role */}
                  <CustomInput
                    label="Role"
                    accessibilityLabel={`formFields[${_index}].company_roleId`}
                    name={`formFields[${_index}].company_role`}
                    testID={`formFields[${_index}].company_roleId`}
                    value={desanitizeInput(field.company_role)}
                    clearable
                    onChangeText={text => {
                      formik.setFieldValue(
                        `formFields[${_index}].company_role`,
                        text,
                      );
                      handleFieldChange(_index, 'company_role', text);
                    }}
                    mode="outlined"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                  />

                  {/* From Date */}
                  <View>
                    <View style={styles.containerDate}>
                      <View style={[styles.column, styles.prefixColumn]}>
                        <Dropdown
                          testID="prefix"
                          accessibilityLabel="prefix"
                          style={[
                            styles.dropdown,
                            isFocusFromPrefix[_index] && {
                              borderColor: theme.colors.primary,
                              borderWidth: 2,
                            },
                          ]}
                          data={filteredData(
                            formFields?.[_index]?.isAroundWorkStartDate,
                          )}
                          itemTextStyle={styles.itemTextStyle}
                          selectedTextStyle={{color: 'black'}}
                          placeholderStyle={{color: 'black', fontWeight: 400}}
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={
                            formFields?.[_index]?.isAroundWorkStartDate
                          }
                          value={formFields?.[_index]?.isAroundWorkStartDate}
                          onFocus={() => handleFocusFromPrefix(_index, true)}
                          onBlur={() => handleFocusFromPrefix(_index, false)}
                          onChange={itemValue => {
                            handleSelectionChange(
                              itemValue.label,
                              formik.setFieldValue,
                              'isAroundWorkStartDate',
                            );

                            const updatedFormFields = [...formFields];
                            updatedFormFields[_index].isAroundWorkStartDate =
                              itemValue.label;
                            setFormFields(updatedFormFields);
                          }}
                        />
                      </View>
                      <View style={[styles.column, styles.datePickerColumn]}>
                        <CustomInput
                          accessibilityLabel={`formFields[${_index}].selectedFromDateId`}
                          name={`formFields[${_index}].selectedFromDate`}
                          testID={`formFields[${_index}].selectedFromDateId`}
                          ref={dateInputRef}
                          mode="outlined"
                          label="From Date"
                          style={[
                            styles.textInputStyle,
                            {backgroundColor: 'white'},
                          ]}
                          value={
                            formFields?.[_index]?.selectedFromDate
                              ? moment(
                                  formFields?.[_index]?.selectedFromDate,
                                ).format('DD MMM YYYY')
                              : ''
                          }
                          onFocus={() => {
                            const allValues = [...showDatePicker];
                            allValues[_index] = !showDatePicker[_index];
                            setShowDatePicker(allValues);
                          }}
                          showSoftInputOnFocus={false}
                          disabled={!formFields[_index]?.company_role}
                        />

                        <Animated.View
                          entering={SlideInDown.duration(250).damping(10)}>
                          <ImuwDatePicker
                            accessibilityLabel="WorFromDateCalendarPicker"
                            onClose={() => {
                              const allValues = [...showDatePicker];
                              allValues[_index] = false;
                              setShowDatePicker(allValues);
                              dateInputRef.current.blur();
                            }}
                            open={showDatePicker[_index]}
                            testID="WorFromDateCalendarPicker"
                            selectedDate={
                              selectedFromDates[_index] && selectedFromDates[_index] instanceof Date 
                                ? selectedFromDates[_index] 
                                : new Date()
                            }
                            mode="date"
                            onDateChange={handleDateChange(_index)}
                            maximumDate={
                              selectedToDates[_index] && selectedToDates[_index] instanceof Date 
                                ? selectedToDates[_index] 
                                : new Date()
                            }
                          />
                        </Animated.View>
                      </View>
                    </View>
                  </View>

                  {/* To Date */}
                  {!formFields?.[_index]?.isPresentlyWorking && (
                    <View style={styles.dateContainer}>
                      <View>
                        <View style={styles.containerDate}>
                          <View style={[styles.column, styles.prefixColumn]}>
                            <Dropdown
                              accessibilityLabel="prefixTo"
                              testID="prefixTo"
                              style={[
                                styles.dropdown,
                                isFocusToPrefix[_index] && {
                                  borderColor: theme.colors.primary,
                                  borderWidth: 2,
                                },
                              ]}
                              data={filteredData(
                                formFields[_index].isAroundWorkEndDate &&
                                  formFields[_index].isAroundWorkEndDate,
                              )}
                              itemTextStyle={styles.itemTextStyle}
                              selectedTextStyle={{color: 'black'}}
                              placeholderStyle={{
                                color: 'black',
                                fontWeight: 400,
                              }}
                              maxHeight={300}
                              labelField="label"
                              valueField="value"
                              placeholder={
                                formFields?.[_index]?.isAroundWorkEndDate
                              }
                              value={formFields[_index].isAroundWorkEndDate}
                              onFocus={() => handleFocusToPrefix(_index, true)}
                              onBlur={() => handleFocusToPrefix(_index, false)}
                              onChange={itemValue => {
                                handleSelectionChange(
                                  itemValue.label,
                                  formik.setFieldValue,
                                  'isAroundWorkEndDate',
                                );

                                const updatedFormFields = [...formFields];
                                updatedFormFields[_index].isAroundWorkEndDate =
                                  itemValue.label;
                                setFormFields(updatedFormFields);
                              }}
                              disabled={!formFields[_index]?.company_role}
                            />
                          </View>
                          <View
                            style={[styles.column, styles.datePickerColumn]}>
                            <CustomInput
                              accessibilityLabel={`formFields[${_index}].selectedToDateId`}
                              name={`formFields[${_index}].selectedToDate`}
                              testID={`formFields[${_index}].selectedToDateId`}
                              ref={dateInputRefToDate}
                              mode="outlined"
                              label="To Date"
                              style={[
                                styles.textInputStyle,
                                {backgroundColor: 'white'},
                              ]}
                              value={
                                formFields?.[_index]?.selectedToDate
                                  ? moment(
                                      formFields?.[_index]?.selectedToDate,
                                    ).format('DD MMM YYYY')
                                  : ''
                              }
                              onFocus={() => {
                                const allValues = [...showDatePickerToDate];
                                allValues[_index] =
                                  !showDatePickerToDate[_index];
                                setShowDatePickerToDate(allValues);
                              }}
                              showSoftInputOnFocus={false}
                              disabled={!formFields[_index]?.company_role}
                            />

                            <Animated.View
                              entering={SlideInDown.duration(250).damping(10)}>
                              <ImuwDatePicker
                                accessibilityLabel="workToDateCalendarPicker"
                                onClose={() => {
                                  const allValues = [...showDatePickerToDate];
                                  allValues[_index] = false;
                                  setShowDatePickerToDate(allValues);
                                  dateInputRefToDate.current.blur();
                                }}
                                open={showDatePickerToDate[_index]}
                                testID="workToDateCalendarPicker"
                                selectedDate={
                                  selectedToDates[_index] && selectedToDates[_index] instanceof Date 
                                    ? selectedToDates[_index] 
                                    : new Date()
                                }
                                mode="date"
                                onDateChange={handleDateChangeToDate(_index)}
                                minimumDate={
                                  selectedFromDates[_index] && selectedFromDates[_index] instanceof Date 
                                    ? selectedFromDates[_index] 
                                    : new Date()
                                }
                              />
                            </Animated.View>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'row', marginTop: 20}}>
                      <Text
                        style={{paddingRight: 15, color: 'black'}}
                        accessibilityLabel={`${_index}-Present`}>
                        Present
                      </Text>
                      <GlobalCheckBox
                        testID="WorkInfoCheckbox"
                        accessibilityLabel={`${_index}-WorkInfoCheckbox`}
                        check={formFields?.[_index]?.isPresentlyWorking}
                        onCheck={() => {
                          const allValues = [...isPresent];
                          allValues[_index] = !isPresent[_index];
                          handleFieldChange(
                            _index,
                            'isPresentlyWorking',
                            allValues[_index],
                          );
                          setIsPresent(allValues);
                        }}
                      />
                    </View>

                    {/* Delete Button */}
                    {_index >= 1 && (
                      <TouchableOpacity
                        onPress={() => removeFormField(_index)}
                        style={styles.deleteButton}>
                        <ConnectionDeleteIcon
                          style={styles.deleteIcon}
                          accessibilityLabel={`${_index}-WorkDeleteIcon`}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {_index < formik.values.formFields.length - 1 && (
                  <Divider
                    bold
                    style={{
                      borderColor: '#B4B4B4',
                      borderWidth: 1,
                      marginVertical: 10,
                    }}
                    accessibilityLabel={`${_index}-Work-divider`}
                  />
                )}
              </View>
            ))}

            {/* Add More Button */}
            <TouchableOpacity onPress={addFormField} style={styles.addButton}>
              <Text
                style={styles.addMoreText}
                accessibilityLabel={'Work-add-more'}>
                Add More
              </Text>
            </TouchableOpacity>
            <View style={[styles.row, {paddingTop: 20, marginBottom: 100}]}>
              <View style={styles.column12}>
                <CustomButton
                  testID="addWorkBtn"
                  accessibilityLabel={'addWorkBtn'}
                  className="addWorkBtn"
                  label={'Save'}
                  onPress={() => formik.handleSubmit()}
                  loading={loading}
                  disabled={!formik.isValid || loading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'rgba(51, 48, 60, 0.3)',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
  },
  itemTextStyle: {
    color: 'black',
    fontWeight: 400,
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
    marginTop: 15,
  },
  datePickerColumn: {
    flex: 2,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  textInputStyle: {
    border: '0px solid #ccc6c6',
    marginTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  saveButton: {
    width: 100,
  },
  formFieldContainer: {
    marginVertical: 10,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    marginBottom: 10,
  },
  dateContainer: {},
  dateInput: {
    backgroundColor: '#F8F8F8',
    flex: 1,
  },
  checkbox: {
    backgroundColor: 'transparent',
    marginBottom: 10,
    width: '40%',
  },
  deleteButton: {
    marginTop: 15,
  },
  deleteIcon: {
    color: 'red',
    width: 24,
    height: 24,
  },
  addButton: {
    alignSelf: 'start',
  },
  addMoreText: {
    fontWeight: 'bold',
    color: NewTheme.colors.primaryOrange,
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
});

export default WorkInfo;
