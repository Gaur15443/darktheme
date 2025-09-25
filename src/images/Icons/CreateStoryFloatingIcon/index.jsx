import * as React from "react";
import Svg, { G, Circle, Path } from "react-native-svg";
const CreateStoryFloatingIcon = (props) => (
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
        d="M25.9992 18.0008L25.9992 33.9992M35.9985 26L16 26"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </G>
  </Svg>
);
export default CreateStoryFloatingIcon;
