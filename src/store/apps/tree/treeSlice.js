import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

/**
 * @param {object} payload
 */

// STATIC API NAMES
const privateTreeListAPI = '/listFamilyTrees';
const getUserSurnameAPI = '/getUserSurname';
const createPrivateTreeAPI = '/createPrivateTree';
const createNewMember = '/member';

// PRIVATE TREE LIST API
export const getprivateTreeList = createAsyncThunk(
  'privateTreeList/getprivateTreeList',
  async () => {
    const response = await Axios.get(privateTreeListAPI);
    return response.data;
  },
);

// USER API (TREE CREATION API)
export const getUserFamilyTree = createAsyncThunk(
  'userFamilyTree/getUserFamilyTree',
  async (apiUrl, payload) => {
    const response = await Axios.get(apiUrl, payload);
    return response.data;
  },
);

// GET USER SURNAME API
export const getUserSurname = createAsyncThunk(
  'userSurname/getUserSurname',
  async (payload, {dispatch}) => {
    const response = await Axios.get(getUserSurnameAPI);

    // eslint-disable-next-line no-use-before-define
    dispatch(createPrivateTree(response.data));
    return response.data;
  },
);
export const activeGroupList = createAsyncThunk(
  'grouplist/activeGroupList',
  async apiUrl => {
    const response = await Axios.get(apiUrl);
    return response.data;
  },
);
export const getTreeName = createAsyncThunk(
  'treeName/getTreeName',
  async (apiUrl, {dispatch}) => {
    const response = await Axios.get(apiUrl);
    const activeApiUrl = `/activeGroupList/${response?.data?.group?.groupId}`;
    dispatch(activeGroupList(activeApiUrl, {}));
    return response.data;
  },
);

// CREATE PRIVATE TREE API
export const createPrivateTree = createAsyncThunk(
  'createTree/createPrivateTree',
  async payload => {
    const data = {
      familyName: payload.userSurname?.user?.surname,
    };
    const response = await Axios.post(createPrivateTreeAPI, data);

    return response.data;
  },
);

export const addNewMember = createAsyncThunk(
  'createMember/addNewMember',
  async ({payload, userId, treeId, isRelation}) => {
    // if (payload.email) delete payload.email;
    const response = await Axios.post(
      `${createNewMember}/${userId}/${isRelation}/${treeId}`,
      payload,
    );
    return response.data;
  },
);
export const existMemberInvite = createAsyncThunk(
  'existMember/existMemberInvite',
  async ({payload}) => {
    const response = await Axios.post('/existMemberInvite', payload);
    return response.data;
  },
);
export const DeclineInvite = createAsyncThunk(
  'declineInvite/declineInvite',
  async ({payload}) => {
    const response = await Axios.put('/declineInvite', payload);
    return response.data;
  },
);

const initialState = {
  treeList: [],
  userFamilyTree: [],
  userSurname: [],
  createTreeResp: null,
};

export const privateTreeListSlice = createSlice({
  name: 'privateTreeList',
  reducers: {},
  initialState,
  extraReducers: builder => {
    builder.addCase('LOGOUT', state => {
      Object.assign(state, initialState);
    });
    // PrivateTreeList API
    builder
      .addCase(getprivateTreeList.pending, state => {
        state.treeList = [];
      })
      .addCase(getprivateTreeList.fulfilled, (state, action) => {
        state.treeList = action.payload;
      })
      .addCase(getprivateTreeList.rejected, state => {
        state.treeList = [];
      });

    // userFamilyTree API
    builder
      .addCase(getUserFamilyTree.pending, state => {
        state.userFamilyTree = [];
      })
      .addCase(getUserFamilyTree.fulfilled, (state, action) => {
        state.userFamilyTree = action.payload;
      })
      .addCase(getUserFamilyTree.rejected, state => {
        state.userFamilyTree = [];
      });

    // userSurname API
    builder
      .addCase(getUserSurname.pending, state => {
        state.userSurname = [];
      })
      .addCase(getUserSurname.fulfilled, (state, action) => {
        state.userSurname = action.payload;
      })
      .addCase(getUserSurname.rejected, state => {
        state.userSurname = [];
      });
    // createPrivateTree API
    builder
      .addCase(createPrivateTree.pending, state => {
        state.createTreeResp = null;
      })
      .addCase(createPrivateTree.fulfilled, (state, action) => {
        state.createTreeResp = action.payload?.message;
      })
      .addCase(createPrivateTree.rejected, state => {
        state.createTreeResp = null;
      });

    // activeGroupList API
    builder
      .addCase(activeGroupList.fulfilled, state => {
        state.activeGroupListData = state.payload;
      })
      .addCase(activeGroupList.rejected, state => {
        state.activeGroupListData = null;
      });
  },
});

export default privateTreeListSlice.reducer;
