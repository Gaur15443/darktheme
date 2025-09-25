import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';

function TagIcon({fill = '#E77237', strokeWidth = 0.5, ...props}) {
  return (
    <Svg
      width={20}
      height={21}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <G clipPath="url(#clip0_23848_3317)">
        <Path
          d="M8.672 19.508H8.67c-.586 0-1.138-.23-1.553-.645l-5.841-5.85a2.2 2.2 0 010-3.105l7.874-7.89a4.267 4.267 0 013.04-1.26h4.996a2.2 2.2 0 012.197 2.197v4.98a4.267 4.267 0 01-1.26 3.04l-7.898 7.89a2.183 2.183 0 01-1.553.643zM12.19 2.223c-.757 0-1.468.295-2.003.83l-7.875 7.89a.734.734 0 000 1.035l5.842 5.85a.727.727 0 00.517.215h.001c.195 0 .38-.076.518-.214l7.899-7.89c.535-.535.83-1.247.83-2.003v-4.98a.733.733 0 00-.733-.733H12.19zm1.883 5.969a2.2 2.2 0 01-2.197-2.197 2.2 2.2 0 012.197-2.198 2.2 2.2 0 012.197 2.198 2.2 2.2 0 01-2.197 2.197zm0-2.93a.733.733 0 10.002 1.467.733.733 0 00-.002-1.467z"
          fill={fill}
          stroke={fill}
          strokeWidth={strokeWidth}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_23848_3317">
          <Path fill="#fff" transform="translate(0 .143)" d="M0 0H20V20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default TagIcon;
