import * as React from 'react';
import Svg, {Rect, G, Path, Defs, ClipPath} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={49}
      height={48}
      viewBox="0 0 49 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Rect x={0.5} width={48} height={48} rx={24} fill="#FF4F4F" />
      <G
        clipPath="url(#clip0_18940_9118)"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M15.5 24a9 9 0 1018 0 9 9 0 00-18 0zM24.5 21v4M24.5 28v.01" />
      </G>
      <Defs>
        <ClipPath id="clip0_18940_9118">
          <Path fill="#fff" transform="translate(12.5 12)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
