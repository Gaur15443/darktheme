import React from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

export default function AstroPhoneIcon() {
  return (
    <Svg width="35" height="35" viewBox="0 0 35 35" fill="none">
      <Rect
        x="0.5"
        width="34.1538"
        height="34.1538"
        rx="17.0769"
        fill="white"
      />
      <G clip-path="url(#clip0_18573_11647)">
        <Path
          d="M11.1595 9.74365H14.8262L16.6595 14.327L14.3678 15.702C15.3496 17.6926 16.9606 19.3036 18.9512 20.2853L20.3262 17.9937L24.9095 19.827V23.4937C24.9095 23.9799 24.7163 24.4462 24.3725 24.79C24.0287 25.1338 23.5624 25.327 23.0762 25.327C19.5005 25.1097 16.128 23.5913 13.5949 21.0582C11.0619 18.5252 9.54347 15.1527 9.32617 11.577C9.32617 11.0908 9.51933 10.6244 9.86314 10.2806C10.207 9.93681 10.6733 9.74365 11.1595 9.74365Z"
          stroke="#6944D3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_18573_11647">
          <Rect
            width="22"
            height="22"
            fill="white"
            transform="translate(6.57617 6.0769)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
