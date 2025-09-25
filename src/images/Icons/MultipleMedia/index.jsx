import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const MultipleMedia = (props) => (
  <Svg
    width={14}
    height={14}
    fill="none"
    {...props}
  >
    <Path
      fill="#fff"
      d="M12.762 1.697h-9.87a.41.41 0 0 0-.41.41v1.23h8.613c.678 0 1.23.553 1.23 1.231V9.9h.438a.41.41 0 0 0 .41-.41V2.107a.41.41 0 0 0-.41-.41Z"
    />
    <Rect
      width={10.606}
      height={7.212}
      x={0.853}
      y={4.242}
      fill="#fff"
      rx={0.636}
    />
  </Svg>
);

export default MultipleMedia;
