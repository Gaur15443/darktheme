import {
  Pressable,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Button, Divider, Portal, Text, useTheme } from 'react-native-paper';
import CustomCheckBox from '../CustomCheckBox/index';
import ShareWith from '../ShareWith';
import CustomTextInput from '../../CustomTextInput';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { ImuwDatePicker } from '../../../core';
import moment from 'moment';
import { CalendarIcon, LocationIcon, TagIcon } from '../../../images';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { pluralize } from '../../../utils/format';
import Spinner from '../../../common/ButtonSpinner';
import { useNavigation } from '@react-navigation/native';
import CustomScrollView from '../../../common/CustomScrollView';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
const DateSelector = memo(
  ({ dateOpen, styles, dataEntered, handleDateChange, closeDateField }) => {
    return (
      <>
        {dateOpen && (
          <Portal>
            <View style={styles?.dateContainer}>
              <TouchableOpacity
                activeOpacity={1}
                accessibilityLabel="closeDateField"
                onPress={() => {
                  closeDateField();
                }}
                style={styles.dateContainerBackground}
              />
              <Animated.View entering={SlideInDown.duration(250).damping(10)}>
                <ImuwDatePicker
                  onClose={() => closeDateField()}
                  open={true}
                  accessibilityLabel="datepicker"
                  selectedDate={
                    new Date(dataEntered?.selectedDate) || new Date()
                  }
                  mode="date"
                  onDateChange={handleDateChange}
                />
              </Animated.View>
            </View>
          </Portal>
        )}
      </>
    );
  },
);

function DrawerContent({
  editDate,
  editLocation = '',
  formDataRef,
  isAuthor = false,
  disableDraftButton,
  disablePublishButton,
  isEditing,
  isSubmittingDraft = false,
  isSubmittingPublish = false,
  onPublish,
  onDraft,
  onViewSubGroups,
  tab,
}) {
  const styles = useCreateStyles();
  const theme = useTheme();
  const navigator = useNavigation();
  const dateInputRef = useRef(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [lsFirstTime, setLsFirstTime] = useState(isEditing);
  const currentlyWritten = useSelector(state => state.story.currentlyWritten);
  const storyData = useSelector(state => state.story.newWrittenStory);

  const [isLifestoryChecked, setIsLifestoryChecked] = useState(
    !!formDataRef?.current?.isLifestory,
  );

  const getSelectedFamilyGroups = useSelector(
    state => state.story.currentlyWritten?.familyGroupId,
  );
  const getSelectedFamilySubGroups = useSelector(
    state => state.story.currentlyWritten?.familySubGroupId,
  );

  const sharedWithLength = useMemo(() => {
    return (
      getSelectedFamilyGroups?.length || getSelectedFamilySubGroups?.length || 0
    );
  }, [getSelectedFamilyGroups, getSelectedFamilySubGroups]);

  const customTheme = {
    colors: {
      primary: theme.colors.orange,
    },
  };

  const [dataEntered, setDataEntered] = useState({
    selectedDate: editDate || new Date(),
    selectedLocation: editLocation || '',
  });

  const [location, setLocation] = useState(
    formDataRef?.current?.location || '',
  );



  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height || 0);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      },
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    formDataRef.current.location = location;
  }, [location, formDataRef]);

  useEffect(() => {
    formDataRef.current.eventDate = dataEntered.selectedDate;
  }, [dataEntered, formDataRef]);

  function onTagClick() {
    navigator.navigate('AddTagging');
  }

  function closeDateField() {
    try {
      dateInputRef.current?.blur?.();
      setDateOpen(false);
      Keyboard.dismiss();
    } catch (__error) {
      /** empty */
    }
  }
  // this function gets date in the format of  YYYY/MM/DD
  // splitting it and converting it to javascript date obj
  const handleDateChange = date => {
    setDataEntered({
      selectedDate: date,
      selectedLocation: dataEntered?.selectedLocation,
    });
    closeDateField();
  };

  function toggleLifestory() {
    if (!formDataRef?.current?.isLifestory) {
      setLsFirstTime(false);
    }
    setIsLifestoryChecked(!isLifestoryChecked);
    formDataRef.current.isLifestory = !formDataRef.current.isLifestory;
  }

  const [height, setHeight] = useState([]);
  const onLayout = event => {
    const m = -0.625;
    const b = 423.75;
    const value = Math.round(m * event.nativeEvent.layout.height + b);
    if (!isNaN(value)) {
      setHeight(value);
    }
  };

  return (
    <View onLayout={onLayout}>
      <KeyboardAvoidingView
        style={{ zIndex: 1, paddingTop: 20, height: '100%' }}
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? (tab === 0 ? 100 : 148) : 0
        }>
        <CustomScrollView
          accessibilityLabel="visibilityScroll"
          // style={{marginBottom: tab === 0 ? ( keyboardVisible ? 380 : 190 ) : keyboardVisible ? 375 : 100, flex: 0}}
          style={{
            marginBottom:
              keyboardVisible && Platform.OS === 'android'
                ? keyboardHeight + (tab === 0 ? 50 : 10)
                : tab === 0
                  ? 190
                  : 100,
            flex: 0,
          }}>
          <View
            style={[
              {
                opacity: isAuthor ? 1 : 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                overflow: 'hidden',
                paddingHorizontal: 25,
              },
            ]}
            pointerEvents={!isAuthor ? 'none' : 'auto'}>
            <ShareWith isCreateStory onViewSubGroups={onViewSubGroups} />
          </View>
          <Divider
            style={{
              backgroundColor: '#F0F0F0',
              padding: 0,
              marginHorizontal: 0,
              marginTop: 6,
              width: '100%',
            }}
          />
          <View
            style={[styles.bottomSection, { paddingBottom: tab !== 0 ? 40 : 0 }]}>
            <DateSelector
              dateOpen={dateOpen}
              styles={styles}
              dataEntered={dataEntered}
              handleDateChange={handleDateChange}
              closeDateField={closeDateField}
            />
            <CustomTextInput
              onFocus={() => setDateOpen(true)}
              onChangeText={text => {
                setDataEntered({
                  selectedDate: dataEntered?.selectedDate,
                  selectedLocation: text,
                });
              }}
              accessibilityLabel="dateInput"
              contentStyle={{
                paddingStart: 0,
              }}
              maskText={!isAuthor}
              label="Date"
              value={moment(dataEntered?.selectedDate).format('Do MMM YYYY')}
              disabled={!isAuthor}
              customTheme={customTheme}
              showSoftInputOnFocus={false}
              left={<CalendarIcon stroke={customTheme.colors.primary} />}
            />
            <CustomTextInput
              ref={dateInputRef}
              customTheme={customTheme}
              left={<LocationIcon stroke={customTheme.colors.primary} />}
              label="City, State, Country"
              contentStyle={{
                paddingStart: 0,
              }}
              accessibilityLabel="locationInput"
              maskText={!isAuthor}
              disabled={!isAuthor}
              value={location}
              onChangeText={text => {
                setLocation(text);
              }}
              onBlur={() => (formDataRef.current.location = location)}
            />
            <Pressable
              accessibilityLabel="tag members"
              disabled={!isAuthor}
              onPress={() => onTagClick()}
              style={[
                styles.tagSection,
                {
                  opacity: !isAuthor ? 0.5 : 1,
                },
              ]}>
              <View style={styles.tagLeftSection}>
                <View
                  style={{
                    width: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TagIcon />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                  }}>
                  Tag Members
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {currentlyWritten?.featureTags?.length > 0 && (
                  <Text
                    style={{
                      marginTop: -3,
                    }}>
                    {pluralize(currentlyWritten?.featureTags?.length, 'member')}
                  </Text>
                )}
                <Icon
                  size={24}
                  name="chevron-right"
                  color={customTheme.colors.primary}
                />
              </View>
            </Pressable>
            {!isAuthor && (
              <View
                style={{
                  height: 40,
                }}
              />
            )}
          </View>
          <Toast
            position="bottom"
            bottomOffset={20}
            autoHide
            visibilityTime={3000}
          />
        </CustomScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

DrawerContent.displayName = 'StoryDrawerContent';

export default memo(DrawerContent);

function useCreateStyles() {
  const theme = useTheme();
  return StyleSheet.create({
    button: {
      borderRadius: 10,
    },
    dateContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    dateContainerBackground: {
      height: '100%',
      width: '100%',
    },
    tagSection: {
      height: 40,
      marginBottom: 90,
      borderWidth: 1,
      borderColor: 'rgba(51, 48, 60, 0.3)',
      borderRadius: theme.roundness,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tagLeftSection: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomSection: {
      gap: 10,
      marginTop: 30,
      paddingHorizontal: 25,
    },
    closeButton: {
      position: 'absolute',
      top: -35,
      right: -6,
      backgroundColor: 'lightgray',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      elevation: 9,
    },
    message: {
      fontSize: 16,
      fontWeight: '500',
      color: 'black',
      textAlign: 'center',
      paddingHorizontal: 15,
    },
    title: {
      fontSize: 24,
      textAlign: 'center',
      paddingHorizontal: 15,
      fontWeight: 'bold',
      color: 'black',
    },
    lifestorySection: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    lifestoryTitle: { color: 'black', fontWeight: 'bold', fontSize: 20 },
    lifestorySubtitle: { color: 'black', fontWeight: '500', fontSize: 13 },
  });
}