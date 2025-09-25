import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const LockIcon = props => (
  <Svg
    width={34}
    height={44}
    viewBox="0 0 34 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M6.194 15.597v-1.829c0-6.078 4.817-10.971 10.8-10.971s10.8 4.893 10.8 10.971v1.829m-21.6 0c-1.98 0-3.6 1.646-3.6 3.657V37.54c0 2.011 1.62 3.657 3.6 3.657h21.6c1.98 0 3.6-1.646 3.6-3.657V19.254c0-2.011-1.62-3.657-3.6-3.657m-21.6 0h21.6m-10.8 14.8v-4.8"
      stroke="#E77237"
      strokeWidth={4}
      strokeLinecap="round"
    />
  </Svg>
);
export default LockIcon;
