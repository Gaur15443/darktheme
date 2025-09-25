import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import SoundRecorder from 'react-native-sound-recorder';
import Toast from 'react-native-toast-message';
import {formatDuration} from '../../../../../utils/format';
import ErrorBoundary from '../../../../../common/ErrorBoundary';

export interface AudioRecorderRef {
  handleStartRecording: () => void;
  handleStopRecording: () => Promise<string>;
}

interface AudioRecorderProps {
  containerStyle?: StyleProp<ViewStyle>;
}

const AudioRecordeChats = forwardRef<AudioRecorderRef, AudioRecorderProps>(
  ({containerStyle = {height: 70, flex: 1}}, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0); // in seconds
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      handleStartRecording,
      handleStopRecording,
    }));

    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        // Clean up any recording
        SoundRecorder.stop().catch(() => {});
      };
    }, []);

    const requestPermissions = async (): Promise<boolean> => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        return (
          granted['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          (granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED ||
            Platform.Version >= 33)
        );
      }
      return true;
    };

    const handleStartRecording = async () => {
      const hasPermission = await requestPermissions();
      // if (!hasPermission) {
      //   Toast.show({
      //     type: 'error',
      //     text1: 'Permission Denied',
      //     text2: 'Please grant audio recording permission',
      //   });
      //   return;
      // }

      try {
        // Stop any existing recording first
        try {
          await SoundRecorder.stop();
        } catch (e) {
          // Ignore if nothing was recording
        }

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Reset state
        setRecordingTime(0);
        setIsRecording(false);

        // Small delay for cleanup
        await new Promise(resolve => setTimeout(resolve, 200));

        // Generate unique filename
        const filename = `audio_recording_${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;

        // Start recording
        await SoundRecorder.start(SoundRecorder.PATH_CACHE + filename);
        setIsRecording(true);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.error('Recording start error:', err);
        Toast.show({
          type: 'error',
          text1: 'Error starting recorder',
          text2: err.message || 'Unknown error',
        });
      }
    };

    const handleStopRecording = async (): Promise<string> => {
      try {
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        let audioFile = '';
        if (isRecording) {
          const result = await SoundRecorder.stop();
          audioFile = result.path || '';
          console.log('Audio file path:', audioFile);
        }

        // Reset state
        setIsRecording(false);
        setRecordingTime(0);

        return audioFile;
      } catch (err: any) {
        console.error('Recording stop error:', err);

        // Reset state
        setIsRecording(false);
        setRecordingTime(0);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        Toast.show({
          type: 'error',
          text1: 'Error stopping recorder',
          text2: err.message || 'Unknown error',
        });
        return '';
      }
    };

    return (
      <ErrorBoundary>
        <View style={[styles.container, containerStyle]}>
          {isRecording && (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Text style={[{color: 'white', fontWeight: 'bold'}]}>
                {formatDuration(recordingTime)}
              </Text>
              <Text style={[{color: 'rgba(255, 67, 67, 1)'}]}>
                Recording...
              </Text>
            </View>
          )}
        </View>
      </ErrorBoundary>
    );
  },
);

export default memo(AudioRecordeChats);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  idleText: {
    color: '#555',
    fontSize: 16,
  },
});
