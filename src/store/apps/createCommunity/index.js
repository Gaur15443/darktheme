import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// Async thunk to create a community
export const createCommunity = createAsyncThunk(
  'createCommunity/createCommunity',
  async (communityData, {rejectWithValue}) => {
    try {
      const response = await Axios.post('/createCommunity', communityData);
      return response.data;
    } catch (error) {
      // Return the error message if the request fails
      return rejectWithValue(error.response.data);
    }
  },
);

// Async thunk for community deep search (imeusweUsers)
export const communityDeepSearch = createAsyncThunk(
  'createCommunity/communityDeepSearch',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await Axios.post('/communityDeepSearch', payload);
      return response.data;
    } catch (error) {
      // Return the error message if the request fails
      return rejectWithValue(error.response.data);
    }
  },
);

// Api To Exit Community
export const exitCommunity = createAsyncThunk(
  'createCommunity/exitCommunity',
  async (params, {rejectWithValue}) => {
    try {
      const response = await Axios.put(`/userCommunityExitRequest/${params}`);

      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Api To Cancel Community Join Request
export const cancelCommmunityJoinRequest = createAsyncThunk(
  'cancelCommmunityJoinRequest/cancelCommmunityJoinRequest',
  async (communityId, {rejectWithValue}) => {
    try {
      const response = await Axios.put(
        `/userCommunityCancelRequest/${communityId}`,
      );

      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Api To Search Communities
export const searchAndFilterCommunities = createAsyncThunk(
  'searchAndFilterCommunities/searchAndFilterCommunities',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await Axios.post(`/searchCommunities`, payload);

      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Remove Member From Community
export const removeMember = createAsyncThunk(
  'createCommunity/removeMember',
  async (data, {rejectWithValue}) => {
    try {
      const response = await Axios.post(
        `/adminMemberManageRequest/${data.id}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Make Or Dismiss Admin
export const makeDismissAdmin = createAsyncThunk(
  'createCommunity/makeDismissAdmin',
  async ({data, id}, {rejectWithValue}) => {
    try {
      const response = await Axios.post(`/adminMemberRoleChange/${id}`, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
// Delete Poll From Community
export const deletePoll = createAsyncThunk(
  'deletePoll/deletePoll',
  async (pollId, {rejectWithValue}) => {
    try {
      const response = await Axios.delete(`/deletePoll/${pollId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

//Remove Logo
export const removeLogo = createAsyncThunk(
  'createCommunity/removeLogo',
  async (data, {rejectWithValue}) => {
    try {
      const response = await Axios.post(
        `/removeCommunityLogo/${data.ownerId}/${data.communityId}`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Remove It And Use Existing
export const viewSingleCommunity = createAsyncThunk(
  'createCommunity/viewSingleCommunity',
  async (params, {rejectWithValue}) => {
    try {
      const response = await Axios.get(`/commmunityDetail/${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Update Community Details
export const updateCommunity = createAsyncThunk(
  'createCommunity/updateCommunity',
  async (data, {rejectWithValue}) => {
    try {
      const response = await Axios.put(
        `/updateCommunityDetails/${data.communityId}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// All Community Members List
export const fetchMember = createAsyncThunk(
  'createCommunity/fetchMember',
  async (params, {rejectWithValue}) => {
    try {
      const response = await Axios.get(
        `commmunityActiveMembers/${params?.memberData?.communityId}/${params?.memberData?.pageNo}`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

//  Community Members By Search
export const fetchSingleMember = createAsyncThunk(
  'createCommunity/fetchSingleMember',
  async ({communityId, payload}, {rejectWithValue}) => {
    try {
      const response = await Axios.post(
        `commmunityActiveMembersSearch/${communityId}`,
        payload,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// All Tree Members List (Invite)
export const fetchTreeMember = createAsyncThunk(
  'createCommunity/fetchTreeeMember',
  async ({communityId}, {rejectWithValue}) => {
    try {
      const response = await Axios.get(`/communityUsersGroup/${communityId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  community: null,
  loading: 'idle',
  error: null,
  singleCommunity: [],
  allMembers: [],
  allTreeMembersToInvite: [],
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(createCommunity.pending, state => {
        state.community = null;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.community = [action?.payload.data];
      })
      .addCase(createCommunity.rejected, state => {
        state.community = null;
      });
    builder

      .addCase(fetchMember.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchMember.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        if (action?.payload?.length) {
          state.allMembers.push(...action.payload);
        }
      })
      .addCase(fetchMember.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });

    builder
      .addCase(fetchTreeMember.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchTreeMember.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        if (action?.payload?.length) {
          state.allTreeMembersToInvite = action.payload;
        }
      })
      .addCase(fetchTreeMember.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });

    builder
      .addCase(exitCommunity.pending, state => {
        state.loading = 'loading';
      })
      .addCase(exitCommunity.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(exitCommunity.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    builder
      .addCase(removeMember.pending, state => {
        state.loading = 'loading';
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    builder
      .addCase(makeDismissAdmin.pending, state => {
        state.loading = 'loading';
      })
      .addCase(makeDismissAdmin.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(makeDismissAdmin.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    builder
      .addCase(removeLogo.pending, state => {
        state.loading = 'loading';
      })
      .addCase(removeLogo.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(removeLogo.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    builder
      .addCase(viewSingleCommunity.pending, state => {
        state.loading = 'loading';
      })
      .addCase(viewSingleCommunity.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.singleCommunity = action.payload;
      })
      .addCase(viewSingleCommunity.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    builder
      .addCase(updateCommunity.pending, state => {
        state.loading = 'loading';
      })
      .addCase(updateCommunity.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateCommunity.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});

export const checkCommnityName = createAsyncThunk(
  'createCommunity/checkCommunityNameExists',
  async (communityName, {rejectWithValue}) => {
    try {
      const response = await Axios.post('/checkCommunityNameExists', communityName);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export default communitySlice.reducer;
