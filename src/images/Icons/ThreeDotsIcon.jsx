import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const ThreeDotsIcon = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={4}
    fill="none"
    {...props}>
    <Path
      fill="#E77237"
      d="M7.997 3.778a1.778 1.778 0 1 0 0-3.555 1.778 1.778 0 0 0 0 3.555ZM14.223 3.778a1.778 1.778 0 1 0 0-3.555 1.778 1.778 0 0 0 0 3.555ZM1.778 3.778a1.778 1.778 0 1 0 0-3.555 1.778 1.778 0 0 0 0 3.555Z"
    />
  </Svg>
);
export default ThreeDotsIcon;
