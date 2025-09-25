import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useTheme, Text} from 'react-native-paper';
import PropTypes from 'prop-types';
import NewTheme from '../../common/NewTheme';
import Spinner from '../../common/ButtonSpinner';

export default function CustomButton({
  label,
  labelStyle,
  customDisabledStyles = null,
  backgroundColor,
  color,
  onPress,
  style,
  disabled,
  loading,
  ...props
}) {
  const theme = useTheme();

  // Define styles for disabled state
  const disabledStyles = customDisabledStyles || {
    color: 'white',
    shadowColor: 'transparent',
    backgroundColor: NewTheme.colors.secondaryPeach,
  };

  // Merge styles based on disabled state
  const buttonStyles = {
    backgroundColor: backgroundColor || NewTheme.colors.primaryOrange,
    padding: 10,
    borderRadius: 10,
    marginBottom: 30,
    ...(disabled ? disabledStyles : {}),
    ...style,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyles}
      disabled={disabled}
      {...props}>
      {loading ? (
        <View
          style={{
            margin: 'auto',
          }}>
          <Spinner color="white" />
        </View>
      ) : (
        <Text
          variant="bold"
          style={{
            textAlign: 'center',
            justifyContent:'center',
            fontSize: 16,
            color: color || '#fff',
            ...labelStyle,
          }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

CustomButton.propTypes = {
  label: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  onPress: PropTypes.func,
  style: PropTypes.object,
  disabled: PropTypes.bool,
};
