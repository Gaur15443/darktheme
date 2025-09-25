import React from 'react';
import Svg, {Path} from 'react-native-svg';
export default function DocumentIcon({stroke = '#E77237'}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none">
      <Path
        d="M10.4058 21.5998H5.6058C4.28031 21.5998 3.2058 20.5253 3.20581 19.1998L3.2059 4.79989C3.20591 3.47441 4.28043 2.3999 5.6059 2.3999H16.4062C17.7317 2.3999 18.8062 3.47442 18.8062 4.7999V11.3999M17.3999 21.1881V17.794M17.3999 17.794V14.3999M17.3999 17.794L14.0058 17.794M17.3999 17.794L20.794 17.794M7.40619 7.1999H14.6062M7.40619 10.7999H14.6062M7.40619 14.3999H11.0062"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
