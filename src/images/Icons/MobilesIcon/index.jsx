import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
const MobilesNewIcon = (props) => (
  <Svg
    width={21}
    height={21}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle cx={18} cy={18} r={18} fill="black" />
    <Path
      d="M22.4273 6H14C12.3364 6 11 7.33636 11 9V27C11 28.6636 12.3636 30 14 30H22.4273C24.0909 30 25.4273 28.6636 25.4273 27V9C25.4273 7.33636 24.0909 6 22.4273 6ZM18.2273 28.0636C17.4636 28.0636 16.8636 27.4636 16.8636 26.7C16.8636 25.9364 17.4636 25.3364 18.2273 25.3364C18.9909 25.3364 19.5909 25.9364 19.5909 26.7C19.5909 27.4636 18.9909 28.0636 18.2273 28.0636ZM24.0636 23.8909H12.3636V10.0091H24.0636V23.8909Z"
      fill="white"
    />
  </Svg>
);
export default MobilesNewIcon;
