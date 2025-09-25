import {
  Text,
  View,
  AppState,
  StyleProp,
  TextStyle,
  AppStateStatus,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatDuration} from '../../../../../utils/format';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../../store';
import ErrorBoundary from '../../../../../common/ErrorBoundary';

export const TIMER_STORAGE_KEY = 'call_timer_start_time';

export default function Counter({
  start,
  textStyle = {},
  onChange = () => {},
}: {
  start: boolean;
  textStyle?: StyleProp<TextStyle>;
  onChange?: (time: number) => void;
}) {
  const _initialTime = useSelector(
    (state: RootState) => state.agoraCallSlice.counter,
  );

  const [time, setTime] = useState(_initialTime);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Load saved start time from AsyncStorage
  const loadStartTime = async () => {
    try {
      const saved = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        setStartTime(parsed);
        const elapsed = Math.floor((Date.now() - parsed) / 1000);
        setTime(Math.max(0, _initialTime - elapsed));
      }
    } catch (err) {
      console.log('Error loading start time:', err);
    }
  };

  // Save new start time if not already set
  const saveStartTime = async () => {
    const current = Date.now();
    setStartTime(current);
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, current.toString());
  };

  // Start logic: load or set start time
  useEffect(() => {
    if (start) {
      loadStartTime().then(async () => {
        const saved = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (!saved) {
          await saveStartTime();
        }
      });
    }
  }, [start]);

  // Start interval timer once startTime is available
  useEffect(() => {
    if (!start || startTime === null) return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, _initialTime - elapsed);
      setTime(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        AsyncStorage.removeItem(TIMER_STORAGE_KEY);
      }
    };

    tick(); // Run immediately
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [start, startTime]);

  // Reset when timer stops or component unmounts
  useEffect(() => {
    const cleanup = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      AsyncStorage.removeItem(TIMER_STORAGE_KEY);
      setStartTime(null);
      setTime(_initialTime);
    };

    if (!start) {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [start]);

  useEffect(() => {
    onChange(time);
  }, [time]);

  // App comes back from background — recalculate time
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (start && startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTime(Math.max(0, _initialTime - elapsed));
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [start, startTime]);

  return (
    <ErrorBoundary>
      <Text style={textStyle}>{formatDuration(time)}</Text>
    </ErrorBoundary>
  );
}
