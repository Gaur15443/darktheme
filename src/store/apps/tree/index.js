import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// ** Fetch UserInfo
export const getTree = createAsyncThunk('appTree/getTree', async () => {
  const response = await Axios.get('/listFamilyTrees');
  return response.data;
});

const privateTreeListAPI = '/listFamilyTrees';
const getUserSurnameAPI = '/getUserSurname';
const createPrivateTreeAPI = '/createPrivateTree';
const importGedcomAPI = '/import-gedcom';
const userGroupAPI = '/userGroups';

// PRIVATE TREE LIST API
export const getprivateTreeList = createAsyncThunk(
  'privateTreeList/getprivateTreeList',
  async (_, {rejectWithValue}) => {
    try {
      const response = await Axios.get(privateTreeListAPI);
      return response.data;
    } catch (error) {
      if (error.message === 'LogOut') {
        window.location.pathname = '/login';
      }
      return rejectWithValue(error.message); // Propagate the error for handling in reducers
    }
  },
);

export const listFamilyTrees = createAsyncThunk(
  'listFamilyTrees/listFamilyTrees',
  async (_, {rejectWithValue}) => {
    try {
      const response = await Axios.get('/listFamilyTrees');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// USERGROUP
export const getUserGroup = createAsyncThunk(
  'userGroup/getUserGroup',
  async () => {
    const response = await Axios.get(userGroupAPI);
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

// updateFamilyName

export const changeFamilyName = createAsyncThunk(
  'changeFamilyName/changeFamilyName',
  async payload => {
    const response = await Axios.put('/updateFamilyName', payload);
    return response.data;
  },
);

// CREATE PRIVATE TREE API
export const createPrivateTree = createAsyncThunk(
  'createTree/createPrivateTree',
  async payload => {
    const data = {
      familyName: payload,
    };
    const response = await Axios.post(createPrivateTreeAPI, data);
    return response.data;
  },
);

// GET USER SURNAME API
export const getUserSurname = createAsyncThunk(
  'userSurname/getUserSurname',
  async (payload, {dispatch}) => {
    const response = await Axios.get(getUserSurnameAPI);
    dispatch(createPrivateTree(payload));
    return response.data;
  },
);

// IMPORT GEDCOM API

export const importGedcom = createAsyncThunk(
  'import-gedcom/importGedcom',
  async payload => {
    const headers = {'Content-Type': 'multipart/form-data'};
    return Axios.post(importGedcomAPI, payload, {headers})
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error.response.data;
      });
  },
);

export const RoleConformation = createAsyncThunk(
  'Conformation/RoleConformation',
  async apiUrl => {
    const response = await Axios.get(apiUrl);
    return response.data;
  },
);

export const getmSpouseData = createAsyncThunk(
  'SpouseData/getmSpouseData',
  async payload => {
    const response = await Axios.post('/getmSpouseData', payload);
    return response.data;
  },
);

export const getTreeName = createAsyncThunk(
  'treeName/getTreeName',
  async apiUrl => {
    const response = await Axios.get(apiUrl);
    return response.data;
  },
);
export const MakeContributor = createAsyncThunk(
  'createContributor/createContributor',
  async ({payload}) => {
    const response = await Axios.post(
      '/createtreeCollabrationNotification',
      payload,
    );
    return response.data;
  },
);
export const RemoveContributor = createAsyncThunk(
  'RemoveContributor/RemoveContributor',
  async ({payload}) => {
    const response = await Axios.put('/declineLinkInvite', payload);
    return response.data;
  },
);
export const unLinkMember = createAsyncThunk(
  'unLink/unLinkMember',
  async ({payload}) => {
    const response = await Axios.post('/unlinkActiveMember', payload);
    return response.data;
  },
);

export const fetchUserInfo = createAsyncThunk(
  'fetchUser/fetchUserInfo',
  async userId => {
    const response = await Axios.get(`/getUserProfile/${userId}`);
    return response.data;
  },
);
export const fetchUserDetailsForClink = createAsyncThunk(
  'fetchUser/fetchUserInfo',
  async userId => {
    const response = await Axios.get(`/getUserProfile/${userId}`);
    return response.data;
  },
);

export const fetchInviteCount = createAsyncThunk(
  'inviteCount/fetchInviteCount',
  async () => {
    const response = await Axios.get('/inviteCount');
    return response.data;
  },
);

export const getTreeDetailsByGroupId = createAsyncThunk(
	'getTreeDetailsByGroupId/getTreeDetailsByGroupId',
	async (payload) => {
		const response = await Axios.get(
			`/getTreeDetailsByGroupId/${payload}`
		);
		return response.data;
	}
);

const initialState = {
  loading: 'idle',
  treeList: [],
  userFamilyTree: [],
  userSurname: [],
  createTreeResp: null,
  gedcomLogs: {gedcom_log: []},
  gedcomErrorLogs: Object,
  fetchUserInfo: {},
  fetchInvite: null,
  fetchCurrentTreeUser: null,
  inviteValue: false,
  spouseList: [],
  homeTooltipSeen: false,
  addMemberClinkListVal: [],
  userTree: null,
  AllFamilyTrees: {},
  groupId: null,
  familyName: null,
  treeId: null,
};

export const appTreeSlice = createSlice({
  name: 'appTree',
  initialState,
  reducers: {
    setUserTree(state, {payload}) {
      state.userTree = payload.treeId;
    },
    resetUserTree(state, {payload}) {
      state.userTree = null;
    },
    resetInviteCount(state, {payload}) {
      state.fetchInvite = null;
    },
    setCountInvite(state, {payload}) {
      state.fetchInvite = payload;
    },
    setTreeItemFromPrivateTree(state, {payload}) {
      state.fetchCurrentTreeUser = payload;
    },
    resetTreeItem(state) {
      state.fetchCurrentTreeUser = null;
    },
    setGroupId(state, {payload}) {
      state.groupId = payload;
    },
    setTreeId(state, {payload}) {
      state.treeId = payload;
    },
    setFamilyName(state, {payload}) {
      state.familyName = payload;
    },
    resetGedcomlogs(state) {
      state.gedcomLogs = {gedcom_log: []};
    },
    setTreeinviteValue(state, {payload}) {
      state.inviteValue = payload;
    },
    getSpouseList(state, {payload}) {
      state.spouseList.push(payload);
    },
    removeSpouseList(state) {
      state.spouseList = [];
    },
    removeSpouseListLastVal(state) {
      if (state.spouseList.length > 0) {
        state.spouseList.pop();
      } else {
        state.spouseList = [];
      }
    },
    setHomeTooltipSeen(state, {payload}) {
      state.homeTooltipSeen = payload;
    },
    setAddMemberClinkList(state, payload) {
      state.addMemberClinkListVal = payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getTree.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getTree.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action?.payload;
      })
      .addCase(getTree.rejected, state => {
        state.loading = 'failed';
      });
      builder
        .addCase(setGroupId, (state, action) => {
        state.groupId = action.payload;
      });
      builder
        .addCase(setTreeId, (state, action) => {
        state.treeId = action.payload;
      });
      builder
        .addCase(setFamilyName, (state, action) => {
        state.familyName = action.payload;
      });

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

    builder
      .addCase(listFamilyTrees.pending, state => {
        state.AllFamilyTrees = {};
      })
      .addCase(listFamilyTrees.fulfilled, (state, action) => {
        state.AllFamilyTrees = action.payload;
      })
      .addCase(listFamilyTrees.rejected, state => {
        state.AllFamilyTrees = {};
      });

    // userFamilyTree API
    builder
      .addCase(getUserFamilyTree.pending, state => {
        state.loading = 'loading';
        state.userFamilyTree = [];
      })
      .addCase(getUserFamilyTree.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.userFamilyTree = action.payload;
      })
      .addCase(getUserFamilyTree.rejected, state => {
        state.loading = 'failed';
        state.userFamilyTree = [];
      });

    // updateFamilyName API
    builder
      .addCase(changeFamilyName.pending, state => {
        state.treeList = [];
      })
      .addCase(changeFamilyName.fulfilled, (state, action) => {
        state.treeList = action.payload;
      })
      .addCase(changeFamilyName.rejected, state => {
        state.treeList = [];
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

    // gedcomImport API
    builder
      .addCase(importGedcom.pending, state => {
        state.gedcomLogs = null;
      })
      .addCase(importGedcom.fulfilled, (state, action) => {
        state.gedcomLogs = action.payload;
      })
      .addCase(importGedcom.rejected, (state, action) => {
        state.gedcomErrorLogs = action.payload;
      });
    //fetchInviteCount
    builder
      .addCase(fetchInviteCount.pending, state => {
        state.fetchInvite = null;
      })
      .addCase(fetchInviteCount.fulfilled, (state, action) => {
        state.fetchInvite = action.payload;
      })
      .addCase(fetchInviteCount.rejected, (state, action) => {
        state.fetchInvite = null;
      });

    // fetchUserInfo API
    builder
      .addCase(fetchUserInfo.pending, state => {
        state.fetchUserInfo = [];
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.fetchUserInfo = action.payload;
      })
      .addCase(fetchUserInfo.rejected, state => {
        state.fetchUserInfo = [];
      });
  },
});
export const {
  setTreeItemFromPrivateTree,
  resetTreeItem,
  setGroupId,
  setFamilyName,
  setTreeId,
  resetGedcomlogs,
  setTreeinviteValue,
  resetInviteCount,
  setCountInvite,
  getSpouseList,
  removeSpouseList,
  removeSpouseListLastVal,
  setHomeTooltipSeen,
  setAddMemberClinkList,
  setUserTree,
  resetUserTree,
} = appTreeSlice.actions;
export default appTreeSlice.reducer;
