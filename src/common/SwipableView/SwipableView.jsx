import React from 'react';
import {View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

const Snappable = ({children, onSwipeEnd}) => {
  const dragX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const clampedX = Math.max(dragX.value, 0);

    // ✅ smoother interpolation instead of hard cutoffs
    const visualPos = interpolate(
      clampedX,
      [0, 100], // input range
      [0, 70], // output range
      'clamp',
    );

    return {
      transform: [{translateX: visualPos}],
    };
  });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate(e => {
      dragX.value = Math.max(e.translationX, 0);
    })
    .onEnd(e => {
      if (onSwipeEnd && dragX.value >= 49) {
        runOnJS(onSwipeEnd)();
      }
      dragX.value = withSpring(0, {
        velocity: e.velocityX,
        damping: 20,
        stiffness: 120,
        overshootClamping: true,
      });
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle, {width: '100%'}]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export const SwipableView = ({
  children,
  onSwipeEnd = () => {},
  disabled = false,
}) => {
  return disabled ? (
    <View style={{width: '100%'}}>{children}</View>
  ) : (
    <Snappable onSwipeEnd={onSwipeEnd}>{children}</Snappable>
  );
};
