import * as React from 'react';
import Svg, { Path,Circle,G } from 'react-native-svg';

const InstagramIcon = (props) => (
    <Svg width={20} height={20} viewBox="0 0 24 24">
    <G fill="#000000">
      <Path
        fillRule="evenodd"
        d="M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10m-3 5a3 3 0 1 0 6 0a3 3 0 0 0-6 0"
        clipRule="evenodd"
      />
      <Path
        d="M18 5a1 1 0 1 0 0 2a1 1 0 0 0 0-2"
      />
      <Path
        fillRule="evenodd"
        d="M5 1a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4zm14 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
        clipRule="evenodd"
      />
    </G>
  </Svg>
);
export default InstagramIcon;
