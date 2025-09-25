import React from 'react';
import Svg, {Path} from 'react-native-svg';
export default function QuotesTabIcon() {
  return (
    <Svg
      width="25"
      height="25"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M5.56522 18.0005L9.73913 13.8266H16.3333C17.2538 13.8266 18 13.0804 18 12.1599V3.66715C18 2.74668 17.2538 2.00049 16.3333 2.00049H3.66667C2.74619 2.00049 2 2.74668 2 3.66716V12.1599C2 13.0804 2.74619 13.8266 3.66667 13.8266H5.56522V18.0005Z"
        stroke="#FF4F4F"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
