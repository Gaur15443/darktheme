import React, {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import PropTypes from 'prop-types';
import { useTheme, Text } from 'react-native-paper';
import { CloseIcon } from '../images';
import { useIsFocused } from '@react-navigation/native';
import { TextInputComponentProps } from './CustomInputTypes';

/**
 * @typedef {Object} CustomTheme
 * @property {Object} colors - The colors object within the custom theme
 * @property {string} colors.primary - The primary color
 * */

/**
 * Custom input component.
 *
 * @typedef {Object} TextInputComponentProps
 * @extends {TextInputProps}  
 * @property {boolean} [clearable] - Shows a cross icon if true.
 * @property {boolean} [maskText] - Whether text should be masked.
 * @property {StyleProp<ViewStyle>} [style] - Styles for the container.
 * @property {StyleProp<TextStyle>} [contentStyle] - Styles for the input text.
 * @property {boolean} [error] - Indicates if the input has an error.
 * @property {string} [errorText] - The error message text.
 * @property {'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' | 'url'} [keyboardType] - The type of keyboard.
 * @property {string | React.ReactNode} [label] - The input label.
 * @property {(text: string) => void} [onChangeText] - Called when text changes.
 * @property {() => void} [onFocus] - Called when input is focused.
 * @property {() => void} [onBlur] - Called when input loses focus.
 * @property {boolean} [secureTextEntry] - Whether the input is for passwords.
 * @property {string} testID - Unique ID for testing.
 * @property {TextInputProps['textContentType']} [textContentType] - Content type for input.
 *  @returns {React.ReactNode} React component representing the custom input.
 */
const CustomInput = forwardRef<TextInput, TextInputComponentProps>(
  (
    {
      clearable = false,
      style = {},
      contentStyle = {},
      error = false,
      errorText,
      keyboardType = 'default',
      label = '',
      multiline = false,
      onChangeText = () => undefined,
      onBlur = () => undefined,
      placeholder = '',
      placeholderTextColor = 'rgba(51, 48, 60, 0.6)',
      rotatingPlaceholders,
      rotatingLabels,
      leftContentStyles = {},
      required,
      left,
      right,
      secureTextEntry = false,
      testID,
      accessibilityLabel,
      textContentType = 'none',
      onFocus = () => undefined,
      value = '',
      defaultValue = '',
      disabled = false,
      relationField = false,
      inputHeight = null,
      centerNumber = 4,
      textVerticalAlign = 'center',
      maskText = false,
      onMaskPress = () => undefined,
      customLabelStyle = {},
      restingLabelStyle = {},
      rightContentStyles = {},
      customTheme = {},
      crossIconPosition = 'center', //flex-start for top and flex-end for bottom
      customBorderColor = null,
      customBorderWidth = null,
      innerContainerStyle = {},
      crossIconBackground = null,
      animateLabel = true,
      inputContainerStyle = {},
      ...props
    },
    ref,
  ) => {
    const mainTheme = useTheme();

    const mergedTheme = {
      ...mainTheme,
      ...customTheme,
      colors: {
        ...mainTheme.colors,
        ...customTheme.colors,
        // @ts-expect-error
        onBackground: customTheme?.colors?.onBackground ? customTheme.colors.onBackground : mainTheme.isDarkTheme ? '#2A2740' : mainTheme.colors.onBackground,
        // @ts-expect-error
        inputColor: customTheme?.colors?.inputColor ? customTheme.colors.inputColor : mainTheme.isDarkTheme ? '#ffffff' : mainTheme.colors.inputColor,
      },
    };

    const theme = mergedTheme;
    // @ts-ignore
    inputHeight = inputHeight ? inputHeight : theme.isDarkTheme ? 48 : 40;

    const pageIsFocused = useIsFocused();
    const styles = createStyles(inputHeight);
    const textFieldRef = useRef<TextInput>(null);
    const intervalId = useRef<NodeJS.Timer>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState('');
    const [computedLabelWidth, setComputedLabelWidth] = useState(0);
    const [computedLeftContentWidth, setComputedLeftContentWidth] =
      useState(40);

    const [typingText, setTypingText] = useState('');

    const labelPosition = useRef(new Animated.Value(text ? 1 : 0)).current;


    useEffect(() => {
      if (!value?.length && rotatingLabels && rotatingLabels?.length > 1 && pageIsFocused) {
        startTyping();
      } else if (
        !value?.length &&
        rotatingLabels?.length === 1 &&
        pageIsFocused
      ) {
        setTypingText(rotatingLabels[0]);
      }
      if (text?.length) {
        // @ts-ignore
        clearInterval(intervalId.current);
      }

      return () => {
        // @ts-ignore
        clearInterval(intervalId.current);
        setTypingText('');
      };
    }, [value, pageIsFocused, rotatingLabels]);

    useEffect(() => {
      setText(value);
      if (value) {
        animatedLabel(1);
      } else {
        animatedLabel(isFocused ? 1 : 0);
      }
    }, [value]);

    function startTyping() {
      let index = 0;
      let placeholderIndex = 0;
      const rotatingTexts = rotatingLabels?.length
        ? rotatingLabels
        : rotatingPlaceholders;

      // @ts-ignore
      clearInterval(intervalId.current);

      intervalId.current = setInterval(() => {
        setTypingText(prevText => {
          const currentPlaceholder = rotatingTexts?.[placeholderIndex];
          const nextChar = currentPlaceholder?.[index];

          if (currentPlaceholder && index >= currentPlaceholder.length) {
            index = 0;
            placeholderIndex = (placeholderIndex + 1) % rotatingTexts.length;
            return '';
          } else {
            index++;
            return prevText + nextChar;
          }
        });
      }, 100);
    }

    function handleFocus(event) {
      setIsFocused(true);
      animatedLabel(1);
      // @ts-ignore
      onFocus(event);
    }

    function handleBlur(event) {
      setIsFocused(false);
      // @ts-ignore
      onBlur(event);
      if (!text) {
        animatedLabel(0);
      }
    }

    function handleTextChange(text) {
      setText(text);
      if (onChangeText) {
        onChangeText(text);
      }
      if (text) {
        animatedLabel(1);
      } else {
        animatedLabel(isFocused ? 1 : 0);
      }
    }

    function animatedLabel(toValue) {
      Animated.timing(labelPosition, {
        toValue: toValue,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    function handleClearText() {
      setText('');
      onChangeText('');
    }

    /**
     * Forces input to be focussed if user clicked on label.
     */
    function forceFocus() {
      if (!isFocused && typeof textFieldRef.current?.focus === 'function') {
        textFieldRef.current.focus();
      }
    }

    const labelStyle = useMemo(() => {
      return {
        position: 'absolute',
        zIndex: 2,
        // @ts-ignore
        color: theme.isDarkTheme ? '#fff' : 'rgba(51, 48, 60, 0.3)',
        fontFamily: 'PublicSans Regular',
        backgroundColor: 'transparent',
        paddingStart: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [left ? 0 : 12, 6],
        }),
        left: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [left ? computedLeftContentWidth : 0, 6],
        }),
        top: labelPosition.interpolate({
          inputRange: [0, 1],
          // division by 4 is to make it centered
          outputRange: [
            inputHeight / centerNumber,
            animateLabel ? -10 : inputHeight / centerNumber,
          ],
        }),
        opacity: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [0.68, 1],
        }),
        fontSize: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 12],
        }),
      };
    }, [left, computedLeftContentWidth, inputHeight, centerNumber]);
    function handleLabelLayoutChange(event) {
      setComputedLabelWidth(event.nativeEvent.layout.width);
    }
    function handleLeftLayoutChange(event) {
      setComputedLeftContentWidth(event.nativeEvent.layout.width);
    }

    return (
      <View
        style={[
          style,
          {
            backgroundColor: 'transparent',
          },
        ]}>
        {label && (label as string)?.length > 0 && (
          <Animated.Text
            suppressHighlighting
            onLayout={handleLabelLayoutChange}
            onPress={forceFocus}
            style={[
              styles.label,
              // @ts-ignore
              labelStyle,
              {
                color:
                  isFocused && !error
                    ? theme.colors.primary
                    : error
                      ? theme.colors.error
                      : relationField
                        ? 'rgb(170,170,170)'
                        : theme.colors.inputColor,
              },
              customLabelStyle,
              ((isFocused || text?.length > 0) ? {} : restingLabelStyle),
            ]}>
            {label}
            {required && <Text style={{ color: 'red' }}>*</Text>}
          </Animated.Text>
        )}
        {maskText && (
          <Pressable
            onPress={event => {
              event.stopPropagation();
              // @ts-ignore
              onMaskPress(event);
            }}
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: disabled ? '#ffffffaa' : 'transparent',
              position: 'absolute',
              zIndex: 2,
            }}
          />
        )}

        {(isFocused || text?.length > 0) && label && (label as string)?.length > 0 && (
          <View
            style={{
              position: 'absolute',
              // @ts-ignore
              backgroundColor: theme.isDarkTheme ? theme.colors.onBackground : '#fff',
              width: animateLabel ? computedLabelWidth : 0,
              height: isFocused ? 2 : error ? 2 : 0.9,
              left: 11,
              top: 0,
              zIndex: 1,
              // @ts-ignore
              borderTopColor: theme.isDarkTheme ? theme.colors.onBackground : '#fff',
              borderTopWidth: isFocused ? 2 : error ? 2 : 1,
            }}
          />
        )}
        <View
          style={[
            styles.innerContainer,
            multiline ? styles.minHeight : styles.height,
            {
              // @ts-ignore
              backgroundColor: theme.isDarkTheme ? 'transparent' : theme.colors.onBackground,
            },
            {
              borderColor: customBorderColor
                ? customBorderColor
                : isFocused && !error
                  ? theme.colors.primary
                  : error
                    ? theme.colors.error
                    : relationField
                      ? theme.colors.outlineVariant
                      // @ts-ignore
                      : theme.isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(51, 48, 60, 0.3)',
              borderWidth: customBorderWidth
                // @ts-ignore
                ? customBorderWidth : theme.isDarkTheme ? 1.2
                  : isFocused
                    ? 2
                    : error
                      ? 2
                      : 1,
            },
            isFocused &&
            !error && {
              // @ts-expect-error
              color: theme.colors.primary,
            },
            innerContainerStyle,
          ]}>
          <View style={[styles.inputContainer, inputContainerStyle]}>
            {left && (
              <View
                onLayout={handleLeftLayoutChange}
                style={{
                  width: 40,
                  left: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  ...leftContentStyles as Object,
                }}>
                {left}
              </View>
            )}
            {/* If not put obscure password doesn't show. */}
            {/* @ts-expect-error */}
            <Text style={{ display: 'none' }} />
            <TextInput
              {...props}
              accessibilityLabel={accessibilityLabel || testID}
              ref={el => {
                textFieldRef.current = el as TextInput;
                if (typeof ref === 'function') {
                  ref(el);
                } else if (ref && ref.hasOwnProperty('current')) {
                  ref.current = el;
                }
              }}
              multiline={multiline}
              style={[
                relationField ? styles.relationshipInput : styles.input,
                multiline ? styles.minHeight : styles.height,
                {
                  ...(rotatingLabels?.length && !value?.length && !text?.length
                    ? { color: placeholderTextColor }
                    : {}),
                  backgroundColor: theme.colors.onBackground,
                  fontFamily: 'PublicSans Regular',
                  ...contentStyle as object,
                },
              ]}
              keyboardType={keyboardType}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChangeText={handleTextChange}
              value={
                rotatingLabels && rotatingLabels?.length > 0 && !value?.length
                  ? typingText
                  : value?.length
                    ? value
                    : text
              }
              textAlignVertical={textVerticalAlign}
              textContentType={textContentType}
              editable={!disabled}
              secureTextEntry={secureTextEntry}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
            />
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: theme.colors.onBackground,
              }}>
              {clearable && text?.length > 0 && isFocused && (
                <TouchableOpacity
                  onPress={handleClearText}
                  // @ts-ignore
                  style={{
                    paddingHorizontal: 6,
                    backgroundColor: crossIconBackground
                      ? crossIconBackground
                      : theme.colors.onBackground,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: crossIconPosition,
                    paddingTop: crossIconPosition === 'flex-start' ? 12 : 0,
                    paddingBottom: crossIconPosition === 'flex-end' ? 12 : 0,
                  }}>
                  <CloseIcon />
                </TouchableOpacity>
              )}
              {right && (
                <View
                  style={{
                    right: 0,
                    backgroundColor: theme.colors.onBackground,
                    height: inputHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...rightContentStyles as Object,
                  }}>
                  {/* @ts-ignore */}
                  {React.cloneElement(right, {
                    color: error ? theme.colors.error : 'rgba(51, 48, 60, 0.6)',
                    // if it's icon size will be 20, otherwise no effect.
                    size: 20,
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
        {errorText?.length && error && (
          <Text style={styles.errorText}>{errorText}</Text>
        )}
      </View>
    );
  },
);

function createStyles(inputHeight) {
  const theme = useTheme();
  return StyleSheet.create({
    height: {
      height: inputHeight,
    },
    minHeight: {
      minHeight: inputHeight,
    },
    innerContainer: {
      borderWidth: 1,
      // @ts-expect-error
      borderColor: theme.colors.inputColor,
      borderRadius: 5,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    label: {
      position: 'absolute',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 10,
      // @ts-expect-error
      backgroundColor: theme.isDarkTheme ? '#2A2740' : 'transparent'
    },
    input: {
      flex: 1,
      fontSize: 16,
      // @ts-expect-error
      color: theme.colors.text,
      paddingStart: 12,
      backgroundColor: theme.colors.onBackground,
      // @ts-expect-error
      fontFamily: theme.fonts.primary,
    },
    relationshipInput: {
      flex: 1,
      fontSize: 16,
      color: 'rgb(170,170,170)',
      paddingStart: 12,
      backgroundColor: theme.colors.onBackground,
      // @ts-expect-error
      fontFamily: theme.fonts.primary,
    },
    errorText: {
      marginTop: 5,
      fontSize: 12,
      color: theme.colors.error,
      // @ts-ignore
      paddingHorizontal: theme.isDarkTheme ? 0 : 16,
    },
  });
}

CustomInput.propTypes = {
  clearable: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  contentStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  restingLabelStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  textVerticalAlign: PropTypes.oneOf(['auto', 'top', 'bottom', 'center']),
  leftContentStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  rightContentStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  error: PropTypes.bool,
  errorText: PropTypes.string,
  onMaskPress: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onChangeText: PropTypes.func,
  keyboardType: PropTypes.oneOf([
    'default',
    'number-pad',
    'decimal-pad',
    'numeric',
    'email-address',
    'phone-pad',
    'url',
  ]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  multiline: PropTypes.bool,
  maskText: PropTypes.bool,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  rotatingPlaceholders: PropTypes.array,
  left: PropTypes.element,
  right: PropTypes.element,
  secureTextEntry: PropTypes.bool,
  testID: PropTypes.string,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  textContentType: PropTypes.string,
  inputHeight: PropTypes.number,
  centerNumber: PropTypes.number,
  relationField: PropTypes.bool,
  animateLabel: PropTypes.bool,
};

CustomInput.displayName = 'CustomInput';

export default memo(CustomInput);
