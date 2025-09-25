import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Svg, Path, Ellipse } from 'react-native-svg';
export default function CustomTickIcon({ useRadioButton = false }) {
  const theme = useTheme();
  return (
    <>
      {useRadioButton ? (
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none">
          <Path
            d="M1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9Z"
            fill="white"
            stroke="white"
            strokeWidth="1.62"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Ellipse
            cx="9.31082"
            cy="9.31134"
            rx="4"
            ry="4"
            transform="rotate(-4.64549 9.31082 9.31134)"
            fill="white"
          />
        </Svg>
      ) : (
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="20"
          viewBox="0 0 15 15"
          fill="none">
          <Path
            d="M3.4375 14.5938C2.09131 14.5938 1 13.5024 1 12.1563V4.03124C1 2.68505 2.09131 1.59375 3.4375 1.59375H11.5625C12.9087 1.59375 14 2.68505 14 4.03124L14 12.1563C14 13.5024 12.9087 14.5938 11.5625 14.5938H3.4375Z"
            fill={theme.colors.primary}
            stroke={theme.colors.primary}
            strokeWidth="1.6233"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9.9375 6.4668L6.30181 9.71678L5.0625 8.60895"
            stroke="white"
            strokeWidth="1.6233"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </>
  );
}
