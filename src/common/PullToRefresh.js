// PullToRefresh.js
import React from 'react';
import {Platform, RefreshControl, ScrollView, View} from 'react-native';
import ButtonSpinner from './ButtonSpinner';
import LinearGradient from 'react-native-linear-gradient';
import NewTheme from './NewTheme.js';

const PullToRefresh = ({
  onRefresh,
  isRefreshing,
  children,
  bgColor,
  colorIsWhite,
  ContainerStyle = {},
  handleScroll = () => undefined,
}) => {
  return (
    <LinearGradient
      colors={[
        bgColor,
        bgColor,
        NewTheme.colors.backgroundCreamy,
        NewTheme.colors.backgroundCreamy,
      ]}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      {Platform.OS === 'android' && (
        <ScrollView
          refreshControl={
            <RefreshControl
              tintColor={'transparent'}
              refreshing={isRefreshing}
              onRefresh={onRefresh}>
              <View
                style={[
                  {
                    marginBottom: -40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  ContainerStyle,
                ]}>
                {isRefreshing && (
                  <ButtonSpinner color={colorIsWhite} marginTop={20} />
                )}
              </View>
            </RefreshControl>
          }>
          {children}
        </ScrollView>
      )}

      {Platform.OS === 'ios' && (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16} // Adjust scroll event frequency
          contentContainerStyle={{flexGrow: 1}}
          bounces={true}>
          {isRefreshing && (
            <View
              style={[
                {
                  // position: 'absolute',
                  // top: 10,
                  bottom: 20,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  // zIndex: 1,
                },
                ContainerStyle,
              ]}>
              <ButtonSpinner color={colorIsWhite} marginTop={20} />
            </View>
          )}
          {children}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default PullToRefresh;
