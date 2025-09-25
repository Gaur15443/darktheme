import React, {useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import CustomTextInput from '../../../../components/CustomTextInput';
import SearchIcon from '../../../../images/Icons/SearchIcon/Index';
import {useTheme} from 'react-native-paper';

const CustomSearchBar = ({
  label,
  value,
  onChangeText,
  onPress = null,
  clearable,
  style,
  customLabelStyle,
  inputHeight = 44,
  marginHorizontal = 0,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const onFocus = () => {
    setIsFocused(true);
    // Call onPress only if it exists
    if (onPress) {
      onPress();
      if (inputRef.current) {
        inputRef.current.blur(); // Deselect the input after onPress
      }
    }
  };
  return (
    <View style={[{marginHorizontal}, style]}>
      {!isFocused && !value && (
        <View
          style={styles.iconWrapper}
          accessibilityLabel="Search icon"
          accessible={true}>
          <SearchIcon width={24} height={24} />
        </View>
      )}
      <CustomTextInput
        ref={inputRef}
        autoCorrect
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        clearable={clearable}
        style={{backgroundColor: 'white'}}
        inputHeight={inputHeight}
        customLabelStyle={{
          marginLeft: isFocused || value ? 0 : 32,

          ...customLabelStyle,
        }}
        onFocus={() => onFocus()}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={`Search input for ${label}`}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: 10,
    left: 10,
    zIndex: 1,
  },
});

export default CustomSearchBar;
