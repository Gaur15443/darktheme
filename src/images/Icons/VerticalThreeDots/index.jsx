import * as React from "react";
import Svg, { Path } from "react-native-svg";
const VerticalThreeDots = (props) => (
  <Svg
  width={props.width}
  height={props.height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12.002 7.198a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Zm0 7.2a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Zm0 7.2a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"
      stroke="#000"
      strokeWidth={2}
    />
  </Svg>
);
export default VerticalThreeDots;