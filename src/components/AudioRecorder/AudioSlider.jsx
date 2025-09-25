import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';

const AudioSlider = ({maxValue, sliderValue, postingInProgress, ...props}) => {
  const styles = createStyles();
  const [animatedWidth, setAnimatedWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: (sliderValue / maxValue) * 100,
      duration: 1000, // Adjust the duration as needed
      useNativeDriver: false,
    }).start();
  }, [sliderValue, maxValue]);

  return (
    <View {...props}>
      <View style={styles.sliderTrack}>
        <Animated.View
          style={[
            styles.sliderThumb,
            { width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }) },
          ]}
        />
      </View>
    </View>
  );
};

function createStyles() {
  const theme = useTheme();

  return StyleSheet.create({
    sliderValue: {
      marginBottom: 5,
      fontSize: 18,
    },
    sliderTrack: {
      width: 250,
      height: 5,
      backgroundColor: '#ddd',
      borderRadius: 5,
      position: 'relative',
    },
    sliderThumb: {
      height: 10,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      position: 'absolute',
      top: -2.5,
    },
  });
}

AudioSlider.propTypes = {
  maxValue: PropTypes.number.isRequired,
  postingInProgress: PropTypes.bool,
  sliderValue: PropTypes.number.isRequired,
};

export default AudioSlider;
