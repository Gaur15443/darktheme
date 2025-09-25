import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const FeedbackMsg = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={27}
    height={28}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.228}
      d="m10.755 11.317 2.005 2.005 4.68-4.68m-4.36 10.464L7.5 24.687v-5.58H5.407a2.674 2.674 0 0 1-2.674-2.675V5.968a2.674 2.674 0 0 1 2.674-2.674H21.45a2.674 2.674 0 0 1 2.674 2.674v10.464a2.674 2.674 0 0 1-2.674 2.674h-8.37Z"
    />
  </Svg>
);
export default FeedbackMsg;
