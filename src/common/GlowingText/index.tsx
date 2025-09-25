import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, Text } from 'react-native';
import { useEffect } from 'react';
import { hexToRgba } from '../../utils/format';
import React from 'react';

const GlowingText = ({ color = "#fff", text = "", style = {} }) => {
  const glowColor = color?.startsWith("#") ? hexToRgba(color) : color;
  const glowValue = useSharedValue(0.5);

  useEffect(() => {
    glowValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [glowValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      textShadowRadius: glowValue.value * 20,
      opacity: 0.5 + glowValue.value * 0.5,
    };
  });

  const AnimatedText = Animated.createAnimatedComponent(Text);

  return (
    <AnimatedText
      style={[
        styles.glowText,
        { textShadowColor: glowColor, color: color },
        animatedStyle,
        style
      ]}
    >
      {text}
    </AnimatedText>
  );
};

const styles = StyleSheet.create({
  glowText: {
    fontFamily: 'PublicSans Regular',
    textShadowOffset: { width: 0, height: 0 },
  },
});


export default GlowingText