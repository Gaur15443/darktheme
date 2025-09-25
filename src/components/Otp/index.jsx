import React, {memo, useEffect, useRef, useState} from 'react';
import {View, TextInput, Platform} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import PropTypes from 'prop-types';

import {getHash, startOtpListener, useOtpVerify} from 'react-native-otp-verify';

/**
 * Component for displaying otp boxes.
 *
 * @param {number} digitCount - Number of otp boxes to show.
 * @param {boolean} disabled - Whether otp boxes should be editable.
 * @param {boolean} hasError - Whether otp submitted is invalid. If `true` red outline is shown, else if `false` the default outline is shown.
 * @param {number} margin - Spacing between the boxes.
 * @param {Function} onClearError - Function to handle when the otp error is reset.
 * @param {Function} onGetKeys - Function to capture the otp keys entered.
 * @param {boolean} otpReset - Whether to clear otp boxes. If `true` all boxes value will reset.
 */
function Otp({
  digitCount,
  disabled = false,
  hasError = false,
  margin = 4,
  onClearError,
  onGetKeys,
  boxStyle = {},
  otpReset = false,
  inputStyle = {},
  onClipboardPasted = () => {},
}) {
  const theme = useTheme();
  const textInputsRefs = useRef(
    Array.from({length: digitCount}).map(() => React.createRef()),
  );
  const [digits, setDigits] = useState(Array(digitCount).fill(''));
  const [focusData, setFocusData] = useState(Array(digitCount).fill(false));

  useEffect(() => {
    let isMounted = true;

    // Uncomment to test hash
    // getHash()
    //   .then(hash => console.log(hash))
    //   .catch(e => console.log("Hash error: ", e));

    const listener = startOtpListener(message => {
      if (!isMounted) return;

      const re = new RegExp(`(\\d{${digitCount}})`, 'gm');
      const match = re.exec(message);

      if (match && match[1]) {
        setDigits(match[1].split(''));
        onGetKeys(match[1]);
      }
    });

    return () => {
      isMounted = false;
      if (typeof listener === 'function') {
        listener();
      }
    };
  }, [digitCount, otpReset]);

  useEffect(() => {
    textInputsRefs.current = Array.from({length: digitCount}).map(() =>
      React.createRef(),
    );
    setDigits(Array(digitCount).fill(''));
  }, [digitCount]);

  useEffect(() => {
    if (otpReset) {
      setDigits(Array(digitCount).fill(''));

      if (typeof onGetKeys === 'function') {
        onGetKeys('');
      }
    }
  }, [otpReset]);

  useEffect(() => {
    const hasDigit = digits.some(digit => digit?.length > 0);

    if (
      hasDigit &&
      hasError &&
      typeof onClearError === 'function' &&
      digits.length
    ) {
      onClearError();
    }
  }, [digits]);

  function isDigitsFull(val) {
    return val.every(elem => elem?.toString?.()?.length > 0);
  }

  function handleKeyDown(event, index) {
    let newDigits = [...digits];

    if (
      event.nativeEvent.key !== 'Tab' &&
      event.nativeEvent.key !== 'ArrowRight' &&
      event.nativeEvent.key !== 'ArrowLeft'
    ) {
      event.preventDefault();
    }

    if (event.nativeEvent.key === 'Backspace') {
      newDigits[index] = '';
      setDigits(newDigits);

      if (index !== 0) {
        // Use the ref to focus on the previous TextInput
        textInputsRefs.current[index - 1]?.current?.focus();
      }

      onGetKeys(newDigits.filter(digit => Number(digit) >= 0).join(''));

      return;
    }

    if (/^([0-9])$/.test(event.nativeEvent.key)) {
      newDigits[index] = event.nativeEvent.key;
      setDigits(newDigits);

      if (index !== digitCount - 1) {
        // Use the ref to focus on the next TextInput
        textInputsRefs.current[index + 1]?.current?.focus();
      }

      if (isDigitsFull(newDigits)) {
        onGetKeys(newDigits.join(''));
      }
    }
  }

  function handleInputChange(text, index) {
    if (text.length > 1) {
      if (text.length === 4) {
        textInputsRefs.current[3]?.current?.focus();
        onClipboardPasted(text);
      }
      console.log('text', text);
      const split = text.toString().split('');
      setDigits(split);
      return;
    }
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);

    if (isDigitsFull(newDigits)) {
      onGetKeys(newDigits.join(''));
    }
  }

  const finalBorderColor = hasError ? 'red' : inputStyle.borderColor || 'black';

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        {Platform.OS === 'ios' && (
          <TextInput
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            onChangeText={text => {
              const newDigits = text.trim().split('');
              setDigits(newDigits);
              onGetKeys(newDigits.join(''));
            }}
            style={{
              position: 'absolute',
              left: -10000,
              bottom: -10000,
              opacity: 0,
              width: 1,
              height: 1,
            }}
          />
        )}

        {React.Children.map(Array.from({length: digitCount}), (_, index) => (
          <View
            style={{
              margin: 5,
              // borderWidth: 1.5,
              // borderColor: hasError ? 'red' : 'white',
              borderColor: finalBorderColor,
              width: 40,
              height: 40,
              margin: 7,
              shadowColor: '#000',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.34,
              shadowRadius: 6.27,

              elevation: 10,
              backgroundColor: '#fff',
              borderRadius: 8,
              ...boxStyle,
            }}>
            <TextInput
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              key={index}
              ref={textInputsRefs.current[index]}
              style={{
                borderWidth: 2,
                borderColor: hasError
                  ? 'red'
                  : focusData[index]
                    ? theme.colors.primary
                    : '#667085',
                width: 40,
                height: 40,
                textAlign: 'center',
                borderRadius: 8,
                color: '#000',
                fontWeight: 'bold',
                ...inputStyle,
              }}
              textAlignVertical="center"
              keyboardType="numeric"
              // maxLength={1}
              value={digits[index]}
              editable={!disabled}
              onFocus={() => {
                setFocusData(prev =>
                  prev.map((__item, itemIndex) => index === itemIndex),
                );
              }}
              onBlur={() => {
                setFocusData(prev =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? false : item,
                  ),
                );
              }}
              onChangeText={text => handleInputChange(text, index)}
              onKeyPress={event => handleKeyDown(event, index)}
            />
          </View>
        ))}
      </View>
      {hasError && (
        <Text style={{color: 'red', textAlign: 'center'}}>Incorrect OTP</Text>
      )}
    </View>
  );
}

Otp.propTypes = {
  digitCount: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  margin: PropTypes.number,
  onClearError: PropTypes.func,
  onGetKeys: PropTypes.func.isRequired,
  otpReset: PropTypes.bool,
  inputStyle: PropTypes.object,
  boxStyle: PropTypes.object,
};

Otp.displayName = 'Otp';

export default memo(Otp);
