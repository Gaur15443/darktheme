import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const UpArrow = ({size = 16, color = 'white', ...props}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="m2.17 6.889 5.833-5.556m0 0 5.833 5.556M8.003 1.333v13.333"
      stroke={color}
      strokeWidth={2.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default UpArrow;
