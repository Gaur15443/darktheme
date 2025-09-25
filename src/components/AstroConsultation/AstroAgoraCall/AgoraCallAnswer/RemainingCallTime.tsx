import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store';
import {setCounter} from '../../../../store/apps/agora';
import Counter from './Counter/Counter';
import {formatDuration} from '../../../../utils/format';
import ErrorBoundary from '../../../../common/ErrorBoundary';

export default function RemainingCallTime({
  callStarted = false,
}: {
  callStarted: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const totalAvailableTime = useSelector(
    (state: RootState) => state.agoraCallSlice.totalAvaiableConsultationTime,
  );
  const [willEnd, setWillEnd] = useState<boolean>(false);
  const willEndRef = useRef<boolean>(false);

  useEffect(() => {
    if (totalAvailableTime > 0) {
      dispatch(setCounter(totalAvailableTime));
    }
  }, [totalAvailableTime]);

  useEffect(() => {
    return () => {
      dispatch(setCounter(0));
    };
  }, []);

  return (
    <ErrorBoundary>
      <View
        style={{
          marginHorizontal: 40,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          backgroundColor: willEnd
            ? 'rgba(239, 68, 68, 0.1)'
            : 'rgba(39, 195, 148, 0.1)',
          padding: 10,
          borderRadius: 8,
          marginTop: 20,
        }}>
        <Text style={willEnd ? styles.redText : styles.greenText}>
          Remaining Time
        </Text>

        {callStarted ? (
          <Counter
            onChange={time => {
              if (time < 60) {
                willEndRef.current = true;
              } else {
                willEndRef.current = false;
              }
              if (willEndRef.current !== willEnd) {
                setWillEnd(willEndRef.current);
              }
            }}
            textStyle={willEnd ? styles.redText : styles.greenText}
            start={callStarted}
          />
        ) : (
          <Text style={willEnd ? styles.redText : styles.greenText}>
            {formatDuration(totalAvailableTime)}
          </Text>
        )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  greenText: {
    color: 'rgba(39, 195, 148, 1)',
    fontWeight: '600',
    fontSize: 18,
  },
  redText: {
    color: 'rgba(239, 68, 68, 1)',
    fontWeight: '600',
    fontSize: 18,
  },
});
