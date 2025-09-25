import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const UnknownIcon = (props) => (
    <Svg
        width={25}
        height={25}
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <G clipPath="url(#clip0_20287_8640)">
            <Path
                d="M8.5 7.5C8.5 8.56087 8.92143 9.57828 9.67157 10.3284C10.4217 11.0786 11.4391 11.5 12.5 11.5C13.5609 11.5 14.5783 11.0786 15.3284 10.3284C16.0786 9.57828 16.5 8.56087 16.5 7.5C16.5 6.43913 16.0786 5.42172 15.3284 4.67157C14.5783 3.92143 13.5609 3.5 12.5 3.5C11.4391 3.5 10.4217 3.92143 9.67157 4.67157C8.92143 5.42172 8.5 6.43913 8.5 7.5Z"
                stroke="#6944D3"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M6.5 21.5V19.5C6.5 18.4391 6.92143 17.4217 7.67157 16.6716C8.42172 15.9214 9.43913 15.5 10.5 15.5H14"
                stroke="#6944D3"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M19.5 22.5V22.51"
                stroke="#6944D3"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M19.5 19.4998C19.9483 19.4983 20.3832 19.3466 20.735 19.0687C21.0868 18.7909 21.3352 18.403 21.4406 17.9673C21.5459 17.5315 21.5019 17.0731 21.3158 16.6652C21.1297 16.2574 20.8122 15.9238 20.414 15.7178C20.0162 15.514 19.5611 15.4508 19.1228 15.5385C18.6845 15.6262 18.2888 15.8596 18 16.2008"
                stroke="#6944D3"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </G>
        <Defs>
            <ClipPath id="clip0_20287_8640">
                <Rect
                    width={24}
                    height={24}
                    fill="white"
                    transform="translate(0.5 0.5)"
                />
            </ClipPath>
        </Defs>
    </Svg>
);
export default UnknownIcon;
