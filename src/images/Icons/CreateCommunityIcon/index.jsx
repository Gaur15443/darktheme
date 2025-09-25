import * as React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
const CreateCommunityIcon = props => (
  <Svg
    width={44}
    height={44}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Circle cx={22} cy={22} r={22} fill="#E77237" />
    <Path
      d="M11.398 31.598a1 1 0 1 0 2 0zm1-3.6h1zm10.2-2.6a1 1 0 1 0 0-2zm9 1.2a1 1 0 1 0 0-2zm-5.4-2a1 1 0 0 0 0 2zm1.7 3.7a1 1 0 0 0 2 0zm2-5.4a1 1 0 1 0-2 0zm-6.5-6.9a2.6 2.6 0 0 1-2.6 2.6v2a4.6 4.6 0 0 0 4.6-4.6zm-2.6 2.6a2.6 2.6 0 0 1-2.6-2.6h-2a4.6 4.6 0 0 0 4.6 4.6zm-2.6-2.6a2.6 2.6 0 0 1 2.6-2.6v-2a4.6 4.6 0 0 0-4.6 4.6zm2.6-2.6a2.6 2.6 0 0 1 2.6 2.6h2a4.6 4.6 0 0 0-4.6-4.6zm-7.4 18.2v-3.6h-2v3.6zm2.6-8.2a4.6 4.6 0 0 0-4.6 4.6h2a2.6 2.6 0 0 1 2.6-2.6zm0 2h6.6v-2h-6.6zm15.6-.8h-2.7v2h2.7zm-2.7 0h-2.7v2h2.7zm1 3.7v-2.7h-2v2.7zm0-2.7v-2.7h-2v2.7z"
      fill="#fff"
    />
  </Svg>
);
export default CreateCommunityIcon;
