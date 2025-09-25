import React from 'react';
import {View} from 'react-native';
import Svg, {Rect, Path} from 'react-native-svg';
import PropTypes from 'prop-types';

const WhatsOnIcon = ({
  stroke = '#989898',
  filledStroke = '#989898',
  showRedDot = false,
}) => {
  return (
    <View>
      <Svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Rect
          x={1}
          y={4}
          width={18}
          height={15}
          rx={2}
          stroke={stroke}
          strokeWidth={2}
        />
        <Path
          d="M2 9H18"
          stroke={filledStroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M7 14H13"
          stroke={filledStroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M6 1L6 5"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M14 1L14 5"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
      {showRedDot === true && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'red',
            width: 8,
            height: 8,
            borderRadius: 4,
          }}
        />
      )}
    </View>
  );
};

WhatsOnIcon.propTypes = {
  stroke: PropTypes.string,
  filledStroke: PropTypes.string,
  showRedDot: PropTypes.bool,
};

WhatsOnIcon.displayName = 'WhatsOnIcon';

export default WhatsOnIcon;
