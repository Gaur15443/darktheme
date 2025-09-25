import React, {useState, useEffect, useRef} from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import MicIcon from '../../images/Icons/MicIcon';
import PauseIcon from '../../images/Icons/PauseIcon';
import RestartIcon from '../../images/Icons/RestartIcon';
import {useTheme, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AudioSlider from './AudioSlider';
import {PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';

/**
 * Component for facilitating audio recording.
 * @param {boolean} props.postingInProgress - Indicates whether user is publishing content. If `true`, all cta interaction should disable.
 * @param {Function} onGetAudio - Function to handle the recorded audio data.
 * @param {Function} onStartedRecording - Function to update if user has started the recording.
 */
const AudioRecorder = ({onGetAudio, onStartedRecording, postingInProgress}) => {
  const theme = useTheme();
  const styles = createStyles();
  const maxAllowedTimeToRecordInSeconds = 900; //15 minutes
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDurationInMilliseconds, setCurrentDurationInMilliseconds] =
    useState(0);
  const [durationInMilliseconds, setDurationInMilliseconds] = useState(0);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());
  const uri = useRef(null);
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Stories,
  );

  useEffect(() => {
    if (!audioRecorderPlayer.current.current) {
      audioRecorderPlayer.current.current = new AudioRecorderPlayer();
    }
  }, []);

  useEffect(() => {
    if (audioRecorderPlayer.current) {
      const setAudioListener = () => {
        const recordBackListener = e => {
          setDurationInMilliseconds(e.currentPosition);
        };
        const playBackListener = e => {
          setCurrentDurationInMilliseconds(e.currentPosition);
        };
        audioRecorderPlayer.current.addRecordBackListener(recordBackListener);
        audioRecorderPlayer.current.addPlayBackListener(playBackListener);
        return () => {
          audioRecorderPlayer.current.removeRecordBackListener(
            recordBackListener,
          );
          audioRecorderPlayer.current.removePlayBackListener(playBackListener);
        };
      };
      setAudioListener();
    }
    return () => {
      setIsRecording(false);
      audioRecorderPlayer.current.stopRecorder();
      audioRecorderPlayer.current.stopPlayer();
    };
  }, []);

  useEffect(() => {
    if (currentDurationInMilliseconds >= durationInMilliseconds) {
      setIsPlaying(false);
      setCurrentDurationInMilliseconds(0);

      audioRecorderPlayer.current.stopPlayer();
    }
  }, [currentDurationInMilliseconds, durationInMilliseconds]);

  useEffect(() => {
    if (isRecording) {
      onStartedRecording(isRecording);
      setCurrentDurationInMilliseconds(0);
      setDurationInMilliseconds(0);
    }
  }, [isRecording]);

  async function checkMicrophonePermissions() {
    let result;
    if (Platform.OS === 'ios') {
      let permission;
      permission = PERMISSIONS.IOS.MICROPHONE;
      result = await request(permission);
    } else {
      result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Permissions for record audio',
          message: 'Give permission to your device to record audio',
          buttonPositive: 'ok',
        },
      );
    }
    return result;
  }
  async function checkStoragePermissions() {
    let permission;
    let result;

    if (Platform.OS === 'ios') {
      return;
      // permission = PERMISSIONS.IOS.MEDIA_LIBRARY;
      // result = await request(permission);
    } else {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        result = PermissionsAndroid.RESULTS.GRANTED;
      } else {
        result = RESULTS.DENIED;
      }
    }

    return result;
  }

  async function onStartRecord() {
    try {
      onGetAudio([]);
      const micPermissionResult = await checkMicrophonePermissions();
      const storagePermissionResult = await checkStoragePermissions();
      if (micPermissionResult !== 'granted') {
        throw new Error(
          'Microphone permission is required to start recording an audio.',
        );
      }
      // -> strict verification on storage permission not to be used
      // -> android sdk > 29 doesn't allow storage permissions
      // -> creates an app specific storage to store data by default, which don't require permission
      // -> same for ios
      // else if(storagePermissionResult !== "granted"){
      //   throw new Error("Storage permissions for recording not granted.");
      // }

      const url = await audioRecorderPlayer.current.startRecorder(
        Platform.OS === 'ios' ? 'sample.m4a' : null,
      );
      uri.current = url;
      setIsRecording(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  async function onPauseRecord() {
    try {
      await audioRecorderPlayer.current.pauseRecorder();
      setIsPaused(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  async function onResumeRecord() {
    try {
      await audioRecorderPlayer.current.resumeRecorder();
      setIsPaused(false);
      setIsRecording(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  /**
   * Stops the audio recording.
   * @param {boolean}  [getBlob=false] - if `true`, the audio will be returned in mp3 format.
   */
  async function onStopRecord(getBlob = false) {
    try {
      const path = await audioRecorderPlayer.current.stopRecorder();
      setIsRecording(false);
      setIsPlaying(false);
      setIsPaused(false);

      if (getBlob) {
        const audioData = {
          name: `recording_${new Date().getTime()}`,
          mediaUrl: path,
          mimeType: 'audio/mp4',
          type: 'Audio',
        };
        onGetAudio([audioData]);
      } else {
        uri.current = null;
        onGetAudio([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  async function onStartPlay() {
    try {
      if (!isPlaying) {
        const storagePermissionResult = await checkStoragePermissions();
        // if (storagePermissionResult !== 'granted') {
        //   throw new Error('Storage permission is required to play recording.');
        // }

        const playback = await audioRecorderPlayer.current.startPlayer(
          uri.current,
        );

        if (!playback) {
          throw new Error('Failed to start audio playback.');
        }

        setIsPlaying(true);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  async function onPausePlay() {
    if (isPlaying) {
      await audioRecorderPlayer.current.pausePlayer();
      setIsPlaying(false);
    }
  }

  async function onResumePlay() {
    if (isPlaying) {
      await audioRecorderPlayer.current.resumePlayer();
    }
  }

  async function onStopPlay() {
    if (isPlaying) {
      uri.current = null;
      await audioRecorderPlayer.current.stopPlayer();
      setIsPlaying(false);
    }
    setIsPaused(false);
    setIsRecording(false);
    setCurrentDurationInMilliseconds(0);
    setDurationInMilliseconds(0);
  }

  /*
    -> auto stop recording after 15 minutes
    -> 1 minute = 60 seconds
    -> 15 minutes = 900 seconds
    -> 1000ms = 1 second
    -> durationInMilliSeconds / 1000 = (seconds) which if is greater than 900 seconds (15 mins) then stop recording
  */
  useEffect(() => {
    const timePassedInSeconds = durationInMilliseconds / 1000;
    if (timePassedInSeconds >= maxAllowedTimeToRecordInSeconds) {
      onStopRecord(true)
        .then(() => {
          Toast.show({
            type: 'success',
            text1: toastMessages?.['4002'],
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [durationInMilliseconds]);

  /**
   * Formats seconds into the format `minutes:seconds`.
   * @param {number} numberOfMilliseconds - number of milliseconds.
   *
   */
  function formatTime(numberOfMilliseconds = 0) {
    const totalSeconds = Math.floor(numberOfMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  async function handleRestart() {
    await onStopRecord();
    setCurrentDurationInMilliseconds(0);
    setDurationInMilliseconds(0);
  }

  return (
    <View
      style={{
        marginTop: 10,
      }}>
      {!isRecording && uri.current && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginTop: 10,
          }}>
          {!isPlaying && (
            <TouchableOpacity
              disabled={postingInProgress}
              onPress={onStartPlay}>
              <Icon name="play" color={theme.colors.primary} size={30} />
            </TouchableOpacity>
          )}
          {isPlaying && (
            <TouchableOpacity
              disabled={postingInProgress}
              onPress={onPausePlay}>
              <Icon name="pause" color={theme.colors.primary} size={30} />
            </TouchableOpacity>
          )}
          <Text>{formatTime(currentDurationInMilliseconds)}</Text>
          <AudioSlider
            sliderValue={currentDurationInMilliseconds}
            maxValue={durationInMilliseconds}
          />
        </View>
      )}

      <Text
        style={{
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
        {formatTime(durationInMilliseconds)}
      </Text>

      {!isRecording && (
        <View style={styles.startRecordingContainer}>
          <TouchableOpacity
            accessibilityLabel="start recording"
            disabled={postingInProgress}
            onPress={onStartRecord}
            style={[styles.button, styles.buttonColor]}>
            <MicIcon />
          </TouchableOpacity>
          <Text
            style={{
              fontWeight: 'bold',
            }}>
            Start recording
          </Text>
        </View>
      )}

      {isRecording && !isPaused && (
        <View style={styles.pauseRecordingContainer}>
          <TouchableOpacity
            accessibilityLabel="pause recording"
            disabled={postingInProgress}
            onPress={onPauseRecord}
            style={[styles.button, styles.buttonColor]}>
            <PauseIcon />
          </TouchableOpacity>
        </View>
      )}

      {isPaused && (
        <View style={styles.pausedContainer}>
          <TouchableOpacity
            disabled={postingInProgress}
            onPress={onResumeRecord}
            accessibilityLabel="resume recording"
            style={[styles.button, styles.buttonColor]}>
            <MicIcon />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={postingInProgress}
            onPress={handleRestart}
            style={[styles.buttonColor, styles.restartButton]}>
            <RestartIcon />
          </TouchableOpacity>
        </View>
      )}
      {isRecording && (
        <View style={styles.stopRecorderContainer}>
          <TouchableOpacity
            disabled={postingInProgress}
            accessibilityLabel="stop recording"
            onPress={() => onStopRecord(true)}
            style={[styles.buttonColor, styles.stopRecorder]}>
            <Text style={styles.stopRecorderText}>Finish recording</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

function createStyles() {
  return StyleSheet.create({
    startRecordingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stopRecorderContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: 4,
    },
    stopRecorder: {
      padding: 8,
      width: '60%',
      marginHorizontal: 'auto',
      borderRadius: 8,
    },
    stopRecorderText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    buttonColor: {
      backgroundColor: '#27C394',
    },
    button: {
      width: 100,
      height: 100,
      borderRadius: 50,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    restartButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pauseRecordingContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pausedContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
  });
}

AudioRecorder.propTypes = {
  postingInProgress: PropTypes.bool,
  onGetAudio: PropTypes.func.isRequired,
  onStartedRecording: PropTypes.func.isRequired,
};

export default AudioRecorder;
