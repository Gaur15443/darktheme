import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Modal, Portal, Text} from 'react-native-paper';
import {
  StoryEditIcon,
  StoryDeleteIcon,
  BackArrowIcon,
  DotsHorizontal,
} from '../../../images';
import Animated, {FadeInRight} from 'react-native-reanimated';
import {SCREEN_WIDTH} from '../../../constants/Screens';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from 'react-native-paper';

export default function ChapterHeader({
  openDeleteMemory,
  memoryId,
  userPermission,
  treeId,
}) {
  const navigation = useNavigation();
  const theme = useTheme();

  const [showOptions, setShowOptions] = useState(false);
  const openOptions = () => {
    setShowOptions(true);
  };
  const closeOptions = () => {
    setShowOptions(false);
  };
  const OpenDeleteMemory = () => {
    setShowOptions(false);
    openDeleteMemory();
  };
  const OpenEditMemory = id => {
    setShowOptions(false);
    navigation.navigate('EditMemory', {memoryId: id, treeId: treeId});
  };
  return (
    <SafeAreaView
      style={{
        width: SCREEN_WIDTH,
        height: 70,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.background,
      }}>
      <TouchableOpacity
        testID="goBackFromView"
        onPress={() => navigation.goBack()}>
        <View
          style={{marginLeft: 10}}
          accessibilityLabel={'Memory-BackArrowIcon'}>
          <BackArrowIcon accessibilityLabel={'Memory-BackArrowIcon'} />
        </View>
      </TouchableOpacity>
      {userPermission && (
        <TouchableOpacity
          testID="editStoryOptions"
          onPress={() => openOptions()}>
          <View style={{marginRight: 10}}>
            <DotsHorizontal accessibilityLabel={'Memory-DotsHorizontal'} />
            <Portal>
              <Modal
                visible={showOptions}
                onDismiss={closeOptions}
                style={styles.ModalStyles}>
                <TouchableOpacity
                  testID="editStory"
                  onPress={() => OpenEditMemory(memoryId)}>
                  <Animated.View
                    entering={FadeInRight.duration(300).damping(20)}
                    style={styles.ButtonOne}>
                    <StoryEditIcon
                      accessibilityLabel={'Memory-StoryEditIcon'}
                    />
                    <Text
                      style={styles.ButtonText}
                      accessibilityLabel={'Memory-Edit-Text'}>
                      Edit
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="deleteStory"
                  onPress={() => OpenDeleteMemory()}>
                  <Animated.View
                    entering={FadeInRight.duration(300).damping(20)}
                    style={styles.ButtonTwo}>
                    <StoryDeleteIcon
                      accessibilityLabel={'Memory-StoryDeleteIcon'}
                    />
                    <Text
                      style={styles.ButtonText}
                      accessibilityLabel={'Memory-Delete-Text'}>
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
    flexDirection: 'row',
    paddingRight: 50,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  ButtonTwo: {
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingVertical: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    borderLeftWidth: 1,
    borderRightWidth: 1,
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
