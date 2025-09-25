import {SvgXml} from 'react-native-svg';


import { Svg, Circle, Path, Mask, G } from 'react-native-svg';

import * as React from 'react';
// import Svg{Circle, Path, Mask, G} from "react-native-svg"
const InviteMemberIcon = ({color = 'rgba(52, 115, 220, 1)', ...props}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    viewBox="0 0 54 54"
    {...props}
  >
    <Circle cx={27} cy={27} r={26.5} fill={color} stroke={color} />
    <Mask
      id="a"
      width={23}
      height={11}
      x={14}
      y={30}
      mask-type="luminance"
      maskUnits="userSpaceOnUse"
    >
      <Path
        fill="#fff"
        fillRule="evenodd"
        d="M14.75 30.877h21.662v10.09H14.75v-10.09Z"
        clipRule="evenodd"
      />
    </Mask>
    <G mask="url(#a)">
      <Path
        fill="#EBEBEB"
        fillRule="evenodd"
        d="M25.58 32.94c-5.817 0-8.767 1-8.767 2.968 0 1.988 2.95 2.998 8.768 2.998 5.817 0 8.768-1 8.768-2.968 0-1.99-2.95-2.998-8.768-2.998Zm0 8.028c-2.678 0-10.83 0-10.83-5.06 0-4.51 6.18-5.031 10.83-5.031 2.68 0 10.832 0 10.832 5.061 0 4.509-6.18 5.03-10.831 5.03Z"
        clipRule="evenodd"
      />
    </G>
    <Path
      fill="#EBEBEB"
      fillRule="evenodd"
      d="M25.58 15.813a5.256 5.256 0 0 0-5.248 5.25 5.194 5.194 0 0 0 1.517 3.705 5.204 5.204 0 0 0 3.693 1.544l.038 1.031v-1.031a5.256 5.256 0 0 0 5.25-5.25 5.256 5.256 0 0 0-5.25-5.25Zm0 12.562h-.042a7.247 7.247 0 0 1-5.15-2.154 7.244 7.244 0 0 1-2.118-5.163c0-4.027 3.279-7.308 7.31-7.308 4.033 0 7.313 3.28 7.313 7.312s-3.28 7.313-7.313 7.313ZM38.405 29.466c-.569 0-1.031-.462-1.031-1.031v-5.516a1.032 1.032 0 0 1 2.063 0v5.516c0 .569-.462 1.03-1.032 1.03Z"
      clipRule="evenodd"
    />
    <Path
      fill="#EBEBEB"
      fillRule="evenodd"
      d="M41.218 26.708h-5.623a1.032 1.032 0 0 1 0-2.063h5.623a1.032 1.032 0 0 1 0 2.063Z"
      clipRule="evenodd"
    />
  </Svg>
);


export default InviteMemberIcon;
