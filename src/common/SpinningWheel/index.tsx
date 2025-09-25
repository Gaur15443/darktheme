import React, {useEffect, useRef, useCallback, useMemo} from 'react';
import {
  Animated,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  Easing,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';

interface SpinningWheelProps {
  source: ImageSourcePropType;
  size?: number;
  duration?: number;
  style?: StyleProp<ImageStyle>;
}

function SpinningWheel({
  source,
  size = 100,
  duration = 40000,
  style,
}: SpinningWheelProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const lastDurationRef = useRef(duration);

  const rotate = useMemo(
    () =>
      spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [spin],
  );

  const baseStyle = useMemo(
    () => ({
      width: size,
      height: size,
    }),
    [size],
  );

  const imageStyle = useMemo(
    () => [baseStyle, {transform: [{rotate}]}, style],
    [baseStyle, rotate, style],
  );

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();
    spin.setValue(0);

    animationRef.current = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
      {
        resetBeforeIteration: false, // Prevents UI thread blocking
        iterations: -1, // Infinite loop without blocking
      },
    );

    animationRef.current.start();
    lastDurationRef.current = duration;
  }, [duration, stopAnimation]);

  useEffect(() => {
    if (isFocused) {
      // Only recreate animation if duration changed or no animation exists
      if (lastDurationRef.current !== duration || !animationRef.current) {
        startAnimation();
      }
    } else {
      stopAnimation();
    }
  }, [isFocused, duration, startAnimation, stopAnimation]);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return (
    <Animated.Image source={source} resizeMode="contain" style={imageStyle} />
  );
}

export default SpinningWheel;
