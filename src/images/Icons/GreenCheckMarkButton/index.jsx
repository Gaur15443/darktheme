import * as React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';
const GreenCheckMarkButton = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Rect width={24} height={24} rx={2} fill="#35D750" />
    <Path
      d="m16.803 8.398-7.16 7.2-2.44-2.454"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default GreenCheckMarkButton;
