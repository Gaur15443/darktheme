import {Dimensions, View, Platform} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import {CustomButton} from '../../../../core';
import theme from '../../../../common/NewTheme';
import NewTheme from '../../../../common/NewTheme';
import {Shadow} from 'react-native-shadow-2';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {height} = Dimensions.get('window');

const BottomBarButton = ({
  label,
  loading = false,
  onPress = () => {},
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <>
      <Shadow
        distance={0}
        // startColor="rgba(0, 0, 0, 0.1)" // Dark shadow color
        // endColor="rgba(0, 0, 0, 0)" // Fade shadow color
        // offset={[0, 4]} // Shift shadow upward for the top edge
        style={{
          width: '100%',
          height: 100,
        }}>
        <View
          style={{
            backgroundColor: 'white',
            height: 100,   
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? insets.bottom - height / 24 : insets.bottom,     
            left: 0, 
            width: '100%',
            borderTopLeftRadius: 37,
            borderTopRightRadius: 37,
            alignItems: 'center',
            borderColor: '#dbdbdb',
            borderWidth: 1.3,
          }}>
          <CustomButton
            label={label}
            onPress={onPress}
            color={'white'}
            style={{
              backgroundColor: disabled
                ? NewTheme.colors.secondaryPeachRGB
                : theme.colors.primaryOrange,
              width: '90%',
              height: 50,
              justifyContent: 'center',
              marginVertical: 25,
            }}
            loading={loading}
            disabled={disabled}
            accessibilityLabel={label ? `Button: ${label}` : 'Action button'}
          />
        </View>
      </Shadow>
    </>
  );
};
BottomBarButton.propTypes = {
  label: PropTypes.string,
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default BottomBarButton;
