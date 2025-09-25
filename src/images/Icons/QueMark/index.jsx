import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const QueMark = props => (
  <Svg
    width={12}
    height={14}
    viewBox="0 0 12 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M5.998 17.934V18M2 5.82C2 3.71 3.79 2 6 2s4 1.71 4 3.82-1.79 3.82-4 3.82c0 0-.002 1.14-.002 2.547"
      stroke="#fff"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default QueMark;
