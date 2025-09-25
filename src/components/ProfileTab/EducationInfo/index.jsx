import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {useTheme, Text, Divider} from 'react-native-paper';
import Animated, {SlideInDown} from 'react-native-reanimated';

import {useDispatch, useSelector} from 'react-redux';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';
import {CustomButton} from '../../../core';
import {getAdduserProfiles} from '../../../store/apps/addUserProfile';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {useNavigation} from '@react-navigation/native';
import Confirm from '../../Confirm';
import {GlobalHeader, GlobalCheckBox, CustomInput} from '../../../components';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import {Dropdown} from 'react-native-element-dropdown';
import NewTheme from '../../../common/NewTheme';
import moment from 'moment';
import _ from 'lodash';
import {useFormik} from 'formik';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import { desanitizeInput } from '../../../utils/sanitizers';

const EducationInfo = ({route}) => {
  const dataPrefix = [
    {label: 'On', value: '1'},
    {label: 'Around (~)', value: '2'},
  ];
  const id = route.params ? route.params.id : undefined;

  useNativeBackHandler(handleBack);
  const dispatch = useDispatch();
  const theme = useTheme();

  const initialFields = {
    degree: '',
    isPresentlyStudying: false,
    selectedFromDate: null,
    selectedToDate: null,
    address: '',
    isAroundEducationStartDate: 'On',
    isAroundEducationEndDate: 'On',
    name: '',
    location: '',

    dateOfFrom: '',
    dateOfTo: '',
    FD_Flag: '',
    TD_Flag: '',
  };
  const [locationInstitute, setInstituteLocation] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [isFocusFromPrefix, setIsFocusFromPrefix] = useState([false]);
  const [isFocusToPrefix, setIsFocusToPrefix] = useState([false]);

  const [isPresent, setIsPresent] = useState([false]);
  const [showDatePicker, setShowDatePicker] = useState([false]);
  const [showDatePickerToDate, setShowDatePickerToDate] = useState([false]);
  const dateInputRef = useRef(null);
  const dateInputRefToDate = useRef(null);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);

  const [formFields, setFormFields] = useState([initialFields]);
  const navigation = useNavigation();

  const userInfo = useSelector(state => state?.userInfo);

  const userId = id ? id : userInfo._id;

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Info_Tab?.basic_facts_error,
  );

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
      setLoading(true);
      let allClinks = [];
      if (basicInfo?.cLink?.length > 0) {
        allClinks = basicInfo?.cLink.flatMap(link => link?.linkId);
        allClinks = [...allClinks, basicInfo?._id];
      }
      const nonEmptyFormFields = formFields.filter(field =>
        Object.entries(field).some(
          ([key, value]) =>
            key !== 'isPresentlyStudying' &&
            value &&
            value?.trim?.() !== '' &&
            (field?.degree?.trim?.() !== '' ||
            field?.name?.trim?.() !== '' ||
            field?.locationInstitute
              ? field?.locationInstitute?.trim?.() !== ''
              : ''),
        ),
      );
      const college = nonEmptyFormFields.map((field, index) => {
        field.FD_Flag = 1;

        field.TD_Flag = 1;

        field.dateOfFrom = field.selectedFromDate || null;
        field.dateOfTo = field.selectedToDate || null;
        field.address = locationInstitute[index];
        if (field.selectedFromDate) {
          field.isAroundEducationStartDate = !(
            field.isAroundEducationStartDate === 'On' || ''
          );
        } else {
          field.isAroundEducationStartDate = false;
        }

        if (field.selectedToDate) {
          field.isAroundEducationEndDate = !(
            field.isAroundEducationEndDate === 'On' || ''
          );
        } else {
          field.isAroundEducationEndDate = false;
        }
        field.docMediaIds =
          basicInfo?.educationDetails?.college?.[index]?.docMediaIds;

        return field;
      });
      const formData = {
        educationDetails: {
          college,
        },
        cLinks: basicInfo?.cLink?.length ? allClinks : [],
        clinkIsPresent: basicInfo?.cLink?.length > 0 ? true : false,
        cloneOwner: basicInfo?.isClone
          ? basicInfo?.cLink[0]?.linkId?.[0]
          : null,
        userId,
      };

      dispatch(getAdduserProfiles(formData)).then(() => handleClose()).catch(() => {
        Toast.show({
          type: 'error',
          text1: toastMessages?.['12005'],
        });
      });
    },
  });

  const addFormField = () => {
    const newFields = [...formFields, initialFields];
    formik.values.formFields = newFields;
    setFormFields(newFields);
    setIsPresent(prev => [...prev, false]);
    setIsFocusFromPrefix(prev => [...prev, false]);
    setIsFocusToPrefix(prev => [...prev, false]);
    setInstituteLocation(prev => [...prev, '']);
    setShowDatePicker(prev => [...prev, false]);
    setShowDatePickerToDate(prev => [...prev, false]);
  };

  useEffect(() => {
    setLoadingDefault(true);
    const field = [];
    const locationField = [];
    const presentFields = [];
    const showVisibleField = [];
    const showVisibleFieldToDate = [];

    if (
      basicInfo &&
      basicInfo?.educationDetails?.college &&
      formik?.values?.formFields
    ) {
      basicInfo.educationDetails.college.forEach((item, index) => {
        if (
          basicInfo.educationDetails.college[index].dateOfFrom &&
          basicInfo.educationDetails.college[index].isPresentlyStudying === true
        ) {
          presentFields.push(item.isPresentlyStudying || true);

          isPresent[index] = true;
        }
        showVisibleField.push(false);
        showVisibleFieldToDate.push(false);

        field.push({
          degree: item.degree,
          name: item.name,
          isPresentlyStudying: item.isPresentlyStudying || false,

          selectedFromDate: item.fromDate
            ? item.fromDate
            : item.dateOfFrom
              ? item.dateOfFrom
              : null,
          selectedToDate: item.toDate
            ? item.toDate
            : item.dateOfTo
              ? item.dateOfTo
              : null,
          location: item?.address,
          isAroundEducationStartDate:
            item.isAroundEducationStartDate === false ? 'On' : 'Around (~)',
          isAroundEducationEndDate:
            item.isAroundEducationEndDate === false ? 'On' : 'Around (~)',
        });

        locationField.push(item.address);
      });
      setInstituteLocation(locationField);
      setShowDatePicker(showVisibleField);
      setShowDatePickerToDate(showVisibleFieldToDate);
      setFormFields(field);
      setIsPresent(presentFields);
    }
    formik.values.formFields = basicInfo?.educationDetails?.college;
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
  const handleFieldChange = (index, field, value) => {
    const updatedFormFields = [...formFields];
    updatedFormFields[index] = {
      ...updatedFormFields[index],
      [field]: value,
    };
    if (field === 'isPresentlyStudying' && value) {
      updatedFormFields[index] = {
        ...updatedFormFields[index],
        selectedToDate: null, // Changed from '' to null
        isAroundEducationEndDate: 'On',
      };
    }
    setFormFields(updatedFormFields);
  };

  const removeFormField = index => {
    setFormFields(prevFormFields => {
      const newFields = [...prevFormFields];
      newFields.splice(index, 1);
      
      // Update the isPresent array
      setIsPresent(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      // Update the locationInstitute array
      setInstituteLocation(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
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
  const handleDateChange = index => {
    return function (date) {
      dateInputRef.current.blur();
      if (date) {
        formFields[index].isAroundEducationStartDate = formFields[index]
          .isAroundEducationStartDate
          ? formFields[index].isAroundEducationStartDate
          : 'On';
      }
      if (formFields[index]) {
        const updatedFormFields = [...formFields];
        updatedFormFields[index].selectedFromDate = date;
        setFormFields(updatedFormFields);
        dateInputRef.current.blur();
        Keyboard.dismiss();
      }
      const allValues = [...showDatePicker];
      allValues[index] = !showDatePicker[index];
      setShowDatePicker(allValues);
      dateInputRef.current.blur();
    };
  };
  const handleDateChangeToDate = index => {
    return function (date) {
      dateInputRefToDate.current.blur();
      if (date) {
        formFields[index].isAroundEducationEndDate = formFields[index]
          .isAroundEducationEndDate
          ? formFields[index].isAroundEducationEndDate
          : 'On';
      }
      Keyboard.dismiss();

      if (formFields[index]) {
        const updatedFormFields = [...formFields];
        updatedFormFields[index].selectedToDate = date;
        setFormFields(updatedFormFields);
        dateInputRefToDate.current.blur();
      }
      const allValues = [...showDatePickerToDate];
      allValues[index] = !showDatePickerToDate[index];
      setShowDatePickerToDate(allValues);
      dateInputRefToDate.current.blur();
    };
  };

  function handleBack() {
    let isFilled = formFields.some(field => {
      return (
        field.name ||
        field.address ||
        field.degree ||
        field.selectedFromDate ||
        field.selectedToDate
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
        heading={'Education History'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          <View style={styles.container}>
            {openConfirmPopup && (
              <Confirm
                accessibilityLabel="education-confirm-Popup"
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
            {formik?.values?.formFields?.map((field, index) => (
              <View key={`formfield-${index}`}>
                <View style={styles.formFieldContainer}>
                  {/* Company Name */}
                  <CustomInput
                    label="Degree"
                    accessibilityLabel={`formFields[${index}].degree`}
                    name={`formFields[${index}].degree`}
                    testID={`formFields[${index}].degree`}
                    clearable
                    value={desanitizeInput(field.degree)}
                    onChangeText={text => {
                      formik.setFieldValue(`formFields[${index}].degree`, text);
                      handleFieldChange(index, 'degree', text);
                    }}
                    mode="outlined"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    outlineColor={theme.colors.altoGray}
                  />

                  {/* Company Role */}
                  <CustomInput
                    label="Institution Name"
                    mode="outlined"
                    accessibilityLabel={`formFields[${index}].name`}
                    clearable
                    name={`formFields[${index}].name`}
                    testID={`formFields[${index}].name`}
                    value={desanitizeInput(field.name)}
                    onChangeText={text => {
                      formik.setFieldValue(`formFields[${index}].name`, text);
                      handleFieldChange(index, 'name', text);
                    }}
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    outlineColor={theme.colors.altoGray}
                  />
                  <CustomInput
                    name={`formFields[${index}].locationInstitute`}
                    mode="outlined"
                    accessibilityLabel={`educationinsta${index}-instalocation`}
                    testID={`educationinsta${index}-instalocation`}
                    label="Institution Location"
                    value={desanitizeInput(locationInstitute[index])}
                    clearable
                    type="text"
                    fullWidth
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    outlineColor={theme.colors.altoGray}
                    onChangeText={text => {
                      handleFieldChange(index, 'locationInstitute', text);
                      const result = [...locationInstitute];
                      result[index] = text;
                      setInstituteLocation(result);
                    }}
                    autoComplete="off"
                  />

                  {/* From Date */}
                  <View>
                    <View style={styles.containerDate}>
                      <View style={[styles.column, styles.prefixColumn]}>
                        <Dropdown
                          accessibilityLabel="prefix"
                          testID="prefix"
                          style={[
                            styles.dropdown,
                            isFocusFromPrefix[index] && {
                              borderColor: theme.colors.primary,
                              borderWidth: 2,
                            },
                          ]}
                          data={filteredData(
                            formFields?.[index]?.isAroundEducationStartDate,
                          )}
                          itemTextStyle={styles.itemTextStyle}
                          selectedTextStyle={{color: 'black'}}
                          placeholderStyle={{color: 'black', fontWeight: 400}}
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={
                            formFields?.[index]?.isAroundEducationStartDate
                          }
                          value={
                            formFields[index].isAroundEducationStartDate &&
                            formFields[index].isAroundEducationStartDate
                          }
                          onFocus={() => handleFocusFromPrefix(index, true)}
                          onBlur={() => handleFocusFromPrefix(index, false)}
                          onChange={itemValue => {
                            handleSelectionChange(
                              itemValue.label,
                              formik.setFieldValue,
                              'isAroundEducationStartDate',
                            );

                            const updatedFormFields = [...formFields];
                            updatedFormFields[
                              index
                            ].isAroundEducationStartDate = itemValue.label;
                            setFormFields(updatedFormFields);
                          }}
                        />
                      </View>
                      <View style={[styles.column, styles.datePickerColumn]}>
                        <CustomInput
                          accessibilityLabel={`educationinsta${index}-fromdate`}
                          name={`formFields[${index}].fromdate`}
                          testID={`educationinsta${index}-fromdate`}
                          ref={dateInputRef}
                          mode="outlined"
                          label="From Date"
                          style={[
                            styles.textInputStyle,
                            {backgroundColor: 'white'},
                          ]}
                          value={
                            formFields[index]?.selectedFromDate
                              ? moment(
                                  formFields[index].selectedFromDate,
                                ).format('DD MMM YYYY')
                              : ''
                          }
                          onFocus={() => {
                            const allValues = [...showDatePicker];
                            allValues[index] = !showDatePicker[index];
                            setShowDatePicker(allValues);
                          }}
                          outlineColor={theme.colors.altoGray}
                          showSoftInputOnFocus={false}
                          disabled={
                            !formFields[index]?.degree?.trim() &&
                            !formFields[index]?.locationInstitute?.trim()
                          }
                        />
                        <Animated.View
                          entering={SlideInDown.duration(250).damping(10)}>
                          <ImuwDatePicker
                            accessibilityLabel="FomDateCalendarPicker"
                            onClose={() => {
                              const allValues = [...showDatePicker];
                              allValues[index] = !showDatePicker[index];
                              setShowDatePicker(allValues);
                              dateInputRef?.current?.blur();
                            }}
                            open={showDatePicker[index]}
                            testID="FomDateCalendarPicker"
                            selectedDate={
                              formFields?.[index]?.selectedFromDate
                                ? new Date(
                                    formFields?.[index]?.selectedFromDate,
                                  )
                                : new Date()
                            }
                            mode="date"
                            onDateChange={handleDateChange(index)}
                            maximumDate={
                              formFields?.[index]?.selectedToDate 
                                ? new Date(formFields[index].selectedToDate)
                                : new Date()
                            }
                          />
                        </Animated.View>
                      </View>
                    </View>
                  </View>

                  {/* To Date */}
                  {!formFields?.[index]?.isPresentlyStudying && (
                    <View style={styles.dateContainer}>
                      <View>
                        <View style={styles.containerDate}>
                          <View style={[styles.column, styles.prefixColumn]}>
                            <Dropdown
                              accessibilityLabel="prefixTo"
                              testID="prefixTo"
                              style={[
                                styles.dropdown,
                                isFocusToPrefix[index] && {
                                  borderColor: theme.colors.primary,
                                  borderWidth: 2,
                                },
                              ]}
                              data={filteredData(
                                formFields?.[index]?.isAroundEducationEndDate,
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
                                formFields?.[index]?.isAroundEducationEndDate
                              }
                              value={formFields[index].isAroundEducationEndDate}
                              onFocus={() => handleFocusToPrefix(index, true)}
                              onBlur={() => handleFocusToPrefix(index, false)}
                              onChange={itemValue => {
                                handleSelectionChange(
                                  itemValue.label,
                                  formik.setFieldValue,
                                  'isAroundEducationEndDate',
                                );

                                const updatedFormFields = [...formFields];
                                updatedFormFields[
                                  index
                                ].isAroundEducationEndDate = itemValue.label;
                                setFormFields(updatedFormFields);
                              }}
                            />
                          </View>
                          <View
                            style={[styles.column, styles.datePickerColumn]}>
                            <CustomInput
                              accessibilityLabel={`educationinsta${index}-todate`}
                              name={`formFields[${index}].todate`}
                              testID={`educationinsta${index}-todate`}
                              ref={dateInputRefToDate}
                              mode="outlined"
                              label="To Date"
                              style={[
                                styles.textInputStyle,
                                {backgroundColor: 'white'},
                              ]}
                              value={
                                formFields?.[index]?.selectedToDate
                                  ? moment(
                                      formFields?.[index]?.selectedToDate,
                                    ).format('DD MMM YYYY')
                                  : ''
                              }
                              onFocus={() => {
                                const allValues = [...showDatePickerToDate];
                                allValues[index] = !showDatePickerToDate[index];
                                setShowDatePickerToDate(allValues);
                              }}
                              outlineColor={theme.colors.altoGray}
                              showSoftInputOnFocus={false}
                              disabled={
                                !formFields[index]?.degree?.trim() &&
                                !formFields[index]?.locationInstitute?.trim()
                              }
                            />
                            <Animated.View
                              entering={SlideInDown.duration(250).damping(10)}>
                              <ImuwDatePicker
                                accessibilityLabel="ToDateCalendarPicker"
                                onClose={() => {
                                  const allValues = [...showDatePickerToDate];
                                  allValues[index] =
                                    !showDatePickerToDate[index];
                                  setShowDatePickerToDate(allValues);
                                  dateInputRefToDate.current.blur();
                                }}
                                open={showDatePickerToDate[index]}
                                testID="ToDateCalendarPicker"
                                selectedDate={
                                  formFields?.[index]?.selectedToDate
                                    ? new Date(
                                        formFields?.[index]?.selectedToDate,
                                      )
                                    : new Date()
                                }
                                mode="date"
                                onDateChange={handleDateChangeToDate(index)}
                                minimumDate={
                                  formFields?.[index]?.selectedFromDate
                                    ? new Date(formFields?.[index]?.selectedFromDate)
                                    : undefined
                                }
                              />
                            </Animated.View>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Present Checkbox */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'row', marginTop: 20}}>
                      <Text
                        style={{paddingRight: 15, color: 'black'}}
                        accessibilityLabel={`isPresentlyStudying${index}`}>
                        Present
                      </Text>

                      <GlobalCheckBox
                        testID={`lifestoryCheckbox${index}`}
                        accessibilityLabel={`lifestoryCheckbox${index}`}
                        check={formFields?.[index]?.isPresentlyStudying}
                        onCheck={() => {
                          const allValues = [...isPresent];
                          allValues[index] = !isPresent[index];
                          handleFieldChange(
                            index,
                            'isPresentlyStudying',
                            allValues[index],
                          );
                          setIsPresent(allValues);
                        }}
                      />
                    </View>

                    {/* Delete Button */}
                    {index >= 1 && (
                      <TouchableOpacity
                        accessibilityLabel={`DeletebButton${index}`}
                        testID={`DeletebButton${index}`}
                        onPress={() => removeFormField(index)}
                        style={styles.deleteButton}>
                        <ConnectionDeleteIcon style={styles.deleteIcon} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {index < formik.values.formFields.length - 1 && (
                  <Divider
                    bold
                    style={{
                      borderColor: '#B4B4B4',
                      borderWidth: 1,
                      marginVertical: 10,
                    }}
                    accessibilityLabel={'Education-Divider'}
                  />
                )}
              </View>
            ))}

            {/* Add More Button */}
            <TouchableOpacity
              testID={'AddFormButtonEducation'}
              onPress={addFormField}
              style={styles.addButton}>
              <Text
                style={styles.addMoreText}
                accessibilityLabel={'AddFormButtonEducation'}>
                Add More
              </Text>
            </TouchableOpacity>
            <View style={[styles.row, {paddingTop: 20, marginBottom: 100}]}>
              <View style={styles.column12}>
                <CustomButton
                  testID="addEducationBtn"
                  accessibilityLabel="addEducationBtn"
                  className="addEducationBtn"
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
});

export default EducationInfo;
