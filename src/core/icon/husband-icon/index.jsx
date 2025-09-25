import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import PropTypes from 'prop-types';

const HusbandIcon = ({isDisabled = false, ...props}) => {
  const colors = {
    disabled: ['#FFFFFF', '#FFFFFF'],
    enabled: ['#6FC1EE', '#B6E5FF'],
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
      <Svg width={68} height={87}>
        <Defs>
          <LinearGradient
            id="husbandIconGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%">
            <Stop offset="0%" stopColor={fillColor[0]} />
            <Stop offset="95%" stopColor={fillColor[1]} />
          </LinearGradient>
        </Defs>
        <Path
          fill={'url(#husbandIconGradient)'}
          d="M.809 74.35c1.984-5.487 6.921-9.937 12.695-10.992 1.282-.235 2.588-.32 3.892-.403 1.712-.11 3.421-.22 5.07-.672 2.903-.795 3.914-3.145 3.788-6.18l-.019-.47c-.08-2.086-.146-3.792-1.89-5.035-1.875-1.335-2.774-2.413-4.198-4.22-2.068-2.638-2.84-6.256-2.877-9.609-.01-.997-.037-2.055-.065-3.152-.022-.893-.045-1.81-.061-2.742-.298-2.069-.888-4.118-1.48-6.173-.799-2.778-1.601-5.565-1.688-8.423-.081-2.498.57-5.28 2.615-6.741 2.176-1.564 5.083-1.128 7.722-.45.961-2.453 2.296-4.678 4.404-6.22C32.681-.026 38.34.478 42.69 2.752c1.459.77 2.82 1.708 4.178 2.644 1.652 1.139 3.301 2.275 5.12 3.108 3.313 1.524 7.681 1.749 10.203-.894-2.054 4.31-4.436 8.957-8.796 10.894-.935.416-1.916.685-2.921.86.946 4.303.814 9.632.698 14.272a232.117 232.117 0 0 0-.064 3.142c-.036 3.353-.809 6.97-2.876 9.61-1.425 1.797-2.32 2.889-4.198 4.22-1.73 1.224-1.798 2.909-1.883 4.964-.007.178-.014.358-.023.54-.13 3.012.877 5.394 3.785 6.18 1.646.446 3.35.557 5.057.668 1.308.085 2.617.17 3.904.407 5.642 1.03 10.472 5.298 12.546 10.606-8.868 8.015-20.622 12.896-33.516 12.896-12.691 0-24.278-4.728-33.095-12.52Z"
        />
      </Svg>
    </View>
  );
};

HusbandIcon.propTypes = {
  isDisabled: PropTypes.bool,
};

export default HusbandIcon;
