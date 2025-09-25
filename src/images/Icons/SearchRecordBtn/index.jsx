import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';
const SearchRecordBtn = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <G clipPath="url(#a)">
      <Path
        d="m23.234 21.86-5.712-5.94a9.66 9.66 0 0 0 2.273-6.23c0-5.343-4.347-9.69-9.69-9.69S.415 4.347.415 9.69s4.347 9.69 9.69 9.69a9.6 9.6 0 0 0 5.552-1.753l5.755 5.985c.24.25.564.388.91.388a1.265 1.265 0 0 0 .91-2.14M10.105 2.528a7.17 7.17 0 0 1 7.162 7.162 7.17 7.17 0 0 1-7.162 7.162A7.17 7.17 0 0 1 2.943 9.69a7.17 7.17 0 0 1 7.162-7.162"
        fill="#000"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SearchRecordBtn;
