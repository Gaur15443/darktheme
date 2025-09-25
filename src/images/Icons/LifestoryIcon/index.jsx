import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const LifestoryIcon = (props) => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 22 22"
    fill="none"
    {...props}
  >
    <Path
      d="M5.875 5h6.75m-6.75 3h6.75m-6.75 3H9.25M4.187 1h10.126c1.242 0 2.25.895 2.25 2v12c0 1.105-1.008 2-2.25 2H4.186c-1.242 0-2.25-.895-2.25-2V3c0-1.105 1.008-2 2.25-2Z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default LifestoryIcon;
