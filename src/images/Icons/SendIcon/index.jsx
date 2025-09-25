import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SendIcon = (props) => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m14.049 1.95-7.11 7.11M2.182 5.488l11.07-3.841a.864.864 0 0 1 1.1 1.1l-3.84 11.07c-.264.758-1.329.78-1.621.032L7.133 9.356a.86.86 0 0 0-.49-.49L2.151 7.108c-.748-.292-.727-1.357.031-1.62Z"
      stroke="#fff"
      strokeWidth={1.333}
      strokeLinecap="round"
    />
  </Svg>
);
export default SendIcon;
