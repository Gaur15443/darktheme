import * as React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
const PollsCheckMark = props => (
  <Svg
    width={17}
    height={17}
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Circle cx={8.453} cy={8.316} r={8} fill="#E77237" />
    <Path d="m12.453 5.316-5.5 5.5-2.5-2.5" fill="#E77237" />
    <Path
      d="m12.453 5.316-5.5 5.5-2.5-2.5"
      stroke="#fff"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default PollsCheckMark;
