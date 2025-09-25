import * as React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';

const CommunityInfo = props => (
  <Svg
    width="18"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    strokeWidth="2"
    xmlns="http://www.w3.org/2000/svg">
    {/* Dot on top */}
    <Circle cx="10" cy="6.5" r="1" fill="#E77237" />

    {/* Line below */}
    <Path
      d="M10 9.5V14"
      stroke="#E77237"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Outer square */}
    <Path
      d="M19 4.375V15.625C19 17.489 17.489 19 15.625 19H4.375C2.511 19 1 17.489 1 15.625V4.375C1 2.511 2.511 1 4.375 1H15.625C17.489 1 19 2.511 19 4.375Z"
      stroke="#E77237"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CommunityInfo;
