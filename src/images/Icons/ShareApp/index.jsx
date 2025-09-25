import * as React from 'react';
import { useTheme } from 'react-native-paper';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
const SvgComponent = props => {
  const theme = useTheme();
  const isDarkTheme = theme.isDarkTheme;

  return <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}>
    <G stroke={isDarkTheme ? "#fff" : theme.colors.primary} clipPath="url(#a)">
      <Path
        fill={isDarkTheme ? "transparent" : "#FFE0D1"}
        d="m9.881 11.59-.076-.267-.267-.076L1.54 8.962a1.446 1.446 0 0 1-.002-2.776L20.475.505a.12.12 0 0 1 .148.148L14.942 19.59l.479.144-.479-.144a1.446 1.446 0 0 1-2.776-.002L9.88 11.59Z"
      />
      <Path
        fill={isDarkTheme ? "#fff" : "#035997"}
        d="M13.547 20.628c-.637 0-1.206-.43-1.38-1.041l-2.204-7.714L20.384 1.452l-5.441 18.137.479.144-.48-.144a1.446 1.446 0 0 1-1.395 1.039Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h21.128v21.128H0z" />
      </ClipPath>
    </Defs>
  </Svg>
};
export default SvgComponent;
