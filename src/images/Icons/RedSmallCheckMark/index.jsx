import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const RedSmallCheckMark = props => (
  <Svg
    width={10}
    height={8}
    viewBox="0 0 10 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path d="m9 1.25-5.5 5.5L1 4.25" fill="#fff" />
    <Path
      d="m9 1.25-5.5 5.5L1 4.25"
      stroke="#E77237"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default RedSmallCheckMark;
