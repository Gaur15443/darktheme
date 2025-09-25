import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const SquarePlusIcon = (props) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path
      d="M9 12h6M12 9v6M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"
      stroke="green"
      strokeWidth={1.5}
    />
  </Svg>
);

export default SquarePlusIcon;
