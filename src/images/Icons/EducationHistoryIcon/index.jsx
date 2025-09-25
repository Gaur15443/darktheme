import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const EducationHistoryIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
   <Path
      stroke="#035997"
      strokeWidth={2}
      d="M4 17.625h4.625c.348 0 .522 0 .67.014a3 3 0 0 1 2.69 2.692c.015.147.015.32.015.669V9c0-2.828 0-4.243-.879-5.121C10.243 3 8.828 3 6 3H4c-.943 0-1.414 0-1.707.293C2 3.586 2 4.057 2 5v10.625c0 .943 0 1.414.293 1.707.293.293.764.293 1.707.293ZM20 17.625h-4.625c-.348 0-.522 0-.67.014a3 3 0 0 0-2.69 2.692C12 20.478 12 20.65 12 21V9c0-2.828 0-4.243.879-5.121C13.757 3 15.172 3 18 3h2c.943 0 1.414 0 1.707.293C22 3.586 22 4.057 22 5v10.625c0 .943 0 1.414-.293 1.707-.293.293-.764.293-1.707.293Z"
    />
  </Svg>
);
export default EducationHistoryIcon;
