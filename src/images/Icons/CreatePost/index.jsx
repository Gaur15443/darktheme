import * as React from "react";
import Svg, {Rect, Path } from "react-native-svg";
const CreatePost = (props) => (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M8.69607 1.99998L8.69607 15.3921M15.3921 8.69604L2 8.69604"
        stroke="black"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>  
);
export default CreatePost;
