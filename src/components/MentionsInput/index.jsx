import React, {
  forwardRef,
  Fragment,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import PropTypes from 'prop-types';
import {useTheme, Text, Portal} from 'react-native-paper';
import {MentionInput} from 'react-native-controlled-mentions';
import DefaultImage from '../stories/DefaultImage';
import {useDispatch, useSelector} from 'react-redux';
import {mentionUsers} from './../../store/apps/tagSlice/index';
import useKeyboardHeight from './../../hooks/useKeyboardheight';
import {colors} from '../../common/NewTheme';
import {fetchSingleMember} from '../../store/apps/createCommunity';

/**
 * @typedef {Object} CustomTheme
 * @property {Object} colors - The colors object within the custom theme
 * @property {string} colors.primary - The primary color
 * */

/**
 * Custom input component.
 *
 * @param {Object} props - Component props.
 * @param {string} [props.customApi] - Custom api for tag suggestions.
 * @param {Object} [props.style] - Styles for the TextInput container.
 * @param {Object} [props.bottomStyles] - Styles for the Bottom section.
 * @param {boolean} [props.error] - Indicates if there is an error with the input.
 * @param {string} [props.errorText] - Error message to display, if any.
 * @param {('default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' | 'url')} [props.keyboardType] - Type of keyboard to display, if not defined it defaults to `default`
 * @param {string|React.ReactNode} [props.label] - Label for the input field. Can be a string or a React node.
 * @param {function} [props.onChangeText] - Function to handle text changes in the input field.
 * @param {function} [props.onFocus] - Function to handle input field focus.
 * @param {function} [props.onBlur] - Function to handle input field blur.
 * @param {string} [props.placeholder] - Placeholder text for the input field.
 * @param {string} [props.placeholderTextColor] - Placeholder color.
 * @param {boolean} [props.required] - If `true`, asterisk will be appended to the label, else it won't.
 * @param {React.ReactNode} [props.right] - Content to append on the right of the TextInput.
 * @param {React.ReactNode} [props.bottom] - Content to append on the bottom of the TextInput.
 * @param {string} props.testID - Unique id to be used for automation testing.
 * @param {string} props.textContentType - type of text content. Refer React native docs.
 * @param {('auto', 'bottom', 'center', 'top')} props.textAlignVertical - Vertical alignment of the input's text.
 * @param {string} [props.value] - default value of the text input
 * @param {CustomTheme} [props.customTheme] - Custom theme in case you need to override the default.
 * @returns {React.ReactNode} React component representing the custom input.
 */
const CustomMentionsInput = forwardRef(
  (
    {
      customApi,
      style = {},
      contentStyle = {},
      customTheme = {},
      error = false,
      errorText,
      showBorder = true,
      keyboardType = 'default',
      label = '',
      multiline = false,
      onChangeText = () => undefined,
      onBlur = () => undefined,
      placeholder = '',
      placeholderTextColor = 'rgba(51, 48, 60, 0.6)',
      required,
      right,
      bottom,
      bottomStyles = {},
      testID,
      accessibilityLabel,
      textContentType = 'none',
      onFocus = () => undefined,
      value = '',
      disabled = false,
      textAlignVertical = 'top',
      tagStyles = {},
      editorContainerStyles = {},
      communityId,
      useCommunityApi = false,
      ...props
    },
    ref,
  ) => {
    const keyboardHeight = useKeyboardHeight();
    const dispatch = useDispatch();
    const mainTheme = useTheme();
    const inputHeight = 40;
    const urlRegex =
      /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(xn--)?[a-z0-9-]{2,20}\b([-a-zA-Z0-9@:%_\+\[\],.~#?&\/=]*[-a-zA-Z0-9@:%_\+\]~#?&\/=])*/gi;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi;

    const styles = useCreateStyles(inputHeight);
    const textFieldRef = useRef();

    const [results, setResults] = useState([]);
    const [contentSize, setContentSize] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState('');
    const [caretPosition, setCaretPosition] = useState({x: 0, y: 0});
    const [computedLabelWidth, setComputedLabelWidth] = useState(0);
    const labelPosition = useRef(new Animated.Value(text ? 1 : 0)).current;
    const groupId = useSelector(state => state?.Tree?.groupId);

    const mergedTheme = {
      ...mainTheme,
      ...customTheme,
      colors: {
        ...mainTheme.colors,
        ...customTheme.colors,
      },
    };

    const theme = mergedTheme;

    const maxScrollViewHeight = useMemo(() => {
      if (results.length >= 4) {
        return 200;
      } else if (results.length === 3) {
        return 150;
      } else if (results.length === 2) {
        return 100;
      } else {
        return 50;
      }
    }, [results]);

    useEffect(() => {
      setResults([]);
    }, [keyboardHeight]);

    useEffect(() => {
      setText(value);
      if (value) {
        animatedLabel(1);
      } else {
        animatedLabel(isFocused ? 1 : 0);
      }
    }, [value]);

    useEffect(() => {
      if (searchTerm) {
        if (useCommunityApi) {
          (async () => {
            try {
              const payload = {
                searchStr: searchTerm,
              };
              const response = await dispatch(
                fetchSingleMember({communityId, payload}),
              ).unwrap();
              if (response?.data) {
                setResults(response?.data);
              }
            } catch (_error) {
              // toast not needed, fail silently.
              /** empty. */
            }
          })();
        } else {
          const payload = {
            searchTerm,
            customApi,
            groupId
          };
          (async () => {
            try {
              const res = await dispatch(mentionUsers(payload)).unwrap();
              setResults(res);
            } catch (_error) {
              // toast not needed, fail silently.
              /** empty. */
            }
          })();
        }
      }
    }, [searchTerm]);

    const renderSuggestions = function () {
      return function ({keyword, onSuggestionPress}) {
        if (keyword == null) {
          return null;
        }
        setSearchTerm(keyword);

        function formatSuggestion(data) {
          if (!useCommunityApi) {
            const formattedData = {
              ...data,
              // differentiate links posted from web app from imeuswe tags.
              id: `imeuswe:${data.id}`,
            };
            onSuggestionPress(formattedData);
          } else {
            const formattedData = {
              ...data,
              // differentiate links posted from web app from imeuswe tags.
              name:
                data?.member?.personalDetails?.name +
                ' ' +
                data?.member?.personalDetails?.lastname,
              id: `imeuswe:${data?.memberId}`,
            };
            onSuggestionPress(formattedData);
          }
        }

        return (
          <>
            {results.length > 0 ? (
              <Portal>
                <ScrollView
                  style={{
                    backgroundColor: theme.colors.onBackground,
                    marginHorizontal: 30,
                    right: 25,
                    left: 0,
                    maxHeight: maxScrollViewHeight,
                    borderRadius: theme.roundness,
                    top:
                      results.length === 1
                        ? caretPosition.y + 150
                        : results.length === 2
                          ? caretPosition.y + 100
                          : results.length === 3
                            ? caretPosition.y + 50
                            : caretPosition.y,
                    paddingRight: 10,
                    ...tagStyles,
                  }}
                  showsVerticalScrollIndicator
                  persistentScrollbar
                  keyboardShouldPersistTaps="always">
                  {results.map(data => (
                    <Pressable
                      key={data?.id || data?.member?.email}
                      onPress={() => formatSuggestion(data)}
                      style={{
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      {data?.personalDetails?.profilepic?.length > 0 ||
                      data?.member?.personalDetails?.profilepic?.length > 0 ? (
                        <Image
                          source={{
                            uri:
                              data?.personalDetails?.profilepic ||
                              data?.member?.personalDetails?.profilepic,
                          }}
                          height={30}
                          width={30}
                          style={{
                            borderRadius: 15,
                            marginRight: 8,
                          }}
                        />
                      ) : (
                        <DefaultImage
                          gender={
                            data?.personalDetails?.gender ||
                            data?.member?.personalDetails?.gender
                          }
                          width={30}
                          height={30}
                          firstName={
                            data?.personalDetails?.name ||
                            data?.member?.personalDetails?.name
                          }
                          lastName={
                            data?.personalDetails?.lastname ||
                            data?.member?.personalDetails?.lastName
                          }
                          style={{
                            marginRight: 8,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          color: theme.colors.text,
                        }}>
                        {data?.name ||
                          data?.member?.personalDetails?.name +
                            ' ' +
                            data?.member?.personalDetails?.lastname}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Portal>
            ) : (
              <View />
            )}
          </>
        );
      };
    };

    function handleFocus(event) {
      setIsFocused(true);
      animatedLabel(1);
      onFocus(event);
    }

    function handleBlur(event) {
      setIsFocused(false);
      onBlur(event);
      if (!text) {
        animatedLabel(0);
      }
    }

    function handleTextChange(text) {
      setText(text);
      if (typeof onChangeText === 'function') {
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

    /**
     * Forces input to be focussed if user clicked on label.
     */
    function forceFocus() {
      if (!isFocused && typeof textFieldRef.current.focus === 'function') {
        textFieldRef.current.focus();
      }
    }

    const labelStyle = {
      position: 'absolute',
      zIndex: 2,
      color: 'rgba(51, 48, 60, 0.3)',
      fontFamily: 'PublicSans Regular',
      backgroundColor: 'transparent',
      paddingStart: labelPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 6],
      }),
      left: labelPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 6],
      }),
      top: labelPosition.interpolate({
        inputRange: [0, 1],
        // division by 4 is to make it centered
        outputRange: [inputHeight / 4, -10],
      }),
      opacity: labelPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [0.68, 1],
      }),
      fontSize: labelPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 16],
      }),
    };

    function handleLabelLayoutChange(event) {
      setComputedLabelWidth(event.nativeEvent.layout.width);
    }

    function onSelectionChange({nativeEvent: {selection}}) {
      if (textFieldRef.current) {
        textFieldRef.current.measure((_fx, _fy, _width, height, px, py) => {
          const {start} = selection;

          const textUpToCaret = text?.slice?.(0, start);
          const numLines = (textUpToCaret?.match?.(/\n/g) || []).length;

          const charWidth = 7; // just an approximation
          const lineStartIndex = textUpToCaret?.lastIndexOf?.('\n') + 1;
          const caretX = px + charWidth * (start - lineStartIndex);

          const lineHeight = 20;
          const totalLineHeight = lineHeight * numLines;
          const caretY = py + numLines * lineHeight;
          let adjustedCaretY = caretY;

          const screenHeight = Dimensions.get('window').height;
          const topSpace = screenHeight - keyboardHeight;
          let spaceDifference = 0;

          if (totalLineHeight > height) {
            spaceDifference =
              screenHeight - (topSpace + (totalLineHeight % height));

            setCaretPosition({
              x: 0,
              y: spaceDifference - 200 - 20,
            });
            return;
          }

          if (totalLineHeight > height) {
            adjustedCaretY = (totalLineHeight % height) + py;
          }

          const availableSpaceBelow =
            screenHeight - adjustedCaretY - keyboardHeight;

          if (availableSpaceBelow <= 200) {
            setCaretPosition({
              x: 0,
              y: adjustedCaretY - 200 - 20,
            });
          } else {
            setCaretPosition({x: caretX, y: adjustedCaretY - 200});
          }
        });
      }
    }

    return (
      <View
        style={[
          style,
          {
            height: 'auto',
            backgroundColor: 'transparent',
          },
        ]}>
        {label?.length > 0 && (
          <Animated.Text
            onLayout={handleLabelLayoutChange}
            onPress={forceFocus}
            style={[
              styles.label,
              labelStyle,
              {
                color:
                  isFocused && !error
                    ? theme.colors.primary
                    : error
                      ? theme.colors.error
                      : theme.colors.inputColor,
              },
            ]}>
            {label}
            {required && <Text style={{color: 'red'}}>*</Text>}
          </Animated.Text>
        )}
        {(isFocused || text?.length > 0) && (
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
        <View
          style={[
            styles.innerContainer,
            editorContainerStyles,
            {
              borderColor:
                isFocused && !error
                  ? theme.colors.primary
                  : error
                    ? theme.colors.error
                    : 'rgba(51, 48, 60, 0.3)',
              borderWidth: !showBorder ? 0 : isFocused ? 2 : error ? 2 : 1,
            },
            isFocused &&
              !error && {
                color: theme.colors.primary,
              },
          ]}>
          <View style={styles.inputContainer}>
            <Wrapper bottom={bottom} bottomStyles={bottomStyles}>
              <MentionInput
                {...props}
                showsVerticalScrollIndicator={false}
                onSelectionChange={onSelectionChange}
                inputRef={el => {
                  textFieldRef.current = el;
                  if (typeof ref === 'function') {
                    ref(el);
                  } else if (ref && ref.hasOwnProperty('current')) {
                    ref.current = el;
                  }
                }}
                onContentSizeChange={e =>
                  setContentSize(e.nativeEvent.contentSize.height)
                }
                partTypes={[
                  {
                    trigger: '@',
                    renderSuggestions: renderSuggestions(),
                    textStyle: {color: colors.secondaryLightBlue},
                  },
                  {
                    pattern: urlRegex,
                    textStyle: {color: colors.secondaryLightBlue},
                  },
                  {
                    pattern: emailRegex,
                    textStyle: {color: colors.secondaryLightBlue},
                  },
                ]}
                style={[
                  styles.input,
                  {
                    fontFamily: 'PublicSans Regular',
                    padding: 12,
                    fontSize: 18,
                    lineHeight: 20,
                    color: theme.colors.text,
                    borderWidth: 0,
                    flex: 1,
                    width: '100%',
                    backgroundColor: theme.colors.onBackground,
                  },
                  contentStyle,
                ]}
                containerStyle={{
                  width: contentStyle?.width || '100%',
                }}
                accessibilityLabel={accessibilityLabel || testID}
                keyboardType={keyboardType}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleTextChange}
                value={text}
                textAlignVertical={textAlignVertical}
                textContentType={textContentType}
                editable={!disabled}
                placeholder={placeholder?.length ? placeholder : null}
                placeholderTextColor={placeholderTextColor}
              />
              {bottom}
            </Wrapper>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: theme.colors.onBackground,
              }}>
              {right && (
                <View
                  style={{
                    right: 0,
                    backgroundColor: theme.colors.onBackground,
                    height: inputHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
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

function Wrapper({bottom, bottomStyles, children}) {
  if (bottom) {
    return <View style={[{flex: 1}, bottomStyles]}>{children}</View>;
  }

  return <Fragment>{children}</Fragment>;
}

function useCreateStyles(inputHeight) {
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
      borderColor: theme.colors.inputColor,
      borderRadius: 5,
      justifyContent: 'center',
      backgroundColor: theme.colors.onBackground,
      overflow: 'hidden',
    },
    label: {
      position: 'absolute',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    input: {
      flex: 1,
      width: '100%',
      fontSize: 16,
      color: theme.colors.text,
      paddingStart: 12,
      backgroundColor: theme.colors.onBackground,
    },
    errorText: {
      marginTop: 5,
      fontSize: 12,
      color: theme.colors.error,
      paddingHorizontal: 16,
    },
  });
}

CustomMentionsInput.propTypes = {
  contentStyle: PropTypes.object,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  tagStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  editorContainerStyles: PropTypes.object,
  error: PropTypes.bool,
  errorText: PropTypes.string,
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
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  right: PropTypes.element,
  bottom: PropTypes.element,
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  textContentType: PropTypes.string,
  textAlignVertical: PropTypes.oneOf(['auto', 'bottom', 'center', 'top']),
};

CustomMentionsInput.displayName = 'CustomMentionsInput';

export default memo(CustomMentionsInput);
