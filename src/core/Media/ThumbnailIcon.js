import React from 'react';
import {useTheme} from 'react-native-paper';
import Svg, {Path} from 'react-native-svg';

const ThumbnailIcon = ({showStroke = true, ...props}) => {
  const theme = useTheme();
  return (
    <Svg
      width={props.width}
      height={props.height}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        fill="#fff"
        stroke={showStroke ? theme.colors.primary : undefined}
        d="M25 50C11.469 50 .5 39.031.5 25.5S11.469 1 25 1s24.5 10.969 24.5 24.5S38.531 50 25 50Z"
      />
      <Path
        fill={theme.colors.primary}
        d="M17.187 16.183c-.03-1.54 1.616-2.535 2.965-1.792l16.687 9.194c1.349.743 1.387 2.667.07 3.463l-16.306 9.855c-1.318.796-3.004-.132-3.034-1.672l-.382-19.048Z"
      />
    </Svg>
  );
};

export default ThumbnailIcon;
