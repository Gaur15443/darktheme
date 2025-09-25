import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

const CustomHamburger = ({
  onPress,
  drawerVisible,
  hasVisitedRef,
  backgroundColor = '#fff',
  animate = true,
}) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!animate) return;
    const toValue = drawerVisible ? 1 : 0;
    if (drawerVisible) {
      animation.setValue(0);
    } else if (hasVisitedRef?.current !== true) {
      animation.setValue(1);
    }
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [drawerVisible, animation, animate]);

  const handleToggleMenu = () => {
    if (onPress) {
      onPress();
    }
  };

  // Interpolation for line animations
  const topLineTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5], // Move down to match the bottom line evenly
  });

  const topLineRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'], // Rotate to 45 degrees for a perfect X
  });

  const middleLineOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0], // Fade out the middle line
  });

  const bottomLineTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5], // Move up to match the top line evenly
  });

  const bottomLineRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'], // Rotate to -45 degrees for a perfect X
  });

  return (
    <TouchableOpacity
      onPress={handleToggleMenu}
      accessibilityLabel="Toggle menu"
      accessible={true}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.line,
            { backgroundColor },
            {
              transform: [
                { translateY: topLineTranslateY },
                { rotate: topLineRotate },
              ],
            },
          ]}
        />
        <Animated.View
          style={[styles.line, { backgroundColor, opacity: middleLineOpacity }]}
        />
        <Animated.View
          style={[
            styles.line,
            { backgroundColor },
            {
              transform: [
                { translateY: bottomLineTranslateY },
                { rotate: bottomLineRotate },
              ],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 16,
    // height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  line: {
    width: 16,
    height: 2,
    backgroundColor: 'black',
    marginVertical: 1.5,
    borderRadius: 2,
  },
});

export default CustomHamburger;
