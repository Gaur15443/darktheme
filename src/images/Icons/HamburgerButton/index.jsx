import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const HamburgerButton = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M20 18H4m16-6H4m16-6H4"
      stroke="#000"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
export default HamburgerButton;
