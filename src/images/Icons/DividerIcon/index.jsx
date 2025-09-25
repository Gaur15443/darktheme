import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";
const DividerIcon = (props) => (
    <Svg
        width={219}
        height={19}
        viewBox="0 0 219 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M107.938 0a17 17 0 0 1 2.595 9.05c0 3.325-.951 6.427-2.595 9.05a17 17 0 0 1-2.594-9.05c0-3.324.951-6.426 2.594-9.05"
            fill="#3B2978"
        />
        <Path
            d="M116.961 9.267a17 17 0 0 1-9.05 2.594c-3.324 0-6.425-.952-9.049-2.594a17 17 0 0 1 9.049-2.594c3.324 0 6.426.95 9.05 2.594"
            fill="#3B2978"
        />
        <Circle cx={191.167} cy={8.73} r={7.034} fill="#5C5888" />
        <Circle cx={205.977} cy={8.73} r={4.813} fill="#5C5888" />
        <Circle cx={216.342} cy={8.729} r={2.592} fill="#5C5888" />
        <Path
            d="M172.133 9.1h-25.176"
            stroke="#A6A2CD"
            strokeWidth={2}
            strokeLinecap="round"
        />
        <Circle
            cx={7.034}
            cy={7.034}
            r={7.034}
            transform="matrix(-1 0 0 1 34.805 1.695)"
            fill="#5C5888"
        />
        <Circle
            cx={4.813}
            cy={4.813}
            r={4.813}
            transform="matrix(-1 0 0 1 17.773 3.917)"
            fill="#5C5888"
        />
        <Circle
            cx={2.592}
            cy={2.592}
            r={2.592}
            transform="matrix(-1 0 0 1 5.188 6.138)"
            fill="#5C5888"
        />
        <Path
            d="M46.805 9.1H71.98"
            stroke="#A6A2CD"
            strokeWidth={2}
            strokeLinecap="round"
        />
    </Svg>
);
export default DividerIcon;
