import * as React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';
const RedCrossIcon = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Rect width={24} height={24} rx={2} fill="#ED2424" />
    <Path
      d="m16 8-8 8m8 0L8 8"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
export default RedCrossIcon;
