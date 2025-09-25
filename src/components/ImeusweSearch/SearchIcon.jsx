/* eslint-disable react/jsx-no-undef */
import * as React from "react"
import Svg, { Path,Text } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      width={23}
      height={23}
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M16.154 15.874l3.143 3.04m-1.013-8.108a7.095 7.095 0 11-14.19 0 7.095 7.095 0 0114.19 0z"
        stroke="#888"
        strokeWidth={1.80995}
        strokeLinecap="round"
      />
      <Text x="50" y="50" fill="black" font-size="24" font-family="Arial">Hello, SVG!</Text>
    </Svg>
  )
}

export default SvgComponent
