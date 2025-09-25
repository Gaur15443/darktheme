import React from 'react';
import {Svg, Path} from 'react-native-svg';
import {View} from 'react-native';

const WorkIcon = ({
  width = 24,
  height = 24,
  stroke = '#035997',
  strokeWidth = 2,
}) => (
  <View style={{marginTop: 10, marginLeft: 20}}>
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={stroke}
        strokeWidth={strokeWidth}
        d="M5 8v8c0 1.886 0 2.828.586 3.414C6.172 20 7.114 20 9 20h6c1.886 0 2.828 0 3.414-.586C19 18.828 19 17.886 19 16V8M5 8h14M5 8H3.364c-.154 0-.23 0-.284-.04a.2.2 0 0 1-.04-.04C3 7.867 3 7.79 3 7.636c0-1.534 0-2.302.399-2.835A2 2 0 0 1 3.8 4.4C4.334 4 5.101 4 6.636 4h10.728c1.534 0 2.302 0 2.835.399.152.114.288.25.402.402.399.533.399 1.3.399 2.835 0 .154 0 .23-.04.284a.2.2 0 0 1-.04.04c-.053.04-.13.04-.284.04H19"
      />
      <Path
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        d="M10 16h4"
      />
    </Svg>
  </View>
);

export default WorkIcon;
