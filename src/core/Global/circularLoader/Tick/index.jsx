import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import PropTypes from 'prop-types';

const Tick = ({handler}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    handler();
  }, []);
  const circleStrokeDashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
    extrapolate: 'clamp',
  });
  return (
    <View style={[styles.container, {width: 100, height: 100}]}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
        style={styles.svg}>
        <AnimatedPath
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
          stroke="#0A76BE"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="50"
          strokeDashoffset={circleStrokeDashOffset}
        />
      </Svg>
    </View>
  );
};

Tick.propTypes = {
  handler: PropTypes.func.isRequired,
};
const AnimatedPath = Animated.createAnimatedComponent(Path);
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // svg: {
  //   maxWidth: '100%',
  //   maxHeight: 250,
  // },
});

export default Tick;
