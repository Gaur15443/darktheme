import React from 'react';
import { Svg, Path } from 'react-native-svg';
export default function SaveButton({ isSaved, width = 24, height = 24 }) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M8.7899 6.48395H14.2066M11.5 15.1936L16.9586 20.0697C17.3614 20.4295 18 20.1436 18 19.6036V5.5C18 4.11929 16.8807 3 15.5 3H7.5C6.11929 3 5 4.11929 5 5.5V19.6036C5 20.1436 5.63865 20.4295 6.04137 20.0697L11.5 15.1936Z"
        stroke={isSaved ? 'red' : 'black'}
        fill={isSaved ? 'red' : 'none'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
