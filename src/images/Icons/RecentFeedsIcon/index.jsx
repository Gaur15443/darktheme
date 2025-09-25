import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const RecentFeedsIcon = props => (
  <Svg
    width={23}
    height={21}
    viewBox="0 0 23 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M19.505 10.5c0 4.97-4.03 9-9.003 9a9 9 0 1 1 0-18A9 9 0 0 1 18.3 6m-1.265 5.488 2.25-2.25 2.251 2.25m-7.661 1.466L10.5 11.83V7.125"
      stroke="#000"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default RecentFeedsIcon;
