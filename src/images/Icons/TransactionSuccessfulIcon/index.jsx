import * as React from "react"
import Svg, { Rect, G, Path, Defs, ClipPath } from "react-native-svg"

function TransactionSuccessfulIcon(props) {
  return (
    <Svg
      width={49}
      height={48}
      viewBox="0 0 49 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect x={0.5} width={48} height={48} rx={24} fill="#27C394" />
      <G
        clipPath="url(#clip0_19712_14283)"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M17.497 19.2a2.2 2.2 0 012.2-2.2h1a2.2 2.2 0 001.55-.64l.7-.7a2.199 2.199 0 013.12 0l.7.7c.412.41.97.64 1.55.64h1a2.2 2.2 0 012.2 2.2v1c0 .58.23 1.139.64 1.55l.7.7a2.199 2.199 0 010 3.12l-.7.7a2.2 2.2 0 00-.64 1.55v1a2.2 2.2 0 01-2.2 2.2h-1a2.2 2.2 0 00-1.55.64l-.7.7a2.202 2.202 0 01-3.12 0l-.7-.7a2.2 2.2 0 00-1.55-.64h-1a2.2 2.2 0 01-2.2-2.2v-1a2.2 2.2 0 00-.64-1.55l-.7-.7a2.2 2.2 0 010-3.12l.7-.7a2.2 2.2 0 00.64-1.55v-1z" />
        <Path d="M21.5 24l2 2 4-4" />
      </G>
      <Defs>
        <ClipPath id="clip0_19712_14283">
          <Path fill="#fff" transform="translate(12.5 12)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default TransactionSuccessfulIcon
