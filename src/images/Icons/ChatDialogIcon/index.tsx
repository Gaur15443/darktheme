import React from 'react';
import Svg, {Circle, ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

export default function ChatDialogIcon() {
  return (
    <Svg width="49" height="48" viewBox="0 0 49 48" fill="none">
      <Circle cx="24.5" cy="24" r="24" fill="#FF4F4F" />
      <G clip-path="url(#clip0_27319_289134)">
        <Path
          d="M20.5 21H21.5M25.5 21H28.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20.5 25H25.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20.5 16H30.5C31.2956 16 32.0587 16.3161 32.6213 16.8787C33.1839 17.4413 33.5 18.2044 33.5 19V27C33.5 27.577 33.337 28.116 33.055 28.573M30.5 30H25.5L20.5 33V30H18.5C17.7044 30 16.9413 29.6839 16.3787 29.1213C15.8161 28.5587 15.5 27.7956 15.5 27V19C15.5 17.915 16.076 16.964 16.939 16.438"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15.5 15L33.5 33"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_27319_289134">
          <Rect
            width="24"
            height="24"
            fill="white"
            transform="translate(12.5 12)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
