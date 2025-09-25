import React from 'react';
import Svg, {Path} from 'react-native-svg';
interface AstroChatIconProps {
  width?: string;
  height?: string;
}
const AstroChatIcon = ({width = '19', height = '18'}: AstroChatIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 19 18" fill="none">
      <Path
        d="M6.60124 9.06345V9M9.97592 9.06345V9M13.3506 9.06345V9M16.7253 9C16.7253 9.97033 16.5206 10.8928 16.1519 11.7267L16.7266 15.7494L13.2795 14.8875C12.303 15.4367 11.176 15.75 9.97592 15.75C6.24835 15.75 3.22656 12.7279 3.22656 9C3.22656 5.27208 6.24835 2.25 9.97592 2.25C13.7035 2.25 16.7253 5.27208 16.7253 9Z"
        stroke="#6944D3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default AstroChatIcon;
