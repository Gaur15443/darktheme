import LottieView from 'lottie-react-native';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

type SpinnerProps = {
  color?: string;
  height?: number;
  width?: number;
  marginTop?: number;
};

const Spinner = ({ color, height = 20, width = 20, marginTop }: SpinnerProps) => {
  const theme = useTheme();
  const spinnerStyle = {
    width,
    height,
    padding: Platform.OS === 'ios' ? 0 : 15,
    marginTop: marginTop,
  }
  return (
    <>
      {color ? (
        <LottieView
          source={require('../animation/lottie/white_ios_spinner.json')}
          style={spinnerStyle}
          autoPlay
          speed={1.5}
          loop
        />
        // @ts-ignore
      ) : theme.isDarkTheme ? (
        <LottieView
          source={require('../animation/lottie/ios_spinner_dark.json')}
          style={spinnerStyle}
          autoPlay
          speed={1.5}
          loop
        />
      ) : (
        <LottieView
          source={require('../animation/lottie/ios_spinner.json')}
          style={spinnerStyle}
          autoPlay
          speed={1.5}
          loop
        />
      )
      }
    </>
  );
};

export default Spinner;
