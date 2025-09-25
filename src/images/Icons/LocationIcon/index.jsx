import React from 'react';
import { Svg, Path } from 'react-native-svg';
export default function LocationIcon({ stroke = '#E77237', size = 24 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M11.9999 21.6004C11.9999 21.6004 19.5129 14.9221 19.5129 9.91343C19.5129 5.76409 16.1492 2.40039 11.9999 2.40039C7.85052 2.40039 4.48682 5.76409 4.48682 9.91343C4.48682 14.9221 11.9999 21.6004 11.9999 21.6004Z"
        stroke={stroke}
        strokeWidth="2"
      />
      <Path
        d="M14.4002 9.60054C14.4002 10.926 13.3257 12.0005 12.0002 12.0005C10.6747 12.0005 9.60017 10.926 9.60017 9.60054C9.60017 8.27506 10.6747 7.20054 12.0002 7.20054C13.3257 7.20054 14.4002 8.27506 14.4002 9.60054Z"
        stroke={stroke}
        strokeWidth="2"
      />
    </Svg>
  );
}
