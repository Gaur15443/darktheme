import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import config from 'react-native-config';
import type {ToastMessages, ToastState} from './index.d';
import axios from 'axios';

const initialState: ToastState = {
  toastMessages: null,
  loading: false,
  error: null,
};

export const getToastMessages = createAsyncThunk<
  ToastMessages,
  void,
  {rejectValue: string}
>('toast/getToastMessages', async (_, {rejectWithValue}) => {
  try {
    // @ts-ignore
    const response = await axios.get(config.TOAST_MESSAGES, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    const data: ToastMessages = await response.data;
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const getToastMessagesSlice = createSlice({
  name: 'getToastMessages',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getToastMessages.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getToastMessages.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.toastMessages = action.payload;
        }
      })
      .addCase(getToastMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error occurred';
      });
  },
});

export default getToastMessagesSlice.reducer;
