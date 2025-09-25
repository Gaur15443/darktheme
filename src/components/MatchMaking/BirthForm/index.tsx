import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomCheckBox from '../../stories/CustomCheckBox';
import {ImuwDatePicker} from '../../../core';
import {Location} from '../..';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {CalendarIcon} from '../../../images';
import ClockIcon from '../../../images/Icons/ClockIcon';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import Toast from 'react-native-toast-message';
import {
  NavigationProp,
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import CustomTextInput from '../../CustomTextInput';
import {Portal, Text} from 'react-native-paper';
import {setMatchMakingData} from '../../../store/apps/astroMatchMaking';
import Spinner from '../../../common/ButtonSpinner';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {LocationData} from '../../Location/location';
import {handleDateChange, handleTimeChange} from '../../../utils/format';
import type {SaveKundliData} from '../../../store/apps/astroKundali/index.d';
import {Track} from '../../../../App';
import ShiningButton from '../../../common/ShiningButton';
import {getTimezone} from '../../../utils';
import type {MatchMakingPayload} from '../../../store/apps/astroMatchMaking/index.d';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  resetSavedKundlis,
  setIsFirstTimeUser,
} from '../../../store/apps/astroKundali';

interface PartnerDetailsFormProps {
  gender: Gender;
  formik: any;
  selections: Selections;
  toggleExactTime: () => void;
  openDatePicker: boolean;
  openTimePicker: boolean;
  setOpenDatePicker: (value: boolean) => void;
  setOpenTimePicker: (value: boolean) => void;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedDateObject: Date | null;
  selectedTimeObject: Date | null;
  setSelectedDate: (value: string | null) => void;
  setSelectedTime: (value: string | null) => void;
  setSelectedDateObject: (value: Date | null) => void;
  setSelectedTimeObject: (value: Date | null) => void;
  setTimeDate: (value: Date) => void;
  testIDPrefix: string;
}
interface Selections {
  selectedGender: 'Boy' | 'Girl';
  exactMaleTime: boolean;
  exactFemaleTime: boolean;
  saveKundli: boolean;
}
type Gender = 'male' | 'female';

function ActiveIcon({style = {}, ...props}: {style?: object}) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(39, 195, 148, 1)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: -14,
        left: '50%',
        marginLeft: -14,
        ...style,
      }}
      {...props}>
      <Icon name="check" color={'#fff'} size={18} style={{}} />
    </View>
  );
}

const stepImages = [
  'https://testing-email-template.s3.ap-south-1.amazonaws.com/male.png',
  'https://testing-email-template.s3.ap-south-1.amazonaws.com/aifemale.png',
];
const genderImages = {
  male: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/male.png',
  female:
    'https://testing-email-template.s3.ap-south-1.amazonaws.com/aifemale.png',
};

function AstroBirthDetailsForm({
  selectedKundli,
  shouldReset,
}: {
  selectedKundli: SaveKundliData | null;
  shouldReset?: boolean;
}) {
  const Container = Platform.OS === 'ios' ? View : ScrollView;
  const MINIMUM_YEAR = '1400';
  const MAX_DATE = new Date('2100');
  const dispatch = useDispatch<AppDispatch>();
  const navigator = useNavigation<NavigationProp<any>>();
  const pageIsFocused = useIsFocused();
  const userData = useSelector((state: RootState) => state.userInfo);
  const toastMessages = useSelector(
    (state: RootState) =>
      state.getToastMessages.toastMessages?.ai_astro_reports,
  );
  const {bottom}: EdgeInsets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [currentStep, setCurrentStep] = useState<Gender | null>('male');
  const [indexedGenders, setIndexedGenders] = useState<Gender[] | undefined>([
    'male',
    'female',
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [openMaleDatePicker, setOpenMaleDatePicker] = useState<boolean>(false);
  const [openFemaleDatePicker, setOpenFemaleDatePicker] =
    useState<boolean>(false);
  const [openMaleTimePicker, setOpenMaleTimePicker] = useState<boolean>(false);
  const [openFemaleTimePicker, setOpenFemaleTimePicker] =
    useState<boolean>(false);
  const [selectedMaleDate, setSelectedMaleDate] = useState<null | string>(null);
  const [selectedFemaleDate, setSelectedFemaleDate] = useState<null | string>(
    null,
  );
  const [selectedMaleTime, setSelectedMaleTime] = useState<null | string>(null);
  const [selectedFemaleTime, setSelectedFemaleTime] = useState<null | string>(
    null,
  );
  const [selectedMaleDateObject, setSelectedMaleDateObject] =
    useState<Date | null>(null);
  const [selectedFemaleDateObject, setSelectedFemaleDateObject] =
    useState<Date | null>(null);
  const [selectedMaleTimeObject, setSelectedMaleTimeObject] =
    useState<Date | null>(null);
  const [selectedFemaleTimeObject, setSelectedFemaleTimeObject] =
    useState<Date | null>(null);

  const [maleTimeDate, setMaleTimeDate] = useState(new Date());
  const [femaleTimeDate, setFemaleTimeDate] = useState(new Date());
  const [maleKundliId, setMaleKundliId] = useState<string | null>(null);
  const [femaleKundliId, setFemaleKundliId] = useState<string | null>(null);

  const [selections, setSelections] = useState<Selections>({
    selectedGender: 'Boy',
    exactMaleTime: false,
    exactFemaleTime: false,
    saveKundli: false,
  });

  const formik = useFormik({
    initialValues: {
      male_name: '',
      male_birthDetails: {
        male_birthPlace: {
          male_placeName: '',
          male_latitude: 19,
          male_longitude: 74,
        },
        male_timezone: '5.5',
      },
      female_name: '',
      female_birthDetails: {
        female_birthPlace: {
          female_placeName: '',
          female_latitude: 19,
          female_longitude: 74,
        },
        female_timezone: '5.5',
      },
    },
    onSubmit: () => {},
    validationSchema: Yup.object().shape({
      male_name: Yup.string()
        .required('This field is required')
        .test('only-space', 'This field cannot be empty', value => {
          return value.trim().length > 0;
        })
        .matches(
          /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
          'Field cannot contain special characters or numbers.',
        ),
      male_birthDetails: Yup.object().shape({
        male_birthPlace: Yup.object().shape({
          male_placeName: Yup.string().required('Birthplace is required'),
        }),
      }),
      female_name: Yup.string()
        .required('This field is required')
        .test('only-space', 'This field cannot be empty', value => {
          return value.trim().length > 0;
        })
        .matches(
          /^(?!\s+$)[^\p{P}\p{S}\p{N}\-]+$/u,
          'Field cannot contain special characters or numbers.',
        ),
      female_birthDetails: Yup.object().shape({
        female_birthPlace: Yup.object().shape({
          female_placeName: Yup.string().required('Birthplace is required'),
        }),
      }),
    }),
  });

  const shouldDisableSubmit = useMemo(() => {
    return (
      Boolean(formik.errors.female_name) ||
      Boolean(formik.errors.male_name) ||
      !selectedFemaleTime ||
      !selectedMaleTime ||
      !formik.values?.male_birthDetails?.male_birthPlace?.male_placeName
        ?.length ||
      !formik.values?.female_birthDetails?.female_birthPlace?.female_placeName
        ?.length ||
      !selectedFemaleTimeObject ||
      !selectedMaleTimeObject
    );
  }, [formik.errors, selectedFemaleTime, selectedMaleTime, formik.values]);

  const maleValueIsFilled = useMemo(() => {
    return (
      Boolean(formik.values.male_name?.length) ||
      Boolean(selectedMaleTime) ||
      Boolean(
        formik.values?.male_birthDetails?.male_birthPlace?.male_placeName
          ?.length,
      ) ||
      Boolean(selectedMaleTimeObject)
    );
  }, [formik.errors, selectedFemaleTime, selectedMaleTime, formik.values]);

  const femaleValueIsFilled = useMemo(() => {
    return (
      Boolean(formik.values.female_name?.length) ||
      Boolean(selectedFemaleTime) ||
      Boolean(
        formik.values?.female_birthDetails?.female_birthPlace?.female_placeName
          ?.length,
      ) ||
      Boolean(selectedFemaleTimeObject)
    );
  }, [
    formik.errors,
    selectedFemaleTime,
    formik.values,
    selectedFemaleTimeObject,
  ]);

  const shouldDisableNext = useMemo(() => {
    // If no gender is selected yet, default to male for initial validation
    const firstGender = indexedGenders?.[0] || 'male';

    // Get the relevant form values and errors based on the first selected gender
    const nameField = `${firstGender}_name` as keyof typeof formik.values;
    const birthPlaceField = `${firstGender}_birthDetails.${firstGender}_birthPlace.${firstGender}_placeName`;
    const selectedDate =
      firstGender === 'male' ? selectedMaleDate : selectedFemaleDate;
    const selectedTime =
      firstGender === 'male' ? selectedMaleTime : selectedFemaleTime;
    const selectedTimeObject =
      firstGender === 'male'
        ? selectedMaleTimeObject
        : selectedFemaleTimeObject;
    const exactTime =
      firstGender === 'male'
        ? selections.exactMaleTime
        : selections.exactFemaleTime;

    // Check if the required fields are valid
    return (
      // Name field is required and must have no errors
      Boolean((formik.errors as any)[nameField]) ||
      // Name must not be empty
      !(formik.values as any)[nameField]?.length ||
      // Birthplace is required and must have no errors
      Boolean(
        (formik.errors as any)[firstGender]?.birthDetails?.[
          firstGender + '_birthPlace'
        ]?.[firstGender + '_placeName'],
      ) ||
      // Birthplace must not be empty
      !(formik.values as any)?.[firstGender + '_birthDetails']?.[
        firstGender + '_birthPlace'
      ]?.[firstGender + '_placeName']?.length ||
      // Date of birth is required
      !selectedDate ||
      // Time of birth is required unless exact time is unknown
      (!selectedTime && !exactTime) ||
      // Time object must be valid unless exact time is unknown
      (!selectedTimeObject && !exactTime)
    );
  }, [
    formik.errors,
    formik.values,
    indexedGenders,
    selectedMaleDate,
    selectedFemaleDate,
    selectedMaleTime,
    selectedFemaleTime,
    selectedMaleTimeObject,
    selectedFemaleTimeObject,
    selections.exactMaleTime,
    selections.exactFemaleTime,
  ]);

  useFocusEffect(
    useCallback(() => {
      Track({
        cleverTapEvent: 'Matchmaking_CTA_Navbar',
        mixpanelEvent: 'Matchmaking_CTA_Navbar',
        userData,
      });
      return () => {
        setOpenMaleDatePicker(false);
        setOpenFemaleDatePicker(false);
        setOpenMaleTimePicker(false);
        setOpenFemaleTimePicker(false);
      };
    }, []),
  );

  useEffect(() => {
    if (shouldReset) {
      formik.resetForm();
      setSelectedMaleDate(null);
      setSelectedFemaleDate(null);
      setSelectedMaleTime(null);
      setSelectedFemaleTime(null);
      setMaleKundliId(null);
      setFemaleKundliId(null);
      setSelections(prev => ({
        ...prev,
        selectedGender: 'Boy',
        exactMaleTime: false,
        exactFemaleTime: false,
        saveKundli: false,
      }));
      setSelectedMaleDateObject(null);
      setSelectedFemaleDateObject(null);
      setSelectedMaleTimeObject(null);
      setSelectedFemaleTimeObject(null);
      setSelectedMaleDateObject(null);
      setSelectedFemaleDateObject(null);
      setIndexedGenders(['male', 'female']);
      setCurrentStep('male');
      setStep(1);
    }
  }, [shouldReset]);

  useEffect(() => {
    if (
      Object.keys(selectedKundli || {}).length > 0 &&
      selectedKundli?.birthDetails?.birthDateTime
    ) {
      if (selectedKundli?.gender?.toLowerCase() === 'male') {
        setCurrentStep('male');
        if (!indexedGenders?.includes?.('male')) {
          setIndexedGenders(['male', 'female']);
        }
        setMaleKundliId(selectedKundli?._id);
      } else if (selectedKundli?.gender?.toLowerCase() === 'female') {
        setCurrentStep('female');
        if (!indexedGenders?.includes?.('female')) {
          setIndexedGenders(['female', 'male']);
        }
        setFemaleKundliId(selectedKundli?._id);
      }
      const {month, day, year, hour, minute} = extractDateComponents(
        selectedKundli?.birthDetails?.birthDateTime as string,
        selectedKundli?.birthDetails?.timezoneString as string,
      );

      const date = `${month}/${day}/${year}`;

      const time = handleTimeChange(
        selectedKundli?.birthDetails?.birthDateTime as string,
      );
      if (selectedKundli?.gender?.toLowerCase() === 'male') {
        formik.setFieldValue('male_name', selectedKundli?.name, true);
        formik.setFieldValue(
          'male_birthDetails.male_birthPlace.male_placeName',
          selectedKundli?.birthDetails?.birthPlace?.placeName,
          true,
        );
        formik.setFieldValue(
          'male_birthDetails.male_birthPlace.male_latitude',
          selectedKundli?.birthDetails?.birthPlace?.latitude,
          true,
        );
        formik.setFieldValue(
          'male_birthDetails.male_birthPlace.male_longitude',
          selectedKundli?.birthDetails?.birthPlace?.longitude,
          true,
        );
        formik.setFieldValue(
          'male_birthDetails.male_timezone',
          selectedKundli?.birthDetails?.timezone,
          true,
        );

        setSelections(prev => ({...prev, selectedGender: 'Boy'}));

        const newDateObj = new Date(year, parseInt(month) - 1, parseInt(day));

        newDateObj.setHours(parseInt(hour), parseInt(minute), 0, 0);

        setSelectedMaleDate(date);
        setSelectedMaleTime(time as string);
        setSelectedMaleDateObject(
          new Date(year, parseInt(month) - 1, parseInt(day)),
        );
        // @ts-ignore
        setSelectedMaleTimeObject(newDateObj.toISOString());

        setTimeout(() => {
          formik.validateField('male_name');
          formik.validateField(
            'male_birthDetails.male_birthPlace.male_placeName',
          );
        }, 100);
      } else if (selectedKundli?.gender?.toLowerCase() === 'female') {
        formik.setFieldValue('female_name', selectedKundli?.name, true);
        formik.setFieldValue(
          'female_birthDetails.female_birthPlace.female_placeName',
          selectedKundli?.birthDetails?.birthPlace?.placeName,
          true,
        );
        formik.setFieldValue(
          'female_birthDetails.female_birthPlace.female_latitude',
          selectedKundli?.birthDetails?.birthPlace?.latitude,
          true,
        );
        formik.setFieldValue(
          'female_birthDetails.female_birthPlace.female_longitude',
          selectedKundli?.birthDetails?.birthPlace?.longitude,
          true,
        );
        formik.setFieldValue(
          'female_birthDetails.female_timezone',
          selectedKundli?.birthDetails?.timezone,
          true,
        );

        setSelections(prev => ({...prev, selectedGender: 'Girl'}));

        const newDateObj = new Date(year, parseInt(month) - 1, parseInt(day));
        const splitTime = time
          ?.replace(/\s+/g, '')
          .replace('AM', '')
          .replace('PM', '');

        // const [hours, minutes] = splitTime?.split?.(':')?.map?.(Number) || [0, 0];

        newDateObj.setHours(parseInt(hour), parseInt(minute), 0, 0);

        setSelectedFemaleDate(date);
        setSelectedFemaleDateObject(
          new Date(year, parseInt(month) - 1, parseInt(day)),
        );
        setSelectedFemaleTime(time as string);
        // @ts-ignore
        setSelectedFemaleTimeObject(newDateObj.toISOString());

        setTimeout(() => {
          formik.validateField('female_name');
          formik.validateField(
            'female_birthDetails.female_birthPlace.female_placeName',
          );
        }, 100);
      }
    }
  }, [selectedKundli]);

  const toggleMaleExactTime = useCallback(() => {
    if (!selections.exactMaleTime) {
      setSelectedMaleTime('12:00 AM');
      setSelectedMaleTimeObject(new Date(new Date().setHours(0, 0, 0, 0)));
    }
    setSelections(prev => ({...prev, exactMaleTime: !prev.exactMaleTime}));
    return undefined;
  }, [selections.exactMaleTime]);

  const toggleFemaleExactTime = useCallback(() => {
    if (!selections.exactFemaleTime) {
      setSelectedFemaleTime('12:00 AM');
      setSelectedFemaleTimeObject(new Date(new Date().setHours(0, 0, 0, 0)));
    }
    setSelections(prev => ({...prev, exactFemaleTime: !prev.exactFemaleTime}));
    return undefined;
  }, [selections.exactFemaleTime]);

  const closeDateField = useCallback(() => {
    setOpenMaleDatePicker(false);
    setOpenFemaleDatePicker(false);
  }, []);

  const closeTimeField = useCallback(() => {
    setOpenMaleTimePicker(false);
    setOpenFemaleTimePicker(false);
  }, []);

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
    try {
      setSubmitting(true);
      const male_birthDateTime = convertToISO(
        selectedMaleDate as string,
        selectedMaleTime as string,
      );
      const female_birthDateTime = convertToISO(
        selectedFemaleDate as string,
        selectedFemaleTime as string,
      );
      const data = {
        male_name: formik.values.male_name,
        male_birthDetails: {
          male_birthDateTime,
          male_birthPlace: {
            ...formik.values.male_birthDetails.male_birthPlace,
          },
          male_timezone:
            formik.values.male_birthDetails.male_timezone.toString(),
          male_timezoneString: getTimezone(),
        },
        female_name: formik.values.female_name,
        female_birthDetails: {
          female_birthDateTime: female_birthDateTime,
          female_birthPlace: {
            ...formik.values.female_birthDetails.female_birthPlace,
          },
          female_timezone:
            formik.values.female_birthDetails.female_timezone.toString(),
          female_timezoneString: getTimezone(),
        },
      } as MatchMakingPayload;
      if (maleKundliId) {
        data.maleKundliId = maleKundliId;
      }
      if (femaleKundliId) {
        data.femaleKundliId = femaleKundliId;
      }
      await dispatch(setMatchMakingData(data)).unwrap();
      dispatch(resetSavedKundlis());
      dispatch(setIsFirstTimeUser(false));
      Toast.show({
        type: 'success',
        text1: toastMessages?.[11003],
      });
      Track({
        cleverTapEvent: 'Matchmaking_Details_Submitted',
        mixpanelEvent: 'Matchmaking_Details_Submitted',
        userData,
      });
      navigator.navigate('AstroViewMatchMakingResults');
    } catch (error) {
      setSubmitting(false);
      Toast.show({
        type: 'error',
        text1: toastMessages?.[11006],
      });
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(date: Date | string) {
    try {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-GB').format(date as Date);
    } catch (error) {
      return '';
    }
  }

  function extractDateComponents(
    birthDateTime: string,
    timezone: string = 'Asia/Kolkata',
  ) {
    const dateObject = new Date(birthDateTime);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const parts = formatter.formatToParts(dateObject);

    const month =
      parts.find(part => part.type === 'month')?.value.padStart(2, '0') || '01';
    const day =
      parts.find(part => part.type === 'day')?.value.padStart(2, '0') || '01';
    const year = Number(
      parts.find(part => part.type === 'year')?.value || '2000',
    );
    const hour =
      parts.find(part => part.type === 'hour')?.value.padStart(2, '0') || '00';
    const minute =
      parts.find(part => part.type === 'minute')?.value.padStart(2, '0') ||
      '00';

    return {
      month,
      day,
      year,
      hour,
      minute,
    };
  }

  function handleGenderOrder(
    indexedGenders: Gender[] | undefined,
    gender: Gender,
    shouldReset?: boolean,
  ) {
    const genders: Gender[] =
      gender === 'male' ? ['male', 'female'] : ['female', 'male'];
    if (shouldReset) {
      setIndexedGenders(genders);
    } else if (indexedGenders?.[0] === 'male') {
      setIndexedGenders(['male', 'female']);
    } else if (indexedGenders?.[0] === 'female') {
      setIndexedGenders(['female', 'male']);
    } else {
      const genders: Gender[] =
        gender === 'male' ? ['male', 'female'] : ['female', 'male'];
      setIndexedGenders(genders);
    }
  }
  function RenderStepTitle() {
    const genderLabel = currentStep === 'male' ? 'Boy' : 'Girl';

    return (
      <Text
        style={{
          fontSize: 16,
        }}>
        Enter {genderLabel}'s Birth Details
      </Text>
    );
  }

  const handleLocationInputBlur = useCallback(
    (gender: 'male' | 'female', event: React.ChangeEvent) => {
      formik.handleChange(
        `${gender}_birthDetails.${gender}_birthPlace.${gender}_placeName`,
      )(event);
      if (!indexedGenders) {
        const otherGender = gender === 'male' ? 'female' : 'male';
        // Get the current value from the formik values for the current gender
        const currentValue =
          (formik.values as any)[`${gender}_birthDetails`]?.[
            `${gender}_birthPlace`
          ]?.[`${gender}_placeName`] || '';
        formik.setFieldValue(
          `${otherGender}_birthDetails.${otherGender}_birthPlace.${otherGender}_placeName`,
          currentValue,
        );
      }
    },
    [indexedGenders, formik.values],
  );
  const handleGetLocationInfo = useCallback(
    (
      focusedGender: 'male' | 'female',
      {full_name, coordinates, tz}: LocationData,
    ) => {
      const blurredGender = focusedGender === 'male' ? 'female' : 'male';

      formik.setFieldValue(
        `${focusedGender}_birthDetails.${focusedGender}_birthPlace.${focusedGender}_placeName`,
        full_name,
      );
      formik.setFieldValue(
        `${focusedGender}_birthDetails.${focusedGender}_birthPlace.${focusedGender}_latitude`,
        coordinates[0],
      );
      formik.setFieldValue(
        `${focusedGender}_birthDetails.${focusedGender}_birthPlace.${focusedGender}_longitude`,
        coordinates[1],
      );
      formik.setFieldValue(
        `${focusedGender}_birthDetails.${focusedGender}_timezone`,
        tz,
      );

      if (!indexedGenders) {
        formik.setFieldValue(
          `${blurredGender}_birthDetails.${blurredGender}_birthPlace.${blurredGender}_placeName`,
          full_name,
        );
        formik.setFieldValue(
          `${blurredGender}_birthDetails.${blurredGender}_birthPlace.${blurredGender}_latitude`,
          coordinates[0],
        );
        formik.setFieldValue(
          `${blurredGender}_birthDetails.${blurredGender}_birthPlace.${blurredGender}_longitude`,
          coordinates[1],
        );
        formik.setFieldValue(
          `${blurredGender}_birthDetails.${blurredGender}_timezone`,
          tz,
        );
      }
    },
    [indexedGenders],
  );

  const handleMaleDateUpdate = useCallback(
    (event: Date) => {
      setMaleTimeDate(new Date(event));
      const formattedDate = handleDateChange(event);
      setSelectedMaleDate(formattedDate as string);
      setSelectedMaleDateObject(new Date(event));

      if (!indexedGenders) {
        setFemaleTimeDate(new Date(event));
        const formattedDate = handleDateChange(event);
        setSelectedFemaleDate(formattedDate as string);
        setSelectedFemaleDateObject(new Date(event));
      }
    },
    [indexedGenders],
  );
  const handleFemaleDateUpdate = useCallback(
    (event: Date) => {
      setFemaleTimeDate(new Date(event));
      const formattedDate = handleDateChange(event);
      setSelectedFemaleDate(formattedDate as string);
      setSelectedFemaleDateObject(new Date(event));

      if (!indexedGenders) {
        setMaleTimeDate(new Date(event));
        const formattedDate = handleDateChange(event);
        setSelectedMaleDate(formattedDate as string);
        setSelectedMaleDateObject(new Date(event));
      }
    },
    [indexedGenders],
  );

  const handleMaleTimeUpdate = useCallback(
    (event: Date) => {
      const formattedTime = handleTimeChange(event);
      setSelectedMaleTime(formattedTime as string);
      setSelectedMaleTimeObject(new Date(event));
      setSelections(prev => ({...prev, exactMaleTime: false}));

      if (!indexedGenders) {
        const formattedTime = handleTimeChange(event);
        setSelectedFemaleTime(formattedTime as string);
        setSelectedFemaleTimeObject(new Date(event));
        setSelections(prev => ({...prev, exactFemaleTime: false}));
      }
    },
    [indexedGenders],
  );

  const handleFemaleTimeUpdate = useCallback(
    (event: Date) => {
      const formattedTime = handleTimeChange(event);
      setSelectedFemaleTime(formattedTime as string);
      setSelectedFemaleTimeObject(new Date(event));
      setSelections(prev => ({...prev, exactFemaleTime: false}));

      if (!indexedGenders) {
        const formattedTime = handleTimeChange(event);
        setSelectedMaleTime(formattedTime as string);
        setSelectedMaleTimeObject(new Date(event));
        setSelections(prev => ({...prev, exactMaleTime: false}));
      }
    },
    [indexedGenders],
  );

  return (
    <ErrorBoundary.Screen>
      {openMaleDatePicker && (
        <Portal>
          <View>
            <TouchableOpacity onPress={() => setOpenMaleDatePicker(true)} />
            <ImuwDatePicker
              theme="dark"
              onClose={() => closeDateField()}
              open={openMaleDatePicker}
              mode="date"
              minimumDate={new Date(MINIMUM_YEAR)}
              maximumDate={MAX_DATE}
              selectedDate={selectedMaleDateObject || new Date()}
              onDateChange={handleMaleDateUpdate}
            />
          </View>
        </Portal>
      )}
      {openMaleTimePicker && (
        <Portal>
          <View>
            <TouchableOpacity onPress={() => setOpenMaleTimePicker(true)} />
            <ImuwDatePicker
              theme="dark"
              onClose={() => closeTimeField()}
              open={openMaleTimePicker}
              selectedDate={selectedMaleTimeObject || new Date()}
              mode="time"
              minimumDate={new Date(MINIMUM_YEAR)}
              maximumDate={MAX_DATE}
              onDateChange={handleMaleTimeUpdate}
            />
          </View>
        </Portal>
      )}
      {openFemaleDatePicker && (
        <Portal>
          <View>
            <TouchableOpacity onPress={() => setOpenFemaleDatePicker(true)} />
            <ImuwDatePicker
              theme="dark"
              onClose={() => closeDateField()}
              open={openFemaleDatePicker}
              mode="date"
              minimumDate={new Date(MINIMUM_YEAR)}
              maximumDate={MAX_DATE}
              selectedDate={selectedFemaleDateObject || new Date()}
              onDateChange={handleFemaleDateUpdate}
            />
          </View>
        </Portal>
      )}
      {openFemaleTimePicker && (
        <View>
          <TouchableOpacity onPress={() => setOpenFemaleTimePicker(true)} />
          <ImuwDatePicker
            theme="dark"
            onClose={() => closeTimeField()}
            open={openFemaleTimePicker}
            selectedDate={selectedFemaleTimeObject || new Date()}
            mode="time"
            minimumDate={new Date(MINIMUM_YEAR)}
            maximumDate={MAX_DATE}
            onDateChange={handleFemaleTimeUpdate}
          />
        </View>
      )}
      {/* <Button mode='contained' onPress={() => {
                setIndexedGenders(undefined);
            }}>Reset</Button> */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 13,
          marginTop: 30,
        }}>
        {Object.entries(genderImages).map(([gender, img]) => (
          <Pressable
            key={gender}
            style={{position: 'relative'}}
            onPress={() => {
              if (maleValueIsFilled && !indexedGenders && gender === 'male') {
                // Reset female fields when male values are filled
                formik.setFieldValue('female_name', '');
                formik.setFieldValue(
                  'female_birthDetails.female_birthPlace.female_placeName',
                  '',
                );
                formik.setFieldValue(
                  'female_birthDetails.female_birthPlace.female_latitude',
                  19,
                );
                formik.setFieldValue(
                  'female_birthDetails.female_birthPlace.female_longitude',
                  74,
                );
                formik.setFieldValue(
                  'female_birthDetails.female_timezone',
                  '5.5',
                );
                setSelectedFemaleDate(null);
                setSelectedFemaleTime(null);
                setSelectedFemaleDateObject(null);
                setSelectedFemaleTimeObject(null);
                setFemaleKundliId(null);
                setSelections(prev => ({
                  ...prev,
                  exactFemaleTime: false,
                  saveKundli: false,
                }));
              } else if (
                femaleValueIsFilled &&
                !indexedGenders &&
                gender === 'female'
              ) {
                // Reset male fields when female values are filled
                formik.setFieldValue('male_name', '');
                formik.setFieldValue(
                  'male_birthDetails.male_birthPlace.male_placeName',
                  '',
                );
                formik.setFieldValue(
                  'male_birthDetails.male_birthPlace.male_latitude',
                  19,
                );
                formik.setFieldValue(
                  'male_birthDetails.male_birthPlace.male_longitude',
                  74,
                );
                formik.setFieldValue('male_birthDetails.male_timezone', '5.5');
                setSelectedMaleDate(null);
                setSelectedMaleTime(null);
                setSelectedMaleDateObject(null);
                setSelectedMaleTimeObject(null);
                setMaleKundliId(null);
                setSelections(prev => ({
                  ...prev,
                  exactMaleTime: false,
                  saveKundli: false,
                }));
              }

              // Update gender selection based on the selected gender
              const genderLabel = gender === 'male' ? 'Boy' : 'Girl';
              setSelections(prev => ({...prev, selectedGender: genderLabel}));

              if (femaleValueIsFilled || maleValueIsFilled) {
                handleGenderOrder(indexedGenders, gender as Gender);
                setCurrentStep(gender as Gender);
              } else {
                handleGenderOrder(indexedGenders, gender as Gender, true);
                setCurrentStep(gender as Gender);
              }
            }}>
            <FastImage
              source={{uri: img}}
              style={{
                width: 100,
                aspectRatio: 1,
                borderRadius: 50,
              }}
            />
            <ActiveIcon
              style={{
                opacity: currentStep === gender ? 1 : 0,
              }}
            />
          </Pressable>
        ))}
      </View>
      <Container key={`${pageIsFocused}`} style={{flex: 1}}>
        {currentStep === 'male' ? (
          <Fragment>
            <View style={styles.nameContainer}>
              <RenderStepTitle />
              <Text style={styles.fieldname}>
                Name<Text>*</Text>
              </Text>
              <CustomTextInput
                maxLength={50}
                testID={`male_name`}
                value={formik.values['male_name']}
                onChangeText={formik.handleChange('male_name')}
                onBlur={event => {
                  formik.handleBlur('male_name')(event);
                  if (!indexedGenders) {
                    formik.setFieldValue(
                      'female_name',
                      formik.values.male_name,
                    );
                  }
                }}
                error={
                  formik.touched['male_name'] &&
                  Boolean(formik.errors['male_name'])
                }
                errorText={formik.errors['male_name']}
              />
            </View>
            <View style={styles.dobTobContainer}>
              <View style={{flex: 1, gap: 10}}>
                <Text style={styles.fieldname}>
                  Date of birth<Text>*</Text>
                </Text>
                <CustomTextInput
                  testID={`male date of birth`}
                  showSoftInputOnFocus={false}
                  value={formatDate(
                    selectedMaleDateObject as unknown as string,
                  )}
                  onMaskPress={() => setOpenMaleDatePicker(true)}
                  maskText={true}
                  right={
                    <Pressable onPress={() => setOpenMaleDatePicker(true)}>
                      <CalendarIcon stroke="#fff" />
                    </Pressable>
                  }
                />
              </View>
              <View style={{flex: 1, gap: 10}}>
                <Text style={styles.fieldname}>
                  Time of birth<Text>*</Text>
                </Text>
                <CustomTextInput
                  testID={'male time of birth'}
                  value={selectedMaleTime as unknown as string}
                  maskText={true}
                  onMaskPress={() => setOpenMaleTimePicker(true)}
                  showSoftInputOnFocus={false}
                  right={
                    <Pressable onPress={() => setOpenMaleTimePicker(true)}>
                      <ClockIcon />
                    </Pressable>
                  }
                />
                <View style={styles.checkboxContainer}>
                  <CustomCheckBox
                    isAstro
                    color="white"
                    check={selections['exactMaleTime']}
                    onCheck={() => {
                      toggleMaleExactTime();

                      if (!indexedGenders) {
                        toggleFemaleExactTime();
                      }
                    }}
                  />
                  <Text style={styles.checkboxText}>
                    Don't know the exact time
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.pobContainer}>
              <Text style={styles.fieldname}>
                Place of birth<Text>*</Text>
              </Text>
              <Location
                value={
                  formik.values?.['male_birthDetails']?.['male_birthPlace']?.[
                    'male_placeName'
                  ]
                }
                getLocationInfo={data => handleGetLocationInfo('male', data)}
                testID="male place of birth"
                onChangeText={formik.handleChange(
                  `male_birthDetails.male_birthPlace.male_placeName`,
                )}
                onBlur={event => handleLocationInputBlur('male', event)}
              />
            </View>
          </Fragment>
        ) : (
          <Fragment>
            <View style={styles.nameContainer}>
              <RenderStepTitle />
              <Text style={styles.fieldname}>
                Name<Text>*</Text>
              </Text>
              <CustomTextInput
                maxLength={50}
                testID={`female_name`}
                value={formik.values['female_name']}
                onChangeText={formik.handleChange('female_name')}
                onBlur={event => {
                  formik.handleBlur('female_name')(event);
                  if (!indexedGenders) {
                    formik.setFieldValue(
                      'male_name',
                      formik.values.female_name,
                    );
                  }
                }}
                error={
                  formik.touched['female_name'] &&
                  Boolean(formik.errors['female_name'])
                }
                errorText={formik.errors['female_name']}
              />
            </View>
            <View style={styles.dobTobContainer}>
              <View style={{flex: 1, gap: 10}}>
                <Text style={styles.fieldname}>
                  Date of birth<Text>*</Text>
                </Text>
                <CustomTextInput
                  testID={`female date of birth`}
                  showSoftInputOnFocus={false}
                  value={formatDate(
                    selectedFemaleDateObject as unknown as string,
                  )}
                  onMaskPress={() => setOpenFemaleDatePicker(true)}
                  maskText={true}
                  right={
                    <Pressable onPress={() => setOpenFemaleDatePicker(true)}>
                      <CalendarIcon stroke="#fff" />
                    </Pressable>
                  }
                />
              </View>
              <View style={{flex: 1, gap: 10}}>
                <Text style={styles.fieldname}>
                  Time of birth<Text>*</Text>
                </Text>
                <CustomTextInput
                  testID={'female time of birth'}
                  value={selectedFemaleTime || ''}
                  maskText={true}
                  onMaskPress={() => setOpenFemaleTimePicker(true)}
                  showSoftInputOnFocus={false}
                  right={
                    <Pressable onPress={() => setOpenFemaleTimePicker(true)}>
                      <ClockIcon />
                    </Pressable>
                  }
                />
                <View style={styles.checkboxContainer}>
                  <CustomCheckBox
                    isAstro
                    color="white"
                    check={selections['exactFemaleTime']}
                    onCheck={() => {
                      toggleFemaleExactTime();

                      if (!indexedGenders) {
                        toggleMaleExactTime();
                      }
                    }}
                  />
                  <Text style={styles.checkboxText}>
                    Don't know the exact time
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.pobContainer}>
              <Text style={styles.fieldname}>
                Place of birth<Text>*</Text>
              </Text>
              <Location
                value={
                  formik.values?.['female_birthDetails']?.[
                    'female_birthPlace'
                  ]?.['female_placeName']
                }
                getLocationInfo={data => handleGetLocationInfo('female', data)}
                testID="female place of birth"
                onChangeText={formik.handleChange(
                  `female_birthDetails.female_birthPlace.female_placeName`,
                )}
                onBlur={event => handleLocationInputBlur('female', event)}
              />
            </View>
          </Fragment>
        )}
        {(currentStep === indexedGenders?.[0] || !currentStep) && (
          <TouchableOpacity
            onPress={async () => {
              if (indexedGenders?.length === 2 && !shouldDisableSubmit) {
                await submit();
              } else {
                setCurrentStep(indexedGenders![1]);
              }
            }}
            activeOpacity={0.7}
            disabled={shouldDisableNext || indexedGenders?.length !== 2}
            style={[
              styles.confirmButton,
              {
                opacity:
                  shouldDisableNext || indexedGenders?.length !== 2 ? 0.5 : 1,
                padding: 10,
              },
            ]}>
            {submitting ? (
              <Spinner />
            ) : (
              <Text style={{color: '#6944D3', fontWeight: '600'}}>Submit</Text>
            )}
          </TouchableOpacity>
        )}
        {currentStep === indexedGenders?.[1] && (
          <TouchableOpacity
            onPress={submit}
            activeOpacity={0.7}
            disabled={shouldDisableSubmit || indexedGenders?.length !== 2}
            style={[
              styles.confirmButton,
              {
                opacity:
                  shouldDisableSubmit || indexedGenders?.length !== 2 ? 0.5 : 1,
              },
            ]}>
            <ShiningButton darkMode style={{padding: 10, width: '100%'}}>
              {submitting ? (
                <Spinner />
              ) : (
                <Text style={{color: '#6944D3', fontWeight: '600'}}>
                  Submit
                </Text>
              )}
            </ShiningButton>
          </TouchableOpacity>
        )}
      </Container>
    </ErrorBoundary.Screen>
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
    paddingTop: 47,
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
    marginTop: 10,
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
  checkboxText: {
    color: 'white',
    fontSize: 12,
    padding: 1,
    flexShrink: 1,
  },
  confirmButton: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBlock: 20,
  },
});

export default memo(AstroBirthDetailsForm);
