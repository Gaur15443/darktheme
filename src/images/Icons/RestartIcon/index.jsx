import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const RestartIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}
  >
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 18.198a3.6 3.6 0 0 1-3.6-3.6v-7.2a3.6 3.6 0 0 1 3.6-3.6h5.4m4.8 0H17a3.6 3.6 0 0 1 3.6 3.6v7.2a3.6 3.6 0 0 1-3.6 3.6H9.2m0 0 2.4-2.4m-2.4 2.4 2.4 2.4m-2.4-14.4 2.4-2.4-2.4-2.4"
    />
  </Svg>
);
export default RestartIcon;
