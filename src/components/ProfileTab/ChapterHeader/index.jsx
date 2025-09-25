import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Modal, Portal, useTheme, Text} from 'react-native-paper';
import {Svg, Path} from 'react-native-svg';
import {
  StoryEditIcon,
  StoryDeleteIcon,
  BackArrowIcon,
  DotsHorizontal,
} from '../../../images';
import Animated, {FadeInUp, FadeInRight} from 'react-native-reanimated';

import {SCREEN_WIDTH} from '../../../constants/Screens';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../../common/NewTheme';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

export default function ChapterHeader({
  openDeleteChapter,
  chapterId,
  goBackViewFromAll,
  id,
  memberTreeId,
  userPermission,
}) {
  const navigation = useNavigation();
  const theme = useTheme();

  const [showOptions, setShowOptions] = useState(false);
  const insets = useSafeAreaInsets();
  const openOptions = () => {
    setShowOptions(true);
  };
  const closeOptions = () => {
    setShowOptions(false);
  };
  const OpenDeleteChapter = () => {
    setShowOptions(false);
    openDeleteChapter();
  }; 
  const OpenEditChapter = chapterId => {

    setShowOptions(false);
    if(chapterId){
      
    navigation.navigate('EditChapter', {
      chapterId: chapterId,
      id: id,
      memberTreeId: memberTreeId,
    });

  }
  };

  return (
    <SafeAreaView
      style={{
        width: SCREEN_WIDTH,
        // height: 70,
        paddingTop: insets.top + 10,
        // height: 70 + insets.top,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.background,
      }}>
      <TouchableOpacity
        testID="goBackFromView"
        onPress={() => goBackViewFromAll()}>
        <View style={{marginLeft: 10}} accessibilityLabel={'BackArrowIcon'}>
          <BackArrowIcon accessibilityLabel={'BackArrowIcon'} />
        </View>
      </TouchableOpacity>
      {userPermission && (
        <TouchableOpacity
          testID="editStoryOptions"
          onPress={() => openOptions()}>
          <View style={{marginRight: 10}}>
            <DotsHorizontal accessibilityLabel={'DotsHorizontal'} />
            <Portal>
              <Modal
                visible={showOptions}
                onDismiss={closeOptions}
                style={styles.ModalStyles}
                contentContainerStyle={{
                  backgroundColor: '#fff',
                  paddingRight: 10,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}>
                <TouchableOpacity
                  testID="editStory"
                  onPress={() => OpenEditChapter(chapterId)}>
                  <Animated.View
                    entering={FadeInRight?.duration(300)?.damping(20)}
                    style={[styles.ButtonOne]}>
                    <StoryEditIcon stroke={colors.primaryOrange} />
                    <Text style={styles.ButtonText}>Edit</Text>
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="deleteStory"
                  onPress={() => OpenDeleteChapter()}>
                  <Animated.View
                    entering={FadeInRight?.duration(300)?.damping(20)}
                    style={styles.ButtonTwo}>
                    <StoryDeleteIcon
                      accessibilityLabel={'StoryDeleteIcon'}
                      stroke={colors.primaryOrange}
                    />
                    <Text
                      style={styles.ButtonText}
                      accessibilityLabel={'Delete'}>
                      Delete
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </Modal>
            </Portal>
          </View>
          {/* <View styles={styles.optionsContainer}>

        </View> */}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = {
  optionsContainer: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'black',
  },
  ButtonOne: {
    // flexDirection: 'row',
    // paddingRight: 50,
    // paddingVertical: 10,
    // borderTopWidth: 1,
    // borderColor: 'lightgrey',
    // borderTopRightRadius: 5,
    // borderTopLeftRadius: 5,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    // backgroundColor: 'white',
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: 10,
    // paddingStart: 10,
    flexDirection: 'row',
    paddingRight: 50,
    paddingVertical: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  ButtonTwo: {
    // borderBottomRightRadius: 5,
    // borderBottomLeftRadius: 5,
    // paddingVertical: 5,
    // paddingVertical: 10,
    // borderBottomWidth: 1,
    // borderColor: 'lightgrey',
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    // backgroundColor: 'white',
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: 10,
    // paddingStart: 10,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingVertical: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  ButtonText: {fontSize: 18, color: 'black', fontWeight: '600'},
  ModalStyles: {
    gap: 5,
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingTop: 42,
    justifyContent: 'flex-start',
  },
};
