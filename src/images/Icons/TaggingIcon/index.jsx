import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

const TaggingIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={18}
    viewBox="0 0 20 20" // Maintain the aspect ratio
    fill="none"
    {...props}
  >
    <G clipPath="url(#clip)">
      <Path
        fill="#fff"
        d="m14.4 4.816-3.815-2.917a.963.963 0 0 0-1.174 0L5.596 4.816a.965.965 0 0 0-.38.768L5.214 17.17a.85.85 0 0 0 .846.846h7.876a.85.85 0 0 0 .846-.846L14.78 5.584a.965.965 0 0 0-.38-.768Zm-3.558-.584a.844.844 0 1 1-1.688 0 .844.844 0 0 1 1.688 0Z"
      />
      <Path
        fill="#F74850"
        d="M10.751.767a.943.943 0 0 1 .152.831l-.125.433-.192-.147a.923.923 0 0 0-.283-.15l.082-.286a.397.397 0 0 0-.207-.477.408.408 0 0 0-.182-.04.406.406 0 0 0-.393.517l.651 2.275a.268.268 0 1 1-.516.144l-.649-2.27A.946.946 0 0 1 9.633.465a.936.936 0 0 1 .36-.07.942.942 0 0 1 .758.373Z"
      />
    </G>
    <Defs>
      <ClipPath id="clip">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default TaggingIcon;
