import * as React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
const TimerIcon = ({color = '#E77237', ...props}) => (
  <Svg
    width={22}
    height={22}
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M14.239 14.011a1 1 0 0 0 .632-1.897zm-2.778-1.98h-1a1 1 0 0 0 .684.949zm1-4.312a1 1 0 1 0-2 0zm2.41 4.395-3.094-1.031-.632 1.897 3.094 1.031zm-2.41-.083V7.72h-2v4.312zM18.71 11a7.25 7.25 0 0 1-7.25 7.25v2A9.25 9.25 0 0 0 20.71 11zm-7.25 7.25A7.25 7.25 0 0 1 4.21 11h-2a9.25 9.25 0 0 0 9.25 9.25zM4.21 11a7.25 7.25 0 0 1 7.25-7.25v-2A9.25 9.25 0 0 0 2.21 11zm7.25-7.25A7.25 7.25 0 0 1 18.71 11h2a9.25 9.25 0 0 0-9.25-9.25z"
      fill={color}
    />
  </Svg>
);
export default TimerIcon;
