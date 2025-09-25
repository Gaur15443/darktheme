import React, {memo} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import DatePicker from 'react-native-date-picker';

/**
 * ImuwDatePicker component renders a date picker UI element.
 *
 * @param {Object} props - The props for configuring the date picker.
 * @param {"date" | "time" | "datetime"} [props.mode='date'] - The mode of the date picker. It can be `date`, `time`, or `datetime`.
 * @param {Date} [props.maximumDate=new Date()] - The maximum selectable date. Defaults to the current date.
 * @param {Date | null} [props.minimumDate=null] - The minimum selectable date. Defaults to `null`, meaning no limit.
 * @param {function(Date): void} [props.onDateChange] - Callback function triggered when the date is selected. Receives the selected date.
 * @param {boolean} [props.open=false] - Controls whether the date picker modal is open.
 * @param {function} [props.onClose] - Callback function to close the date picker modal.
 * @param {Date} [props.selectedDate=new Date()] - The pre-selected date when the date picker opens.
 * @param {string} [props.theme='light'] - The theme for the date picker, can be `light` or `dark`. Defaults to `light`.
 * @param {...Object} props - Additional props that can be passed to the underlying `DatePicker` component.
 *
 * @returns {JSX.Element} A JSX element rendering the date picker modal.
 */

function ImuwDatePicker({
  mode = 'date',
  maximumDate = new Date(),
  minimumDate = null,
  onDateChange = () => undefined,
  open = false,
  onClose = () => undefined,
  selectedDate = new Date(),
  theme = 'light',
  ...props
}) {
  return (
    <SafeAreaView>
      <DatePicker
        theme={theme}
        {...props}
        modal
        accessibilityLabel="date picker"
        maximumDate={maximumDate}
        minimumDate={minimumDate || new Date('1000-01-01')}
        open={open}
        date={new Date(selectedDate) || new Date()}
        onConfirm={date => {
          onDateChange(date);
          onClose();
        }}
        onCancel={() => {
          onClose();
        }}
        mode={mode || 'date'}
      />
    </SafeAreaView>
  );
}

ImuwDatePicker.propTypes = {
  mode: PropTypes.string,
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  theme: PropTypes.string,
};

ImuwDatePicker.displayName = 'ImuwDatePicker';

export default memo(ImuwDatePicker);
