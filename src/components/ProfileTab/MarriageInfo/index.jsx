import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {Text, Divider} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import Confirm from '../../Confirm';

import {useTheme, Modal, Portal} from 'react-native-paper';
import {getAdduserProfiles} from '../../../store/apps/addUserProfile';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {CustomButton} from '../../../core';
import {useDispatch, useSelector} from 'react-redux';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {GlobalHeader, CustomInput} from '../../../components';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import Animated, {SlideInDown} from 'react-native-reanimated';
import _ from 'lodash';
import {Dropdown} from 'react-native-element-dropdown';
import { desanitizeInput } from '../../../utils/sanitizers';

const Marriageinfo = ({route}) => {
  const id = route.params ? route.params.id : undefined;

  const data = [
    {label: 'Married', value: '1'},
    {label: 'Not Married Anymore', value: '2'},
  ];
  const dataPrefix = [
    {label: 'On', value: '1'},
    {label: 'Around (~)', value: '2'},
  ];
  const dispatch = useDispatch();
  const theme = useTheme();
  const initialFields = {
    value: 'Living',
    linkYourSpouse: '',
    spouseId: {},
    maidenName: '',
    relationship: '',
    isAroundDateOfMarraige: '',
    selectedMarriageDate: null,
    marraigeDate: null,
    MD_Flag_N: null,

    location_of_wedding: '',
  };

  // ** State
  const [formFields, setFormFields] = useState([initialFields]);
  const [showDatePicker, setShowDatePicker] = useState([false]);
  const [showModal, setShowModal] = useState(null);
  const [isFocus, setIsFocus] = useState([false]);
  const [isFocusPrefix, setIsFocusPrefix] = useState([false]);
  const weddingLocationRefs = useRef([]);

  const [selectedMarriageDate, setSelectedMarriageDate] = useState(null);
  const [weddinglocation, setWeddingLocation] = useState(['']);
  const dateInputRefMarriage = useRef(null);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);

  const [maritalStatus, setMaritalStatus] = useState('single');

  const navigation = useNavigation();
  const userInfo = useSelector(state => state?.userInfo);
  const userId = id ? id : userInfo._id;

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Info_Tab?.basic_facts_error,
  );

  const validationSchema = Yup.object().shape({
    formFields: Yup.array().of(
      Yup.object().shape({
        linkYourSpouse: Yup.string().matches(
          /^[A-Za-z\s]+$/,
          'Spouse Name must contain only letters and spaces',
        ),

        maidenName: Yup.string()
          .nullable()
          .optional()
          .matches(
          /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
            'Field cannot contain special characters or numbers.',
          ),
      }),
    ),
  });
  const [loading, setLoading] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(true);

  const handleClose = async () => {
    await dispatch(fetchUserProfile(userId)).unwrap();
    setLoading(false);

    navigation.goBack();
  };

  const formik = useFormik({
    initialValues: {
      formFields,
    },
    validationSchema,
    onSubmit: () => {
      setLoading(true);

      const marriageDetails = formFields.map((field, index) => {
        field.MD_Flag_N = 1;

        field.marraigeDate = field.selectedMarriageDate || null;

        (field.location_of_wedding = weddinglocation[index]),
          (field.relationship =
            formik?.values?.formFields?.[index]?.relationship);
        field.isAroundDateOfMarraige = field.selectedMarriageDate
          ? formik?.values?.formFields?.[index]?.prefix !== 'On'
          : false;
        field.domMediaIds = basicInfo?.marriageDetails?.[index]?.domMediaIds;

        return field;
      });

      let allClinks = [];
      if (basicInfo?.cLink?.length > 0) {
        // let allClinks = basicInfo?.cLink?.[0]?.linkId || [];
        allClinks = basicInfo?.cLink.flatMap(link => link?.linkId);
        allClinks = [...allClinks, basicInfo?._id];

        marriageDetails?.forEach((field, index) => {
          const allSpouses = [
            ...(field?.spouseId?.husbands || []),
            ...(field?.spouseId?.wifes || []),
          ];
          const whoToUpdate = _.intersection(allClinks, allSpouses);
          marriageDetails[index].whoToUpdate =
            whoToUpdate.length > 0 ? whoToUpdate[0] : basicInfo?._id;
        });
      }

      const formData = {
        marriageDetails,
        userId,
        cloneOwner: basicInfo?.isClone ? basicInfo.cLink[0].linkId[0] : null,
        cLinks: basicInfo?.cLink?.length ? allClinks : [],
        clinkIsPresent: basicInfo?.cLink?.length > 0,
      };
      dispatch(getAdduserProfiles(formData)).then(() => handleClose()).catch(() => {
        Toast.show({
          type: 'error',
          text1: toastMessages?.['12005'],
        })
      })
    },
    enableReinitialze: true,
  });

  const handleFieldChange = (index, field, value) => {
    const updatedFormFields = [...formFields];
    const fieldToUpdate = {
      ...updatedFormFields[index],
      [field]: value,
    };

    updatedFormFields[index] = fieldToUpdate;

    setFormFields(updatedFormFields);
  };
  const handleDateChange = index => {
    return function (date) {
      setSelectedMarriageDate(date);
      dateInputRefMarriage.current.blur();

      if (formFields[index]) {
        const updatedFormFields = [...formFields];
        updatedFormFields[index].selectedMarriageDate = date;
        setFormFields(updatedFormFields);
        dateInputRefMarriage.current.blur();
        Keyboard.dismiss();
      }
      const allValues = [...showDatePicker];
      allValues[index] = !showDatePicker[index];
      setShowDatePicker(allValues);
      dateInputRefMarriage.current.blur();
    };
  };

  useEffect(() => {
    setLoadingDefault(true);

    const field = [];
    const locationField = [];
    const showVisibleField = [];

    if (basicInfo) {
      basicInfo.marriageDetails.forEach((item, index) => {
        showVisibleField.push(false);

        field.push({
          linkYourSpouse: `${item?.spouseId?.personalDetails?.name} ${item?.spouseId?.personalDetails?.lastname}`,
          maidenName: item.maidenName,
          selectedMarriageDate: item.marraigeDate,
          spouseId: item.spouseId,
          relationship: item.relationship,

          prefix: item.isAroundDateOfMarraige === false ? 'On' : 'Around (~)',
          MD_Flag_N: item.MD_Flag_N,
        });

        locationField.push(
          item?.location_of_wedding?.length
            ? item?.location_of_wedding
            : (item?.location_of_wedding?.formatted_address ?? ''),
        );
      });
      setShowDatePicker(showVisibleField);

      setWeddingLocation(locationField);
      setFormFields(field);
    }
    if (basicInfo.personalDetails.relationStatus) {
      setMaritalStatus(basicInfo.personalDetails.relationStatus);
    }
    formik.values.formFields = basicInfo?.marriageDetails;
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
    seOpenConfirmPopup(true);
  }
  const handleSelectionChange = (label, setFieldValue, name) => {
    setFieldValue(name, label);
  };
  const filteredData = value => {
    return dataPrefix.filter(item => item.label !== value);
  };
  const handleFocusFromPrefix = (index, value) => {
    setIsFocusPrefix(prevState => {
      const updatedState = [...prevState];
      updatedState[index] = value;
      return updatedState;
    });
  };
  const handleFocus = (index, value) => {
    setIsFocus(prevState => {
      const updatedState = [...prevState];
      updatedState[index] = value;
      return updatedState;
    });
  };

  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Marriage Details'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          <View style={styles.container}>
            {openConfirmPopup && (
              <Confirm
                title={'Are you sure you want to leave?'}
                subTitle={'If you discard, you will lose your changes.'}
                discardCtaText={'Discard'}
                continueCtaText={'Continue Editing'}
                onContinue={() => seOpenConfirmPopup(false)}
                onDiscard={() => {
                  navigation.goBack();
                }}
                accessibilityLabel="confirm-popup-marriage-history"
                onCrossClick={() => seOpenConfirmPopup(false)}
              />
            )}
            <View>
              <View className="row">
                <View>
                  <Text
                    style={{
                      fontWeight: 600,
                      color: '#444444',
                      padding: 0,
                      textAlign: 'center',
                    }}
                    accessibilityLabel="-marriage-history-subcontent">
                    Spouse information will reflect here after they have been
                    added to the tree.
                  </Text>
                </View>
                <View>
                  {basicInfo?.marriageDetails?.length > 0 &&
                    Object.keys(basicInfo?.marriageDetails?.[0]?.spouseId || {})
                      .length > 0 &&
                    formik?.values?.formFields.map((field, index) => (
                      <View key={`formfield-${index}`}>
                        <View>
                          <View>
                            <CustomInput
                              contentStyle={{color: '#c5c4c9'}}
                              label="Spouse Name"
                              accessibilityLabel={`formfield-${index}spouseName`}
                              testID={`formfield-${index}spouseName`}
                              mode="outlined"
                              value={field.linkYourSpouse}
                              onChangeText={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={Boolean(formik.errors.linkYourSpouse)}
                              clearable
                              disabled
                              style={[
                                styles.textInputStyle,
                                {backgroundColor: 'white'},
                              ]}
                              outlineColor={theme.colors.altoGray}
                            />
                          </View>
                          {basicInfo?.personalDetails?.gender === 'female' && (
                            <View>
                              <CustomInput
                                name="maidenName"
                                label="Maiden Name"
                                accessibilityLabel="maidenName"
                                testID="maidenName"
                                mode="outlined"
                                value={desanitizeInput(field.maidenName)}
                                onChangeText={text => {
                                  formik.setFieldValue(
                                    `formFields[${index}].maidenName`,
                                    text,
                                  );
                                  handleFieldChange(index, 'maidenName', text);
                                }}
                                onBlur={formik.handleBlur(
                                  `formFields[${index}].maidenName`,
                                )}
                                clearable
                                style={[
                                  styles.textInputStyle,
                                  {backgroundColor: 'white'},
                                ]}
                                outlineColor={theme.colors.altoGray}
                                error={
                                  formik?.touched?.formFields?.[index]
                                    ?.maidenName &&
                                  formik?.errors?.formFields?.[index]
                                    ?.maidenName
                                }
                                helperText={
                                  formik?.touched?.formFields?.[index]
                                    ?.maidenName &&
                                  formik?.errors?.formFields?.[index]
                                    ?.maidenName
                                }
                              />
                            </View>
                          )}
                        </View>
                        <View>
                          <View style={styles.containerDate}>
                            <View style={[styles.column, styles.prefixColumn]}>
                              <Dropdown
                                testID="prefix"
                                accessibilityLabel="prefix"
                                style={[
                                  styles.dropdown,
                                  isFocusPrefix[index] && {
                                    borderColor: theme.colors.primary,
                                    borderWidth: 2,
                                  },
                                ]}
                                data={filteredData(formFields[index].prefix)}
                                itemTextStyle={styles.itemTextStyle}
                                selectedTextStyle={{color: 'black'}}
                                placeholderStyle={{
                                  color: 'black',
                                  fontWeight: 400,
                                }}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                onFocus={() => {
                                  weddingLocationRefs.current.blur();
                                  handleFocusFromPrefix(index, true);
                                }}
                                onBlur={() =>
                                  handleFocusFromPrefix(index, false)
                                }
                                placeholder={formFields[index].prefix}
                                value={formFields[index].prefix}
                                onChange={itemValue => {
                                  handleSelectionChange(
                                    itemValue.label,
                                    formik.setFieldValue,
                                    'prefix',
                                  );
                                  const updatedFormFields = [...formFields];
                                  updatedFormFields[index].prefix =
                                    itemValue.label;
                                  setFormFields(updatedFormFields);
                                }}
                              />
                            </View>
                            <View
                              style={[styles.column, styles.datePickerColumn]}>
                              <CustomInput
                                name="date"
                                accessibilityLabel="marriageDate"
                                ref={dateInputRefMarriage}
                                testID="marriageDate"
                                mode="outlined"
                                label="Marriage Date"
                                style={[
                                  styles.textInputStyle,
                                  {backgroundColor: 'white'},
                                ]}
                                value={
                                  formFields[index]?.selectedMarriageDate
                                    ? moment(
                                        formFields[index]?.selectedMarriageDate,
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
                              />
                              <Animated.View
                                entering={SlideInDown.duration(250).damping(
                                  10,
                                )}>
                                <ImuwDatePicker
                                  onClose={() => {
                                    const allValues = [...showDatePicker];
                                    allValues[index] = !showDatePicker[index];
                                    setShowDatePicker(allValues);
                                    if (dateInputRefMarriage.current) {
                                      dateInputRefMarriage.current.blur();
                                    }
                                    Keyboard.dismiss();
                                  }}
                                  accessibilityLabel="marriageDatePicker"
                                  open={showDatePicker[index]}
                                  testID="marriageDatePicker"
                                  selectedDate={
                                    formFields[index]?.selectedMarriageDate
                                      ? new Date(
                                          formFields[
                                            index
                                          ]?.selectedMarriageDate,
                                        )
                                      : new Date()
                                  }
                                  mode="date"
                                  onDateChange={handleDateChange(index)}
                                />
                              </Animated.View>
                            </View>
                          </View>
                        </View>

                        <View>
                          <CustomInput
                            ref={el => (weddingLocationRefs.current = el)}
                            accessibilityLabel={`wedding${index}-locationId`}
                            name={`formFields[${index}].weddinglocation`}
                            testID={`wedding${index}-locationId`}
                            label="Wedding Location"
                            value={desanitizeInput(weddinglocation[index])}
                            clearable
                            mode="outlined"
                            onChangeText={text => {
                              handleFieldChange(index, 'weddinglocation', text);
                              const result = [...weddinglocation];
                              result[index] = text;
                              setWeddingLocation(result);
                            }}
                            style={[
                              styles.textInputStyle,
                              {backgroundColor: 'white'},
                            ]}
                            outlineColor={theme.colors.altoGray}
                            autoComplete="off"
                          />
                        </View>

                        <View style={{marginTop: 15}}>
                          <Dropdown
                            accessibilityLabel="bloodGroupDropdown"
                            testID="bloodGroupDropdown"
                            style={[
                              styles.dropdown,
                              isFocus[index] && {
                                borderColor: theme.colors.primary,
                                borderWidth: 2,
                              },
                            ]}
                            data={data}
                            itemTextStyle={styles.itemTextStyle}
                            selectedTextStyle={{color: 'black'}}
                            placeholderStyle={{color: 'black', fontWeight: 400}}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={
                              !isFocus[index] && !formFields[index].relationship
                                ? ''
                                : `${formFields[index].relationship}`
                            }
                            value={formFields[index].relationship}
                            onFocus={() => {
                              weddingLocationRefs.current.blur();
                              handleFocus(index, true);
                            }}
                            onBlur={() => handleFocus(index, false)}
                            onChange={itemValue => {
                              const updatedFormFields = [...formFields];
                              updatedFormFields[index].relationship =
                                itemValue.label;
                              setFormFields(updatedFormFields);
                            }}
                          />
                        </View>
                        <View style={{marginTop: 20}}>
                          {index !== formik.values.formFields.length - 1 && (
                            <View cols="12" className="pt-0 pb-0">
                              <Divider
                                bold
                                style={{
                                  borderColor: '#B4B4B4',
                                  borderWidth: 1,
                                  marginVertical: 10,
                                }}
                                accessibilityLabel="marriage-Divider"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                </View>

                <View style={[styles.row, {paddingTop: 20, marginBottom: 100}]}>
                  <View style={styles.column12}>
                    <CustomButton
                      testID="addMarriageBtn"
                      className="addMarriageBtn"
                      label={'Save'}
                      onPress={() => formik.handleSubmit()}
                      loading={loading}
                      disabled={!formik.isValid || loading}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};
const styles = StyleSheet.create({
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
    alignSelf: 'flex-end',
    marginBottom: 10,
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
    color: '#3473DC',
  },
});

export default Marriageinfo;
