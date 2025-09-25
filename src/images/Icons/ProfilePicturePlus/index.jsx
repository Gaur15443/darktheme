import React from 'react';
import {View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

const ProfilePicturePlus = ({color}) => {
  return (
    <View>
      <Svg width="45" height="45" viewBox="0 0 68 68">
        <Circle
          cx="34"
          cy="34"
          r="32"
          fill="white"
          stroke={color || '#3473DC'}
          strokeWidth="3"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M33.9967 44.2169C34.5086 44.2187 34.9716 44.0107 35.3071 43.6753C35.6426 43.3398 35.8505 42.8768 35.8487 42.3649V35.8531L42.3812 35.8538C42.8931 35.8555 43.3561 35.6476 43.6916 35.3122C44.0253 34.9784 44.235 34.5137 44.2332 34.0018C44.2332 32.9779 43.405 32.1497 42.3812 32.1497L35.8487 32.149V25.6195C35.8487 24.5957 35.0205 23.7675 33.9967 23.7675C32.9728 23.7675 32.1446 24.5957 32.1446 25.6195V32.1486L25.6201 32.148C24.598 32.1462 23.7698 32.9744 23.7681 34C23.7681 35.0239 24.5962 35.8521 25.6201 35.8521L32.1446 35.8527V42.3649C32.1446 43.3887 32.9728 44.2169 33.9967 44.2169Z"
          fill={color || '#3473DC'}
        />
      </Svg>
    </View>
  );
};

export default ProfilePicturePlus;
