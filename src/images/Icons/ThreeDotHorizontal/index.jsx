import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';
const ThreeDotHorizontal = props => (
  <Svg
    width={14}
    height={14}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <G clipPath="url(#a)" fill="#E77237">
      <Path d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0m0 13.125A6.125 6.125 0 1 1 7 .875a6.125 6.125 0 0 1 0 12.25" />
      <Path d="M7 7.875a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75m3.063 0a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75m-6.125 0a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75" />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h14v14H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default ThreeDotHorizontal;
