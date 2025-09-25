import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const Cancel = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    fill="none"
    {...props}
  >
    <Path
      stroke="#DE0000"
      strokeLinecap="round"
      strokeWidth={2}
      d="M5.472 19.528 20.167 4.833M12.5 24C6.149 24 1 18.851 1 12.5S6.149 1 12.5 1 24 6.149 24 12.5 18.851 24 12.5 24Z"
    />
  </Svg>
);
export default Cancel;
