import React from 'react';
import Svg, {Path} from 'react-native-svg';
export default function CrossIcon({
  fill = 'white',
  width = '15',
  height = '15',
  testID,
}) {
  return (
    <Svg
      dataTestid={testID}
      width={width || '15'}
      height={height || '15'}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M2.2767 2.27652L16.8297 16.8296M2.2767 16.8296L16.8297 2.27652"
        stroke={fill || 'white'}
        strokeWidth="3.43019"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
