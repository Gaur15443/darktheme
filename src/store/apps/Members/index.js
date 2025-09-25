import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getInvitedMember = createAsyncThunk(
  'invitedMember/getInvitedMember',
  async membersId => {
    const response = await Axios.get(`/getInvitedMember/${membersId}/All`);
    return response.data;
  },
);

const initialState = {
  invitedMember: [],
};

const invitedMemberSlice = createSlice({
  name: 'invitedMember',
  initialState,
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getInvitedMember.pending, state => {
        state.invitedMember = [];
      })
      .addCase(getInvitedMember.fulfilled, (state, action) => {
        if (action.payload) {
          state.invitedMember = action.payload;
        }
      })
      .addCase(getInvitedMember.rejected, state => {
        state.invitedMember = [];
      });
  },
});

export default invitedMemberSlice.reducer;
