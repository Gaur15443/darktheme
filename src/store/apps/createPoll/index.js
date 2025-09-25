import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// Async thunk to create a Poll
export const createPoll = createAsyncThunk(
  'createPoll/createPoll',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await Axios.post('/createPoll', payload);
      return response.data;
    } catch (error) {
      // Return the error message if the request fails
      return rejectWithValue(error.response.data);
    }
  },
);
// Async thunk to get a pollData
export const getPoll = createAsyncThunk(
  'getPoll/getPoll',
  async (id, { rejectWithValue }) => {
    try {
      const response = await Axios.get(`/getPollById/${id}`);
      return response.data;
    } catch (error) {
      // Return the error message if the request fails
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  createdPoll: null,
  loading: 'idle',
  error: null,
  pollById: null,
};

const createPollSlice = createSlice({
  name: 'createPoll',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(createPoll.pending, state => {
        state.createdPoll = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.createdPoll = [action?.payload.data];
      })
      .addCase(createPoll.rejected, state => {
        state.createdPoll = null;
      })
      .addCase(getPoll.pending, state => {
        state.pollById = null;
      })
      .addCase(getPoll.fulfilled, (state, action) => {
        state.pollById = [action?.payload.data];
      })
      .addCase(getPoll.rejected, state => {
        state.pollById = null;
      });
  },
});

export default createPollSlice.reducer;
