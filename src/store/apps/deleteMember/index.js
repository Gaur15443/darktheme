import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const deleteMember = createAsyncThunk(
  'deleteMember/deleteMember',
  async ({dependentUser}, {rejectWithValue}) => {
    try {
      const apiUrl = '/getDependentsData';
      const response = await Axios.post(apiUrl, {dependents: dependentUser});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const postDeleteMember = createAsyncThunk(
  'postDeleteMember',
  async ({userId, treeId, isOwnersClink, isClone}) => {
    const response = await Axios.post(
      `/postDeleteUserTree/${userId}/${treeId}?${
        isOwnersClink ? 'isownersclink=true' : ''
      }`,
      {isClone: !!isClone},
    );
    return response.data;
  },
);

const initialState = {
  deleteMemberData: [],
};

const deleteMemberSlice = createSlice({
  name: 'deleteMember',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase('LOGOUT', state => {
      Object.assign(state, initialState);
    });

    builder
      .addCase(deleteMember.pending, state => {
        state.deleteMemberData = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.deleteMemberData = action.payload;
      })
      .addCase(deleteMember.rejected, state => {
        state.deleteMemberData = null;
      });

    builder
      .addCase(postDeleteMember.pending, state => {
        state.deleteMemberData = null;
      })
      .addCase(postDeleteMember.fulfilled, (state, action) => {
        if (action.payload) {
          state.deleteMemberData = action.payload;
        }
      })
      .addCase(postDeleteMember.rejected, state => {
        state.deleteMemberData = null;
      });
  },
});

export default deleteMemberSlice.reducer;
