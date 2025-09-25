import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const SvgComponent = ({width = 13, height = 11}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 13 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M11.7851 2L4.48753 9.33879L2 6.8372"
      stroke="#E77237"
      stroke-width="2.03855"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
export default SvgComponent;
