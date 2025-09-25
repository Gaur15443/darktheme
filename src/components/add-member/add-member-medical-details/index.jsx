import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';

import {useFormik} from 'formik';
import {Dropdown} from 'react-native-element-dropdown';
import CustomInput from '../../CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SquarePlusIcon from '../../../core/icon/square-plus-icon';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';
import NewTheme from '../../../common/NewTheme';
import CustomDropdown from '../../customDropdown';

export default function AddMemberFormMedicalDetails({
  onValidationChange,
  updateFormValues,
}) {
  const data = [
    {label: 'A+', value: '1'},
    {label: 'A-', value: '2'},
    {label: 'B+', value: '3'},
    {label: 'B-', value: '4'},
    {label: 'O+', value: '5'},
    {label: 'O-', value: '6'},
    {label: 'AB+', value: '7'},
    {label: 'AB-', value: '8'},
    {label: ' ', value: '9'},
  ];
  const bloodGroupData = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''];
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const initialFields = [
    {
      bloodgroup: null,
      chronic_condition: [
        {
          name: null,
        },
      ],
      allergies: [
        {
          name: null,
        },
      ],
      illnesses: [
        {
          name: null,
        },
      ],
      preExistingConditions: [
        {
          name: null,
        },
      ],
    },
  ];
  const [formFields, setFormFields] = useState(initialFields);

  // Formik
  const formik = useFormik({
    initialValues: {
      formFields,
    },
  });

  // Update and Validate Formik Values
  useEffect(() => {
    onValidationChange(formik.isValid);
    updateFormValues('medicalDetails', formFields[0]);
  }, [formik.isValid]);

  /**
   *
   * @param {('chronic_condition' | 'allergies' | 'illnesses' | 'preExistingConditions')} fieldName
   */

  // Add Fields
  function addFields(fieldName) {
    const newFields = [...formFields];
    newFields[0][fieldName].push(initialFields[0][fieldName]);

    formik.values.formFields = newFields;
    setFormFields(newFields);
  }

  // Delete Fields
  function deleteCondition(fieldName, index) {
    const newFields = [...formFields];
    const fieldArray = newFields[0][fieldName];

    if (fieldArray && fieldArray?.length > index) {
      fieldArray.splice(index, 1);
      formik.values.formFields = newFields;
      setFormFields(newFields);
    }
  }

  // Input Handler
  function handleFieldChange(index, fieldName, value) {
    const updatedFormFields = [...formFields];
    if (fieldName === 'bloodgroup') {
      updatedFormFields[0][fieldName] = value;
    } else {
      updatedFormFields[0][fieldName][index] = {name: value};
    }
    setFormFields(updatedFormFields);
    formik.setFieldValue(`formFields[0].${fieldName}[${index}].name`, value);
  }

  // Loading State
  const [loadingData, setLoadingData] = useState(true);

  // Function to save data to AsyncStorage
  const saveData = async () => {
    try {
      const dataToSave = {
        ...formik.values,
        value: value,
      };
      await AsyncStorage.setItem('addMember_MH', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Function to load data from AsyncStorage
  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('addMember_MH');
      if (data !== null) {
        const parsedData = JSON.parse(data);
        const {value, ...formikValues} = parsedData;
        formik.setValues(formikValues);
        setFormFields(parsedData.formFields);
        setValue(parsedData.value);
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
  }, [formik.values, value, formFields]);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Lose Focus Of Custom Inputs
  const inputRefs = {
    medical: useRef(null),
    allergies: useRef(null),
    hereditary: useRef(null),
  };
  const blurInputs = () => {
    Object.keys(inputRefs).forEach(key => {
      if (inputRefs[key].current) {
        inputRefs[key].current.blur();
      }
    });
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
      <View>
        <View style={{zIndex: 1001, backgroundColor: 'white'}}>
          <CustomDropdown
            testID="bloodGroupDropdown"
            label={'Blood Group'}
            options={data}
            value={value}
            onOptionSelect={item => {
              formik.setFieldValue(`formFields[${0}].bloodgroup`, item.label);
              handleFieldChange(0, 'bloodgroup', item.label);
              setValue(item.value);
              setIsFocus(false);
            }}
            onFocus={() => {
              setIsFocus(true);
              blurInputs();
            }}
            onBlur={() => setIsFocus(false)}
            inputHeight={45}
          />
        </View>
      </View>
      {formik.values.formFields[0].chronic_condition.map(
        (field, fieldIndex) => (
          <View key={fieldIndex} style={{flexDirection: 'row'}}>
            <CustomInput
              inputHeight={45}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={{width: '85%', backgroundColor: 'white', marginTop: 10}}
              testID={`add-medical-conditions-${fieldIndex}`}
              label="Medical Conditions"
              name={'roleInCompany'}
              value={field.name}
              onChangeText={e => {
                const capitalizedText = e.charAt(0).toUpperCase() + e.slice(1);
                const updatedFormFields = [...formik.values.formFields];
                updatedFormFields[0].chronic_condition[
                  fieldIndex
                ].chronic_condition = capitalizedText;
                formik.setFieldValue('formFields', updatedFormFields);
                handleFieldChange(
                  fieldIndex,
                  'chronic_condition',
                  capitalizedText,
                );
              }}
              onBlur={formik.handleBlur}
              ref={inputRefs.medical}
              clearable
            />

            {fieldIndex === 0 ? (
              <TouchableOpacity onPress={() => addFields('chronic_condition')}>
                <View style={styles.deleteAndPlusIcon}>
                  <SquarePlusIcon />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  deleteCondition('chronic_condition', fieldIndex)
                }>
                <View style={styles.deleteAndPlusIcon}>
                  <ConnectionDeleteIcon />
                </View>
              </TouchableOpacity>
            )}
          </View>
        ),
      )}
      {formik.values.formFields[0].allergies.map((field, fieldIndex) => (
        <View key={fieldIndex} style={{flexDirection: 'row'}}>
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={{width: '85%', backgroundColor: 'white', marginTop: 10}}
            testID={`add-allergies-${fieldIndex}`}
            label="Allergies"
            name={`formFields[${0}].allergies[${fieldIndex}].name`}
            value={field.name}
            onChangeText={e => {
              const capitalizedText = e.charAt(0).toUpperCase() + e.slice(1);

              const updatedFormFields = [...formik.values.formFields];
              updatedFormFields[0].allergies[fieldIndex].allergies =
                capitalizedText;
              formik.setFieldValue('formFields', updatedFormFields);
              handleFieldChange(fieldIndex, 'allergies', capitalizedText);
            }}
            onBlur={formik.handleBlur}
            ref={inputRefs.allergies}
            clearable
          />

          {fieldIndex === 0 ? (
            <TouchableOpacity onPress={() => addFields('allergies')}>
              <View style={styles.deleteAndPlusIcon}>
                <SquarePlusIcon />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => deleteCondition('allergies', fieldIndex)}>
              <View style={styles.deleteAndPlusIcon}>
                <ConnectionDeleteIcon />
              </View>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {formik.values.formFields[0].illnesses.map((field, fieldIndex) => (
        <View key={fieldIndex} style={{flexDirection: 'row'}}>
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={{width: '85%', backgroundColor: 'white', marginTop: 10}}
            testID={`add-illness-${fieldIndex}`}
            label="Hereditary Conditions"
            name={`formFields[${0}].illnesses[${fieldIndex}].name`}
            value={field.name}
            onChangeText={e => {
              const capitalizedText = e.charAt(0).toUpperCase() + e.slice(1);

              const updatedFormFields = [...formik.values.formFields];
              updatedFormFields[0].illnesses[fieldIndex].illnesses =
                capitalizedText;
              formik.setFieldValue('formFields', updatedFormFields);
              handleFieldChange(fieldIndex, 'illnesses', capitalizedText);
            }}
            onBlur={formik.handleBlur}
            ref={inputRefs.hereditary}
            clearable
          />

          {fieldIndex === 0 ? (
            <TouchableOpacity onPress={() => addFields('illnesses')}>
              <View style={styles.deleteAndPlusIcon}>
                <SquarePlusIcon />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => deleteCondition('illnesses', fieldIndex)}>
              <View style={styles.deleteAndPlusIcon}>
                <ConnectionDeleteIcon />
              </View>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'rgba(51, 48, 60, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  deleteAndPlusIcon: {
    height: 40,
    marginTop: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
