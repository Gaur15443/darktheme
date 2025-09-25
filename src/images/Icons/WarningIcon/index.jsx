import React from 'react';
import Svg, {Path} from 'react-native-svg';

const WarningIcon = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    stroke="#ff4500"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}>
    <Path stroke="none" d="M0 0h24v24H0z" />
    <Path d="m10.24 3.957-8.422 14.06A1.989 1.989 0 0 0 3.518 21h16.845a1.989 1.989 0 0 0 1.7-2.983L13.64 3.957a1.989 1.989 0 0 0-3.4 0zM12 9v4M12 17h.01" />
  </Svg>
);

export default WarningIcon;
