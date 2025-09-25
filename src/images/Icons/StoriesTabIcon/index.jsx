import React from 'react';
import Svg, {Path} from 'react-native-svg';
export default function StoriesTabIcon({
  stroke = '#2DAAFF',
  strokeWidth = 1.5,
}) {
  return (
    <Svg
      width="25"
      height="25"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M9.77143 16.8574V4.51449M9.77143 16.8574L8.55687 15.6428C7.87102 14.9569 6.94123 14.5716 5.97129 14.5716H2.91349C2.40854 14.5716 2 14.1623 2 13.6574V4.05735C2 3.55241 2.40934 3.14307 2.91429 3.14307H6.42802C7.39795 3.14307 8.32816 3.52837 9.01401 4.21422L9.77143 4.97164L10.5288 4.21422C11.2147 3.52837 12.1449 3.14307 13.1148 3.14307H17.0857C17.5907 3.14307 18 3.55241 18 4.05735V13.6574C18 14.1623 17.5907 14.5716 17.0857 14.5716H13.572C12.602 14.5716 11.6718 14.9569 10.986 15.6428L9.77143 16.8574Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
