import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const AstroConsultationIcon = (props) => (
    <Svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <G clipPath="url(#clip0_19170_8080)">
            <Path
                d="M10.0058 16.65C8.76311 16.6524 7.53599 16.3732 6.41667 15.8333L2.5 16.6667L3.58333 13.4167C1.64667 10.5525 2.395 6.85667 5.33333 4.77167C8.27167 2.6875 12.4917 2.85833 15.2042 5.17167C16.8642 6.58833 17.6458 8.53833 17.4933 10.455"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M13.334 15.8333H18.334"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M15.834 13.3333V18.3333"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </G>
        <Defs>
            <ClipPath id="clip0_19170_8080">
                <Rect width={20} height={20} fill="white" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default AstroConsultationIcon;
