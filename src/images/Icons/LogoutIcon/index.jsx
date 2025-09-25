import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const SvgComponent = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    {...props}>
    <Path
      fill="#035997"
      fillRule="evenodd"
      d="M7.09 10.849h12.802V9.032c0-.162.087-.3.232-.37a.403.403 0 0 1 .435.048l4.48 3.565a.4.4 0 0 1 .155.322.4.4 0 0 1-.155.322l-4.48 3.564a.403.403 0 0 1-.435.05.403.403 0 0 1-.232-.372v-1.816H7.089a.607.607 0 0 1-.605-.605v-2.287c0-.332.273-.604.605-.604Z"
      clipRule="evenodd"
    />
    <Path
      fill="#E77237"
      fillRule="evenodd"
      d="M16.331 0H1.591C.716 0 0 .716 0 1.59v22.012c0 .875.716 1.59 1.59 1.59h14.741c.875 0 1.59-.715 1.59-1.59v-4.37a.631.631 0 0 0-.63-.63h-2.236a.631.631 0 0 0-.63.63v2.465H3.497v-18.2h10.93V5.96c0 .347.283.63.63.63h2.236c.347 0 .63-.283.63-.63V1.59c0-.875-.716-1.591-1.59-1.591Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgComponent;
