import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const AstroKundaliIcon = (props) => (
    <Svg
        width={21}
        height={20}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <G clipPath="url(#clip0_19170_8087)">
            <Path
                d="M10.5 1.66667L13 5.83333H18L15.5 10L18 14.1667H13L10.5 18.3333L8 14.1667H3L5.5 10L3 5.83333H8L10.5 1.66667Z"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </G>
        <Defs>
            <ClipPath id="clip0_19170_8087">
                <Rect width={20} height={20} fill="white" transform="translate(0.5)" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default AstroKundaliIcon;
