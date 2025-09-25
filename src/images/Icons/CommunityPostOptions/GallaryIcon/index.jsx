import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const GallaryIcon = ({opacity = 1, props}) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    opacity={opacity}
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="m8.158 15.6 3.84-3.6 2.56 1.8 3.627-3.6 3.2 3M2.398 9v10.8h12.8m-5.12-12v-.09m11.52 7.49v-10a1 1 0 0 0-1-1H7.238a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h13.36a1 1 0 0 0 1-1"
      stroke="#E77237"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default GallaryIcon;
