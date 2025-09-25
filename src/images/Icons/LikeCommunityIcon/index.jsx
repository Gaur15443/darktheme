import * as React from "react";
import Svg, { Path } from "react-native-svg";
const LikeCommunityIcon = (props) => (
  <Svg
    width={16}
    height={13}
    viewBox="0 0 16 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      clipRule="evenodd"
      d="M2.538 2.137a3.2 3.2 0 0 1 4.525 0l.938.937.937-.937a3.2 3.2 0 1 1 4.525 4.525l-5.462 5.463-5.463-5.463a3.2 3.2 0 0 1 0-4.525Z"
      stroke="#444"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);
export default LikeCommunityIcon;
