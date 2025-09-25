import * as React from "react"
import Svg, { Path } from "react-native-svg"

function HoroscopeArrowIcon(props) {
    return (
        <Svg
            width={35}
            height={16}
            viewBox="0 0 35 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <Path
                d="M34.707 8.707a1 1 0 000-1.414L28.343.929a1 1 0 10-1.414 1.414L32.586 8l-5.657 5.657a1 1 0 001.414 1.414l6.364-6.364zM0 8v1h34V7H0v1z"
                fill="#fff"
            />
        </Svg>
    )
}

export default HoroscopeArrowIcon
