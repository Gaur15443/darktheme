import { View, Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Divider } from 'react-native-paper';
import NewTheme from './NewTheme';
import { Shadow } from 'react-native-shadow-2';

const HeaderSeparator = ({ style = {} }) => {
  return (
    <View style={[styles.container, style]}>
      <Shadow
        distance={0}
        // startColor="rgba(0, 0, 0, 0.10)"
        // endColor="rgba(0, 0, 0, 0)"
        offset={[0, 0.1]}
        style={{
          width: '100%',
          height: 2,
        }}>
        <View
          style={{
            height: 10,
            position: 'relative',
            top: -10,
            backgroundColor: NewTheme.colors.backgroundCreamy,
            ...style
          }}></View>
      </Shadow>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
    height: 5,
    zIndex: 1000,
  },
});

export default HeaderSeparator;