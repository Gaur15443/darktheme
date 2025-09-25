import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {AstroAxios} from '../../../plugin/Axios';
import type {
  KundaliById,
  StoredKundliObject,
  SaveKundliData,
  Reports,
  GetAstroPdfResponse,
  GetAstroPdfPayload,
  IsOwnerKundliResponse,
  ReportAlert,
} from './index.d';
import type {RootState} from '../..';
import type {AxiosResponse} from 'axios';

export const saveAstroUserKundli = createAsyncThunk<any, SaveKundliData>(
  'astroKundli/saveAstroUserKundli',
  async data => {
    const response = await AstroAxios.post('/saveAstroUserKundli', data);
    return response.data.data as StoredKundliObject;
  },
);
export const checkIfReportIsPurchased = createAsyncThunk<any, {
    reportId : string,
    kundliId : string}
 >(
  'astroKundli/checkIfReportIsPurchase',
  async (data) => {
    const response = await AstroAxios.post('/isPurchasedReportAlert', data);
    return response.data as ReportAlert;
  },
);

export const getSavedKundli = createAsyncThunk<
  SaveKundliData[],
  number | undefined,
  {state: RootState}
>('astroKundli/getSavedKundlis', async (payload, {getState, dispatch}) => {
  try {
    const state = getState() as RootState;
    const astroKundaliState = state.astroKundaliSlice;
    const pageNo = payload ? payload : astroKundaliState.pageNo;

    const response = await AstroAxios.get<{data: SaveKundliData[]}>(
      `/getSavedKundli/?page=${pageNo}&limit=10`,
    );
    dispatch(setPageNo(pageNo + 1));
    if (!response?.data?.data?.length || response?.data?.data?.length < 10) {
      dispatch(setLoadedAll(true));
    }
    return response.data.data;
  } catch (error) {
    if (error?.message?.includes?.('404')) {
      dispatch(setLoadedAll(true));
    }
    return [];
  }
});

export const checkIfOwnerKundliExists = createAsyncThunk<any, string>(
  'astroKundli/isOwnerKundli',
  async (id: string) => {
    const response = await AstroAxios.post<IsOwnerKundliResponse>(
      `/isOwnerKundli`,
      {
        userId: id,
      },
    );
    return response.data?.isOwner;
  },
);
export const getSavedKundliById = createAsyncThunk(
  'astroKundli/getSavedKundliById',
  async (id: string) => {
    const response = await AstroAxios.get<KundaliById[]>(
      `/getSavedKundliById/${id}`,
    );
    return response.data;
  },
);

export const getAstroReports = createAsyncThunk<any, Reports[]>(
  'astroKundli/getAstroReports',
  async () => {
    const response = await AstroAxios.get('/getAstroReports');
    return response.data;
  },
);

export const getAstroPdf = createAsyncThunk<
  GetAstroPdfResponse,
  GetAstroPdfPayload
>(
  'astroKundli/getPdfUrl',
  async (payload: GetAstroPdfPayload): Promise<GetAstroPdfResponse> => {
    const response: AxiosResponse<GetAstroPdfResponse> = await AstroAxios.post(
      '/getPdfUrl',
      payload,
    );
    return response.data;
  },
);

const initialState: {
  savedKundlis: SaveKundliData[];
  selectedReportPrice: any;
  selectedReportDiscount: any;
  selectedReportId: string | null;
  savedKundli: KundaliById[];
  astroReports: any[];
  selectedReport: 'Career' | 'Marriage' | 'Kundli';
  generateReport: boolean;
  storedKundliObject: StoredKundliObject | null;
  pageNo: number;
  loadedAll: boolean;
  isFirstTimeUser: boolean;
  shouldReset: boolean;
  ownerKundliExists: boolean;
} = {
  isFirstTimeUser: true,
  savedKundlis: [],
  savedKundli: [],
  astroReports: [],
  selectedReport: 'Career',
  selectedReportId: null,
  selectedReportPrice: null,
  generateReport: false,
  storedKundliObject: null,
  selectedReportDiscount: null,
  pageNo: 1,
  loadedAll: false,
  shouldReset: false,
  ownerKundliExists: false,
};

const astroKundaliSlice = createSlice({
  name: 'astroKundli',
  initialState,
  reducers: {
    setSelectedReport(state, {payload}) {
      state.selectedReport = payload;
    },
    setSelectedReportId(state, {payload}) {
      state.selectedReportId = payload;
    },
    setSelectedReportPrice(state, {payload}) {
      state.selectedReportPrice = payload;
    },
    setSelectedReportDiscount(state, {payload}) {
      state.selectedReportDiscount = payload;
    },
    toggleGenerateReport(state, {payload}) {
      state.generateReport = payload;
    },
    setPageNo(state, {payload}) {
      state.pageNo = payload;
    },
    setLoadedAll(state, {payload}) {
      state.loadedAll = payload;
    },
    resetSavedKundlis(state) {
      state.savedKundlis = [];
      state.pageNo = 1;
      state.loadedAll = false;
    },
    setIsFirstTimeUser(state, {payload}) {
      state.isFirstTimeUser = payload;
    },
    updateSavedKundli(state, {payload}) {
      state.savedKundli = payload;
    },
    updateSavedKundlis(state, {payload}) {
      state.savedKundlis = payload;
    },
    setShouldReset(state, {payload}) {
      state.shouldReset = payload;
    },
    setStoredKundliObject(state, {payload}) {
      state.storedKundliObject = payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getSavedKundli.fulfilled, (state, {payload}) => {
        state.savedKundlis.push(...payload);
      })
      .addCase(getAstroReports.fulfilled, (state, {payload}) => {
        state.astroReports = payload;
      })
      .addCase(saveAstroUserKundli.fulfilled, (state, {payload}) => {
        state.storedKundliObject = payload;
      })
      .addCase(checkIfOwnerKundliExists.fulfilled, (state, {payload}) => {
        state.ownerKundliExists = payload;
      });
  },
});

export const {
  setSelectedReport,
  setSelectedReportId,
  setSelectedReportPrice,
  setSelectedReportDiscount,
  toggleGenerateReport,
  setPageNo,
  setLoadedAll,
  setIsFirstTimeUser,
  updateSavedKundli,
  resetSavedKundlis,
  setShouldReset,
  updateSavedKundlis,
  setStoredKundliObject,
} = astroKundaliSlice.actions;

export default astroKundaliSlice.reducer;
