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
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import {useTheme, Text, Portal} from 'react-native-paper';
import PropTypes from 'prop-types';
import NewTheme from '../common/NewTheme';
import {useIsFocused} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconDown from 'react-native-vector-icons/FontAwesome';
import {ScrollView} from 'react-native-gesture-handler';

const CustomDropdown = forwardRef(
  (
    {
      style = {},
      error = false,
      errorText,
      label = '',
      onFocus = () => undefined,
      onBlur = () => undefined,
      placeholder = '',
      placeholderTextColor = 'rgba(51, 48, 60, 0.6)',
      options = [],
      required,
      left,
      right,
      testID,
      accessibilityLabel,
      value = '',
      defaultValue = '',
      inputHeight = 40,
      maxDropDownHeight = 200,
      centerNumber = 4,
      onOptionSelect = () => undefined,
      customTheme = {},
      feedback,
      feedbackIconColor = '#3473DC',
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
      },
    };
    const isIos = Platform.OS === 'ios';
    const theme = mergedTheme;
    const pageIsFocused = useIsFocused();
    const styles = createStyles(inputHeight, maxDropDownHeight);
    const [isFocused, setIsFocused] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue);
    const pressableRef = useRef(null);
    const labelPosition = useRef(
      new Animated.Value(selectedValue ? 1 : 0),
    ).current;
    const [computedLabelWidth, setComputedLabelWidth] = useState(0);
    const [computedHeight, setComputedHeight] = useState(0);

    const [measurements, setMeasurements] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
    const windowHeight = Dimensions.get('window').height;

    const measurePressable = () => {
      if (pressableRef.current) {
        pressableRef.current.measure((x, y, width, height, pageX, pageY) => {
          setMeasurements({x, y, width, height, pageX, pageY});

          const dropdownTop = pageY + height;
          const dropdownLeft = pageX;

          const spaceBelow = windowHeight - dropdownTop;
          const dropdownHeight = Math.min(options.length * 50, 200);

          if (spaceBelow < dropdownHeight) {
            setDropdownPosition({
              top: pageY - dropdownHeight,
              left: dropdownLeft,
            });
          } else {
            setDropdownPosition({
              top: dropdownTop,
              left: dropdownLeft,
            });
          }
        });
      }
    };

    useEffect(() => {
      if (selectedValue) {
        animatedLabel(1);
      } else {
        animatedLabel(isFocused ? 1 : 0);
      }
    }, [selectedValue]);

    function handleFocus(event) {
      setIsFocused(true);
      animatedLabel(1);
      onFocus(event);
    }

    function handleBlur(event) {
      setIsFocused(false);
      onBlur(event);
      if (!selectedValue) {
        animatedLabel(0);
      }
    }

    function animatedLabel(toValue) {
      Animated.timing(labelPosition, {
        toValue: toValue,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    function toggleDropdown() {
      measurePressable();
      setDropdownVisible(!dropdownVisible);
      if (!dropdownVisible) {
        handleFocus();
      } else {
        handleBlur();
      }
    }

    function selectOption(option) {
      handleBlur();
      setSelectedValue(option?.label);
      setDropdownVisible(false);
      onOptionSelect(option);
    }

    function handleLabelLayoutChange(event) {
      setComputedLabelWidth(event.nativeEvent.layout.width);
    }

    function handleHeightLayoutChange(event) {
      setComputedHeight(event.nativeEvent.layout.height);
    }

    const labelStyle = useMemo(() => {
      return {
        position: 'absolute',
        zIndex: 2,
        color: 'rgba(51, 48, 60, 0.3)',
        fontFamily: 'PublicSans Regular',
        paddingStart: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [left ? 0 : 12, 4],
        }),
        left: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [left ? 40 : 0, 10],
        }),
        top: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [inputHeight / centerNumber, isIos ? -7 : -8],
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
    }, [left, inputHeight, centerNumber]);

    return (
      <View
        style={[
          style,
          {
            backgroundColor: 'transparent',
          },
        ]}
        accessibilityLabel={accessibilityLabel}>
        {label?.length > 0 && (
          <Animated.Text
            onLayout={handleLabelLayoutChange}
            style={[
              styles.label,
              labelStyle,
              {
                color:
                  isFocused && !error
                    ? NewTheme.colors.primaryOrange
                    : error
                      ? theme.colors.error
                      : theme.colors.inputColor,
              },
            ]}>
            {label}
            {required && <Text style={{color: 'red'}}>*</Text>}
          </Animated.Text>
        )}

        {(isFocused || value?.length > 0) && (
          <View
            style={{
              position: 'absolute',
              backgroundColor: 'transparent',
              width: computedLabelWidth,
              height: 1,
              left: 11,
              top: 0,
              zIndex: 1,
              borderTopColor: '#fff',
              borderTopWidth: 2,
            }}
          />
        )}

        <Pressable
          ref={pressableRef}
          onLayout={measurePressable}
          onPress={toggleDropdown}
          style={[
            styles.inputContainer,
            {
              borderColor:
                isFocused && !error
                  ? NewTheme.colors.primaryOrange
                  : error
                    ? theme.colors.error
                    : 'rgba(51, 48, 60, 0.3)',
              borderWidth: isFocused ? 2 : error ? 2 : 1,
            },
          ]}>
          <Text
            style={[
              styles.selectedText,
              {
                color: selectedValue ? theme.colors.text : placeholderTextColor,
              },
            ]}>
            {selectedValue || placeholder}
          </Text>
          {right && (
            <View
              style={{
                position: 'absolute',
                right: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {right}
            </View>
          )}

          <IconDown
            name="chevron-down"
            size={10}
            color={
              isFocused && !error
                ? NewTheme.colors.primaryOrange
                : error
                  ? theme.colors.error
                  : 'rgba(51, 48, 60, 0.3)'
            }
            style={{
              position: 'absolute',
              right: 15,
              top: '50%',
              transform: [{translateY: -7}],
            }}
          />
        </Pressable>
        {dropdownVisible && (
          <Portal>
            <View
              style={{
                backgroundColor: 'transparent',
                flex: 1,
              }}
              onTouchStart={e => {
                const touchY = e.nativeEvent.pageY;
                if (
                  touchY < dropdownPosition.top ||
                  touchY > dropdownPosition.top + computedHeight
                ) {
                  setDropdownVisible(false);
                  handleBlur();
                }
              }}>
              <View
                style={[
                  styles.dropdown,
                  {
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: measurements ? measurements.width : '100%',
                  },
                ]}>
                <ScrollView onLayout={handleHeightLayoutChange}>
                  {options.map(item => (
                    <TouchableOpacity
                      key={String(item.value)}
                      style={[
                        styles.dropdownItem,
                        {
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor:
                            selectedValue === item.value
                              ? '#D9D9D9'
                              : 'transparent',
                          borderRadius: 5,
                        },
                      ]}
                      onPress={() => selectOption(item)}
                      accessibilityLabel={`option${item.label}`}>
                      <View style={{flex: 11}}>
                        <Text style={styles.dropdownLabel}>{item.label}</Text>
                        {item.description ? (
                          <Text style={styles.dropdownDescription}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                      {feedback && value === item.value && (
                        <Icon
                          name="check"
                          size={20}
                          color={feedbackIconColor}
                          style={{flex: 1}}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Portal>
        )}

        {errorText?.length && error && (
          <Text style={styles.errorText}>{errorText}</Text>
        )}
      </View>
    );
  },
);

function createStyles(inputHeight, maxDropDownHeight) {
  return StyleSheet.create({
    inputContainer: {
      height: inputHeight,
      justifyContent: 'center',
      borderRadius: 5,
      paddingHorizontal: 10,
    },
    selectedText: {
      fontSize: 16,
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderRadius: 5,
      elevation: 5,
      zIndex: 1000,
      maxHeight: maxDropDownHeight,
    },
    dropdownItem: {
      padding: 10,
      zIndex: 1000,
    },
    dropdownText: {
      fontSize: 16,
    },
    errorText: {
      color: 'red',
      marginTop: 5,
    },
    dropdownLabel: {
      color: 'black',
      fontWeight: '700',
    },
    dropdownDescription: {
      color: 'gray',
      fontSize: 12,
    },
  });
}

CustomDropdown.propTypes = {
  error: PropTypes.bool,
  errorText: PropTypes.string,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  value: PropTypes.string,
  left: PropTypes.element,
  right: PropTypes.element,
  inputHeight: PropTypes.number,
  maxDropDownHeight: PropTypes.number,
  centerNumber: PropTypes.number,
  testID: PropTypes.string,
  feedback: PropTypes.bool,
};

export default memo(CustomDropdown);
