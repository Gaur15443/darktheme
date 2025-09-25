import React from 'react';
import {Svg, Path} from 'react-native-svg';
export default function MediaUploaderIcon({
  stroke = '#E77237',
  strokeWidth = '1.5',
}) {
  return (
    <Svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.5857 2.2915H6.37567C3.86567 2.2915 2.2915 4.06984 2.2915 6.5865V13.3748C2.2915 15.8915 3.859 17.6698 6.37567 17.6698H13.5815C16.1023 17.6698 17.669 15.8915 17.669 13.3748V6.5865C17.6723 4.06984 16.1048 2.2915 13.5857 2.2915Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.91944 7.32105C8.91944 8.17105 8.23111 8.85938 7.38111 8.85938C6.53194 8.85938 5.84277 8.17105 5.84277 7.32105C5.84277 6.47105 6.53194 5.78271 7.38111 5.78271C8.23027 5.78355 8.91861 6.47188 8.91944 7.32105Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.6725 12.4592C16.9033 11.6675 15.4242 10.0684 13.8158 10.0684C12.2067 10.0684 11.2792 13.5959 9.73167 13.5959C8.18417 13.5959 6.77833 12.0009 5.53833 13.0234C4.29833 14.045 3.125 16.1342 3.125 16.1342"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
