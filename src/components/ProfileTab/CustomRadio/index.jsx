import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';
import { CustomFilledCircle } from '../../../images';

const CustomRadio = ({
  label,
  disabled = false,
  checked,
  onPress,
  labelStyle = {},
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onPress={onPress}>
      <View
        style={{
          height: 24,
          width: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: checked
            ? theme.colors.primary
            : theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
          backgroundColor: (theme.isDarkTheme ? "#fff" : "transparent"),
        }}>
        {checked && (
          <CustomFilledCircle accessibilityLabel={'CustomFilledCircle'} />
        )}
      </View>
      <Text
        style={[{ marginRight: 25, color: theme.isDarkTheme ? '#fff' : 'grey' }, { ...labelStyle }]}
        accessibilityLabel={`Radio-${label}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

CustomRadio.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
  labelStyle: PropTypes.object,
};

CustomRadio.displayName = 'CustomRadio';

export default memo(CustomRadio);
