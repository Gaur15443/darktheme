import * as React from 'react';
import { useTheme } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
const SvgComponent = props => {
  const theme = useTheme();
  const isDarkTheme = theme.isDarkTheme;

  return <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    fill="none"
    {...props}>
    <Path
      fill={isDarkTheme ? "transparent" : "#FFE0D1"}
      stroke={isDarkTheme ? "#fff" : theme.colors.primary}
      strokeWidth={2}
      d="M24 12.5C24 18.851 18.851 24 12.5 24S1 18.851 1 12.5 6.149 1 12.5 1 24 6.149 24 12.5Z"
    />
    <Path
      fill={isDarkTheme ? "#fff" : "#035997"}
      d="M12.49 8.287a1.562 1.562 0 1 0 0-3.125 1.562 1.562 0 0 0 0 3.125ZM12.494 19.85a1.25 1.25 0 0 1-1.25-1.25v-6.25a1.25 1.25 0 0 1 0-2.5h1.25a1.25 1.25 0 0 1 1.25 1.25v7.5a1.25 1.25 0 0 1-1.25 1.25Z"
    />
    <Path
      fill={isDarkTheme ? "#fff" : "#035997"}
      d="M13.744 19.85h-2.5a1.25 1.25 0 0 1 0-2.5h2.5a1.25 1.25 0 1 1 0 2.5Z"
    />
  </Svg>
};
export default SvgComponent;
