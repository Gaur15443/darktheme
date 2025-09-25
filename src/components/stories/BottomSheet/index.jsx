import React, {
  useState,
  useEffect,
  useMemo,
  cloneElement,
  Fragment,
} from 'react';
import {View, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import Animated, {SlideInDown} from 'react-native-reanimated';
import {TextInput, Text, Portal} from 'react-native-paper';
import {ShareWith} from '../../../components';
import {CalendarIcon, LocationIcon} from '../../../images';
import moment from 'moment';
import PropTypes from 'prop-types';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';
import useKeyboardHeight from './../../../hooks/useKeyboardheight';
import CustomBottomSheet from './../../CustomBottomSheet/index';
import DrawerContent from './DrawerContent';
import AddTagging from './../AddTagging/index';

const BottomSheet = ({
  visible = false,
  sheetNumber = 0,
  onClose = () => undefined,
  inputData,
  editDate,
  editLocation = '',
  formDataRef,
  disabled = false,
}) => {
  const keyboardHeight = useKeyboardHeight();
  const snapPoints = [200];
  const keyboardDenominator = useMemo(() => {
    return Platform.OS === 'android' ? 2.8 : 1;
  }, []);
  const [dateOpen, setDateOpen] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [dataEntered, setDataEntered] = useState({
    selectedDate: editDate || new Date(),
    // lifestory currently saves formatted address
    selectedLocation: editLocation?.formatted_address || editLocation || '',
  });

  useEffect(() => {
    inputData(dataEntered);
  }, [dataEntered]);

  // this function gets date in the format of  YYYY/MM/DD
  // splitting it and converting it to javascript date obj
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
  function handleSheetClose(event) {
    if (keyboardHeight > 0) return;
    onClose(event);
  }

  //returns date field
  const dateField = () => {
    return (
      <CustomBottomSheet snapPoints={snapPoints} onClose={onClose}>
        <View style={styles?.miniTitleContainer}>
          <CalendarIcon />
          <Text style={styles?.miniTitle}>Date</Text>
        </View>
        <TouchableOpacity
          disabled={disabled}
          accessibilityLabel="datePopUpOpen"
          style={{marginTop: 25}}
          onPress={() => setDateOpen(true)}>
          <View style={styles?.dateField}>
            <Text style={styles?.miniTitle}>
              {moment(editDate || dataEntered.selectedDate).format(
                'Do MMM YYYY',
              )}
            </Text>
          </View>
        </TouchableOpacity>
      </CustomBottomSheet>
    );
  };

  //returns location field
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
          <LocationIcon />
          <Text style={styles?.miniTitle}>Location</Text>
        </View>
        <TextInput
          disabled={disabled}
          onChangeText={text => {
            setDataEntered({
              selectedDate: dataEntered?.selectedDate,
              selectedLocation: text,
            });
          }}
          value={dataEntered?.selectedLocation}
          style={{marginHorizontal: 30, marginTop: 25}}
          outlineStyle={styles?.TextField}
          name="title"
          accessibilityLabel="locationInput"
          mode="outlined"
          placeholder="City, State, Country"
        />
      </CustomBottomSheet>
    );
  };

  // returns share with component

  return (
    <>
      {visible && (
        <View transparent={true}>
          <View style={styles?.container}>
            <TouchableOpacity
              activeOpacity={1}
              accessibilityLabel="closeSheet"
              onPress={() => {
                onClose();
              }}
              style={{
                height: '100%',
                width: '100%',
              }}
            />
            {/* date picker starts... */}

            <View style={styles?.dateContainer}>
              <TouchableOpacity
                activeOpacity={1}
                accessibilityLabel="closeDateField"
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
                  accessibilityLabel="datepicker"
                  selectedDate={
                    new Date(editDate || dataEntered.selectedDate) || new Date()
                  }
                  mode="date"
                  onDateChange={handleDateChange}
                />
              </Animated.View>
            </View>

            {/* date picker ends here */}
            {sheetNumber === 0 && (
              <Fragment>
                {showTag && (
                  <Portal>
                    <AddTagging onAddTagClose={() => setShowTag(false)} />
                  </Portal>
                )}
                {!showTag && (
                  <CustomBottomSheet
                    enableOverDrag={keyboardHeight < 1}
                    enableDynamicSizing={false}
                    useScrollView
                    // snapPoints={[600]}
                    snapPoints={[
                      600 + (keyboardHeight || 1) / keyboardDenominator,
                    ]}
                    onClose={handleSheetClose}
                    contentStyle={{
                      height: 200,
                    }}
                    BottomSheetFooter={cloneElement(
                      <DrawerContent.BottomSection
                        onTagClick={() => setShowTag(true)}
                      />,
                      {
                        formDataRef,
                      },
                    )}>
                    <DrawerContent />
                  </CustomBottomSheet>
                )}
              </Fragment>
            )}

            {/* {sheetNumber === 0 && dateField()} */}
            {sheetNumber === 1 && (
              <CustomBottomSheet
                snapPoints={['50%']}
                enableDynamicSizing={false}
                onClose={onClose}
                useScrollView>
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

export default BottomSheet;
BottomSheet.propTypes = {
  visible: PropTypes.bool,
  sheetNumber: PropTypes.number,
  onClose: PropTypes.func,
  editLocation: PropTypes.string,
  disabled: PropTypes.bool,
};
