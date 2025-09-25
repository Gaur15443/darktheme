import React from 'react';
import PropTypes from 'prop-types';
import {View, Image} from 'react-native';
import {Text} from 'react-native-paper';

function DefaultImage({
  firstName,
  lastName,
  gender,
  style = {},
  size = 50,
  ...props
}) {
  const genderToLowerCase = gender?.toLowerCase?.() || '';

  function setInitials() {
    const first = typeof firstName === 'string' ? firstName : '';
    const last = typeof lastName === 'string' ? lastName : '';
    const name = first.charAt(0).toUpperCase() + last.charAt(0).toUpperCase();

    return name;
  }

  // Calculate font size based on the component's size
  const calculateFontSize = () => {
    return size * 0.3;
  };

  return (
    <View
      {...props}
      accessible={true}
      accessibilityLabel={setInitials()}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor:
          genderToLowerCase === 'male'
            ? '#C2D5F5'
            : genderToLowerCase === 'female'
              ? '#FAC3D2'
              : genderToLowerCase === 'unspecified'
                ? '#FFF0BD'
                : '#FFECDA',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}>
      <Image
        source={{
          uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAWElEQVR42mP8/wcAAwAB/AR+0ARAAwAAAABJRU5ErkJggg==',
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      <Text
        style={{
          position: 'absolute',
          fontSize: calculateFontSize(),
          fontWeight: '600',
          color: '#111',
        }}>
        {setInitials()}
      </Text>
    </View>
  );
}

DefaultImage.propTypes = {
  size: PropTypes.number,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  gender: PropTypes.oneOf(['male', 'female', '']).isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default DefaultImage;
