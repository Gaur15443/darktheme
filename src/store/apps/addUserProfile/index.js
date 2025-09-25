import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// ** Fetch religion
export const getAdduserProfiles = createAsyncThunk(
  'appAdduserProfiles/getAdduserProfiles',
  async (formData, {rejectWithValue}) => {
    try {
      const response = await Axios.put(
        `/addUserProfile/${formData.userId}`,
        formData,
      );

      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

const initialState = {
  loading: 'idle',
  data: null,
};

export const appAdduserProfilesSlice = createSlice({
  name: 'appCommunities',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getAdduserProfiles.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getAdduserProfiles.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action?.payload;
      })
      .addCase(getAdduserProfiles.rejected, state => {
        state.loading = 'failed';
      });
  },
});

export default appAdduserProfilesSlice.reducer;
