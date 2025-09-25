import React from 'react';
import Svg, { Path } from 'react-native-svg';

const QuotesTagIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1.955 19.052c2.7-.008 6.297-1.019 6.276-8.019l-.025-8C8.202 1.783 7.52 1.018 6.4 1.04l-3.6.01c-1.125.004-1.798.756-1.794 1.978l.019 6.028c.003 1.25.68 1.998 1.806 1.995.9-.003.9-.003.903.997l.003 1c.003 1-.894 2.003-1.794 2.005-.9.003-.9.011-.897 1.034l.006 1.97c.003 1 .003 1 .903.996Zm10.8-.033c2.7-.008 6.297-1.02 6.276-8.019l-.025-8C19.002 1.75 18.32.985 17.2 1.006l-3.6.01c-1.125.004-1.798.756-1.794 1.978l.019 6.028c.003 1.25.68 1.998 1.806 1.995l.675-.002c.007 2.25.237 3.999-2.463 4.007l.01 3c.002 1 .002 1 .902.997Z"
    />
  </Svg>
);

export default QuotesTagIcon;
