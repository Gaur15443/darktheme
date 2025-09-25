import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const StoryIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={16}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.667}
      d="M8.771 14.857V2.514m0 12.343-1.214-1.214a3.656 3.656 0 0 0-2.586-1.071H1.913A.914.914 0 0 1 1 11.657v-9.6c0-.505.41-.914.914-.914h3.514c.97 0 1.9.385 2.586 1.071l.757.758.758-.758a3.657 3.657 0 0 1 2.586-1.07h3.97c.506 0 .915.408.915.913v9.6c0 .505-.41.915-.914.915h-3.514c-.97 0-1.9.385-2.586 1.07l-1.215 1.215Z"
    />
  </Svg>
);

export default StoryIcon;
