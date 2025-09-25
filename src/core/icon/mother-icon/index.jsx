import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import PropTypes from 'prop-types';

const MotherIcon = ({isDisabled = false, ...props}) => {
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
      <Svg width={68} height={85} viewBox="0 0 76 105">
        <Defs>
          <LinearGradient
            id="motherIconGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%">
            <Stop offset="0%" stopColor={fillColor[0]} />
            <Stop offset="95%" stopColor={fillColor[1]} />
          </LinearGradient>
        </Defs>
        <Path
          fill={'url(#motherIconGradient)'}
          fillRule="evenodd"
          d="M.83 90.837c2.399-5.29 6.795-9.597 14.807-8.95C35.103 83.454 28.585 69.47 28.585 69.47s-4.872-2.353-8.639-10.36c-1.117 2.689-2.733 5.147-5.065 6.776 2.407-2.495 3.83-5.17 4.618-7.765a40.837 40.837 0 0 1-1.965-5.7c-.446 1.85-2.47 9.937-4.489 12.982 2.647-4.818 2.257-8.454 1.678-13.844-.12-1.12-.249-2.315-.36-3.612-4.895-23.165 5.413-33.551 10.955-37.328.875-.632 1.83-1.19 2.87-1.658C28.616 3.94 32.749 0 37.784 0c3.026 0 5.725 1.423 7.49 3.648 1.62-.33 3.265-.406 4.884-.116a19.846 19.846 0 0 0-4.532.587c.104.149.205.301.301.456a12.08 12.08 0 0 1 3.048.143c-.987.016-1.927.099-2.823.239a9.915 9.915 0 0 1 1.258 4.572c.49.203 20.07 8.494 14.016 38.56-.214 2.824-1.076 5.779-1.906 8.626-1.343 4.607-2.605 8.933-.905 11.96-1.207-.977-1.367-4.61-1.189-8.224a59.837 59.837 0 0 0-.066-6.798c-1.157 3.734-2.516 6.653-3.851 8.909.043 2.67.66 5.718 2.38 8.914-1.919-1.938-2.898-4.632-3.344-7.388-2.735 4.056-5.127 5.388-5.127 5.388s-6.525 13.98 12.947 12.41c8.28-.667 12.699 3.951 15.042 9.48-9.99 8.417-22.892 13.489-36.978 13.489-14.38 0-27.525-5.285-37.599-14.018Zm46.58-81.27c.002.076.003.152.003.229l.06.03-.063-.259Z"
          clipRule="evenodd"
        />
      </Svg>
    </View>
  );
};

MotherIcon.propTypes = {
  isDisabled: PropTypes.bool,
};

export default MotherIcon;
