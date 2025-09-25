import React, {useState, useEffect, useRef} from 'react';
import moment from 'moment';

import {View, StyleSheet} from 'react-native';
import {HelperText, useTheme} from 'react-native-paper';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Theme from '../../../common/Theme';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import CustomInput from '../../CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from 'react-native-element-dropdown';
import CustomDropdown from '../../customDropdown';

const AddMemberMarriageDetails = ({
  relation,
  updateFormValues,
  onValidationChange,
  spouseName,
}) => {
  const [weddingLocation, setWeddingLocation] = useState('');
  const [isRelationStatus, setRelationStatus] = useState('');
  const data = [
    {label: 'Married', value: 'Married'},
    {label: 'Not Married Anymore', value: 'Not Married Anymore'},
  ];

  const [value, setValue] = useState('Married');
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusPrefix, setIsFocusPrefix] = useState(false);
  const [activeTab, setActiveTab] = useState('Married');
  const theme = useTheme();
  const weddingLocationInputRef = useRef(null);
  const maidenNameInputRef = useRef(null);
  const [isMarriageDatePickerVisible, setMarriageDatePickerVisibility] =
    useState(false);
  const [selectedMarriageDate, setSelectedMarriageDate] = useState(null);
  const marriageDateInputRef = useRef(null);
  const dataPrefix = [
    {label: 'On', value: '1'},
    {label: 'Around (~)', value: '2'},
  ];

  // Formik
  const formik = useFormik({
    initialValues: {
      MD_Flag: null,
      isAroundDateOfMarraige: '',
      prefix: 'On',
      marriageDetails: {
        marraigeDate: null,
        location_of_wedding: '',
        maidenName: null,
        linkYourSpouse:
          relation === 'wife' || relation === 'husband' ? spouseName : null,
        relationship: 'Married',
      },
    },
    validationSchema: Yup.object().shape({
      marriageDetails: Yup.object().shape({
        linkYourSpouse: Yup.string()
          .min(2, 'Field must be at least 2 characters')
          .notRequired(),
        maidenName: Yup.string()
          .min(2, 'Field must be at least 2 characters')
          .notRequired(),
      }),
    }),
  });
  // Load Data from Async Storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedDataJSON = await AsyncStorage.getItem('addMember_MD');
        if (savedDataJSON) {
          const savedData = JSON.parse(savedDataJSON);
          const {selectedMarriageDate, weddingLocation, ...formikValues} =
            savedData;
          formik.setValues(formikValues);
          setSelectedMarriageDate(savedData.selectedMarriageDate);
          setWeddingLocation(savedData.weddingLocation);
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save Entered Values To Async Storage
  useEffect(() => {
    AsyncStorage.setItem(
      'addMember_MD',
      JSON.stringify({
        ...formik.values,
        selectedMarriageDate,
        weddingLocation,
      }),
    ).catch(error => {
      console.error('Error saving to AsyncStorage:', error);
    });
  }, [formik?.values, selectedMarriageDate, weddingLocation]);

  //  Marriage Date Handler
  const handleMarriageDateChange = date => {
    const fullIsoMd = new Date(date).toISOString();

    setSelectedMarriageDate(moment(date).format('DD MMM YYYY'));
    formik.setFieldValue('marriageDetails.marraigeDate', fullIsoMd);
    formik.setFieldValue('MD_Flag', 1);
    setMarriageDatePickerVisibility(false);
    marriageDateInputRef.current.blur();
  };

  // Close Marriage Date Picker
  const closeMarriageDatePicker = () => {
    setMarriageDatePickerVisibility(false);
    marriageDateInputRef.current.blur();
  };

  // Update and Validate Entered Values
  useEffect(() => {
    onValidationChange(formik.isValid);
    updateFormValues('marriageDetails', formik.values.marriageDetails);
    updateFormValues(
      'isAroundDateOfMarraige',
      formik.values.prefix === 'On' ? false : true,
    );
  }, [formik.isValid, formik.values.marriageDetails]);

  // Active Tab Handler
  const handleTabPress = tab => {
    setActiveTab(tab);
    if (tab === 'Single') {
      AsyncStorage.removeItem('addMember_MD');
      formik.resetForm();

      // Reset local component states
      setSelectedMarriageDate(null);
      setWeddingLocation('');
    }
  };

  const handleStatusChange = event => {
    setRelationStatus(event.target.value);
    onRelationStatusChange(event.target.value);
  };

  useEffect(() => {
    updateFormValues('MD_Flag', 1);
  }, [formik.values.marriageDetails.marraigeDate]);

  const handleSelectionChange = (label, setFieldValue, name) => {
    setFieldValue(name, label);
  };
  const filteredData = () => {
    const selectedValue = formik.values.prefix;
    return dataPrefix.filter(item => item.label !== selectedValue);
  };

  const blurInputs = () => {
    if (weddingLocationInputRef?.current) {
      weddingLocationInputRef?.current.blur();
    }
    if (maidenNameInputRef?.current) {
      maidenNameInputRef?.current.blur();
    }
  };
  return (
    <View
      style={{
        backgroundColor: 'white',
        marginTop: -50,
        paddingBottom: 30,
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      }}>
      {activeTab === 'Married' && (
        <View>
          <View>
            <CustomInput
              contentStyle={{color: '#c5c4c9'}}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={[styles.textInputStyle, {color: 'grey'}]}
              testID="spouse-name"
              label="Spouse Name"
              name="spouseName"
              value={formik.values.marriageDetails?.linkYourSpouse}
              onChangeText={text =>
                formik.handleChange('marriageDetails.linkYourSpouse')(text)
              }
              onBlur={formik.handleBlur('marriageDetails.linkYourSpouse')}
              disabled
            />

            {formik.touched.marriageDetails?.linkYourSpouse &&
              formik.errors.marriageDetails?.linkYourSpouse && (
                <HelperText style={{color: 'red'}}>
                  {formik.errors.marriageDetails?.linkYourSpouse}
                </HelperText>
              )}

            {(relation === 'wife' || relation === 'sister') && (
              <CustomInput
                ref={maidenNameInputRef}
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                style={styles.textInputStyle}
                testID="maiden-name"
                label="Maiden Name"
                name="maidenName"
                value={formik.values.marriageDetails?.maidenName}
                onChangeText={text => {
                  const capitalizedText =
                    text.charAt(0).toUpperCase() + text.slice(1);
                  formik.handleChange('marriageDetails.maidenName')(
                    capitalizedText,
                  );
                }}
                onBlur={formik.handleBlur('marriageDetails.maidenName')}
                clearable
              />
            )}

            {formik.touched.marriageDetails?.maidenName &&
              formik.errors.marriageDetails?.maidenName && (
                <HelperText style={{color: 'red'}}>
                  {formik.errors.marriageDetails?.maidenName}
                </HelperText>
              )}
            <View>
              <View style={styles.containerDate}>
                <View style={[styles.column, styles.prefixColumn]}>
                  <View style={{zIndex: 1001, backgroundColor: 'white'}}>
                    <CustomDropdown
                      testID="prefix"
                      label={formik.values.prefix}
                      options={filteredData()}
                      value={formik.values.prefix}
                      onOptionSelect={itemValue => {
                        handleSelectionChange(
                          itemValue.label,
                          formik.setFieldValue,
                          'prefix',
                        );
                      }}
                      onFocus={() => {
                        setIsFocusPrefix(true);
                        blurInputs();
                      }}
                      onBlur={() => setIsFocusPrefix(false)}
                      inputHeight={40}
                    />
                  </View>
                </View>
                <View style={[styles.column, styles.datePickerColumn]}>
                  <CustomInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    ref={marriageDateInputRef}
                    mode="outlined"
                    testID="marriage-date"
                    style={styles.textInputStyle}
                    name="marriageDate"
                    label="Marriage Date"
                    value={selectedMarriageDate ? selectedMarriageDate : ''}
                    onFocus={() => setMarriageDatePickerVisibility(true)}
                    showSoftInputOnFocus={false}
                  />

                  <ImuwDatePicker
                    testID="marriage-date-picker"
                    mode="date"
                    onClose={closeMarriageDatePicker}
                    open={isMarriageDatePickerVisible}
                    onDateChange={handleMarriageDateChange}
                  />
                </View>
              </View>
            </View>
          </View>
          <View>
            <CustomInput
              ref={weddingLocationInputRef}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={[styles.textInputStyle]}
              testID="wedding-location"
              name="weddingLocation"
              label="Wedding Location"
              value={weddingLocation || ''}
              onChangeText={text => {
                const capitalizedText =
                  text.charAt(0).toUpperCase() + text.slice(1);
                formik.values.marriageDetails.location_of_wedding =
                  capitalizedText;
                setWeddingLocation(
                  formik.values.marriageDetails.location_of_wedding,
                );
              }}
              onBlur={formik.handleBlur('marriageDetails.location_of_wedding')}
              clearable
            />
          </View>
          <View>
            <View style={{zIndex: 1001, backgroundColor: 'white'}}>
              <CustomDropdown
                testID="relationshipDropdown"
                label={'Relationship Status'}
                options={data}
                value={value}
                onOptionSelect={item => {
                  setValue(item.value);
                  formik.setFieldValue(
                    'marriageDetails.relationship',
                    item.value,
                  );
                  setIsFocus(false);
                }}
                onFocus={() => {
                  setIsFocus(true);
                  blurInputs();
                }}
                onBlur={() => setIsFocus(false)}
                inputHeight={40}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  row1: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 3,
    fontSize: 16,
    fontWeight: '700',
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
    paddingTop: 10,
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
    color: Theme.light.scrim,
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: Theme.dark.shadow,
    backgroundColor: Theme.light.outlineVariant,
    height: '30px',
    borderRadius: 10,
    marginTop: 20,
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
    border: '0px solid #C3C3C3',
    marginVertical: 10,
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
  datePickerColumn: {
    flex: 1.5,
    marginLeft: 5,
  },
  dropdownOne: {
    width: '140%',
    height: 41,
    borderColor: 'rgba(51, 48, 60, 0.3)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    marginVertical: 10,
  },
  itemTextStyle: {
    color: 'black',
    fontWeight: 400,
    left: -5,
  },
  dropdown: {
    height: 50,
    borderColor: '#C3C3C3',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginVertical: 10,
  },
});

export default AddMemberMarriageDetails;
