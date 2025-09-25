import React from 'react';
import Svg, {Path} from 'react-native-svg';
import NewTheme from '../../../common/NewTheme';

const LocationPinkIcon = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    viewBox="0 0 24 24"
    fill="none"
    // stroke="rgb(237, 56, 105)"
    stroke={NewTheme.colors.primaryOrange}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    className="icon icon-tabler icon-tabler-map-pin"
    {...props}>
    <Path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0" />
    <Path d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
  </Svg>
);

export default LocationPinkIcon;
