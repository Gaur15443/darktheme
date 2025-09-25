import React from 'react';
import { Svg, Path } from 'react-native-svg';
import PropTypes from 'prop-types';

const TopQuoteIcon = ({ width = '100', height = '100', ...props }) => (
  <Svg
    {...props}
    width={width}
    height={height}
    viewBox="0 0 89 81"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M55.5626 81C53.9058 81 52.5626 79.6569 52.5626 78V46.0134C52.5626 45.5164 52.6861 45.0272 52.9219 44.5897L76.1125 1.5763C76.636 0.605351 77.6501 0 78.7531 0H85.8021C87.8805 0 89.3292 2.06225 88.6243 4.01746L77.2746 35.4989C76.6189 37.3177 77.8295 39.2727 79.7499 39.4962L85.72 40.1912C87.2325 40.3672 88.3732 41.6484 88.3732 43.1711V78C88.3732 79.6569 87.03 81 85.3732 81H55.5626ZM3 81C1.34315 81 0 79.6569 0 78V46.0167C0 45.5176 0.124528 45.0264 0.362303 44.5876L23.67 1.57082C24.1944 0.602925 25.2069 0 26.3077 0H33.3609C35.4392 0 36.8879 2.06225 36.1831 4.01746L24.8319 35.5031C24.1766 37.3205 25.3851 39.2744 27.3038 39.5L33.1608 40.1885C34.6718 40.3661 35.8106 41.6466 35.8106 43.168V78C35.8106 79.6569 34.4674 81 32.8106 81H3Z"
      fill="#FFE9DF"
    />
  </Svg>
);

TopQuoteIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};

TopQuoteIcon.displayName = 'TopQuoteIcon';

export default TopQuoteIcon;
