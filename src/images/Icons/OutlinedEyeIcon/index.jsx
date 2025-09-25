import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const OutlinedEyeIcon = (props) => (
    <Svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <G clipPath="url(#clip0_23805_21798)">
            <Path
                d="M8.33594 9.9987C8.33594 10.4407 8.51153 10.8646 8.82409 11.1772C9.13665 11.4898 9.56058 11.6654 10.0026 11.6654C10.4446 11.6654 10.8686 11.4898 11.1811 11.1772C11.4937 10.8646 11.6693 10.4407 11.6693 9.9987C11.6693 9.55667 11.4937 9.13275 11.1811 8.82019C10.8686 8.50763 10.4446 8.33203 10.0026 8.33203C9.56058 8.33203 9.13665 8.50763 8.82409 8.82019C8.51153 9.13275 8.33594 9.55667 8.33594 9.9987Z"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M17.5 10C15.5 13.3333 13 15 10 15C7 15 4.5 13.3333 2.5 10C4.5 6.66667 7 5 10 5C13 5 15.5 6.66667 17.5 10Z"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </G>
        <Defs>
            <ClipPath id="clip0_23805_21798">
                <Rect width={20} height={20} fill="white" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default OutlinedEyeIcon;
