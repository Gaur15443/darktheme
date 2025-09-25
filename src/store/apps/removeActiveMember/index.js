import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const removeActiveMember = createAsyncThunk(
  'removeActiveMember/removeActiveMember ',
  async ({activeMember, groupId}) => {
    try {
      const response = await Axios.post('/removeActiveMember', {
        activeMember,
        groupId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const initialState = {
  removeActiveMemberData: null,
};

const removeActiveMemberSlice = createSlice({
  name: 'removeActiveMember ',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(removeActiveMember.pending, state => {
        state.removeActiveMemberData = null;
      })
      .addCase(removeActiveMember.fulfilled, (state, action) => {
        state.removeActiveMemberData = action.payload;
      })
      .addCase(removeActiveMember.rejected, state => {
        state.removeActiveMemberData = null;
      });
  },
});

export default removeActiveMemberSlice.reducer;
