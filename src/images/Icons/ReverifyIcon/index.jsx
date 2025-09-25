import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const ReverifyIcon = (props) => (
  <Svg
    width="25px"
    height="30px"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect width={48} height={48} fill="white" fillOpacity={0.01} />
    <Path
      d="M19 12L31 24L19 36"
      stroke="#000000"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ReverifyIcon;
