import * as React from 'react';
import { useTheme } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

function BackIcon({ stroke, ...props }) {
  const theme = useTheme();
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      className="icon icon-tabler icon-tabler-arrow-left"
      width={28}
      height={28}
      viewBox="0 0 28 28"
      strokeWidth={1.5}
      stroke={stroke || theme.colors.headerIcon || "#000"}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <Path d="M0 0h24v24H0z" stroke="none" />
      <Path d="M19 12H5M11 18l-6-6M11 6l-6 6" />
    </Svg>
  );
}

export default BackIcon;
