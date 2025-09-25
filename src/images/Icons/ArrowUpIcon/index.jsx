import * as React from "react";
import Svg, { G, Circle, Path } from "react-native-svg";
const ArrowUpIcon = (props) => (
  <Svg
    width={52}
    height={52}
    viewBox="0 0 52 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G opacity={0.8}>
      <Circle cx={26} cy={26} r={26} fill="#E77237" />
      <Path
        d="M18.7551 25.2154L25.4999 18.7917M25.4999 18.7917L32.2447 25.2154M25.4999 18.7917L25.4999 34.2084"
        stroke="white"
        strokeWidth={3.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);
export default ArrowUpIcon;
