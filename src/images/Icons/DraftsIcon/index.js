import * as React from "react";
import Svg, { Path } from "react-native-svg";
const DraftsIcon = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M9.55742 21.5574H4.75741C3.43193 21.5574 2.35741 20.4828 2.35742 19.1574L2.35751 4.75741C2.35752 3.43193 3.43204 2.35742 4.75751 2.35742H15.5578C16.8833 2.35742 17.9578 3.43194 17.9578 4.75742V9.55742M13.1576 18.2484L18.2488 13.1573L21.6429 16.5514L16.5517 21.6426H13.1576V18.2484Z"
      stroke="black"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default DraftsIcon;
