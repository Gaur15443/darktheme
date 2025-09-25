import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const ViewEyeIcon = ({ height = 16, width = 16, ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    {...props}
  >
    <Path
      stroke="#EB8B5A"
      strokeWidth={1.333}
      d="M9.6 8.02c0 .86-.716 1.556-1.6 1.556-.884 0-1.6-.697-1.6-1.557S7.116 6.463 8 6.463c.884 0 1.6.697 1.6 1.556Z"
    />
  </Svg>
);
export default ViewEyeIcon;
