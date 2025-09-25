import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const RemoveCommunityMemberIcon = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M12 0a12 12 0 1 0 12 12A12.014 12.014 0 0 0 12 0m0 21.818A9.818 9.818 0 1 1 21.818 12 9.83 9.83 0 0 1 12 21.818"
      fill="#000"
    />
    <Path
      d="M16.365 10.91H7.638a1.091 1.091 0 0 0 0 2.18h8.727a1.09 1.09 0 1 0 0-2.18"
      fill="#E00"
    />
  </Svg>
);
export default RemoveCommunityMemberIcon;
