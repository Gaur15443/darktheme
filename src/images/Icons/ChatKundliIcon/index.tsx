import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';

export default function ChatKundliIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M1 1L23 23" stroke="white" />
      <Rect x="0.5" y="0.5" width="23" height="23" rx="1.5" stroke="white" />
      <Path d="M1 23L23 1" stroke="white" />
      <Path d="M23.5 11L12 1" stroke="white" />
      <Path d="M12 1L0.5 11" stroke="white" />
      <Path d="M0.499756 11L11.9998 23.5" stroke="white" />
      <Path d="M12 23.5L23.5 11" stroke="white" />
    </Svg>
  );
}

const styles = StyleSheet.create({});
