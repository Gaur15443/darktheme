import React from 'react';
import {Svg, Path} from 'react-native-svg';
export default function PlusButtonStory() {
  return (
    <Svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M12 6L12 18M18 12L6 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
