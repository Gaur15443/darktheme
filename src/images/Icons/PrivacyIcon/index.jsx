import * as React from 'react';
import { useTheme } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
const SvgComponent = props => {
  const theme = useTheme();
  const isDarkTheme = theme.isDarkTheme;

  return <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={27}
    fill="none"
    {...props}>
    <Path
      fill={isDarkTheme ? "transparent" : theme.colors.primary}
      stroke={isDarkTheme ? "#fff" : theme.colors.primary}
      strokeWidth={2}
      d="M11.822 26.596S0 25.221 0 5.503L11.822 0l11.821 5.503c0 19.718-11.822 21.093-11.822 21.093Z"
    />
    <Path
      fill={isDarkTheme ? 'transparent' : "#FFE0D1"}
      d="M11.822 24.762S2.057 22.469 2.057 6.42l9.765-4.586 9.766 4.586c0 16.05-9.766 18.342-9.766 18.342Z"
    />
    <Path
      fill={isDarkTheme ? "#fff" : "#035997"}
      d="M10.598 18c-.343 0-.674-.122-.93-.345l-4.2-3.636a1.342 1.342 0 0 1-.114-1.922 1.424 1.424 0 0 1 1.974-.116l3.18 2.754L16.58 8.43c.254-.264.605-.419.976-.43.371-.012.732.12 1.003.368.27.247.43.589.441.95.012.361-.124.713-.378.976L11.62 17.57c-.13.136-.288.244-.464.319a1.429 1.429 0 0 1-.557.112Z"
    />
  </Svg>
};
export default SvgComponent;
