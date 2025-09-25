import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const MakeContributorBtn = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M16.026 20.57v-3.213a3.214 3.214 0 0 0-3.214-3.214H5.615A3.214 3.214 0 0 0 2.4 17.356v3.215m19.2 0v-3.214a3.214 3.214 0 0 0-3.215-3.214M15.406 4.06a3.21 3.21 0 0 1 1.301 2.583 3.21 3.21 0 0 1-1.3 2.583m-2.913-2.583a3.214 3.214 0 1 1-6.428 0 3.214 3.214 0 0 1 6.428 0"
      stroke="#000"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default MakeContributorBtn;
