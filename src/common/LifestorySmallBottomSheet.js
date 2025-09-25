import React, {
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import {Modal, Portal} from 'react-native-paper';

import BottomSheet, {
  BottomSheetView,
  WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import {CloseIcon} from '../images/Icons/ModalIcon';
import {Text, TextInput} from 'react-native-paper';
import {CustomButton, ImuwDatePicker} from './../core';
import {LocationIcon, CalendarIcon} from '../images';
import moment from 'moment';
import useKeyboardHeight from '../hooks/useKeyboardheight';

const LifestorySmallBottomSheet = forwardRef(
  (
    {
      enableCrossIcon,
      title,
      snapPoints: propSnapPoints,
      contentHeight,
      customTitleStyle = {},
      titleVariant,
      enableDynamicSizingProp,
      containerStyle = {},
      disableSnapPoint,
      hideIndicator = false,
      submitOnPress = false,
      saveButtonDisabled = false,
      loading = false,
      inputData,
      editDate,
      editLocation = '',
      locationData,
      dateData,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const keyboardHeight = useKeyboardHeight();

    const [dataEntered, setDataEntered] = useState({
      selectedDate: editDate || new Date(),
      selectedLocation: editLocation,
    });
    const [dateOpen, setDateOpen] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
      inputData(dataEntered);
    }, [dataEntered]);

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        event => {
          setKeyboardVisible(true);
          const keyboardHeight = event.endCoordinates.height;

          if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(0);
          }
        },
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
        },
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

    const dateField = () => {
      return (
        <View style={styles.dateDiv}>
          <TouchableOpacity
            testID="datePopUpOpen"
            style={styles.dateField}
            onPress={() => setDateOpen(true)}>
            <View style={styles.dateFieldContent}>
              <CalendarIcon accessibilityLabel="CalendarIcon" />
              <Text
                style={styles.TextField}
                accessibilityLabel="edit-chapter-date">
                {moment(editDate || dataEntered.selectedDate).format(
                  'Do MMM YYYY',
                )}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    const handleDateChange = date => {
      setDataEntered({
        selectedDate: date,
        selectedLocation: dataEntered?.selectedLocation,
      });
      closeDateField();
    };

    function closeDateField() {
      setDateOpen(false);
    }

    const snapPoints = useMemo(() => {
      return keyboardVisible ? ['70%'] : ['28%'];
    }, [propSnapPoints, contentHeight, keyboardVisible]);

    const handleOpenPress = useCallback(() => {
      setIsVisible(true);
    }, []);

    const handleClosePress = useCallback(() => {
      bottomSheetRef.current?.close();
      setIsVisible(false);
    }, []);

    useImperativeHandle(ref, () => ({
      open: handleOpenPress,
      close: handleClosePress,
    }));

    return (
      <Portal>
        <Modal
          visible={isVisible}
          onRequestClose={handleClosePress}
          animationType="fade"
          onDismiss={handleClosePress}
          style={{
            backgroundColor: 'transparent',
            borderRadius: 6,
            shadowColor: 'transparent',
            marginBottom: 0,
          }}
          contentContainerStyle={{
            height: '100%',
            width: '100%',
            padding: 0,
            margin: 0,
            // paddingHorizontal: 25,
            marginBottom: 0,
          }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 20}>
            <BottomSheet
              ref={bottomSheetRef}
              index={0}
              enableDynamicSizing={!keyboardHeight > 0}
              snapPoints={
                keyboardHeight > 0 ? Platform.OS === 'ios' ? [keyboardHeight + 150] : ['75%'] : null // +150 for ios
              }
              enablePanDownToClose={true}
              onClose={handleClosePress}
              backgroundStyle={styles.bottomSheet}
              handleIndicatorStyle={[
                styles.indicator,
                hideIndicator ? {height: 0} : {},
              ]}>
              <BottomSheetView
                style={[
                  styles.bottomDialogContainer,
                  containerStyle,
                  keyboardVisible && {paddingTop: 10},
                ]}>
                {enableCrossIcon && (
                  <View style={styles.headerContainer}>
                    <Text
                      variant={titleVariant || 'default'}
                      style={[styles.headerText, customTitleStyle]}>
                      {title}
                    </Text>

                    <TouchableOpacity
                      onPress={handleClosePress}
                      accessibilityLabel="close media upload options">
                      <CloseIcon color="black" />
                    </TouchableOpacity>
                  </View>
                )}

                <View>
                  {dateField()}

                  <ImuwDatePicker
                    onClose={() => closeDateField()}
                    open={dateOpen}
                    testID="datepicker"
                    selectedDate={
                      new Date(editDate || dataEntered.selectedDate) ||
                      new Date()
                    }
                    accessibilityLabel="edit-chapter-datepicker"
                    mode="date"
                    onDateChange={handleDateChange}
                  />
                </View>

                <View
                  style={[
                    styles.textInputContainer,
                    keyboardVisible && {marginBottom: 15, marginTop: 5},
                  ]}>
                  <TextInput
                    style={styles.textInput}
                    accessibilityLabel="edit-chapter-locationInput"
                    onChangeText={text => {
                      setDataEntered({
                        selectedDate: dataEntered?.selectedDate,
                        selectedLocation: text,
                      });
                    }}
                    defaultValue={
                      editLocation ||
                      dataEntered?.selectedLocation ||
                      locationData
                    }
                    outlineStyle={styles.textInputOutline}
                    name="title"
                    testID="locationInput"
                    mode="outlined"
                    placeholder="City, State, Country"
                    left={<TextInput.Icon icon={() => <LocationIcon />} />}
                  />
                </View>

                <View
                  style={[
                    styles.buttonContainer,
                    keyboardVisible && styles.buttonContainerKeyboard,
                  ]}>
                  <CustomButton
                    testID="craeteChapterBtn"
                    className="craeteChapterBtn"
                    label={'Publish'}
                    onPress={submitOnPress}
                    loading={loading}
                    disabled={saveButtonDisabled || loading}
                  />
                </View>
              </BottomSheetView>
            </BottomSheet>
          </KeyboardAvoidingView>

          <TouchableWithoutFeedback onPress={handleClosePress}>
            <View
              style={{
                flex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: WINDOW_HEIGHT / 4,
              }}
            />
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  indicator: {
    backgroundColor: 'gray',
    width: 40,
  },
  bottomDialogContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    width: '100%',
    paddingHorizontal: 25,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    color: 'black',
  },
  dateDiv: {
    width: '100%',
    paddingVertical: '1%',
  },
  dateField: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 10,
    padding: 9,
    overflow: 'hidden',
  },
  dateFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingLeft: 6,
  },
  miniTitle: {
    fontWeight: '600',
    color: 'black',
    fontSize: 18,
  },
  TextField: {
    color: 'black',
  },
  textInputContainer: {
    width: '100%',
    marginVertical: 5,
  },
  textInput: {
    width: '100%',
    backgroundColor: 'white',
  },
  textInputOutline: {
    borderRadius: 10,
    borderColor: 'lightgrey',
  },
  buttonContainer: {
    paddingTop: 7,
    marginBottom: 40,
  },
  buttonContainerKeyboard: {
    marginBottom: 15,
  },
});

export default LifestorySmallBottomSheet;
