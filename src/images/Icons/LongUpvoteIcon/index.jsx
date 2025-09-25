import * as React from "react";
import Svg, { Path } from "react-native-svg";
const LongUpvoteIcon = ({ fill = 'none', stroke = '#fff', strokeWidth = 1, ...props }) => (
    <Svg
        width={12}
        height={14}
        viewBox="0 0 12 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M6 0L12 6.36364H8.25V13.6818C8.25 13.8568 8.08125 14 7.875 14H4.125C3.91875 14 3.75 13.8568 3.75 13.6818V6.36364H0L6 0Z"
            fill={fill}
            strokeWidth={strokeWidth}
            stroke={stroke}
            fillOpacity={0.9}
        />
    </Svg>
);
export default LongUpvoteIcon;
