import * as React from 'react';
import { useTheme } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
const SvgComponent = props => {
  const theme = useTheme();
  const isDarkTheme = theme.isDarkTheme;

  return <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    {...props}>
    <Path
      fill={isDarkTheme ? "transparent" : "#FFE0D1"}
      stroke={isDarkTheme ? "#fff" : theme.colors.primary}
      strokeWidth={2}
      d="M12.646 1.148c6.352 0 11.5 5.15 11.5 11.5 0 6.352-5.148 11.5-11.5 11.5-6.35 0-11.5-5.148-11.5-11.5 0-6.35 5.15-11.5 11.5-11.5Z"
    />
    <Path
      fill={isDarkTheme ? "transparent" : "#FFE0D1"}
      d="M22.054 4.425c-1.822 3.345-4.4 6.796-7.62 10.017-3.22 3.22-6.67 5.792-10.011 7.615-.21-.182-.413-.372-.61-.57A12.5 12.5 0 1 1 21.484 3.81c.198.197.387.402.57.615Z"
      opacity={0.1}
    />
    <Path
      fill={isDarkTheme ? "#fff" : "#035997"}
      d="M15.608 6.07H9.687A3.618 3.618 0 0 0 6.068 9.69v5.92a3.618 3.618 0 0 0 3.619 3.62h5.92a3.618 3.618 0 0 0 3.62-3.62V9.69a3.618 3.618 0 0 0-3.62-3.619Zm2.467 9.02a2.987 2.987 0 0 1-2.987 2.987h-4.881A2.987 2.987 0 0 1 7.22 15.09v-4.881a2.987 2.987 0 0 1 2.987-2.987h4.881a2.987 2.987 0 0 1 2.987 2.987v4.881Z"
    />
    <Path
      fill={isDarkTheme ? "#fff" : "#035997"}
      d="m15.047 10.275-.032-.032-.026-.026a3.316 3.316 0 0 0-2.342-.967 3.375 3.375 0 0 0-3.352 3.4c0 .9.354 1.763.987 2.403a3.32 3.32 0 0 0 2.372.986 3.41 3.41 0 0 0 2.393-5.764Zm-2.4 4.605a2.23 2.23 0 1 1 2.199-2.23 2.212 2.212 0 0 1-2.199 2.23ZM16.994 9.093a.803.803 0 0 1-.798.81.791.791 0 0 1-.562-.236.81.81 0 0 1 .564-1.38c.186 0 .366.065.508.184l.017.017c.026.021.05.046.072.072l.018.02a.808.808 0 0 1 .18.513Z"
    />
  </Svg>
};
export default SvgComponent;
