import React from 'react';
import { Svg, Path } from 'react-native-svg';
export default function CommentButton({ size = 24, ...props }) {
  return (
    <Svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M20.2337 15.6356C20.7252 14.5238 20.9982 13.2938 20.9982 12C20.9982 7.02944 16.9691 3 11.999 3C7.02893 3 2.99988 7.02944 2.99988 12C2.99988 16.9706 7.02893 21 11.999 21C13.5992 21 15.1018 20.5823 16.4038 19.85L20.9999 20.9991L20.2337 15.6356Z"
        stroke="black"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
