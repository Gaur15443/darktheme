import * as React from "react";
import Svg, { Path } from "react-native-svg";
const ExitIcon = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M11.98 20.302H4.507a.83.83 0 0 1-.83-.83V4.526a.83.83 0 0 1 .83-.83h7.473a.83.83 0 1 0 0-1.66H4.507a2.494 2.494 0 0 0-2.491 2.49v14.946a2.494 2.494 0 0 0 2.49 2.491h7.474a.83.83 0 1 0 0-1.66Z"
      fill="red"
      stroke="red"
      strokeWidth={0.417}
    />
    <Path
      d="m21.76 11.409-5.048-4.982a.83.83 0 1 0-1.166 1.182l3.608 3.56H9.487a.83.83 0 1 0 0 1.661h9.667l-3.608 3.56a.83.83 0 0 0 1.166 1.183l5.049-4.982a.83.83 0 0 0 0-1.182Z"
      fill="red"
      stroke="red"
      strokeWidth={0.417}
    />
  </Svg>
);
export default ExitIcon;
