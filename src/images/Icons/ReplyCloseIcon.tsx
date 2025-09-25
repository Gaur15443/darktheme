import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Svg, {Path} from 'react-native-svg';

export default function ReplyCloseIcon() {
  return (
    <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <Path
        d="M9 1L1 9M9 9L1 1"
        stroke="#13102B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
