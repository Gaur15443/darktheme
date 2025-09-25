import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const IIconSuggestedInvite = ({color = '#E77237', ...props}) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M12 1C5.92 1 1 5.92 1 12s4.92 11 11 11 11-4.92 11-11S18.08 1 12 1Zm0 20.465c-5.22 0-9.465-4.246-9.465-9.465 0-5.22 4.246-9.465 9.465-9.465 5.22 0 9.465 4.246 9.465 9.465 0 5.22-4.246 9.465-9.465 9.465Z"
      fill={color}
      stroke={color}
    />
    <Path
      d="M11.997 10.168c-.533 0-.911.275-.911.68v5.517c0 .348.378.695.91.695.51 0 .923-.347.923-.695V10.85c0-.406-.414-.681-.922-.681Zm.011-3.402a.92.92 0 0 0-.922.91c0 .487.405.923.922.923.506 0 .911-.436.911-.923a.92.92 0 0 0-.91-.91Z"
      fill={color}
      stroke={color}
    />
  </Svg>
);

export default IIconSuggestedInvite;
