import LottieView from 'lottie-react-native';
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const Spinner = () => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {theme?.isDarkTheme ? <LottieView
        source={require('../animation/lottie/planets.json')}
        style={{
          width: '50%',
          height: '50%',
        }}
        autoPlay
        speed={1.5}
        loop
      /> : <LottieView
        source={require('../animation/lottie/spinner.json')}
        style={{
          width: '50%',
          height: '50%',
        }}
        autoPlay
        speed={1.5}
        loop
      />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height - 250,
  },
  spinner: {
    width: 90,
    height: 90,
  },
});

export default Spinner;
