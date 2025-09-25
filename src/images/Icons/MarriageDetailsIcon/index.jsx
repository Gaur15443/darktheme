import * as React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';

const MarriageDetailsIcon = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <Circle cx={9} cy={9} r={6.1} stroke="#035997" strokeWidth={1.8} />
    <Circle cx={15} cy={15} r={6.1} stroke="#035997" strokeWidth={1.8} />
  </Svg>
);
export default MarriageDetailsIcon;
