import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import PropTypes from 'prop-types';

const BrotherIcon = ({isDisabled = false, ...props}) => {
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
      <Svg width={70} height={93}>
        <Defs>
          <LinearGradient
            id="brotherIconGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%">
            <Stop offset="0%" stopColor={fillColor[0]} />
            <Stop offset="95%" stopColor={fillColor[1]} />
          </LinearGradient>
        </Defs>
        <Path
          fill={'url(#brotherIconGradient)'}
          d="M.945 78.594C9.962 87.424 22.31 92.87 35.927 92.87c12.923 0 24.7-4.902 33.575-12.949a11.03 11.03 0 0 0 .485-1.071c-.462-7.401-6.41-14.096-13.693-15.427-1.288-.235-2.6-.32-3.91-.404-1.726-.11-3.45-.222-5.115-.676-2.927-.8-3.942-3.191-3.812-6.224l.019-.482v-.001c.078-2.094.143-3.81 1.901-5.058 1.892-1.344 2.793-2.432 4.226-4.255 2.087-2.655 2.862-6.297 2.899-9.67.01-1.01.037-2.08.064-3.19l.004-.138c1.247-2.877 2.081-5.918 2.287-9.042.328-5.002-1.088-10.23-4.43-13.954-2.35-2.62-5.713-4.386-9.188-4.765a9.62 9.62 0 0 0 .545-4.694 7.829 7.829 0 0 1-3.5 4.021c-.287-1.235-.574-2.473-.86-3.712a6.358 6.358 0 0 1-1.74 4.163c-.347.004-.687.02-1.017.044-3.674-.148-7.486 1.096-11.034 2.341C18.831 9.411 13.55 11.108 8.766 9.35a17.53 17.53 0 0 0 11.321 5.584 42.655 42.655 0 0 1-12.733 3.737 24.36 24.36 0 0 0 11.347 2.4c-.564 3.927-.45 8.425-.35 12.418.027 1.1.054 2.162.065 3.163.033 3.373.812 7.015 2.9 9.67 1.432 1.819 2.33 2.91 4.221 4.255 1.762 1.25 1.827 2.97 1.906 5.07l.018.471c.13 3.033-.876 5.42-3.812 6.224-1.67.457-3.396.568-5.123.678-1.307.083-2.616.167-3.901.402-7.2 1.324-13.094 7.88-13.68 15.172Z"
        />
      </Svg>
    </View>
  );
};

BrotherIcon.propTypes = {
  isDisabled: PropTypes.bool,
};

export default BrotherIcon;
