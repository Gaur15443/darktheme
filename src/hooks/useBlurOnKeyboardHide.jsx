import { useFocusEffect } from '@react-navigation/native';
import { Keyboard } from 'react-native';
import { useCallback, useRef } from 'react';

function useBlurOnKeyboardHide() {
  const inputsRef = useRef([]);
  useFocusEffect(
    useCallback(() => {

      const hideSub = Keyboard.addListener('keyboardDidHide', () => {
        inputsRef?.current?.forEach?.(input => input?.blur?.());
      });

      return () => {
        hideSub.remove();
      };
    }, []),
  );
  return inputsRef;
}

export default useBlurOnKeyboardHide;
