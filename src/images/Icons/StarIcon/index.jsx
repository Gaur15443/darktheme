import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const StarIcon = ({ stroke = "white", ...props }) => (
    <Svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <G clipPath="url(#clip0_20840_9180)">
            <Path
                d="M12.0008 17.75L5.82881 20.995L7.00781 14.122L2.00781 9.25495L8.90781 8.25495L11.9938 2.00195L15.0798 8.25495L21.9798 9.25495L16.9798 14.122L18.1588 20.995L12.0008 17.75Z"
                stroke={stroke}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </G>
        <Defs>
            <ClipPath id="clip0_20840_9180">
                <Rect width={24} height={24} fill="white" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default StarIcon;
