import React from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

export default function ChatFileDownloadIcon() {
  return (
    <Svg width="25" height="25" viewBox="0 0 20 20" fill="none">
      <G clip-path="url(#clip0_27319_295442)">
        <Path
          d="M3.33594 14.166V15.8327C3.33594 16.2747 3.51153 16.6986 3.82409 17.0112C4.13665 17.3238 4.56058 17.4993 5.0026 17.4993H15.0026C15.4446 17.4993 15.8686 17.3238 16.1811 17.0112C16.4937 16.6986 16.6693 16.2747 16.6693 15.8327V14.166"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M5.83594 9.16602L10.0026 13.3327L14.1693 9.16602"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 3.33398V13.334"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_27319_295442">
          <Rect width="20" height="20" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
