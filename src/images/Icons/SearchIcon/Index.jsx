import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const SearchIcon = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="m16.928 17.042 3.474 3.36m-1.12-8.96a7.84 7.84 0 1 1-15.68 0 7.84 7.84 0 0 1 15.68 0Z"
      stroke="#000"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
export default SearchIcon;
