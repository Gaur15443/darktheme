import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function SearchIcon({color = '#E77237', width = 23, height = 25, ...props}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 23 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M15.765 15.502l3.118 3.017m-1.005-8.044a7.038 7.038 0 11-14.077 0 7.038 7.038 0 0114.077 0z"
        stroke={color}
        strokeWidth={1.79551}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SearchIcon;
