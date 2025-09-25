import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const Header = ({enableBlueMode}) => {
  const styles = useCreateStyles();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {enableBlueMode ? (
          <Image
            style={styles.image}
            source={{
              uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/White.png',
            }}
          />
        ) : (
          <Image
            style={styles.image}
            source={{
              uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png',
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

function useCreateStyles() {
  return StyleSheet.create({
    safeArea: {
      // Padding to account for status bar on Android and iOS
      paddingTop: Platform.OS === 'ios' ? 0 : '14%',
      // SafeAreaView does not automatically account for notch, so set this manually if needed
      paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    },
    container: {
      marginLeft: 12,
      paddingBottom: 5.5,
    },
    image: {
      height: 35,
      width: 155,
    },
  });
}

export default Header;
