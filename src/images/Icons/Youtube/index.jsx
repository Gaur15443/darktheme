import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={31}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="red"
        d="M15.648 31c8.56 0 15.5-6.94 15.5-15.5 0-8.56-6.94-15.5-15.5-15.5-8.56 0-15.5 6.94-15.5 15.5 0 8.56 6.94 15.5 15.5 15.5Z"
      />
      <Path
        fill="#fff"
        d="M20.72 9.67H10.576a3.086 3.086 0 0 0-3.086 3.087v5.486a3.086 3.086 0 0 0 3.086 3.088H20.72a3.086 3.086 0 0 0 3.086-3.088v-5.486a3.084 3.084 0 0 0-3.086-3.088ZM13.5 18v-5l4.299 2.5-4.3 2.5Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M.148 0h31v31h-31z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgComponent;
