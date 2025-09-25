import React from 'react';
import {Image, View, StyleSheet} from 'react-native';

const SpouseTreeIcon = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('../../../assets/images/spousetree.png')}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Centers the image horizontally
    justifyContent: 'center',
  },
  image: {
    width: 60, // Sets the width of the image
    height: 50, // Sets the height of the image
  },
});

export default SpouseTreeIcon;
