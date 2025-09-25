/* eslint-disable react/no-unstable-nested-components */
import React, {useState, useEffect, useMemo} from 'react';
import {View, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import Animated, {SlideInDown} from 'react-native-reanimated';
import {TextInput, Text} from 'react-native-paper';
import {ShareWith} from '../../../components';
import {CalendarIcon, LocationIcon} from '../../../images';
import moment from 'moment';
import PropTypes from 'prop-types';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import CustomBottomSheet from './../../CustomBottomSheet/index';
import useKeyboardHeight from './../../../hooks/useKeyboardheight';

const BottomChapter = ({
  visible = false,
  sheetNumber = 0,
  onClose = () => undefined,
  inputData,
  editDate,
  editLocation = '',
}) => {
  const keyboardHeight = useKeyboardHeight();
  const keyboardDenominator = useMemo(() => {
    return Platform.OS === 'android' ? 2.8 : 1;
  }, [Platform.OS]);
  const snapPoints = [200];
  const [dateOpen, setDateOpen] = useState(false);
  const [dataEntered, setDataEntered] = useState({
    selectedDate: editDate || new Date(),
    selectedLocation: editLocation,
  });

  useEffect(() => {
    inputData(dataEntered);
  }, [dataEntered]);

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

  function handleLocationClose(event) {
    if (keyboardHeight > 0) {
      return;
    }
    onClose(event);
  }

  const dateField = () => {
    return (
      <CustomBottomSheet onClose={onClose} snapPoints={[200]}>
        <View style={styles?.miniTitleContainer}>
          <CalendarIcon accessibilityLabel="CalendarIcon" />
          <Text style={styles?.miniTitle} accessibilityLabel="Date-label">
            Date
          </Text>
        </View>
        <TouchableOpacity
          testID="datePopUpOpen"
          style={{marginTop: 25}}
          onPress={() => setDateOpen(true)}>
          <View style={styles?.dateField}>
            <Text
              style={styles?.miniTitle}
              accessibilityLabel="edit-chapter-date">
              {moment(editDate || dataEntered.selectedDate).format(
                'Do MMM YYYY',
              )}
            </Text>
          </View>
        </TouchableOpacity>
      </CustomBottomSheet>
    );
  };

  const Location = () => {
    return (
      <CustomBottomSheet
        snapPoints={[
          snapPoints[0] + (keyboardHeight || 1) / keyboardDenominator,
        ]}
        enableDynamicSizing={false}
        onClose={handleLocationClose}
        enableOverDrag={keyboardHeight < 1}>
        <View style={styles?.miniTitleContainer}>
          <LocationIcon accessibilityLabel="edit-chapter-LocationIcon" />
          <Text
            style={styles?.miniTitle}
            accessibilityLabel="edit-chapter-Location-Label">
            Location
          </Text>
        </View>
        <TextInput
          accessibilityLabel="edit-chapter-locationInput"
          onChangeText={text => {
            setDataEntered({
              selectedDate: dataEntered?.selectedDate,
              selectedLocation: text,
            });
          }}
          defaultValue={editLocation || dataEntered?.selectedLocation}
          style={{marginHorizontal: 30, marginTop: 25}}
          outlineStyle={styles?.TextField}
          name="title"
          testID="locationInput"
          mode="outlined"
          placeholder="City, State, Country"
        />
      </CustomBottomSheet>
    );
  };

  return (
    <>
      {visible && (
        <View>
          <View style={styles?.container}>
            <TouchableOpacity
              activeOpacity={1}
              testID="closeSheet"
              onPress={() => {
                onClose();
              }}
              style={{
                height: '100%',
                width: '100%',
              }}
            />

            <View style={styles?.dateContainer}>
              <TouchableOpacity
                activeOpacity={1}
                testID="closeDateField"
                onPress={() => {
                  closeDateField();
                }}
                style={{
                  height: '100%',
                  width: '100%',
                }}
              />
              <Animated.View entering={SlideInDown.duration(250).damping(10)}>
                <ImuwDatePicker
                  onClose={() => closeDateField()}
                  open={dateOpen}
                  testID="datepicker"
                  selectedDate={
                    new Date(editDate || dataEntered.selectedDate) || new Date()
                  }
                  accessibilityLabel="edit-chapter-datepicker"
                  mode="date"
                  onDateChange={handleDateChange}
                />
              </Animated.View>
            </View>
            {sheetNumber === 0 && dateField()}
            {sheetNumber === 1 && (
              <CustomBottomSheet snapPoints={['50%']} onClose={onClose}>
                <ShareWith unMount={() => onClose()} />
              </CustomBottomSheet>
            )}
            {sheetNumber === 2 && Location()}
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    zIndex: 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    zIndex: 10,
    backgroundColor: 'white',
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  closeButton: {
    marginTop: 10,
    marginRight: 20,
    alignSelf: 'flex-end',
    color: 'blue',
  },
  miniTitle: {
    fontWeight: '600',
    color: 'black',
    fontSize: 18,
  },
  dateField: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 40,
  },
  TextField: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: 'lightgrey',
    marginHorizontal: 4.3,
  },
  miniTitleContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 20,
    marginLeft: 20,
  },
});

BottomChapter.propTypes = {
  visible: PropTypes.bool,
  sheetNumber: PropTypes.number,
  onClose: PropTypes.func,
  editLocation: PropTypes.string,
};

export default BottomChapter;
