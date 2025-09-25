import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import PropTypes from 'prop-types';

const DaughterIcon = ({isDisabled = false, ...props}) => {
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
      <Svg width={69} height={84}>
        <Defs>
          <LinearGradient
            id="daughterIconGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%">
            <Stop offset="0%" stopColor={fillColor[0]} />
            <Stop offset="95%" stopColor={fillColor[1]} />
          </LinearGradient>
        </Defs>
        <Path
          fill={'url(#daughterIconGradient)'}
          d="m0 71.278.25.22c.396-5.397 2.703-15.386 14.429-14.596 16.005 1.078 12.398-8.529 12.398-8.529S16.152 44.569 14.81 28.759a68.11 68.11 0 0 1-8.762 7.13c1.907-3.8 1.802-8.288 1.267-12.504-.118-.933-.256-1.866-.393-2.8-.484-3.29-.97-6.59-.628-9.883.293-2.866 1.297-5.794 3.44-7.718a8.528 8.528 0 0 1 9.506-1.13 8.528 8.528 0 0 1 4.154 5.653c2.074-1.079 4.641-1.755 7.819-1.788 4.777-.05 8.482.93 11.335 2.498a8.326 8.326 0 0 1 13.803-5.242c2.144 1.924 3.147 4.852 3.44 7.718.342 3.294-.143 6.593-.627 9.882-.138.934-.275 1.869-.393 2.801-.535 4.216-.645 8.704 1.262 12.504a68.08 68.08 0 0 1-9.001-7.364C48.82 44.51 39.019 48.369 39.019 48.369s-3.593 9.607 12.399 8.529c11.873-.8 14.088 9.469 14.441 14.811a50.284 50.284 0 0 0 2.672-2.484c-9.048 9.048-21.548 14.644-35.355 14.644-12.73 0-24.35-4.757-33.176-12.591Z"
        />
      </Svg>
    </View>
  );
};

DaughterIcon.propTypes = {
  isDisabled: PropTypes.bool,
};

export default DaughterIcon;
