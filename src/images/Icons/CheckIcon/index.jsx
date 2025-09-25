import React from 'react';
import { Svg, Path } from 'react-native-svg';

const CheckIcon = (props) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    {...props}
  >
    <Path d="M0 0h24v24H0z" />
    <Path d="M5 12l5 5L20 7" stroke="rgb(38, 243, 4)" />
  </Svg>
);

export default CheckIcon;
