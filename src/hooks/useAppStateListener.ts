import {useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
export default function useAppStateListener() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState<AppStateStatus>(
    appState.current,
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current !== nextAppState) {
        appState.current = nextAppState;
        setAppStateVisible(nextAppState);
      }
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return appStateVisible;
}
