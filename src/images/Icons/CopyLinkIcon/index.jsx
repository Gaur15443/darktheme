import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import NewTheme from '../../../common/NewTheme';
const CopyLinkIcon = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="m7.381 10.19-2.234 2.234a4.45 4.45 0 0 0 .047 6.343 4.45 4.45 0 0 0 3.182 1.352 4.36 4.36 0 0 0 3.162-1.278l2.233-2.233m2.853-2.798 2.233-2.234a4.45 4.45 0 0 0-.047-6.343 4.54 4.54 0 0 0-3.18-1.325 4.4 4.4 0 0 0-3.163 1.278L10.234 7.42m-1.618 7.907 6.7-6.7"
      stroke={NewTheme.colors.primaryOrange}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CopyLinkIcon;
