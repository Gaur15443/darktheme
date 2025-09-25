import * as React from 'react';
import Svg, { Path, Mask, G } from 'react-native-svg';

function MicIcon(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}
    >
      <Path
        fill="#000"
        fillRule="evenodd"
        d="M11.961 22.064a.734.734 0 01-.734-.733v-3.092a.734.734 0 011.467 0v3.092a.734.734 0 01-.733.733zm-.001-19.56c-1.785 0-3.238 1.461-3.238 3.258v4.584c0 1.795 1.453 3.257 3.239 3.257 1.786 0 3.239-1.462 3.239-3.257V5.762c0-1.797-1.453-3.258-3.24-3.258zm0 12.566c-2.594 0-4.705-2.12-4.705-4.724V5.762c0-2.606 2.111-4.725 4.706-4.725 2.594 0 4.706 2.12 4.706 4.725v4.584c0 2.605-2.112 4.724-4.706 4.724z"
        clipRule="evenodd"
      />
      <Mask
        id="a"
        width={18}
        height={10}
        x={3}
        y={9}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: 'luminance',
        }}
      >
        <Path
          fill="#fff"
          fillRule="evenodd"
          d="M3.404 9.645h17.114v9.327H3.404V9.645z"
          clipRule="evenodd"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          fill="#000"
          fillRule="evenodd"
          d="M11.96 18.972c-4.718 0-8.557-3.855-8.557-8.594a.734.734 0 011.467 0c0 3.93 3.18 7.127 7.09 7.127 3.91 0 7.09-3.197 7.09-7.127a.734.734 0 011.468 0c0 4.74-3.839 8.594-8.558 8.594z"
          clipRule="evenodd"
        />
      </G>
    </Svg>
  );
}

export default MicIcon;
