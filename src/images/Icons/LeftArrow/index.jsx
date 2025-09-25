import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const LeftArrow = props => (
  <Svg
    width={7}
    height={12}
    viewBox="0 0 7 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M6 11 1 6l5-5"
      stroke="#000"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default LeftArrow;
