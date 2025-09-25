import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import {useFormik} from 'formik';
import DeleteIcon from '../../../core/icon/delete-icon';
import CustomInput from '../../CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';
import NewTheme from '../../../common/NewTheme';
const AddMemberFormSocialDetails = ({onValidationChange, updateFormValues}) => {
  const initialFields = [
    {
      sociallinks: [
        {
          account: 'facebook',
          label: 'Facebook',
          link: '',
        },
        {
          account: 'Insta',
          label: 'Instagram',
          link: '',
        },
        {
          account: 'Twitter',
          label: 'Twitter',
          link: '',
        },
      ],
      other: [],
    },
  ];
  const [formFields, setFormFields] = useState(initialFields);

  // Formik
  const formik = useFormik({
    initialValues: {
      formFields,
    },
    onSubmit: () => {},
  });

  // Update and Validate Formik Values
  useEffect(() => {
    onValidationChange(formik.isValid);
    const validSocialLinks = formik.values.formFields[0].sociallinks.filter(
      field => field.link !== '',
    );
    const validOther = formik.values.formFields[0].other.filter(
      field => field.link !== '',
    );

    updateFormValues('sociallinks', validSocialLinks);
    updateFormValues('other', validOther);
  }, [formik.isValid, formik.values]);

  // Add Fields
  function addFields() {
    const newFields = [...formik.values.formFields];
    newFields[0].other.push({
      account: 'Other social media',
      link: '',
    });
    formik.values.formFields = newFields;
    setFormFields(newFields);
  }

  // Delete Fields
  function deleteSocial(index) {
    const newFields = [...formik.values.formFields];
    newFields[0].other.splice(index, 1);

    formik.values.formFields = newFields;
    setFormFields(newFields);
  }

  const [loadingData, setLoadingData] = useState(true);

  // Function to save data to AsyncStorage
  const saveData = async () => {
    try {
      const dataToSave = {
        ...formik.values,
      };
      await AsyncStorage.setItem('addMember_SD', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Function to load data from AsyncStorage
  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('addMember_SD');
      if (data !== null) {
        const parsedData = JSON.parse(data);
        formik.setValues(parsedData);
        setFormFields(parsedData.formFields);
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
  }, [formik.values, formFields]);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  return (
    <View
      style={{
        backgroundColor: 'white',
        marginTop: -50,
        paddingBottom: 50,
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      }}>
      {formik.values.formFields[0].sociallinks.map((field, fieldIndex) => (
        <View key={fieldIndex}>
          <CustomInput
            inputHeight={45}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            testID={field.label}
            label={field.label}
            value={field.link}
            style={{marginTop: 10, backgroundColor: 'white'}}
            onChangeText={text => {
              const capitalizedText =
                text.charAt(0).toUpperCase() + text.slice(1);
              formik.setFieldValue(
                `formFields[0].sociallinks[${fieldIndex}].link`,
                capitalizedText,
              );
            }}
            clearable
          />
        </View>
      ))}
      {formik.values.formFields[0].other.map((field, fieldIndex) => (
        <View key={fieldIndex}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <CustomInput
              inputHeight={45}
              autoCapitalize="none"
              autoCorrect={false}
              testID={`other-social-media-${fieldIndex}`}
              mode="outlined"
              label="Other social media"
              value={field.link}
              onChangeText={text => {
                const capitalizedText =
                  text.charAt(0).toUpperCase() + text.slice(1);
                formik.setFieldValue(
                  `formFields[0].other[${fieldIndex}].link`,
                  capitalizedText,
                );
              }}
              style={{width: '85%', marginTop: 10}}
              clearable
            />

            <TouchableOpacity onPress={() => deleteSocial(fieldIndex)}>
              <View
                style={{
                  height: 40,
                  marginTop: 10,
                  marginLeft: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ConnectionDeleteIcon />
              </View>
            </TouchableOpacity>
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
};

export default AddMemberFormSocialDetails;
