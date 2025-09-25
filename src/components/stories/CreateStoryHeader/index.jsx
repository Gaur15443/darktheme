import React from 'react';
import {View, TouchableOpacity, Platform} from 'react-native';
import {CrossIcon} from '../../../images';
import {SCREEN_WIDTH} from '../../../constants/Screens';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StyleSheet} from 'react-native';

export default function CreateStoryHeader({tabValue, onBack}) {
  const ios = Platform.OS == 'ios';
  const {top} = useSafeAreaInsets();

  const styles = StyleSheet.create({
    headerContainer: {
      paddingTop: ios ? top : top + 0,
      // backgroundColor: '#FEF8F1',
      zIndex: 1,
    },
    headerContent: {
      width: SCREEN_WIDTH,
      backgroundColor: '#FEF8F1',
      height: 40,
    },
    crossIcon: {padding: 12, marginRight: 10, marginTop: 5},
    backButton: {
      alignItems: 'flex-end',
    },
  });

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          accessibilityLabel="createStoryBackButton"
          onPress={() => {
            onBack();
          }}
          style={styles.backButton}>
          <View style={styles.crossIcon}>
            <CrossIcon fill={'#000'} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
