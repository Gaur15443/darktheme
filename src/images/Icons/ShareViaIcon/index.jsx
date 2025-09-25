import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const ShareViaIcon = props => (
  <Svg
    width={25}
    height={24}
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="m21.5 11.46-9.6-6.358v3.6c-8.4 1.8-8.4 10.2-8.4 10.2s3.6-4.8 8.4-4.2v3.72z"
      stroke="#E77237"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);
export default ShareViaIcon;
