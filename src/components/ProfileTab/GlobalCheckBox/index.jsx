import React from 'react';
import {TouchableOpacity} from 'react-native';
import {EditInfoCheckBox} from '../../../images';
import NewTheme from '../../../common/NewTheme';

export default function GlobalCheckBox({check, onCheck}) {
  return (
    <>
      {check ? (
        <TouchableOpacity
          testID="GlobalCheckBoxActive"
          onPress={() => onCheck()}>
          <EditInfoCheckBox accessibilityLabel={'EditInfoCheckBox'} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          testID="GlobalCheckBoxDisabled"
          onPress={() => onCheck()}
          style={styles.checkBoxBorder}
          accessibilityLabel={'GlobalCheckBoxDisabled'} />
      )}
    </>
  );
}

const styles = {
  checkBoxBorder: {
    borderWidth: 2,
    borderColor: NewTheme.colors.primaryOrange,
    width: 18,
    height: 18,
    borderRadius: 3,
  },
};
