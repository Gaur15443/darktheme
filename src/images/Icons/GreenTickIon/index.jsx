import * as React from 'react';
import {Svg, Path} from 'react-native-svg';

const GreenTickIcon = ({width, height, transform, ...props}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ?? 24}
    height={height ?? 24}
    fill="none"
    {...props}>
    <Path
      stroke="#27C394"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m16.8 8.4-7.16 7.2-2.44-2.454"
      transform={transform ?? 'translate(0, 0)'}
    />
  </Svg>
);
export default GreenTickIcon;
