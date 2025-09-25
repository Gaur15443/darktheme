import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const DocsIcon = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M10.406 21.6h-4.8a2.4 2.4 0 0 1-2.4-2.4V4.8a2.4 2.4 0 0 1 2.4-2.4h10.8a2.4 2.4 0 0 1 2.4 2.4v6.6M17.4 21.188v-3.394m0 0V14.4m0 3.394h-3.394m3.394 0h3.394M7.406 7.2h7.2m-7.2 3.6h7.2m-7.2 3.6h3.6"
      stroke="#E77237"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default DocsIcon;
