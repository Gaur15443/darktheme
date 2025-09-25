import React from 'react';
import Svg, {Path} from 'react-native-svg';

const AddAutoMedia = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={14}
    viewBox="0 0 14 14"
    {...props}
  >
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeWidth={2.328}
      d="M12.56 6.97H1.382M6.97 12.56V1.382"
    />
  </Svg>
);

export default AddAutoMedia;
