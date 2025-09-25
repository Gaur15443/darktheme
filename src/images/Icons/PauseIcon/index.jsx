import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const PauseIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={17}
    fill="none"
    {...props}
  >
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeWidth={4}
      d="M2 2v12.5M12.175 2v12.5"
    />
  </Svg>
);
export default PauseIcon;
