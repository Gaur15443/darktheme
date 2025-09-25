import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import PropTypes from 'prop-types';

const FatherIcon = ({isDisabled = false, ...props}) => {
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
      <Svg width={68} height={85}>
        <Defs>
          <LinearGradient
            id="fatherIconGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%">
            <Stop offset="0%" stopColor={fillColor[0]} />
            <Stop offset="100%" stopColor={fillColor[1]} />
          </LinearGradient>
        </Defs>
        <Path
          fill={'url(#fatherIconGradient)'}
          d="m.945 72.423.031.027c.575-7.038 6.268-13.367 13.222-14.637 1.245-.229 2.514-.31 3.782-.39 1.668-.108 3.334-.214 4.942-.656 2.829-.777 3.811-3.085 3.689-6.017a108.9 108.9 0 0 1-.018-.458c-.077-2.028-.14-3.692-1.845-4.9-1.83-1.298-2.698-2.347-4.083-4.111-2.016-2.569-2.762-6.088-2.801-9.351-.017-1.594-.14-3.412-.27-5.32-.32-4.747-.68-10.05.463-13.847 1.602-5.323 4.983-8.507 10.021-10.85 0 0 7.497-2.348 12.528 0 5.03 2.347 8.42 5.523 10.017 10.85 1.14 3.801.784 9.109.465 13.857-.129 1.904-.25 3.719-.267 5.31-.036 3.263-.79 6.782-2.806 9.35-1.385 1.765-2.257 2.814-4.083 4.112-1.7 1.208-1.764 2.871-1.84 4.9l-.019.458c-.122 2.932.856 5.244 3.685 6.017 1.606.439 3.27.546 4.937.653 1.27.082 2.54.164 3.787.393 6.75 1.232 12.309 7.224 13.16 14.007-8.887 8.106-20.708 13.05-33.685 13.05-12.651 0-24.205-4.7-33.012-12.447Z"
        />
      </Svg>
    </View>
  );
};

FatherIcon.propTypes = {
  isDisabled: PropTypes.bool,
};

export default FatherIcon;
