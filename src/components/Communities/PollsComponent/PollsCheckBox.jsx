// CustomRadioButton.js
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {PollsCheckMark} from '../../../images';

const PollsCheckBox = ({selected, onPress, disabled}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{alignItems: 'center', justifyContent: 'center'}}>
      <View style={{width: 17, height: 17, marginRight: 5}}>
        {selected ? (
          <PollsCheckMark />
        ) : (
          <View
            style={{
              width: 17,
              height: 17,
              borderRadius: 9,
              borderWidth: 1,
              borderColor: '#DDDDDD',
            }}></View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PollsCheckBox;
