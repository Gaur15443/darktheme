import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, StyleSheet} from 'react-native';
const DefaultImage = ({
  width = '50',
  height = '50',
  firstName,
  lastName,
  gender,
}) => {
  const genderToLowerCase = gender?.toLowerCase?.() || '';
  const initials = `${firstName?.charAt?.(0)?.toUpperCase?.() || ''}${lastName?.charAt?.(0)?.toUpperCase?.() || ''}`;

  return (
    <View
      style={[
        styles.container,
        {
          width: width,
          height: height,
          backgroundColor:
            genderToLowerCase === 'male'
              ? '#C2D5F5'
              : genderToLowerCase === 'female'
                ? '#FAC3D2'
                : genderToLowerCase === 'unspecified'
                  ? '#FFF0BD'
                  : '#FFECDA',
        },
      ]}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
};

DefaultImage.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  gender: PropTypes.oneOf(['male', 'female', '']),
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  initials: {
    fontWeight: '600',
    color: '#111',
  },
});

export default DefaultImage;
