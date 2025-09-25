import React from 'react';
import {Svg, Path} from 'react-native-svg';
import {useTheme} from 'react-native-paper';

export default function StoryFilterIcon() {
  const theme = useTheme();

  return (
    <Svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M6.46154 12H17.5385M4 7H20M10.1538 17H13.8462"
        stroke={theme.colors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
