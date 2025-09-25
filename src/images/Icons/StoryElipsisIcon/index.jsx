import React from 'react';
import { Svg, Path } from 'react-native-svg';
export default function StoryElipsisIcon({ stroke = '#130F26', width = null, height = null }) {
  return (
    <Svg
      width={width || 34}
      height={height || 34}
      viewBox="0 0 24 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M21.1921 2.03031H21.2131"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.8376 2.03031H11.8586"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.48332 2.03031H2.50432"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
