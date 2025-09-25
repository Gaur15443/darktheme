import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getListPublicData = createAsyncThunk(
  'getListPublicData',
  async ({firstname, lastname}, {rejectWithValue}) => {
    try {
      const response = await Axios.post('/getListPublicData', {
        firstname: firstname.toUpperCase(),
        lastname: lastname.toUpperCase(),
      });
      return response.data;
    } catch (error) {
      // Handle errors and provide a custom payload to the rejection
      return rejectWithValue(error.message);
    }
  },
);

export const getPublicDataPlural = createAsyncThunk(
  'getPublicDataPlural/getFilterPublicDataPlural',
  async ({payload}) => {
    const response = await Axios.post('/getfilterPublicDataPlural', payload);
    return response.data;
  },
);

export const getPublicDataSingular = createAsyncThunk(
  'getPublicDataSingular/getFilterPublicDataSingular/',
  async ({payload}) => {
    const response = await Axios.post('/getfilterPublicDataSingular', payload);
    return response.data;
  },
);

// Create a slice of the Redux store
const publicDataSlice = createSlice({
  name: 'publicData',
  initialState: {
    count: 0,
    totalRecord: [],
    totalCount: 0,
    otherCategoryCount: 0,
    otherIdsArray: [],
    pmKisanArray: [],
    othersArray: [],
    voterListArr: [],
    rationCardArray: [],
    birthAndDeathArray: [],
    indianLandArray: [],
    freedomFighterArray: [],
    deathNews: [],
    migrationArray: [],
    judicialArray: [],
    isResponeCome: false,
    isResponse: false,
    getAllPluralData: [],
    getAllSingularData: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getListPublicData.pending, state => {
        state.count = 0;
        state.totalRecord = [];
        state.totalCount = 0;
        state.otherCategoryCount = 0;
        state.otherIdsArray = [];
        state.pmKisanArray = [];
        state.othersArray = [];
        state.voterListArr = [];
        state.rationCardArray = [];
        state.birthAndDeathArray = [];
        state.indianLandArray = [];
        state.freedomFighterArray = [];
        state.deathNews = [];
        state.migrationArray = [];
        state.judicialArray = [];
        state.isResponeCome = false;
        state.isResponse = false;
      })
      .addCase(getListPublicData.fulfilled, (state, action) => {
        state.getListPublicData = action?.payload;
        state.count = action?.payload?.data?.count;
        state.totalRecord = action?.payload?.data?.totalRecord;
        state.totalCount = action?.payload?.data?.totalCount;
        state.otherCategoryCount = action?.payload?.data?.otherCategoryCount;
        state.otherIdsArray = action?.payload?.data?.otherIdsArray;
        state.pmKisanArray = action?.payload?.data?.pmKisanArray;
        state.othersArray = action?.payload?.data?.othersArray;
        state.voterListArr = action?.payload?.data?.voterListArr;
        state.rationCardArray = action?.payload?.rationCardArray;
        state.birthAndDeathArray = action?.payload?.data?.birthAndDeathArray;
        state.indianLandArray = action?.payload?.data?.indianLandArray;
        state.freedomFighterArray = action?.payload?.data?.freedomFighterArray;
        state.deathNews = action?.payload?.data?.deathNews;
        state.migrationArray = action?.payload?.data?.migrationArray;
        state.judicialArray = action?.payload?.data?.judicialArray;
        state.isResponeCome = action?.payload?.data?.isResponeCome;
        state.isRespone = action?.payload?.data?.isRespone;
      })
      .addCase(getListPublicData.rejected, state => {
        state.count = 0;
        state.totalRecord = [];
        state.totalCount = 0;
        state.otherCategoryCount = 0;
        state.otherIdsArray = [];
        state.pmKisanArray = [];
        state.othersArray = [];
        state.voterListArr = [];
        state.rationCardArray = [];
        state.birthAndDeathArray = [];
        state.indianLandArray = [];
        state.freedomFighterArray = [];
        state.deathNews = [];
        state.migrationArray = [];
        state.judicialArray = [];
        state.isResponeCome = false;
        state.isResponse = false;
      });
    builder
      .addCase(getPublicDataPlural.pending, state => {
        state.getAllPluralData = [];
      })
      .addCase(getPublicDataPlural.fulfilled, (state, action) => {
        state.getAllPluralData = action.payload;
      })
      .addCase(getPublicDataPlural.rejected, state => {
        state.getAllPluralData = [];
      });

    builder
      .addCase(getPublicDataSingular.pending, state => {
        state.getAllSingularData = [];
      })
      .addCase(getPublicDataSingular.fulfilled, (state, action) => {
        state.getAllSingularData = action.payload;
      })
      .addCase(getPublicDataSingular.rejected, state => {
        state.getAllSingularData = [];
      });
  },
});

export default publicDataSlice.reducer;
