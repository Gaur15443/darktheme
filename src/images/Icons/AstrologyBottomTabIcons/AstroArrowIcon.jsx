import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const AstroArrowIcon = (props) => (
    <Svg
        width={12}
        height={12}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <G clipPath="url(#clip0_23546_13106)">
            <Path
                d="M11.3346 4.6665L4.66797 11.3332"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M5.33203 4.6665H11.332V10.6665"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </G>
        <Defs>
            <ClipPath id="clip0_23546_13106">
                <Rect width={16} height={16} fill="white" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default AstroArrowIcon;
