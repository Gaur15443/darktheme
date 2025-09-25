import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const RightArrow = props => (
  <Svg
    width={7}
    height={12}
    viewBox="0 0 7 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="m1 11 4.58-5L1 1"
      stroke="#888"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default RightArrow;
