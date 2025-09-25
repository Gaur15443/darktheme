import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFormik } from 'formik';
import AudioRecorder from '../../../AudioRecorder';
import { useDispatch } from 'react-redux';
import { setNewWrittenStory } from '../../../../store/apps/story';
import CustomInput from './../../../CustomTextInput';
import { Text, useTheme } from 'react-native-paper';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { createStoryStyles } from '../styles';

/**
 * Story audio form component.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.postingInProgress - Indicates whether user is publishing content. If `true`, all cta interaction should disable.
 * @param {Object} props.formDataRef - Reference to the form data object.
 * @param {Object} props.formDataRef.current - Current snapshot of the form data object.
 * @param {string} props.formDataRef.current.storiesTitle - Title of the audio.
 * @param {Array} props.formDataRef.current.blobData - Array containing the recorded audio blob.
 * @param {Function} props.onValidationChange - Function to handle validation changes.
 */
export default function AudiosForm({
  formDataRef,
  postingInProgress,
  onValidationChange,
  onRecording,
}) {
  const theme = useTheme();
  const customTheme = {
    colors: {
      primary: theme.colors.orange,
    },
  };
  const dispatch = useDispatch();
  const [blobData, setBlobData] = useState([]);
  const [recordingInProgress, setRecordingInProgress] = useState(false);

  const formik = useFormik({
    initialValues: {
      storiesTitle: '',
    },
    validateOnChange: true,
    validationSchema: Yup.object().shape({
      storiesTitle: Yup.string()
        .required('This field is required')
        .max(50, 'Length cannot be more than 50')
        .test('space-check', 'This field is required', val => {
          return !/^\s+$/.test(val);
        }),
    }),
  });

  useEffect(() => {
    setRecordingInProgress(recordingInProgress);
    if (typeof onRecording === 'function') {
      onRecording(recordingInProgress);
    }
  }, [recordingInProgress]);

  useEffect(() => {
    formDataRef.current.blobData = blobData;
  }, [blobData]);

  useEffect(() => {
    onValidationChange(formik.isValid);
  }, [formik.isValid, formik.values]);

  useEffect(() => {
    dispatch(
      setNewWrittenStory({
        storiesTitle: formik.values.storiesTitle,
      }),
    );
    formDataRef.current.storiesTitle = formik.values.storiesTitle;
  }, [formik]);

  function handleOnGetMedia(data) {
    formDataRef.current.blobData = data;

    const updatedData = data.map((_file, index) => {
      const result = {
        ..._file,
        _id: `local-${Date.now() + index}`,
      };
      return result;
    });
    setBlobData(prev => [...prev, ...updatedData]);

    dispatch(
      setNewWrittenStory({
        mediaLength: data.length,
      }),
    );
  }

  return (
    <>
      {/* Title Input */}
      <View style={styles.inputContainer}>
        <CustomInput
          customTheme={customTheme}
          name="title"
          accessibilityLabel="audioTitle"
          maxLength={50}
          disabled={postingInProgress}
          label="Title of Audio Story"
          required
          style={[
            styles.textInputStyle,
            { backgroundColor: 'white', height: 50.9 },
            createStoryStyles.inputContainer,
          ]}
          value={formik.values.storiesTitle}
          inputHeight={50.9}
          onChangeText={text => {
            if (text?.length <= 50) {
              if (!formik.touched.storiesTitle) {
                formik.setFieldTouched('storiesTitle', true, true);
              }

              formik.handleChange('storiesTitle')(text);
            }
          }}
          onBlur={formik.handleBlur('storiesTitle')}
          restingLabelStyle={createStoryStyles.titlePadding}
          contentStyle={
            {
              ...(postingInProgress
                ? {
                  opacity: 0.5,
                  color: 'rgba(51, 48, 60, 0.3)',
                }
                : {})
            }
          }
          error={Boolean(formik.errors.storiesTitle)}
          errorText={formik.errors.storiesTitle}
          right={
            <Text
              style={
                postingInProgress
                  ? {
                    color: 'rgba(51, 48, 60, 0.3)',
                  }
                  : {}
              }>{`${formik.values.storiesTitle?.length || 0}/50`}</Text>
          }
          rightContentStyles={{
            opacity: postingInProgress ? 0.5 : 1,
          }}
        />
        <AudioRecorder
          postingInProgress={postingInProgress}
          onGetAudio={handleOnGetMedia}
          onStartedRecording={e => {
            setRecordingInProgress(e);
          }}
        />
      </View>
      {/* Title input ends */}
    </>
  );
}

AudiosForm.propTypes = {
  formDataRef: PropTypes.object,
  postingInProgress: PropTypes.bool,
  onValidationChange: PropTypes.func.isRequired,
  onRecording: PropTypes.func.isRequired,
};

const styles = {
  input: {
    backgroundColor: 'white',
    margin: 12,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 10,
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 7,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 15,
    paddingHorizontal: 6,
  },
  tabContainer: {
    alignItems: 'center',
    padding: 10,
  },
  headerText: {
    textAlign: 'center',
    fontWeight: '600',
    color: 'white',
    fontSize: 17,
    marginHorizontal: 20,
  },
  inputContainer: {
    // flex: 1,
    // marginHorizontal: 10,
    marginVertical: 10,
  },
  textInputStyle: {
    backgroundColor: '#FFF',
  },
};
