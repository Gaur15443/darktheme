import * as React from "react";
import Svg, { Path } from "react-native-svg";
const MobileIcon = (props) => (
  <Svg
    width={14}
    height={20}
    viewBox="0 0 16 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M11.4273 0H3C1.33636 0 0 1.33636 0 3V21C0 22.6636 1.36364 24 3 24H11.4273C13.0909 24 14.4273 22.6636 14.4273 21V3C14.4273 1.33636 13.0909 0 11.4273 0ZM7.22727 22.0636C6.46364 22.0636 5.86364 21.4636 5.86364 20.7C5.86364 19.9364 6.46364 19.3364 7.22727 19.3364C7.99091 19.3364 8.59091 19.9364 8.59091 20.7C8.59091 21.4636 7.99091 22.0636 7.22727 22.0636ZM13.0636 17.8909H1.36364V4.00909H13.0636V17.8909Z"
      fill="white"
    />
  </Svg>
);
export default MobileIcon;
