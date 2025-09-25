import React, {useState} from 'react';
import {StyleSheet, Dimensions,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CommunityHomeScreen} from '../../../components';

import ErrorBoundary from '../../../common/ErrorBoundary';
import {Theme} from '../../../common';

const {width} = Dimensions.get('window');

const CommunitiesScreen = ({navigation, route}) => {
  return (
    <ErrorBoundary.Screen>
      <SafeAreaView style={[styles.container]}>
        <CommunityHomeScreen
          updated={route?.params?.updated || null}
          route={route}
        />
      </SafeAreaView>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawer: {
    position: 'absolute',
    top: 81,
    bottom: 0,
    left: 0,
    width: width,
    borderRightWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'red',
    zIndex: 1,
    elevation: 5,
  },
});

export default CommunitiesScreen;
