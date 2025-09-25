import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomCheckBox, Location } from '../../components';
import { ImuwDatePicker } from '../../core';
import { useTheme, Modal, Portal, Button, Text } from 'react-native-paper';
import GradientView from '../../common/gradient-view';
import { useDispatch, useSelector } from 'react-redux';
import { checkIfOwnerKundliExists, resetSavedKundlis, saveAstroUserKundli, setIsFirstTimeUser, setPageNo, setShouldReset } from '../../store/apps/astroKundali';
import { useFormik } from 'formik';
import Toast from 'react-native-toast-message';
import UnknownIcon from '../../images/Icons/UnknownIcon';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { AppDispatch, RootState } from '../../store';
import * as Yup from 'yup';
import CustomTextInput from '../CustomTextInput';
import { CalendarIcon, CrossIcon } from '../../images';
import ClockIcon from '../../images/Icons/ClockIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateAndTimeToISO, getTimezone } from '../../utils';
import { LocationData } from '../Location/location';
import useNativeBackHandler from '../../hooks/useBackHandler';
import { Track } from '../../../App';
import ShiningButton from '../../common/ShiningButton';
import ButtonSpinner from '../../common/ButtonSpinner';

interface AstroBirthFormProps {
  customHandleSubmit?: ((...args: any[]) => void) | null;
  customRedirect?: ((...args: any[]) => void) | null;
  bottomOffset?: number | null;
  style?: ViewStyle;
  skipPopUp?: boolean;
  isSubmitting?: boolean;
  isConsultation?: boolean;
  onGetKundliId?: (id: string) => Promise<void | undefined>;
}

function formatDateWithName(inputDate: string) {
  if (!inputDate?.length) return '';

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const [month, day, year] = inputDate?.split?.('/')?.map?.(Number) || [];
  if (!month || !day || !year) return '';

  return `${day} ${months[month - 1]} ${year}`;
}

function formatDate(date: Date | string) {
  try {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-GB').format(date as Date);
  } catch (error) {
    return '';
  }
}

export default function AstroBirthForm({
  customHandleSubmit = null,
  customRedirect = null,
  style = {},
  bottomOffset = null,
  skipPopUp = false,
  isSubmitting = false,
  isConsultation = false,
  onGetKundliId = () => { },
}: AstroBirthFormProps) {
  const MAX_DATE = new Date('2100');
  const MIN_DATE = new Date(1400, 0, 1);
  const dispatch = useDispatch<AppDispatch>();
  const navigator = useNavigation();
  const toastMessages = useSelector(
    (state: RootState) =>
      state.getToastMessages.toastMessages?.ai_astro_reports,
  );
  const ownerKundliExists = useSelector(
    (state: RootState) => state.astroKundaliSlice.ownerKundliExists,
  );
  const formik = useFormik({
    initialValues: {
      name: '',
      gender: 'male',
      birthDetails: {
        birthPlace: {
          placeName: '',
          latitude: 19,
          longitude: 74,
        },
        timezone: '5.5',
      },
    },
    onSubmit: () => { },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required('This field is required')
        .test(
          'not-only-spaces',
          'This field cannot be empty',
          value => value?.trim().length > 0,
        )
        .matches(
          /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
          'Field cannot contain special characters or numbers.',
        ),
      gender: Yup.string().required('Gender is required'),
      birthDetails: Yup.object().shape({
        birthPlace: Yup.object().shape({
          placeName: Yup.string().required('Birthplace is required'),
          // latitude: Yup.number(),
          // longitude: Yup.number(),
        }),
      }),
    }),
  });

  const [showPopup, setShowPopup] = useState(false);
  const theme = useTheme();
  const genders = [
    {
      name: 'Male',
    },
    {
      name: 'Female',
    },
  ];
  // @ts-ignore
  const selectedReport = useSelector(
    (state: RootState) => state.astroKundaliSlice.selectedReport,
  );
  const userData = useSelector((state: RootState) => state.userInfo);
  const reportId = useSelector(
    (state: RootState) => state.astroKundaliSlice.selectedReportId,
  );

  useNativeBackHandler(handleBack);

  const { bottom } = useSafeAreaInsets();
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [selectedDate, setSelectedDate] = useState<null | string>(null);
  const [selectedTime, setSelectedTime] = useState<null | string>(null);
  const [timeDate, setTimeDate] = useState(new Date());
  const [previousPayload, setPreviousPayload] = useState<string | null>(null);
  const [previousResponse, setPreviousResponse] = useState<string | null>(null);
  const [selectedDateObject, setSelectedDateObject] = useState<
    Date | string | null
  >(null);
  const [selectedTimeObject, setSelectedTimeObject] = useState<
    Date | string | null
  >(null);
  const isOwnersKundli = useRef(false);
  const typeOfReport = useSelector(
    (state: RootState) => state.astroKundaliSlice.selectedReport,);

  const [selections, setSelections] = useState({
    selectedGender: 'Male',
    exactTime: false,
    saveKundli: false,
  });

  useEffect(() => {
    Track({
      cleverTapEvent: 'Birth_Details_Visited',
      mixpanelEvent: 'Birth_Details_Visited',
      userData,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!ownerKundliExists && userData?._id) {
        dispatch(checkIfOwnerKundliExists(userData._id)).catch(_ => { });
      }
    }, [ownerKundliExists, userData?._id]),
  );

  function handleBack() {
    if (
      formik.values.name?.length ||
      formik.values.birthDetails.birthPlace.placeName?.length ||
      selectedDate?.length ||
      selectedTime?.length
    ) {
      setShowDiscardPopup(true);
    } else {
      navigator.goBack();
    }
  }

  function handleReset() {
    setShowDiscardPopup(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelections(prev => ({ ...prev, exactTime: false }));
    formik.resetForm();
    navigator.goBack();
  }

  function handleDateChange(date: string | number | Date) {
    if (!date) return;
    setSelectedDateObject(new Date(date));
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));

    setSelectedDate(formattedDate);
  }

  function handleTimeChange(time: string | number | Date) {
    if (!time) return;

    const dateObject = new Date(time).toISOString();
    setSelectedTimeObject(dateObject);
    setSelections(prev => ({ ...prev, exactTime: false }));
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
      hour12: true,
    }).format(new Date(time));

    setSelectedTime(formattedTime);
  }

  function handleGenderSelect(gender) {
    setSelections(prev => ({ ...prev, selectedGender: gender }));
  }

  function toggleExactTime() {
    if (!selections.exactTime) {
      setSelectedTime('12:00 AM');
      setSelectedTimeObject(new Date(new Date().setHours(0, 0, 0, 0)));
    }
    setSelections(prev => ({ ...prev, exactTime: !prev.exactTime }));
    return undefined;
  }

  function closeDateField() {
    setOpenDatePicker(false);
  }

  function closeTimeField() {
    setOpenTimePicker(false);
  }
  const convertToISO = (dateStr: string, timeStr: string) => {
    const [month, day, year] = dateStr.split('/').map(Number);

    const normalizedTimeStr = timeStr.replace(/\s+/g, ' ').trim();
    const [timeValue, meridiem] = normalizedTimeStr.split(' ');
    const [hours, minutes] = timeValue.split(':').map(Number);

    let convertedHours = hours;
    if (meridiem === 'PM' && hours !== 12) {
      convertedHours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      convertedHours = 0;
    }

    const dateObject = new Date(year, month - 1, day, convertedHours, minutes);

    return dateObject.toISOString();
  };

  async function submit() {
    if (isSubmitting || inProgress) return;
    try {
      const birthDateTime = convertToISO(
        selectedDate as string,
        selectedTime as string,
      );
      const data = {
        name: formik.values.name,
        gender: selections.selectedGender.toLowerCase(),
        birthDetails: {
          birthDateTime,
          birthPlace: {
            ...formik.values.birthDetails.birthPlace,
            latitude: Number(formik.values.birthDetails.birthPlace.latitude),
            longitude: Number(formik.values.birthDetails.birthPlace.longitude),
          },
          timezone: formik.values.birthDetails.timezone.toString(),
          timezoneString: getTimezone(),
        },
        type_of_report: selectedReport,
        isOwnersKundli: isOwnersKundli.current,
      };
      if (typeof previousPayload === 'string') {
        const id = JSON.parse(previousResponse)?._id;

        if (id) {
          // @ts-ignore
          data.kundliId = id;
        }
      }
      const props = {
        'Name of Person': formik.values.name,
        'Date of Birth': selectedDate,
        'Time of Birth': selectedTime,
        'Place of Birth': formik.values.birthDetails.birthPlace?.placeName,
        Gender: selections.selectedGender,
      };
      dispatch(resetSavedKundlis());
      dispatch(setIsFirstTimeUser(false));

      if (typeof customHandleSubmit === 'function') {
        customHandleSubmit({ ...data, isOwnersKundli: false, props });
        return;
      }
      setInProgress(true);
      const stringifiedPayload = JSON.stringify(data);
      if (stringifiedPayload === previousPayload && previousResponse) {
        Track({
          cleverTapEvent: 'Birth_Details_Submitted',
          mixpanelEvent: 'Birth_Details_Submitted',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });

        Toast.show({
          type: 'success',
          text1: toastMessages?.[11002],
        });

        dispatch(resetSavedKundlis());
        dispatch(setIsFirstTimeUser(false));
      }
      setPreviousPayload(stringifiedPayload);
      let res;
      if (reportId) {
        // @ts-expect-error
        res = await dispatch(saveAstroUserKundli({ ...data, reportId })).unwrap();
      }
      else {
        // @ts-expect-error
        res = await dispatch(saveAstroUserKundli(data)).unwrap();

      }
      setPreviousResponse(JSON.stringify(res));
      onGetKundliId(res._id);

      Track({
        cleverTapEvent: 'Birth_Details_Submitted',
        mixpanelEvent: 'Birth_Details_Submitted',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });

      Toast.show({
        type: 'success',
        text1: toastMessages?.[11002],
      });

      dispatch(resetSavedKundlis());
      dispatch(setIsFirstTimeUser(false));

      if (typeof customRedirect === 'function') return customRedirect(res);

      if (!isConsultation) {
        // @ts-ignore
        navigator.navigate('ReportsPaymentScreen', {
          kundli: res,
        });
      }
      setInProgress(false);
    } catch (error: any) {
      if (error.message === "This report has already been purchased for this Kundli") {
        Toast.show({
          type: "error",
          text1: `This ${typeOfReport} Report is already purchased. View it in My Orders`,
        });
      }
      else {
        Toast.show({
          type: 'error',
          text1: toastMessages?.[11005],
        });
      }
      setInProgress(false);
    }
    finally {
      setInProgress(false);
    }
  }

  async function handleOwnerConfirmation(val: boolean) {
    isOwnersKundli.current = val;
    await AsyncStorage.setItem('isFirstTimeKundli', JSON.stringify(false));
    setShowPopup(false);
    await submit();
  }
  function convertToISOString(dateStr: string, timeStr: string) {
    const [month, day, year] = dateStr.split('/'); // Extract MM/DD/YYYY
    const [time, period] = timeStr.split(' '); // Extract time and AM/PM
    let [hours, minutes] = time.split(':'); // Extract HH and MM

    // Convert 12-hour format to 24-hour
    if (period === 'PM' && hours !== '12') {
      hours = String(Number(hours) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    // Construct ISO string
    const isoString = new Date(
      `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes}:00Z`,
    );
    // .toISOString();
    return isoString.toISOString();
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[{ paddingHorizontal: 15, flex: 1 }, style]}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ gap: 15 }}>
            <View style={styles.nameContainer}>
              <Text style={styles.fieldname}>
                Name<Text>*</Text>
              </Text>

              <CustomTextInput
                maxLength={50}
                testID="name"
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                errorText={formik.errors.name}
              />
            </View >
            <View style={styles.genderContainer}>
              <Text style={styles.fieldname}>
                Gender<Text>*</Text>
              </Text>
              <View style={styles.buttonContainer}>
                {genders.map(gender => (
                  <TouchableOpacity
                    key={gender.name}
                    activeOpacity={0.7}
                    onPress={() => handleGenderSelect(gender.name)}
                    style={[
                      styles.button,
                      {
                        backgroundColor:
                          selections.selectedGender === gender?.name
                            ? '#6944D3'
                            : '#FFFFFF33',
                      },
                    ]}>
                    <Text key={gender?.name} style={styles.buttonText}>
                      {gender?.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {
              openDatePicker && (
                <Portal>
                  <ImuwDatePicker
                    theme="dark"
                    onClose={() => closeDateField()}
                    open={openDatePicker}
                    mode="date"
                    selectedDate={(selectedDateObject as Date) || new Date()}
                    onDateChange={handleDateChange}
                    maximumDate={MAX_DATE}
                    minimumDate={MIN_DATE}
                  />
                </Portal>
              )
            }
            {
              openTimePicker && (
                <Portal>
                  <ImuwDatePicker
                    theme="dark"
                    onClose={() => closeTimeField()}
                    open={openTimePicker}
                    selectedDate={(selectedTimeObject as Date) || new Date()}
                    mode="time"
                    onDateChange={handleTimeChange}
                    maximumDate={MAX_DATE}
                    minimumDate={MIN_DATE}
                  />
                </Portal>
              )
            }
            <View style={styles.dobTobContainer}>
              <View style={{ flex: 1, gap: 10 }}>
                <Text style={styles.fieldname}>
                  Date of birth<Text>*</Text>
                </Text>
                <CustomTextInput
                  testID="dateOfBirth"
                  showSoftInputOnFocus={false}
                  value={formatDate(selectedDateObject)}
                  maskText={true}
                  onMaskPress={() => {
                    setOpenDatePicker(true);
                  }}
                  right={
                    <Pressable onPress={() => setOpenDatePicker(true)}>
                      <CalendarIcon stroke="#fff" />
                    </Pressable>
                  }
                />
              </View>
              <View style={{ flex: 1, gap: 10 }}>
                <Text style={styles.fieldname}>
                  Time of birth<Text>*</Text>
                </Text>
                <CustomTextInput
                  testID="timeOfBirth"
                  value={selectedTime as string}
                  maskText={true}
                  onMaskPress={() => {
                    setOpenTimePicker(true);
                  }}
                  showSoftInputOnFocus={false}
                  right={
                    <Pressable onPress={() => setOpenTimePicker(true)}>
                      <ClockIcon />
                    </Pressable>
                  }
                />
                <View style={styles.checkboxContainer}>
                  <CustomCheckBox
                    isAstro
                    color="white"
                    check={selections?.exactTime}
                    onCheck={() => toggleExactTime()}
                  />
                  {/* Take default 12 pm */}
                  <Text style={styles.checkboxText}>
                    Don’t know the exact time
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.pobContainer}>
              <Text style={styles.fieldname}>
                Place of birth<Text>*</Text>
              </Text>
              <Location
                getLocationInfo={(data: LocationData) => {
                  formik.setFieldValue(
                    'birthDetails.birthPlace.placeName',
                    data.full_name,
                  );
                  formik.setFieldValue(
                    'birthDetails.birthPlace.latitude',
                    data.coordinates[0],
                  );
                  formik.setFieldValue(
                    'birthDetails.birthPlace.longitude',
                    data.coordinates[1],
                  );
                  formik.setFieldValue('birthDetails.timezone', data.tz);
                }}
                testID="placeOfBirth"
                value={formik.values.birthDetails.birthPlace.placeName}
                onChangeText={text =>
                  formik.setFieldValue(
                    'birthDetails.birthPlace.placeName',
                    text,
                  )
                }
                onBlur={() =>
                  formik.setFieldTouched(
                    'birthDetails.birthPlace.placeName',
                    true,
                  )
                }
              />
            </View>
          </View >
        </ScrollView >
        <Portal>
          <Modal
            visible={showPopup}
            style={{
              paddingHorizontal: 15,
            }}
            contentContainerStyle={{
              backgroundColor: 'transparent',
            }}>
            <View>
              <View
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                }}>
                <GradientView
                  style={{}}
                  contentStyle={{
                    padding: 16,
                    borderRadius: 8,
                    paddingBottom: 22,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      marginBlock: 24,
                    }}>
                    <View
                      style={{
                        backgroundColor: '#fff',
                        height: 48,
                        width: 48,
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <UnknownIcon />
                    </View>
                  </View>
                  <View style={{ gap: 6, marginBottom: 10 }}>
                    <Text
                      // @ts-ignore
                      variant="bold"
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      Is this your kundli?
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 12,
                      }}>
                      This will help us customize the process.
                    </Text>
                  </View>
                  <Button
                    onPress={() => handleOwnerConfirmation(true)}
                    mode="contained"
                    theme={{
                      colors: {
                        primary: '#fff',
                        onPrimary: theme.colors.primary,
                      },
                    }}
                    style={{ borderRadius: 8, marginBottom: 10 }}>
                    <Text
                      // @ts-ignore
                      variant="bold"
                      style={{ fontSize: 14, color: '#6944D3' }}>
                      Yes, it's mine
                    </Text>
                  </Button>
                  <Button
                    onPress={() => handleOwnerConfirmation(false)}
                    mode="outlined"
                    theme={{
                      colors: {
                        primary: '#fff',
                      },
                    }}
                    style={{ borderRadius: 8 }}>
                    <Text style={{ fontSize: 14 }}>No, it's someone else's</Text>
                  </Button>
                </GradientView>
              </View>
            </View>
          </Modal>
        </Portal>
        <Portal>
          <Modal
            visible={showDiscardPopup}
            style={{
              paddingHorizontal: 15,
            }}
            contentContainerStyle={{
              backgroundColor: 'transparent',
            }}>
            <View>
              <Pressable
                onPress={() => setShowDiscardPopup(false)}
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  right: -12,
                  top: -12,
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  height: 24,
                  width: 24,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <CrossIcon testID={'cross-icon'} fill="#000" width={'8'} height={'8'} />
              </Pressable>
              <View
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                }}>
                <GradientView
                  style={{}}
                  contentStyle={{
                    padding: 16,
                    borderRadius: 8,
                    paddingBlock: 24,
                  }}>
                  <View style={{ gap: 6, marginBottom: 10 }}>
                    <Text
                      // @ts-ignore
                      variant="bold"
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      {`Are you sure you want to ${'\n'} leave?`}
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 12,
                      }}>
                      If you discard, you will lose your changes.
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 13,
                      justifyContent: 'center',
                      marginTop: 24,
                    }}>
                    <Button
                      onPress={() => setShowDiscardPopup(false)}
                      mode="outlined"
                      theme={{
                        colors: {
                          primary: '#fff',
                        },
                      }}
                      style={{ borderRadius: 8, width: '46%' }}>
                      No
                    </Button>
                    <Button
                      onPress={handleReset}
                      mode="contained"
                      theme={{
                        colors: {
                          primary: '#fff',
                          onPrimary: theme.colors.primary,
                        },
                      }}
                      style={{ borderRadius: 8, width: '46%' }}>
                      Yes
                    </Button>
                  </View>
                </GradientView>
              </View>
            </View>
          </Modal>
        </Portal>
        <TouchableOpacity
          disabled={
            !formik.values.name?.length ||
            !selectedDate ||
            !selectedTime ||
            !formik.values.birthDetails.birthPlace.placeName?.length ||
            isSubmitting ||
            inProgress
          }
          onPress={async () => {
            if (!skipPopUp) {
              setShowPopup(true);
            } else {
              await submit();
            }
          }}
          activeOpacity={0.7}
          style={[
            styles.confirmButton,
            {
              bottom: bottomOffset || bottom + 10,
              opacity:
                !formik.values.name?.length ||
                  !selectedDate ||
                  !selectedTime ||
                  !formik.values.birthDetails.birthPlace.placeName?.length
                  ? 0.5
                  : 1,
            },
          ]}>
          <ShiningButton
            style={{ width: '100%', padding: 10 }}
            darkMode
            animate={
              !!formik.values.name?.length &&
              !!selectedDate &&
              !!selectedTime &&
              !!formik.values.birthDetails.birthPlace.placeName?.length
            }>
            {/** @ts-ignore */}
            {inProgress || isSubmitting ? (
              <ButtonSpinner />
            ) : (
              <Text
                variant={"bold" as any}
                style={{ color: '#6944D3', fontWeight: '600' }}>
                Confirm
              </Text>
            )}
          </ShiningButton>
        </TouchableOpacity>
      </View >
    </View >
  );
}

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
    gap: 10,
  },
  pobContainer: {
    gap: 10,
  },
  button: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    color: 'white',
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  dobTobContainer: {
    width: '100%',
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
    paddingRight: 4,
    maxWidth: '96%',
  },
  confirmButton: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    overflow: 'hidden',
    borderRadius: 8,
  },
  checkboxText: {
    color: 'white',
    fontSize: 12,
    padding: 1,
    flexShrink: 1,
  },
});
