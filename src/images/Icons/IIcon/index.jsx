// Import necessary components
import React from 'react';
import PropTypes from 'prop-types';
import Svg, {Path, Circle} from 'react-native-svg';


const IIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    {...props}
  >
    <Path
      stroke="#E77237"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.667}
      d="M14 14v6m0-10.447V9.5m12 12v-15A4.5 4.5 0 0 0 21.5 2h-15A4.5 4.5 0 0 0 2 6.5v15A4.5 4.5 0 0 0 6.5 26h15a4.5 4.5 0 0 0 4.5-4.5Z"
    />
  </Svg>
);

IIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
};
export default IIcon;
