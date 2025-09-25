import * as React from 'react';
import Svg, {G, Circle, Path, Defs} from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const UploadImagePlaceHolder = props => (
  <Svg
    width={108}
    height={108}
    viewBox="0 0 108 108"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <G filter="url(#a)">
      <Circle cx={54} cy={50} r={50} fill="#fff" />
      <Path
        d="m48.197 58.934 9.059-8.525 4.263 4.262m-13.322 4.263h10.657a3.197 3.197 0 0 0 3.197-3.197V50.41m-13.854 8.525A3.197 3.197 0 0 1 45 55.737V45.08a3.197 3.197 0 0 1 3.197-3.197h6.927m5.862 5.146v-3.015m0 0V41m0 3.014H57.97m3.015 0H64M51.394 46.68a1.599 1.599 0 1 1-3.197 0 1.599 1.599 0 0 1 3.197 0"
        stroke="#E77237"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default UploadImagePlaceHolder;
