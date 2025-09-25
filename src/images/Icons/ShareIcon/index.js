import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const SvgComponent = props => (
  <Svg
    fill="none"
    height="25"
    strokeWidth={'1.6'}
    viewBox="0 0 20 20"
    width="25"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="m17.5002 9.54918-8.00004-5.29918v3c-7.00016 1.5-7.00016 8.5-7.00016 8.5s3-4 7.00016-3.5v3.1z"
      stroke="#000"
      stroke-linejoin="round"
      stroke-width="1.66667"
    />
  </Svg>
);
export default SvgComponent;
