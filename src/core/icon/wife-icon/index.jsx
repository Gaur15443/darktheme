import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import PropTypes from 'prop-types';

const WifeIcon = ({isDisabled = false, ...props}) => {
  const colors = {
    disabled: ['#FFFFFF', '#FFFFFF'],
    enabled: ['#FE3C76', '#F7789E'],
  };

  const [fillColor, setFillColor] = useState(colors.enabled);

  useEffect(() => {
    if (isDisabled) {
      setFillColor(colors.disabled);
    } else {
      setFillColor(colors.enabled);
    }
  }, [isDisabled]);

  return (
    <View {...props}>
      <Svg width={64} height={86} viewBox="0 0 64 86">
        <Defs>
          <LinearGradient
            id="wifeIconGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%">
            <Stop offset="0%" stopColor={fillColor[0]} />
            <Stop offset="95%" stopColor={fillColor[1]} />
          </LinearGradient>
        </Defs>
        <Path
          fill={'url(#wifeIconGradient)'}
          stroke="#fff"
          d="M26.298 51.129c-6.93.89-15.181.77-21.25-.499a41.09 41.09 0 0 0 9.467-26.545l.014.023.013-1.7c.01-1.308.185-6.567 2.244-11.505 1.027-2.464 2.514-4.823 4.66-6.576 2.139-1.746 4.956-2.91 8.694-2.956 8.058-.1 12.864 3.451 15.659 7.853 2.815 4.433 3.604 9.76 3.518 13.16l-.046 1.806.067-.105a41.072 41.072 0 0 0 9.466 26.545c-6.069 1.268-14.313 1.388-21.242.5l-.492-.063-.067.492c-.2 1.472-.235 4.071 1.476 6.178 1.727 2.128 5.105 3.6 11.375 3.098 4.768-.383 7.83 1.491 9.83 4.218 1.964 2.679 2.919 6.207 3.367 9.306a49.292 49.292 0 0 1-31.127 11.01A49.291 49.291 0 0 1 .8 74.362c.45-3.1 1.406-6.63 3.372-9.31 2.001-2.727 5.063-4.602 9.83-4.217 6.27.505 9.648-.968 11.377-3.097 1.711-2.108 1.678-4.708 1.479-6.18l-.067-.492-.493.063Z"
        />
      </Svg>
    </View>
  );
};

WifeIcon.propTypes = {
  isDisabled: PropTypes.bool,
};

export default WifeIcon;
