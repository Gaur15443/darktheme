import {WINDOW_HEIGHT, WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import React from 'react';
import {
  Image,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import {Portal, useTheme} from 'react-native-paper';

const SplashScreen = () => {
  const styles = createStyles();

  return (
    <Portal>
      <View style={styles.container}>
        <PortalSplashScreen />
      </View>
    </Portal>
  );
};

const PortalSplashScreen = () => {
  const styles = createStyles();
  const theme = useTheme();
  return (
    <>
      <Image
        source={{
          uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png',
        }}
        style={styles.image}
        resizeMode="contain"
      />
    </>
  );
};

function createStyles() {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.splashScreen,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 310,
      height: 200,
      alignSelf: 'center',
    },
    spinner: {
      position: 'relative',
      right: WINDOW_WIDTH / 2,
      bottom: WINDOW_HEIGHT / 5,
    },
  });
}

export default SplashScreen;
