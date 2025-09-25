/* eslint-disable no-use-before-define */
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CustomTickIcon } from '../../../images';
import PropTypes from 'prop-types';
import AstroCustomTickIcon from '../../../images/Icons/AstroCustomTickIcon';

interface CustomCheckBoxProps {
  color?: string;
  check?: boolean;
  useRadioButton?: boolean;
  onCheck?: () => void | undefined;
  isAstro?: boolean;
  [key: string]: any;
}

function CustomCheckBox({
  color = '#000',
  check = false,
  useRadioButton = false,
  onCheck = () => undefined,
  isAstro = false,
  key,
  ...props
}: CustomCheckBoxProps) {


  return (
    <View key={key}>
      {check ? (
        <TouchableOpacity
          style={{ top: isAstro ? 0 : -2 }}
          {...props}
          testID="customCheckBoxActive"
          onPress={() => onCheck()}>
          {isAstro ? (
            <AstroCustomTickIcon />
          ) : (
            <CustomTickIcon useRadioButton={useRadioButton} />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          {...props}
          testID="customCheckBoxDisabled"
          onPress={() => onCheck()}
          style={[
            styles.checkBoxBorder,
            {
              borderColor: color,
              borderRadius: useRadioButton ? 50 : 3,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = {
  checkBoxBorder: {
    borderWidth: 2,
    // top: 2,
    width: 18,
    height: 18,
  },
};

CustomCheckBox.displayName = 'CustomCheckBox';

CustomCheckBox.propTypes = {
  color: PropTypes.string,
  check: PropTypes.bool,
  onCheck: PropTypes.func,
};

export default memo(CustomCheckBox);