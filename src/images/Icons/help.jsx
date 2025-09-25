import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={30}
    fill="none"
    {...props}
  >
    <Path
      stroke="#2D70E0"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M14.999 20.625v.05m-2.812-9.138c0-1.582 1.26-2.865 2.813-2.865 1.553 0 2.813 1.283 2.813 2.865 0 1.583-1.26 2.866-2.813 2.866l-.001 1.91M26.25 15c0 6.213-5.037 11.25-11.25 11.25S3.75 21.213 3.75 15 8.787 3.75 15 3.75 26.25 8.787 26.25 15Z"
    />
  </Svg>
);
export default SvgComponent;
