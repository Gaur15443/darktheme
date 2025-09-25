import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {bytesToMegaBytes} from '../../../utils/mediaFunctions';
import Axios from '../../../plugin/Axios';
import nativeConfig from 'react-native-config';
import {AxiosError} from 'axios';

/**
 * @param {object} payload
 * @param {string} payload.id - User id.
 * @param {string} payload.uploadPercentageRef - A useRef value in percentage.
 * @param {string} payload.uploadProgressInMbRef - A useRef value in percentage e.g 0mb.
 * @param {string} [payload.controllerRef] - A useRef optional value that's an instance of  new AbortController().
 */
export const uploadMedia = createAsyncThunk(
  'media/uploadMedia',
  async (payload, {dispatch, rejectWithValue}) => {
    try {
      const config = {
        onUploadProgress: progressEvent => {
          // dispatch(mediaSlice.actions.setLoaded(progressEvent.loaded));
          // dispatch(mediaSlice.actions.setTotal(progressEvent.total));
          if (payload?.uploadPercentageRef) {
            payload.uploadPercentageRef.current = '0%';
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            payload.uploadPercentageRef.current = `${Math.floor(progress)}%`;
            payload.uploadProgressInMbRef.current = `${bytesToMegaBytes(
              progressEvent.loaded,
            ).toFixed(2)}mb / ${bytesToMegaBytes(progressEvent.total).toFixed(
              2,
            )}mb`;
          }
        },
        signal: payload?.controllerRef?.signal,
      };

      const response = await Axios.post(
        `${nativeConfig.MEDIA_URL}/uploadAndInsertMedia/v1/${payload.id}`,
        payload.formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          ...config,
        },
      );
      return response;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.log('Axios error:', e.response?.data);
        return rejectWithValue(e.response?.data);
      }
      console.log('Unexpected error:', e);
      return rejectWithValue(`An unknown error occurred ${e}`);
    }
  },
);
/**
 * @param {object} payload
 * @param {string} payload.id - User id.
 * @param {string} payload.uploadPercentageRef - A useRef value in percentage.
 * @param {string} payload.uploadProgressInMbRef - A useRef value in percentage e.g 0mb.
 * @param {string} [payload.controllerRef] - A useRef optional value that's an instance of  new AbortController().
 */
export const uploadProfile = createAsyncThunk(
  'media/uploadProfile',
  async payload => {
    const response = await Axios.post(
      `${nativeConfig.MEDIA_URL}/profileImage/${payload.id}${payload.clinkOwner ? '?clinkowner=' + payload.clinkOwner : ''}`,
      payload.formData,

      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return [response.data];
  },
);

export const cleanS3Media = createAsyncThunk(
  'media/cleanS3Media',
  async ({userId, mediaId}) => {
    await Axios.delete(`/removeMediaFromS3/${userId}/${mediaId}`);
  },
);

const initialState = {
  uploadedMedia: [],
  uploadedProfile: [],
  loaded: 0,
  total: 0,
  currentVideoInstance: null,
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    resetUploadedMedia(state) {
      state.uploadedMedia = [];
    },
    resetUploadedProfile(state) {
      state.uploadedProfile = [];
    },
    setCurrentVideoInstance(state, {payload}) {
      state.currentVideoInstance = payload;
    },
    setLoaded(state, action) {
      state.loaded = action.payload;
    },
    setTotal(state, action) {
      state.total = action.payload;
    },
    resetLoaded(state, action) {
      state.loaded = 0;
    },
    resetTotal(state, action) {
      state.total = 0;
    },
  },
  extraReducers: builder => {
    // upload api.
    builder
      .addCase(uploadMedia.pending, state => {
        state.uploadedMedia = [];
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.uploadedMedia = action.payload?.data || [];
      })
      .addCase(uploadMedia.rejected, state => {
        state.uploadedMedia = [];
      })

      .addCase(uploadProfile.pending, state => {
        state.uploadedProfile = [];
      })
      .addCase(uploadProfile.fulfilled, (state, {payload}) => {
        state.uploadedProfile = payload;
      })
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      });
  },
});

export const {
  setCurrentVideoInstance,
  resetUploadedMedia,
  resetUploadedProfile,
  resetLoaded,
  resetTotal,
} = mediaSlice.actions;

export default mediaSlice.reducer;
