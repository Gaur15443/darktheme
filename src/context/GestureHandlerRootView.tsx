import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import {GestureResponderEvent, Keyboard} from 'react-native';
import {GestureHandlerRootView as GestureHandlerRootViewBase} from 'react-native-gesture-handler';

type GestureContextType = {
  disableKeyboardDismiss: boolean;
  setDisableKeyboardDismiss: (value: boolean) => void;
  getResponderHandler: () => (e: GestureResponderEvent) => boolean;
};

const GestureContext = createContext<GestureContextType | undefined>(undefined);

export const useGestureContext = () => {
  const ctx = useContext(GestureContext);
  if (!ctx) {
    throw new Error('useGestureContext must be used inside GestureProvider');
  }
  return ctx;
};

export function GestureProvider({children}: {children: ReactNode}) {
  const [disableKeyboardDismiss, setDisableKeyboardDismiss] = useState(false);

  const emptyFunction = (_: GestureResponderEvent) => false;

  function handleKeyboardDismiss() {
    try {
      Keyboard?.dismiss();
    } catch (_error) {
      /**empty */
    }
  }

  const getResponderHandler = useMemo(
    () => () =>
      disableKeyboardDismiss ? emptyFunction : handleKeyboardDismiss,
    [disableKeyboardDismiss],
  );

  return (
    <GestureContext.Provider
      value={{
        disableKeyboardDismiss,
        setDisableKeyboardDismiss,
        getResponderHandler,
      }}>
      <GestureHandlerRootViewBase
        onStartShouldSetResponder={getResponderHandler()}
        style={{
          flex: 1,
        }}>
        {children}
      </GestureHandlerRootViewBase>
    </GestureContext.Provider>
  );
}
