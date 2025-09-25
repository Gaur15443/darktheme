import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 2 18 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M4.8 21.6V12m7.2 9.6V12m0 0h2.4M12 12H9.6m9.6 9.6v-4.8m0-4.8V2.4M12 7.2V2.4M4.8 7.2V2.4m0 4.8h2.4m-2.4 0H2.4m19.2 9h-4.8"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent
