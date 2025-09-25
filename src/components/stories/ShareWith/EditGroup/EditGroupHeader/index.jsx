import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import {SCREEN_WIDTH} from '../../../../../constants/Screens';
import {
  BackArrowIcon,
  CommentDeleteIcon,
  CrossIcon,
} from '../../../../../images';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Button, useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../../../common/NewTheme';

export default function EditGroupHeader({onSave, onDelete}) {
  const navigator = useNavigation();
  const theme = useTheme();
  const styles = useCreateStyles();
  const {top} = useSafeAreaInsets();
  const ios = Platform.OS == 'ios';
  const edit = useSelector(state => state.story.editGroup);
  const grpName = useSelector(state => state.story.groupName);
  const grpMem = useSelector(state => state.story.groupMem);
  const [disableButton, setDisableButton] = useState(true);

  useEffect(() => {
    const enable = grpName?.length > 0 && grpName.length <= 15 && grpMem > 0;
    setDisableButton(!enable);
  }, [grpName, grpMem]);

  return (
    <View
      style={{
        paddingTop: ios ? top : top + 10,
        backgroundColor: theme.colors.background,
      }}>
      <View style={styles.buttonsContainer}>
        <View style={styles.imageContainer}>
          <TouchableOpacity
            testID="goBack"
            style={{padding: 10}}
            onPress={() => navigator.goBack()}>
            <BackArrowIcon />
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row'}}>
          {edit && (
            <TouchableOpacity testID="deleteGroup" onPress={() => onDelete()}>
              <View style={styles.deleteButton}>
                <CommentDeleteIcon />
              </View>
            </TouchableOpacity>
          )}
          <Button
            testID="saveGroup"
            style={[
              styles.plusButton,
              {padding: 0, opacity: disableButton ? 0.5 : 1},
            ]}
            buttonColor={colors.primaryOrange}
            disabled={disableButton}
            loading={false}
            labelStyle={{color: 'white', fontSize: 16}}
            mode="contained"
            onPress={() => onSave()}>
            Create
          </Button>
        </View>
      </View>
    </View>
  );
}

function useCreateStyles() {
  const theme = useTheme();

  return StyleSheet.create({
    filterButton: {
      backgroundColor: '#DCE9FF',
      padding: 8,
      borderRadius: 5,
      marginRight: 5,
    },
    plusButton: {
      backgroundColor: colors.primaryOrange,
      borderRadius: 6,
      marginRight: 10,
    },
    deleteButton: {
      padding: 10,
      borderRadius: 6,
      marginRight: 10,
    },
    buttonsContainer: {
      backgroundColor: theme.colors.background,
      height: 70,
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: SCREEN_WIDTH,
      flexDirection: 'row',
      gap: 5,
    },
    imageContainer: {
      width: 150,
      justifyContent: 'center',
      height: '100%',
      padding: 10,
      marginRight: 'auto',
      marginLeft: -8,
    },
  });
}
