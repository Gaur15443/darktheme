import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useTheme, Text} from 'react-native-paper';
import PropTypes from 'prop-types';
import NewTheme from '../../common/NewTheme';
import Spinner from '../../common/ButtonSpinner';
import LinearGradient from 'react-native-linear-gradient';

export default function LoaderButton({
  label,
  labelStyle,
  customDisabledStyles = null,
  backgroundColor,
  gradientColor,
  spinnerColor,
  color,
  onPress,
  gradientStyles,
  disabled,
  loading,
  style,
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
    padding: 10,
    borderRadius: 10,
    ...(disabled ? disabledStyles : {}),
    ...gradientStyles,
  };

  return (
    <LinearGradient
      colors={gradientColor || ['#FFBD9C', '#FFFFFF']}
      start={{x: 0, y: 3}} // * change y here and x below to see the changes
      end={{x: 0.6, y: 0}}
      style={[buttonStyles]}>
      <TouchableOpacity style={[style]} onPress={onPress} disabled={disabled}>
        {loading ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Spinner color={spinnerColor || 'red'} />
            <Text
              variant="bold"
              style={{
                color: color || '#E77237',
                textAlign: 'center',
                fontSize: 16,
                marginLeft: 15,
                letterSpacing: 0,
              }}>
              {' We are validating the OTP'}
            </Text>
          </View>
        ) : (
          <Text
            variant="bold"
            style={{
              textAlign: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: color || '#E77237',
              ...labelStyle,
            }}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

LoaderButton.propTypes = {
  label: PropTypes.string,
  backgroundColor: PropTypes.string,
  gradientColor: PropTypes.arrayOf(PropTypes.string),
  color: PropTypes.string,
  onPress: PropTypes.func,
  gradientStyles: PropTypes.object,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  spinnerColor: PropTypes.string,
};
