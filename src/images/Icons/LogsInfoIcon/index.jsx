import React from 'react';
import Svg, {Path} from 'react-native-svg';

const LogsInfoIcon = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    stroke="#3473DC"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}>
    <Path stroke="none" d="M0 0h24v24H0z" />
    <Path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 9h.01" />
    <Path d="M11 12h1v4h1" />
  </Svg>
);

export default LogsInfoIcon;
