import * as React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';
const CrossIconComment = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}>
    <Rect width={16} height={16} fill="#DBD9D9" rx={8} />
    <Path
      stroke="#444"
      strokeLinecap="round"
      strokeWidth={1.333}
      d="m10.67 5.332-5.334 5.333m5.333 0L5.336 5.332"
    />
  </Svg>
);
export default CrossIconComment;
