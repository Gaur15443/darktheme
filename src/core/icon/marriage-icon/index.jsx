import React from 'react';
import {View} from 'react-native';
import {Svg, Circle} from 'react-native-svg';

const MarriageIcon = ({
  width = 24,
  height = 24,
  stroke = '#035997',
  strokeWidth = 1.8,
}) => (
  <View style={{marginTop: 10, marginLeft: 20}}>
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={9} r={6.1} stroke={stroke} strokeWidth={strokeWidth} />
      <Circle
        cx={15}
        cy={15}
        r={6.1}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Svg>
  </View>
);

export default MarriageIcon;
