import { StyleSheet, Text, TextStyle } from 'react-native';
import React, { memo, useEffect, useRef, useState } from 'react';
import BackgroundTimer from './BackgroundCounterConfig';
import { formatDuration } from '../../utils/format';

interface BackgroundTimerProps {
  startTime?: number;
  start: boolean;
  interval?: number;
  style?: TextStyle;
  onStop?: () => void;
  customTime?: number | null;
  onChange?: (time: number) => void;
}

function BackgroundCounter({
  startTime = 60,
  start = false,
  interval = 1000,
  style = {},
  onStop = () => undefined,
  onChange = (time: number) => undefined,
  customTime = null,
}: BackgroundTimerProps) {
  const [time, setTime] = useState<number>(startTime);
  const timeRef = useRef(time);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function startTimer() {
    // if (!start) return;
    const timer = BackgroundTimer.setInterval(() => {
      if (timeRef.current <= 1) {
        setTime(0);
        onChange(0);
        onStop();
        BackgroundTimer.clearInterval();
        return;
      }
      timeRef.current = timeRef.current - 1;
      onChange(timeRef.current);
      setTime(prevTime => prevTime - 1);
    }, interval);
  }

  useEffect(() => {
    if (!start) return;
    startTimer();
  }, [start, startTime]);

  return (
    <Text style={[styles.text, style]}>
      {formatDuration(typeof customTime === 'number' ? customTime : time)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: '#27C394',
  },
});

export default memo(BackgroundCounter);
