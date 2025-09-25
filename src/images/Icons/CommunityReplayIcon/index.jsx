import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CommunityReplayIcon = ({ width = 15, height = 12, ...props }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 15 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M4.036 1.002 1 4.079m0 0 3.036 3.077M1 4.079h9.539A3.26 3.26 0 0 1 13.8 7.34v0a3.26 3.26 0 0 1-3.261 3.262H7.4"
      stroke="#444"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CommunityReplayIcon;
