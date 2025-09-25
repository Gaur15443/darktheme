import React, {ReactNode, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';

interface ShiningButtonProps {
  children: ReactNode;
  darkMode?: boolean;
  animate?: boolean;
  style?: ViewStyle;
}

const ShiningButton: React.FC<ShiningButtonProps> = ({
  children,
  animate = true,
  darkMode = false,
  style = {},
}) => {
  const screenWidth = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(-150)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (animate) {
      translateX.setValue(-150);
      animationRef.current = Animated.loop(
        Animated.timing(translateX, {
          toValue: screenWidth,
          duration: 1500,
          useNativeDriver: true,
        }),
      );
      animationRef.current.start();
    } else {
      animationRef.current?.stop();
      translateX.setValue(-150);
    }
  }, [animate]);

  return (
    <View style={[styles.buttonContainer, style]}>
      {animate && (
        <Animated.View
          style={[
            styles.shineOverlay,
            {
              backgroundColor: darkMode
                ? 'rgba(105, 68, 211, 0.2)'
                : 'rgba(255,255,255,0.3)',
            },
            {
              transform: [
                {translateX},
                Platform.OS === 'ios' ? {skewX: '30deg'} : {skewY: '30deg'},
              ],
            },
          ]}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  shineOverlay: {
    position: 'absolute',
    top: -30,
    left: 0,
    bottom: -30,
    width: 30,
    zIndex: 2,
  },
});

export default ShiningButton;
