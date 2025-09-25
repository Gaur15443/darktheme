import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const PlusIcon = ({
  size = 20,
  color = '#E77237',
  strokeWidth = 2,
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M10 5v10m5-5H5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);
export default PlusIcon;
