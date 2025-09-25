import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const RemoveLogo = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M2.4 9v10.8h12.8m6.4-4.6v-10a1 1 0 0 0-1-1H7.24a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1H20.6a1 1 0 0 0 1-1"
      stroke="#E77237"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m16.678 11.58-4.286-4.286a.756.756 0 0 0-1.07 1.07l4.287 4.285a.756.756 0 0 0 1.069-1.069Z"
      fill="#E00"
      stroke="#E00"
      strokeWidth={0.3}
    />
    <Path
      d="m16.678 8.363-4.286 4.286a.756.756 0 0 1-1.07-1.07l4.287-4.285a.756.756 0 0 1 1.069 1.07Z"
      fill="#E00"
      stroke="#E00"
      strokeWidth={0.3}
    />
  </Svg>
);
export default RemoveLogo;
