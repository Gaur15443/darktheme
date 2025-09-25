import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CancelModalIcon = (props) => (
  <Svg
    width={12}
    height={12}
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1.41677 1.41657L8.73167 8.73147M1.41677 8.73147L8.73167 1.41657"
      stroke="#E77237"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CancelModalIcon;
