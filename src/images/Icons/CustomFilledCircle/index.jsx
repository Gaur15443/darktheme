import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'react-native-paper';

const CustomFilledCircle = props => {
  const theme = useTheme();
  return <View>
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9z"
        stroke={!theme.isDarkTheme ? theme.colors.primary : "#fff"}
        fill={!theme.isDarkTheme ? theme.colors.primary : "#fff"}
        strokeWidth={1.5}
      />
      <Path
        d="M7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0"
        stroke={!theme.isDarkTheme ? theme.colors.primary : "#fff"}
        fill={!theme.isDarkTheme ? "#fff" : theme.colors.primary}
        strokeWidth={1.5}
      />
    </Svg>
  </View>
};

export default CustomFilledCircle;
