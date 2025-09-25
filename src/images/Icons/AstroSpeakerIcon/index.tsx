import React from 'react';
import Svg, {G, Path} from 'react-native-svg';

export default function AstroSpeakerIcon({stroke = 'white'}) {
  return (
    <Svg width="31" height="31" viewBox="0 0 31 31" fill="none">
      <G id="icon/volume-2">
        <Path
          id="Vector"
          d="M14.1729 6.6897L7.81817 11.7735H2.73438V19.3992H7.81817L14.1729 24.483V6.6897Z"
          stroke={stroke}
          strokeWidth="1.90642"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          id="Vector_2"
          d="M19.9414 11.0872C21.1327 12.2788 21.802 13.8949 21.802 15.58C21.802 17.265 21.1327 18.8811 19.9414 20.0728"
          stroke={stroke}
          strokeWidth="1.90642"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          id="Vector_3"
          d="M24.4277 6.60083C26.8104 8.98421 28.1489 12.2163 28.1489 15.5864C28.1489 18.9565 26.8104 22.1887 24.4277 24.5721"
          stroke={stroke}
          strokeWidth="1.90642"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
