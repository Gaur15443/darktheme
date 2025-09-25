import * as React from "react";
import Svg, { Path } from "react-native-svg";
const ChangeLogo = (props) => (
  <Svg
    width={21}
    height={20}
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m4.197 18.934 9.059-8.525 4.263 4.262M4.197 18.934h10.657a3.197 3.197 0 0 0 3.197-3.197V10.41M4.197 18.934A3.197 3.197 0 0 1 1 15.737V5.08a3.197 3.197 0 0 1 3.197-3.197h6.927m5.862 5.146V4.014m0 0V1m0 3.014H13.97m3.015 0H20M7.394 6.68a1.599 1.599 0 1 1-3.197 0 1.599 1.599 0 0 1 3.197 0"
      stroke="#E77237"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ChangeLogo;
