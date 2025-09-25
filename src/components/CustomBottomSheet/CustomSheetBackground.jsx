import React, {memo, useMemo} from 'react';
import PropTypes from 'prop-types';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

const CustomSheetBackground = ({style, backgroundColor = 'white', ...rest}) => {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  }));
  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );

  return (
    <Animated.View pointerEvents="none" style={containerStyle} {...rest} />
  );
};

CustomSheetBackground.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  backgroundColor: PropTypes.string,
};

CustomSheetBackground.displayName = 'CustomSheetBackground';

export default memo(CustomSheetBackground);
