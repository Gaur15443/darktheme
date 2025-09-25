import React from 'react';
import {View, StyleSheet} from 'react-native';

const GlobalStyle = ({children, style}) => {
  return (
    <View
      style={[
        styles.container,
        styles.defaultMargin,
        styles.defaultPadding,
        {...(style || {})},
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  defaultMargin: {
    marginLeft: 10,
  },
  defaultPadding: {
    marginRight: 10,
  },
});

export default GlobalStyle;
