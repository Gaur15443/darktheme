import * as React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';
const EditInfoCheckBox = props => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Rect
      x={0.5}
      y={0.5}
      width={15}
      height={15}
      rx={3.5}
      fill="#E97D47"
      stroke="#E97D47"
    />
    <Path d="m12 5-5.5 5.5L4 8" fill="#E97D47" />
    <Path
      d="m12 5-5.5 5.5L4 8"
      stroke="#fff"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default EditInfoCheckBox;
