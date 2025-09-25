import React from 'react';
import Svg, {G, Path} from 'react-native-svg';
export default function AstroBluetoothIcon({stroke = 'white'}) {
  return (
    <Svg width="31" height="31" viewBox="0 0 31 31" fill="none">
      <G id="icon/bluetooth">
        <Path
          id="Vector"
          d="M9.23047 9.2317L21.94 21.9412L15.5852 28.2959V2.87695L21.94 9.2317L9.23047 21.9412"
          stroke={stroke}
          strokeWidth="1.90642"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
