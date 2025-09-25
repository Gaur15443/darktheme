import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SubcategoryIcon(props) {
  return (
    <Svg
      width={20}
      height={22}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M10.695 6.74l3.472 3.646m0 0l-3.472 3.646m3.472-3.646H5.834"
        stroke="#E77237"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SubcategoryIcon
