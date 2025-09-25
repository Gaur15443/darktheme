import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getInvitedTreeMember = createAsyncThunk(
  'invitedTreeMember/getInvitedTreeMember',
  async (membersId, {rejectWithValue}) => {
    try {
      if (!membersId) {
        return null;
      }
      const response = await Axios.get(
        `/getInvitedTreeMember/${membersId}/All`,
      );
      return {membersId, data: response.data};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  invitedTreeMembers: {},
};

const invitedTreeMemberSlice = createSlice({
  name: 'invitedTreeMember',
  initialState,
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getInvitedTreeMember.pending, (state, action) => {
        const membersId = action.meta.arg;
        if (membersId) {
          state.invitedTreeMembers[membersId] = {status: 'pending', data: null};
        }
      })
      .addCase(getInvitedTreeMember.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.membersId) {
          state.invitedTreeMembers[payload.membersId] = {
            status: 'fulfilled',
            data: payload.data,
          };
        } else if (payload === null) {
          state.invitedTreeMembers = {};
        }
      })
      .addCase(getInvitedTreeMember.rejected, (state, action) => {
        const membersId = action.meta.arg;
        if (membersId) {
          state.invitedTreeMembers[membersId] = {
            status: 'rejected',
            data: null,
            error: action.payload,
          };
        }
      });
  },
});

export default invitedTreeMemberSlice.reducer;
