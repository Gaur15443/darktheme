import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"

function HomeVideoPlay(props) {
  return (
    <Svg
      width={35}
      height={34}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Circle cx={10} cy={10.666} r={10} fill="#000" />
      <Path
        d="M8.45 6.842C7.648 6.43 7 6.768 7 7.6v6.134c0 .832.649 1.17 1.45.757l5.95-3.075c.8-.414.8-1.084 0-1.498L8.45 6.842z"
        fill="#fff"
      />
    </Svg>
  )
}

export default HomeVideoPlay
