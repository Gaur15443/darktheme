import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import * as Yup from 'yup';
import {useFormik} from 'formik';

import Confirm from '../../Confirm';
import {GlobalHeader, CustomInput} from '../../../components';
import {GlobalStyle} from '../../../core';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';
import SquarePlusIcon from '../../../core/icon/square-plus-icon';
import {CustomButton} from '../../../core';
import {getAdduserProfiles} from '../../../store/apps/addUserProfile';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {nameValidator} from '../../../utils/validators';
import {useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';

import {useDispatch, useSelector} from 'react-redux';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import NewTheme from '../../../common/NewTheme';
import { desanitizeInput } from '../../../utils/sanitizers';

const MedicalInfo = ({route}) => {
  const styles = StyleSheet.create({
    dropdown: {
      backgroundColor: 'white',
      height: 45,
      borderColor: 'rgba(51, 48, 60, 0.3)',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    itemTextStyle: {
      color: 'black',
    },

    textInputStyle: {
      border: '0px solid #ccc6c6',
      marginTop: 15,
    },

    pickerContainer: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      overflow: 'hidden',
      marginBottom: 0,
      backgroundColor: 'white',
    },
    picker: {
      height: 50,
      width: '100%',
      paddingHorizontal: 10,
    },
    pickerSelectStyles: {
      inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
      },
      inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
      },
    },
  });
  useNativeBackHandler(handleBack);
  const dispatch = useDispatch();
  const id = route.params ? route.params.id : undefined;

  const theme = useTheme();
  const navigation = useNavigation();
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
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const [bloodgroup, setBloodGroup] = useState('');
  const [MedicalCon, setMedicalCon] = useState([{name: ''}]);
  const [AllergiesCon, setAllergiesCon] = useState([{name: ''}]);
  const [HeriditaryCon, setHeriditaryCon] = useState([{name: ''}]);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLoadingDefault] = useState(true);

  const userInfo = useSelector(state => state?.userInfo);

  const userId = id ? id : userInfo._id;

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Info_Tab?.basic_facts_error,
  );

  const addMedicalCon = () => {
    setMedicalCon([...MedicalCon, {name: ''}]);
  };

  const addAllergiesCon = () => {
    setAllergiesCon([...AllergiesCon, {name: ''}]);
  };

  const addHeriditaryCon = () => {
    setHeriditaryCon([...HeriditaryCon, {name: ''}]);
  };

  const validationSchema = Yup.object().shape({
    MedicalCon: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().test(
          'valid-name',
          'Name can not contain special characters and numbers',
          nameValidator,
        ),
      }),
    ),
    AllergiesCon: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().test(
          'valid-name',
          'Name can not contain special characters and numbers',
          nameValidator,
        ),
      }),
    ),
    HeriditaryCon: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().test(
          'valid-name',
          'Name can not contain special characters and numbers',
          nameValidator,
        ),
      }),
    ),
  });

  const handleFieldChange = (index, value) => {
    const updatedFormFields = [...MedicalCon];
    updatedFormFields[index] = {...updatedFormFields[index], name: value};
    formik.setFieldValue(`MedicalCon[${index}].name`, value);
    setMedicalCon(updatedFormFields);
  };

  const handleAllergyFieldChange = (index, value) => {
    const updatedAllergyField = [...AllergiesCon];
    updatedAllergyField[index] = {...updatedAllergyField[index], name: value};
    formik.setFieldValue(`AllergiesCon[${index}].name`, value);
    setAllergiesCon(updatedAllergyField);
  };

  const handleHeriditaryFieldChange = (index, value) => {
    const updatedHeriditaryField = [...HeriditaryCon];
    updatedHeriditaryField[index] = {
      ...updatedHeriditaryField[index],
      name: value,
    };
    formik.setFieldValue(`HeriditaryCon[${index}].name`, value);
    setHeriditaryCon(updatedHeriditaryField);
  };

  const removeFormField = index => {
    const updatedFormFields = [...MedicalCon];
    updatedFormFields.splice(index, 1);
    setMedicalCon(updatedFormFields);
  };

  const removeAllergyField = index => {
    const updatedAllergyField = [...AllergiesCon];
    updatedAllergyField.splice(index, 1);
    setAllergiesCon(updatedAllergyField);
  };

  const removeHeriditaryField = index => {
    const updatedHeriditaryField = [...HeriditaryCon];
    updatedHeriditaryField.splice(index, 1);
    setHeriditaryCon(updatedHeriditaryField);
  };

  useEffect(() => {
    setLoadingDefault(true);
    if (basicInfo && basicInfo.medicalDetails) {
      setValue((basicInfo && basicInfo.medicalDetails.bloodgroup) || '');
    }
    if (basicInfo && basicInfo.medicalDetails) {
      setMedicalCon(basicInfo.medicalDetails.chronic_condition);
    }
    if (basicInfo && basicInfo.medicalDetails) {
      setAllergiesCon(basicInfo.medicalDetails.allergies);
    }
    if (basicInfo && basicInfo.medicalDetails) {
      setHeriditaryCon(basicInfo.medicalDetails.illnesses);
    }
    setLoadingDefault(false);
  }, [basicInfo]);

  useEffect(() => {
    if (!MedicalCon.length) {
      setMedicalCon([{name: ''}]);
    }
    if (!AllergiesCon.length) {
      setAllergiesCon([{name: ''}]);
    }
    if (!HeriditaryCon.length) {
      setHeriditaryCon([{name: ''}]);
    }
  });

  const handleClose = async () => {
    await dispatch(fetchUserProfile(userId)).unwrap();
    setLoading(false);

    navigation.goBack();
  };

  const formik = useFormik({
    initialValues: {
      MedicalCon,
      AllergiesCon,
      HeriditaryCon,
    },
    validationSchema,
    onSubmit: () => {
      setLoading(true);
      let allClinks = [];
      if (basicInfo?.cLink?.length > 0) {
        allClinks = basicInfo?.cLink.flatMap(link => link?.linkId);
        allClinks = [...allClinks, basicInfo?._id];
      }
      const formData = {
        medicalDetails: {
          chronic_condition: MedicalCon,
          allergies: AllergiesCon,
          illnesses: HeriditaryCon,
          bloodgroup,
        },
        userId,
        cLinks: basicInfo?.cLink?.length ? allClinks : [],
        cloneOwner: basicInfo?.isClone
          ? basicInfo?.cLink?.[0]?.linkId?.[0]
          : null,
        clinkIsPresent: basicInfo?.cLink?.length > 0 ? true : false,
      };
      dispatch(getAdduserProfiles(formData)).then(() => {
        handleClose();
      }).catch(() => {
        Toast.show({
          type: 'error',
          text1: toastMessages?.['12005'],
        })
      });
    },
  });
  const handleItemSelect = option => {
    setBloodGroup(option);
  };

  function handleBack() {
    let isChronic = MedicalCon.some(MedicalCon => {
      return MedicalCon.name;
    });
    let isAllergies = AllergiesCon.some(AllergiesCon => {
      return AllergiesCon.name;
    });
    let isIllnesses = HeriditaryCon.some(HeriditaryCon => {
      return HeriditaryCon.name;
    });
    if (bloodgroup || isChronic || isAllergies || isIllnesses) {
      seOpenConfirmPopup(true);
    } else {
      seOpenConfirmPopup(false);
      navigation.goBack();
    }
  }

  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Medical History'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          <GlobalStyle>
            <View style={[styles.content, {marginTop: 40}]}>
              <View style={styles.section}>
                {openConfirmPopup && (
                  <Confirm
                    accessibilityLabel={'Medical-confirm-popup'}
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

                <View>
                  <Dropdown
                    testID="bloodGroupDropdown"
                    accessibilityLabel={'bloodGroupDropdown'}
                    style={[
                      styles.dropdown,
                      isFocus && {
                        borderColor: NewTheme.colors.primaryOrange,
                        borderWidth: 2,
                      },
                    ]}
                    data={data}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      !isFocus && !value ? 'Blood Group' : `${value}`
                    }
                    value={value}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      formik.setFieldValue(
                        `formFields[${0}].bloodgroup`,
                        item.label,
                      );

                      setBloodGroup(item.label);
                      setValue(item.value);
                      setIsFocus(false);
                    }}
                    placeholderStyle={{
                      color: 'rgb(146, 143, 153)',
                      fontWeight: '400',
                    }}
                    itemTextStyle={{color: 'black'}}
                    selectedTextStyle={{
                      color: 'black',
                      fontWeight: '500',
                      paddingLeft: 6,
                    }}
                  />
                </View>
              </View>
              <View style={styles.section}>
                {MedicalCon.map((medical, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <CustomInput
                      accessibilityLabel={`MedicalCon[${index}].nameId`}
                      label="Medical Conditions"
                      name={`MedicalCon[${index}].name`}
                      testID={`MedicalCon[${index}].nameId`}
                      clearable
                      value={desanitizeInput(medical.name)}
                      mode="outlined"
                      style={[
                        styles.textInputStyle,
                        {backgroundColor: 'white'},
                        {flex: 1},
                        {marginRight: 8},
                      ]}
                      onBlur={formik.handleBlur(`MedicalCon[${index}].name`)}
                      error={
                        formik.errors.MedicalCon &&
                        Boolean(formik?.errors?.MedicalCon?.[index]?.name)
                      }
                      onChangeText={text => {
                        handleFieldChange(index, text);
                      }}
                      outlineColor={theme.colors.altoGray}
                    />
                    {index >= 1 ? (
                      <TouchableOpacity
                        onPress={() => removeFormField(index)}
                        style={{
                          marginTop: 20,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-end',
                        }}
                        accessibilityLabel={`MedicalCon[${index}].deleteIcon`}>
                        <ConnectionDeleteIcon />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={addMedicalCon}
                        style={{
                          marginTop: 20,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-end',
                        }}
                        accessibilityLabel={`MedicalCon[${index}].SquarePlusIcon`}>
                        <SquarePlusIcon
                          accessibilityLabel={`MedicalCon[${index}].SquarePlusIcon`}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.section}>
                {AllergiesCon.map((allergy, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <CustomInput
                      accessibilityLabel={`AllergiesCon[${index}].nameId`}
                      label="Allergies"
                      name={`AllergiesCon[${index}].name`}
                      testID={`AllergiesCon[${index}].nameId`}
                      mode="outlined"
                      clearable
                      style={[
                        styles.textInputStyle,
                        {backgroundColor: 'white'},
                        {flex: 1},
                        {marginRight: 8},
                      ]}
                      onBlur={formik.handleBlur(`AllergiesCon[${index}].name`)}
                      error={
                        formik.errors.AllergiesCon &&
                        Boolean(formik?.errors?.AllergiesCon?.[index]?.name)
                      }
                      value={desanitizeInput(allergy.name)}
                      onChangeText={text =>
                        handleAllergyFieldChange(index, text)
                      }
                      outlineColor={theme.colors.altoGray}
                    />
                    {index >= 1 ? (
                      <TouchableOpacity
                        onPress={() => removeAllergyField(index)}
                        style={{
                          marginTop: 20,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-end',
                        }}
                        accessibilityLabel={`AllergiesCon[${index}].deleteIcon`}>
                        <ConnectionDeleteIcon />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={addAllergiesCon}
                        style={{
                          marginTop: 20,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-end',
                        }}
                        accessibilityLabel={`AllergiesCon[${index}].SquarePlusIcon`}>
                        <SquarePlusIcon />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.section}>
                {HeriditaryCon.map((heridity, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <CustomInput
                      label="Hereditary Conditions"
                      accessibilityLabel={`HeriditaryCon[${index}].nameId`}
                      name={`HeriditaryCon[${index}].name`}
                      testID={`HeriditaryCon[${index}].nameId`}
                      clearable
                      value={desanitizeInput(heridity.name)}
                      mode="outlined"
                      style={[
                        styles.textInputStyle,
                        {backgroundColor: 'white'},
                        {flex: 1},
                        {marginRight: 8},
                      ]}
                      outlineColor={theme.colors.altoGray}
                      onBlur={formik.handleBlur(`HeriditaryCon[${index}].name`)}
                      error={
                        formik.errors.HeriditaryCon &&
                        Boolean(formik?.errors?.HeriditaryCon?.[index]?.name)
                      }
                      onChangeText={text =>
                        handleHeriditaryFieldChange(index, text)
                      }
                    />
                    {index >= 1 ? (
                      <TouchableOpacity
                        onPress={() => removeHeriditaryField(index)}
                        style={{
                          marginTop: 20,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-end',
                        }}
                        accessibilityLabel={`HeriditaryCon[${index}].deleteIcon`}>
                        <ConnectionDeleteIcon
                          accessibilityLabel={`HeriditaryCon[${index}].deleteIcon`}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={addHeriditaryCon}
                        style={{
                          marginTop: 20,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-end',
                        }}
                        accessibilityLabel={`HeriditaryCon[${index}].SquarePlusIcon`}>
                        <SquarePlusIcon />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              <View style={[styles.row, {paddingTop: 20, marginBottom: 100}]}>
                <View style={styles.column12}>
                  <CustomButton
                    testID="addMedicalBtn"
                    accessibilityLabel="addMedicalBtn"
                    className="addMedicalBtn"
                    label={'Save'}
                    onPress={() => formik.handleSubmit()}
                    loading={loading}
                    disabled={!formik.isValid || loading}
                  />
                </View>
              </View>
            </View>
          </GlobalStyle>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default MedicalInfo;
