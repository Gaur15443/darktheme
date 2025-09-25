import {useCallback} from 'react';
import {BackHandler} from 'react-native';
import PropTypes from 'prop-types';
import {useFocusEffect} from '@react-navigation/native';

/**
 * Custom hook to handle hardware back button press in React Native.
 * @param {Function} onBackPress - Callback function to be called when the back button is pressed.
 */
const useNativeBackHandler = onBackPress => {
  useFocusEffect(
    useCallback(() => {
      /**
       * Function to handle the back button press event.
       * @returns {boolean} - Whether the default back action should be prevented.
       */
      const backAction = () => {
        if (onBackPress && typeof onBackPress === 'function') {
          onBackPress();
          return true;
        }
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [onBackPress]),
  );
};

useNativeBackHandler.propTypes = {
  onBackPress: PropTypes.func,
};

export default useNativeBackHandler;
