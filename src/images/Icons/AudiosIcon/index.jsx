import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const AudiosIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.667}
      d="M1.665 8.314A6.402 6.402 0 0 0 8 13.794m0 0a6.402 6.402 0 0 0 6.335-5.48M8 13.794V17M8 1a2.743 2.743 0 0 0-2.742 2.743V7.4a2.743 2.743 0 0 0 5.486 0V3.743A2.743 2.743 0 0 0 8 1Z"
    />
  </Svg>
);

export default AudiosIcon;
