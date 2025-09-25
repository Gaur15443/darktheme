import React from 'react';
import {View} from 'react-native';
import {useTheme, Text} from 'react-native-paper';
export default function DefaultImage(props) {
  const genderToLowerCase = props?.gender?.toLowerCase?.() || '';
  const theme = useTheme();
  function setInitials() {
    const first = typeof props.firstName === 'string' ? props.firstName : '';
    const last = typeof props.lastName === 'string' ? props.lastName : '';
    const name = first.charAt(0).toUpperCase() + last.charAt(0).toUpperCase();

    return name;
  }

  return (
    <View
      {...props}
      style={{
        borderRadius: props.borderRadius || 50,
        ...(props.style || {}),
        justifyContent: 'center',
        alignItems: 'center',
        color: '#111',
        fontWeight: 600,
        width: props.width,
        height: props.height,
        backgroundColor:
          genderToLowerCase === 'male'
            ? '#C2D5F5'
            : genderToLowerCase === 'female'
              ? '#FAC3D2'
              : genderToLowerCase === 'unspecified'
                ? '#FFF0BD'
                : '#FFECDA',
      }}>
      <Text
        style={{
          fontSize: props.fontSize || 12,
          fontWeight: props.fontWeight || 500,
          color: theme.colors.text,
        }}>
        {setInitials()}
      </Text>
    </View>
  );
}
