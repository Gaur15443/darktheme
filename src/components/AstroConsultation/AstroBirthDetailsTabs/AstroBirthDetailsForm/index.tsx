import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { memo, useCallback, useState } from 'react';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Formik, useFormikContext } from 'formik';
import moment from 'moment';
import CustomCheckBox from '../../../stories/CustomCheckBox';
import ImuwDatePicker from '../../../../core/UICompoonent/ImuwDatePicker';

interface AstroBirthDetailsFormProps {
  onConfirm?: (data: AstroBirthDetaisFormValues) => Promise<void | undefined>;
  isLoading?: boolean;
}

export interface AstroBirthDetaisFormValues {
  name: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  exactTime: boolean;
  saveKundli: boolean;
}

const AstroBirthDetailsForm = ({
  onConfirm = async () => { },
  isLoading = false,
}: AstroBirthDetailsFormProps) => {
  const { bottom }: EdgeInsets = useSafeAreaInsets();
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  const initialValues: AstroBirthDetaisFormValues = {
    name: '',
    gender: 'Male',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    exactTime: false,
    saveKundli: false,
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onConfirm}>
      {({ handleSubmit }) => (
        <>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ gap: 15 }}>
              <NameField />
              <GenderField />
              <DateTimeFields
                openDatePicker={openDatePicker}
                setOpenDatePicker={setOpenDatePicker}
                openTimePicker={openTimePicker}
                setOpenTimePicker={setOpenTimePicker}
              />
              <PlaceOfBirthField />
            </View>
          </ScrollView>
          <TouchableOpacity
            disabled={isLoading}
            onPress={() => handleSubmit()}
            activeOpacity={0.7}
            style={[styles.confirmButton, { bottom }]}>
            {isLoading ? (
              <ActivityIndicator color="#6944D3" />
            ) : (
              <Text style={{ color: '#6944D3', fontWeight: '600' }}>Confirm</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </Formik>
  );
};

// **Memoized Input Fields to Prevent Re-renders**
const NameField = memo(() => {
  const { values, handleChange } = useFormikContext<AstroBirthDetaisFormValues>();
  return (
    <View style={styles.nameContainer}>
      <Text style={styles.fieldname}>Name</Text>
      <TextInput
        style={styles.name}
        value={values.name}
        onChangeText={handleChange('name')}
      />
    </View>
  );
});

const GenderField = memo(() => {
  const { values, setFieldValue } =
    useFormikContext<AstroBirthDetaisFormValues>();
  const genders = ['Male', 'Female'];

  const handleGenderSelect = useCallback(
    (gender: string) => {
      setFieldValue('gender', gender);
    },
    [setFieldValue],
  );

  return (
    <View style={styles.genderContainer}>
      <Text style={styles.fieldname}>Gender</Text>
      <View style={styles.buttonContainer}>
        {genders.map(gender => (
          <TouchableOpacity
            key={gender}
            activeOpacity={0.7}
            onPress={() => handleGenderSelect(gender)}
            style={[
              styles.button,
              {
                backgroundColor:
                  values.gender === gender
                    ? '#6944D3'
                    : 'rgba(255, 255, 255, 0.2)',
              },
            ]}>
            <Text style={styles.buttonText}>{gender}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// Inside DateTimeFields component
const DateTimeFields = memo(
  ({
    openDatePicker,
    setOpenDatePicker,
    openTimePicker,
    setOpenTimePicker,
  }: {
    openDatePicker: boolean;
    setOpenDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
    openTimePicker: boolean;
    setOpenTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const { values, setFieldValue } =
      useFormikContext<AstroBirthDetaisFormValues>();

    const closeDateField = useCallback(() => setOpenDatePicker(false), []);
    const closeTimeField = useCallback(() => setOpenTimePicker(false), []);

    const toggleExactTime = useCallback(() => {
      setFieldValue('exactTime', !values.exactTime);
    }, [values.exactTime, setFieldValue]);

    return (
      <View style={styles.dobTobContainer}>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={styles.fieldname}>Date of birth</Text>
          <TouchableOpacity
            style={[styles.name, { padding: 16 }]}
            onPress={() => setOpenDatePicker(true)}>
            <Text style={{ color: values.dateOfBirth ? 'white' : '#aaa' }}>
              {values.dateOfBirth
                ? moment(values.dateOfBirth).format('DD MMM YYYY')
                : 'Select Date'}
            </Text>
          </TouchableOpacity>
          <ImuwDatePicker
            theme="dark"
            onClose={closeDateField}
            open={openDatePicker}
            mode="date"
            selectedDate={
              values.dateOfBirth ? new Date(values.dateOfBirth) : new Date()
            }
            onDateChange={(date: Date) =>
              setFieldValue('dateOfBirth', date.toISOString())
            }
          />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={styles.fieldname}>Time of birth</Text>
          <TouchableOpacity
            style={[styles.name, { padding: 16 }]}
            onPress={() => setOpenTimePicker(true)}>
            <Text style={{ color: values.timeOfBirth ? 'white' : '#aaa' }}>
              {values.timeOfBirth
                ? moment(values.timeOfBirth).format('hh:mm A')
                : 'Select Time'}
            </Text>
          </TouchableOpacity>
          <ImuwDatePicker
            theme="dark"
            onClose={closeTimeField}
            open={openTimePicker}
            mode="time"
            onDateChange={(date: Date) =>
              setFieldValue('timeOfBirth', date.toISOString())
            }
          />
          <View style={styles.checkboxContainer}>
            <CustomCheckBox
              isAstro
              color="white"
              check={values.exactTime}
              onCheck={toggleExactTime}
            />
            <Text style={{ color: 'white', fontSize: 12 }}>
              Don’t know the exact time
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

const PlaceOfBirthField = memo(() => {
  const { values, handleChange, setFieldValue } =
    useFormikContext<AstroBirthDetaisFormValues>();

  const toggleSaveKundli = useCallback(() => {
    setFieldValue('saveKundli', !values.saveKundli);
  }, [values.saveKundli, setFieldValue]);

  return (
    <View style={styles.pobContainer}>
      <Text style={styles.fieldname}>Place of birth</Text>
      <TextInput
        style={styles.name}
        value={values.placeOfBirth}
        onChangeText={handleChange('placeOfBirth')}
      />
      <View style={[styles.checkboxContainer, { gap: 10 }]}>
        <CustomCheckBox
          isAstro
          color="white"
          check={values.saveKundli}
          onCheck={toggleSaveKundli}
        />
        <Text style={{ color: 'white' }}>Save this Kundali</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  name: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    color: 'white',
  },
  fieldname: {
    color: 'white',
  },
  nameContainer: {
    paddingTop: 40,
    gap: 10,
  },
  pobContainer: {
    gap: 10,
  },
  button: {
    padding: 15,
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dobTobContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderContainer: {
    gap: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  },
});

export default memo(AstroBirthDetailsForm);
