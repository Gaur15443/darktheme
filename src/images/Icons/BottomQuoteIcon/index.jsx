import React from 'react';
import { Svg, Path } from 'react-native-svg';
import PropTypes from 'prop-types';

const BottomQuoteIcon = ({ width = '100', height = '100', ...props }) => (
  <Svg
    {...props}
    width={width}
    height={height}
    viewBox="0 0 90 81"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M33.5077 0C35.1646 0 36.5077 1.34315 36.5077 3V34.9866C36.5077 35.4836 36.3842 35.9728 36.1484 36.4103L12.9578 79.4237C12.4343 80.3946 11.4202 81 10.3172 81H3.26823C1.18984 81 -0.25885 78.9378 0.446045 76.9825L11.7957 45.5011C12.4514 43.6823 11.2408 41.7273 9.3204 41.5038L3.3503 40.8088C1.83784 40.6328 0.697151 39.3516 0.697151 37.8289V3C0.697151 1.34315 2.0403 0 3.69715 0H33.5077ZM86.0703 0C87.7272 0 89.0703 1.34315 89.0703 3V34.9833C89.0703 35.4824 88.9458 35.9736 88.708 36.4124L65.4003 79.4292C64.8759 80.3971 63.8635 81 62.7626 81H55.7095C53.6311 81 52.1824 78.9378 52.8873 76.9825L64.2384 45.4969C64.8937 43.6795 63.6852 41.7256 61.7665 41.5L55.9095 40.8115C54.3986 40.6339 53.2598 39.3534 53.2598 37.832V3C53.2598 1.34315 54.6029 0 56.2598 0H86.0703Z"
      fill="#FFE9DF"
    />
  </Svg>
);

BottomQuoteIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};

BottomQuoteIcon.displayName = 'BottomQuoteIcon';

export default BottomQuoteIcon;
