import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const RemoveContributorIcon = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M2.402 21.6V18a3.6 3.6 0 0 1 3.6-3.6h6m5.4-12c1.457.817 2.4 2.125 2.4 3.6s-.943 2.784-2.4 3.6m-3-3.6a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0"
      stroke="#797979"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m19.818 18.819-1.909-1.91m0 0L16 15m1.91 1.91L16 18.817m1.91-1.909L19.818 15"
      stroke="#797979"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
export default RemoveContributorIcon;
