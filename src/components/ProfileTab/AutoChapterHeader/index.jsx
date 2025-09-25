import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Modal, Portal, useTheme, Text} from 'react-native-paper';
import {Svg, Path} from 'react-native-svg';
import {StoryEditIcon, BackArrowIcon, DotsHorizontal} from '../../../images';
import Animated, {FadeInUp, FadeInRight} from 'react-native-reanimated';

import {SCREEN_WIDTH} from '../../../constants/Screens';
import {useNavigation} from '@react-navigation/native';
export default function AutoChapterHeader({goBackViewFromAll}) {
  const navigation = useNavigation();
  const theme = useTheme();

  const [showOptions, setShowOptions] = useState(false);
  return (
    <SafeAreaView
      style={{
        width: SCREEN_WIDTH,
        height: Platform.OS === 'ios' ? 70 : 70 + 44,
        paddingTop: Platform.OS === 'ios' ? 0 : 44,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.background,
      }}>
      <TouchableOpacity
        testID="goBackFromView"
        onPress={() => goBackViewFromAll()}>
        <View style={{marginLeft: 10}}>
          <BackArrowIcon />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
