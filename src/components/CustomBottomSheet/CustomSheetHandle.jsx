import React, { memo, useMemo } from 'react';
import Animated, { useAnimatedStyle, interpolateColor } from 'react-native-reanimated';

const CustomSheetHandle = ({ style, animatedIndex, ...props }) => {
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedIndex.value,
      [0, 1],
      // TODO: Animate colors based on the position
      ['#000','#000']
    );

    return {
      backgroundColor,
      width: 60,
      height: 4,
      borderRadius: 8,
      marginTop: 4,
      marginBottom: 4,
      alignSelf: 'center',
    };
  });

  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );

  return <Animated.View pointerEvents="none" {...props} style={containerStyle} />;
};

export default memo(CustomSheetHandle);
