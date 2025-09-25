import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={21}
    fill="none"
    {...props}
  >
    <Path
      stroke="#E77237"
      strokeLinecap="round"
      strokeWidth={2.133}
      d="m16.215 16.359 3.704 3.584m-9.6-14.08a3.84 3.84 0 0 1 3.84 3.84m4.566.682a8.363 8.363 0 1 1-16.726 0 8.363 8.363 0 0 1 16.726 0Z"
    />
  </Svg>
);
export default SvgComponent;

