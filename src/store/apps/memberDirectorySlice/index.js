import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getGroupData = createAsyncThunk(
  'memberDirectorySlice/getGroupData',
  async () => {
    const response = await Axios.get('/userGroups');
    return response.data;
  },
);

export const getAllSubGroup = createAsyncThunk(
  'memberDirectory/getAllSubGroup',
  async (_payload, {getState}) => {
    const state = getState().userInfo;
    const response = await Axios.get(`/getAllSubGroup/${state._id}`);
    return response.data?.Data;
  },
);

export const getMySubgroups = createAsyncThunk(
  'memberDirectory/getMySubgroups',
  async (_payload, {getState}) => {
    const state = getState().userInfo;
    const response = await Axios.get(`/getMySubgroups/${state._id}`);
    return response.data.Data;
  },
);

export const getUserAllgroups = createAsyncThunk(
  'memberDirectory/getUserAllgroups',
  async (_payload, {getState}) => {
    const state = getState().userInfo;
    const response = await Axios.get(`/userAllGroups/${state._id}`);
    return response.data?.Data;
  },
);

export const createUserSubgroups = createAsyncThunk(
  'memberDirectory/createUserSubgroups',
  async data => {
    const response = await Axios.post('/createSubGroup', data);
    return response.data;
  },
);

export const getSubGroupById = createAsyncThunk(
  'memberDirectory/getSubGroupById',
  async id => {
    const response = await Axios.get(`/getSubGroupById/${id}`);
    return response.data;
  },
);

export const editUserSubgroups = createAsyncThunk(
  'memberDirectory/editUserSubgroups',
  async payload => {
    const {id, ...rest} = payload;
    const response = await Axios.put(`/updateSubGroupById/${id}`, rest);
    return response.data;
  },
);

export const deleteUserSubgroups = createAsyncThunk(
  'memberDirectory/deleteUserSubgroups',
  async payload => {
    const response = await Axios.delete('/deleteSubGroupById', {
      data: payload,
    });

    return response.data;
  },
);

const initialState = {
  memberGroupDetails: [],
  membersAllSubGroups: [],
  allMySubGroups: [],
  membersAllGroups: [],
  getSubGroupById: [],
  data: null,
};

const index = createSlice({
  name: 'memberDirectory',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getGroupData.pending, state => {
        state.memberGroupDetails = [];
      })
      .addCase(getGroupData.fulfilled, (state, {payload}) => {
        state.memberGroupDetails = payload;
      })
      .addCase(getGroupData.rejected, state => {
        state.memberGroupDetails = [];
      })

      .addCase(getAllSubGroup.pending, state => {
        state.membersAllSubGroups = [];
      })
      .addCase(getAllSubGroup.fulfilled, (state, {payload}) => {
        state.membersAllSubGroups = payload;
      })
      .addCase(getAllSubGroup.rejected, state => {
        state.membersAllSubGroups = [];
      })

      .addCase(getMySubgroups.pending, state => {
        state.allMySubGroups = [];
      })
      .addCase(getMySubgroups.fulfilled, (state, {payload}) => {
        state.allMySubGroups = payload;
      })
      .addCase(getMySubgroups.rejected, state => {
        state.allMySubGroups = [];
      })

      .addCase(getUserAllgroups.pending, state => {
        state.membersAllGroups = [];
      })
      .addCase(getUserAllgroups.fulfilled, (state, {payload}) => {
        state.membersAllGroups = payload;
      })
      .addCase(getUserAllgroups.rejected, state => {
        state.membersAllGroups = [];
      })

      .addCase(createUserSubgroups.pending, state => {
        state.data = '';
      })
      .addCase(createUserSubgroups.fulfilled, (state, {payload}) => {
        state.data = payload;
      })
      .addCase(createUserSubgroups.rejected, state => {
        state.data = null;
      })

      .addCase(deleteUserSubgroups.pending, state => {
        state.data = null;
      })
      .addCase(deleteUserSubgroups.fulfilled, (state, {payload}) => {
        state.data = payload;
      })
      .addCase(deleteUserSubgroups.rejected, state => {
        state.data = null;
      })

      .addCase(getSubGroupById.pending, state => {
        state.data = null;
      })
      .addCase(getSubGroupById.fulfilled, (state, {payload}) => {
        state.data = payload;
      })
      .addCase(getSubGroupById.rejected, state => {
        state.data = null;
      });
  },
});

export default index.reducer;
