import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// ** Fetch religion
export const getCommunities = createAsyncThunk(
  'appCommunities/getCommunities',
  async (data, {rejectWithValue}) => {
    try {
      const response = await Axios.post('/getCommunityData', data);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);
export const getReligions = createAsyncThunk(
  'appReligions/getReligions',
  async () => {

    try {
      const response = await Axios.get('/getReligionData');
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const getScripts = createAsyncThunk(
  'appScripts/getScripts',
  async () => {

    try {
      const response = await Axios.get('/getScriptData');
      return response;
    } catch (error) {
      throw error;
    }
  },
);
export const getGothras = createAsyncThunk(
  'appGothras/getGothras',
  async () => {

    try {
      const response = await Axios.get('/getGotraData');
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const initialState = {
  loading: 'idle',
  community: [],
  religion: [],
  scripts: [],
  gothra: [],
};

export const appCommunitiesSlice = createSlice({
  name: 'appCommunities',
  initialState,
  reducers: {
    setReligion: (state, {payload}) => {
      state.religion = payload;
    },
  },
  extraReducers: builder => {
    builder
      //   .addCase('LOGOUT', state => {
      //     Object.assign(state, initialState);
      //   })
      .addCase(getCommunities.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getCommunities.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.community = action?.payload;
      })
      .addCase(getCommunities.rejected, state => {
        state.loading = 'failed';
      })
      .addCase(getReligions.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getReligions.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.religion = action?.payload;
      })
      .addCase(getReligions.rejected, state => {
        state.loading = 'failed';
      });

    builder
      //   .addCase('LOGOUT', state => {
      //     Object.assign(state, initialState);
      //   })
      .addCase(getScripts.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getScripts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.scripts = action?.payload;
      })
      .addCase(getScripts.rejected, state => {
        state.loading = 'failed';
      });

    builder

      .addCase(getGothras.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getGothras.fulfilled, (state, action) => {
        state.loading = 'succeeded';

        state.gothra = action?.payload;
      })
      .addCase(getGothras.rejected, state => {
        state.loading = 'failed';
      });
  },
});
export const {setReligion} = appCommunitiesSlice.actions;

export default appCommunitiesSlice.reducer;
