import Svg, {Path} from 'react-native-svg';
import React from 'react';

export default function GalleryIcon({
  width = '24',
  height = '24',
  stroke = '#E77237',
}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none">
      <Path
        d="M8.16002 15.6002L12 12.0002L14.56 13.8002L18.1867 10.2002L21.3867 13.2002M2.40002 9.0002V19.8002H15.2M10.08 7.8002V7.70996M21.6 15.2002V5.2002C21.6 4.64791 21.1523 4.2002 20.6 4.2002H7.24002C6.68774 4.2002 6.24002 4.64791 6.24002 5.2002V15.2002C6.24002 15.7525 6.68774 16.2002 7.24003 16.2002H20.6C21.1523 16.2002 21.6 15.7525 21.6 15.2002Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
