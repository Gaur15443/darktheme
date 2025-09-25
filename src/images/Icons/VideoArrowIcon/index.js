import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={17}
    height={15}
    viewBox="0 0 17 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M2.00006 2L7.73535 7.5L2.00006 13"
      stroke="#E77237"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.26471 2L15 7.5L9.26471 13"
      stroke="#E77237"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
