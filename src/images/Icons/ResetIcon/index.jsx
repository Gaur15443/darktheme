import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M5.81654 21.5999L2.40039 17.9999M2.40039 17.9999L5.81654 14.3999M2.40039 17.9999H19.2004C20.5259 17.9999 21.6004 16.9254 21.6004 15.5999V11.9999M18.1842 2.3999L21.6004 5.9999M21.6004 5.9999L18.1842 9.5999M21.6004 5.9999L4.80039 5.9999C3.47491 5.9999 2.40039 7.07442 2.40039 8.3999L2.40039 11.9999"
      stroke="#E77237"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
